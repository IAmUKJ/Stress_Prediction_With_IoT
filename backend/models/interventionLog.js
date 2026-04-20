const mongoose = require("mongoose");

const interventionLogSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    stressIndex: { type: Number, required: true },
    activity: { type: Number, required: true },
    intervention: { type: String, required: true },
    category: {
      type: String,
      enum: ["breathing", "movement", "hydration", "recovery", "maintenance"],
      required: true,
    },
    duration: { type: Number, default: 0 }, // in seconds
    effectiveness: { type: Number, min: 0, max: 100, default: null }, // user rating after intervention
    userFeedback: { type: String, default: "" },
    completed: { type: Boolean, default: false },
    sessionId: { type: String },
    notes: { type: String, default: "" },
    metadata: {
      heartRate: { type: Number, default: null },
      buildupDetected: { type: Boolean, default: false },
      recoverySeconds: { type: Number, default: null },
    },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Index for efficient queries
interventionLogSchema.index({ deviceId: 1, createdAt: -1 });
interventionLogSchema.index({ sessionId: 1 });

module.exports = mongoose.model("InterventionLog", interventionLogSchema);
