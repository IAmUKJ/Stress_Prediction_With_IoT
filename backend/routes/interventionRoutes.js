const express = require("express");
const {
  logIntervention,
  getInterventions,
  getSessionInterventions,
  updateInterventionFeedback,
  getGeminiRecommendations,
  getInterventionStats,
  exportSessionPDF,
  deleteIntervention,
} = require("../controllers/interventionController");

const router = express.Router();

// Log a new intervention
router.post("/log", logIntervention);

// Specific routes first (must come before /:deviceId)
router.get("/session/:sessionId", getSessionInterventions);
router.get("/recommendations/:deviceId", getGeminiRecommendations);
router.get("/export/:sessionId/pdf", exportSessionPDF);

// Generic routes after specific ones
router.get("/:deviceId/stats", getInterventionStats);
router.get("/:deviceId", getInterventions);

// Update intervention feedback/effectiveness
router.put("/:interventionId/feedback", updateInterventionFeedback);

// Delete intervention
router.delete("/:interventionId", deleteIntervention);

module.exports = router;
