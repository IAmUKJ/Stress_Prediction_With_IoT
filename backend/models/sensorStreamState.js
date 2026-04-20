const mongoose = require("mongoose");

const sensorStreamStateSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    sampleIndex: {
      type: Number,
      default: 0,
    },
    lastAvgHeartRate: {
      type: Number,
      default: null,
    },
    lastFirebaseUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SensorStreamState", sensorStreamStateSchema);