const InterventionLog = require("../models/interventionLog");
const StressPrediction = require("../models/stressPrediction");
const SensorReading = require("../models/sensorReading");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const PDFDocument = require("pdfkit");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Log an intervention
exports.logIntervention = async (req, res) => {
  try {
    const { deviceId, stressIndex, activity, intervention, category, sessionId, metadata } = req.body;

    const interventionLog = new InterventionLog({
      deviceId,
      stressIndex,
      activity,
      intervention,
      category,
      sessionId,
      metadata,
    });

    await interventionLog.save();

    res.status(201).json({
      success: true,
      data: interventionLog,
      message: "Intervention logged successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all interventions for a device
exports.getInterventions = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const interventions = await InterventionLog.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await InterventionLog.countDocuments({ deviceId });

    res.status(200).json({
      success: true,
      data: interventions,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get interventions by session
exports.getSessionInterventions = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const interventions = await InterventionLog.find({ sessionId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: interventions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update intervention effectiveness
exports.updateInterventionFeedback = async (req, res) => {
  try {
    const { interventionId } = req.params;
    const { effectiveness, userFeedback, completed } = req.body;

    const updated = await InterventionLog.findByIdAndUpdate(
      interventionId,
      {
        effectiveness,
        userFeedback,
        completed,
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: "Feedback recorded successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get personalized recommendations using Gemini
exports.getGeminiRecommendations = async (req, res) => {
  try {
    const { deviceId, sessionId } = req.params;

    // Fetch recent data
    const recentInterventions = await InterventionLog.find({
      $or: [{ deviceId }, { sessionId }],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    const recentStress = await StressPrediction.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(20);

    const recentSensors = await SensorReading.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate stats
    const avgStress =
      recentStress.length > 0
        ? recentStress.reduce((sum, s) => sum + s.stressIndex, 0) / recentStress.length
        : 0;

    const avgActivity =
      recentSensors.length > 0
        ? recentSensors.reduce((sum, s) => sum + (s.activity || 0), 0) / recentSensors.length
        : 0;

    const successfulInterventions = recentInterventions.filter((i) => i.effectiveness > 70).length;
    const totalInterventions = recentInterventions.length;
    const successRate = totalInterventions > 0 ? (successfulInterventions / totalInterventions) * 100 : 0;

    // Build context for Gemini
    const context = `
    User Stress Data:
    - Average Stress Level: ${avgStress.toFixed(2)}/100
    - Average Activity: ${(avgActivity * 100).toFixed(2)}%
    - Intervention Success Rate: ${successRate.toFixed(2)}%
    - Recent Interventions: ${recentInterventions.length}
    
    Intervention History:
    ${recentInterventions
      .slice(0, 5)
      .map((i) => `- ${i.intervention} (Category: ${i.category}, Effectiveness: ${i.effectiveness}/100)`)
      .join("\n")}
    
    Most Effective Categories: ${
      recentInterventions.length > 0
        ? Array.from(
            new Set(
              recentInterventions
                .filter((i) => i.effectiveness > 70)
                .map((i) => i.category)
            )
          ).join(", ")
        : "No data yet"
    }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Based on this user's stress management data, provide 3-5 personalized recommendations for managing stress and improving wellness. Be specific, practical, and reference their intervention history.

    ${context}

    Format your response as a JSON object with:
    {
      "recommendations": [
        {
          "title": "Recommendation title",
          "description": "Detailed description",
          "category": "breathing|movement|hydration|recovery|maintenance",
          "duration": 5,
          "rationale": "Why this works for this user"
        }
      ],
      "summary": "Overall personalized wellness summary"
    }`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [], summary: text };

    res.status(200).json({
      success: true,
      data: recommendations,
      message: "Personalized recommendations generated successfully",
    });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate recommendations",
    });
  }
};

// Get intervention statistics
exports.getInterventionStats = async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const interventions = await InterventionLog.find({
      deviceId,
      createdAt: { $gte: startDate },
    });

    const stats = {
      total: interventions.length,
      completed: interventions.filter((i) => i.completed).length,
      byCategory: {},
      avgEffectiveness: 0,
      topIntervention: "",
    };

    let totalEffectiveness = 0;
    let countedEffectiveness = 0;
    const categoryCount = {};

    interventions.forEach((intervention) => {
      // Count by category
      if (!stats.byCategory[intervention.category]) {
        stats.byCategory[intervention.category] = 0;
      }
      stats.byCategory[intervention.category]++;

      // Average effectiveness
      if (intervention.effectiveness !== null) {
        totalEffectiveness += intervention.effectiveness;
        countedEffectiveness++;
      }
    });

    if (countedEffectiveness > 0) {
      stats.avgEffectiveness = Math.round(totalEffectiveness / countedEffectiveness);
    }

    // Find most used intervention
    const interventionCount = {};
    interventions.forEach((i) => {
      interventionCount[i.intervention] = (interventionCount[i.intervention] || 0) + 1;
    });

    stats.topIntervention = 
      Object.keys(interventionCount).length > 0
        ? Object.keys(interventionCount).reduce((a, b) =>
            interventionCount[a] > interventionCount[b] ? a : b
          )
        : "None";

    res.status(200).json({
      success: true,
      data: stats,
      period: `Last ${days} days`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Export session as PDF
exports.exportSessionPDF = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { deviceId } = req.query;

    // Fetch session data
    const interventions = await InterventionLog.find({ sessionId }).sort({ createdAt: 1 });
    const stressData = await StressPrediction.find({ deviceId }).sort({ createdAt: -1 }).limit(50);
    const analytics = await InterventionLog.aggregate([
      { $match: { sessionId } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgEffectiveness: { $avg: "$effectiveness" },
        },
      },
    ]);

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="session-${sessionId}.pdf"`);

    doc.pipe(res);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Stress Management Session Report", { align: "center" });
    doc.fontSize(12).font("Helvetica").text(`Session ID: ${sessionId}`, { align: "center" });
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: "center" });
    doc.moveDown();

    // Session Summary
    doc.fontSize(14).font("Helvetica-Bold").text("Session Summary");
    doc.fontSize(11).font("Helvetica");
    doc.text(`Total Interventions: ${interventions.length}`);
    doc.text(`Completed: ${interventions.filter((i) => i.completed).length}`);

    const avgStress = stressData.length > 0 ? (stressData.reduce((sum, s) => sum + s.stressIndex, 0) / stressData.length).toFixed(2) : "N/A";
    doc.text(`Average Stress Level: ${avgStress}`);

    const avgEffectiveness = interventions.filter((i) => i.effectiveness).length > 0 
      ? (interventions.filter((i) => i.effectiveness).reduce((sum, i) => sum + i.effectiveness, 0) / interventions.filter((i) => i.effectiveness).length).toFixed(2) 
      : "N/A";
    doc.text(`Average Intervention Effectiveness: ${avgEffectiveness}%`);
    doc.moveDown();

    // Interventions Log
    doc.fontSize(14).font("Helvetica-Bold").text("Interventions Log");
    doc.fontSize(10).font("Helvetica");

    interventions.slice(0, 20).forEach((intervention, index) => {
      doc.text(
        `${index + 1}. ${intervention.intervention} (${intervention.category}) - Effectiveness: ${intervention.effectiveness || "N/A"}%`,
        { indent: 10 }
      );
      if (intervention.userFeedback) {
        doc.text(`   Feedback: ${intervention.userFeedback}`, { indent: 20, color: "#666666" });
      }
      doc.moveDown(0.3);
    });

    if (interventions.length > 20) {
      doc.text(`... and ${interventions.length - 20} more interventions`, { color: "#999999" });
    }

    doc.moveDown();

    // Category Breakdown
    if (analytics.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").text("Intervention Categories");
      doc.fontSize(10).font("Helvetica");

      analytics.forEach((cat) => {
        doc.text(
          `${cat._id}: ${cat.count} interventions (Avg Effectiveness: ${cat.avgEffectiveness ? cat.avgEffectiveness.toFixed(2) : "N/A"}%)`,
          { indent: 10 }
        );
      });
    }

    doc.moveDown();
    doc.fontSize(8).text("This report was automatically generated by the Stress Management System.", {
      align: "center",
      color: "#999999",
    });

    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete intervention log
exports.deleteIntervention = async (req, res) => {
  try {
    const { interventionId } = req.params;

    await InterventionLog.findByIdAndDelete(interventionId);

    res.status(200).json({
      success: true,
      message: "Intervention deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
