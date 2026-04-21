const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
    },
    accelX: {
      type: Number,
      default: null,
    },
    accelY: {
      type: Number,
      default: null,
    },
    activity: {
      type: Number,
      default: null,
    },
    hrv: {
      type: Number,
      default: null,
    },
    spo2: {
      type: Number,
      default: null,
    },

    // direct heart-rate reading from device payload window
    heartRate: {
      type: Number,
      required: true,
    },

    firebaseUpdatedAt: {
      type: Date,
      default: Date.now,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SensorReading", sensorReadingSchema);