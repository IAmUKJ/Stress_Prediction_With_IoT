const mongoose = require("mongoose");

const stressPredictionSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, index: true },
    predictedClass: { type: String, required: true },
    stressIndex: { type: Number, required: true },
    confidence: { type: Number, required: true },
    featureVector: { type: [Number], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StressPrediction", stressPredictionSchema);