const StressPrediction = require("../models/stressPrediction");
const SensorReading = require("../models/sensorReading");

const {
  rollingMean,
  detectBuildUp,
  detectSpikes,
  recoveryTime,
} = require("../utils/trendEngine");

const getAnalytics = async (req, res) => {
  try {
    const deviceId = req.query.deviceId || "data";

    const stressRows = await StressPrediction.find({ deviceId })
      .sort({ createdAt: 1 })
      .limit(300);

    const sensorRows = await SensorReading.find({ deviceId })
      .sort({ createdAt: 1 })
      .limit(300);

    const stress = stressRows.map((row) => row.stressIndex);
    const activity = sensorRows.map((row) => row.activity || 0);

    const rolling = rollingMean(stress, 15);
    const spikes = detectSpikes(stress);
    const buildup = detectBuildUp(stress, 150);
    const recovery = recoveryTime(stress, activity);

    const series = stressRows.map((row, i) => ({
      time: row.createdAt,
      stress: stress[i],
      rolling: rolling[i],
      spike: spikes.includes(i),
    }));

    const avgStress =
      stress.length > 0
        ? stress.reduce((a, b) => a + b, 0) / stress.length
        : 0;

    res.json({
      success: true,
      summary: {
        buildupDetected: buildup,
        spikeCount: spikes.length,
        recoverySeconds: recovery,
        maxStress: Math.max(...stress, 0),
        avgStress: Number(avgStress.toFixed(2)),
      },
      series,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getAnalytics };