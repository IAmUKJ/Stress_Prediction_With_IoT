const SensorReading = require("../models/sensorReading");
const StressPrediction = require("../models/stressPrediction");
const { buildFeaturesFromLiveBuffer } = require("../ml/stressInference");
const { spawn } = require("child_process");
const path = require("path");

const FEATURE_COUNT = 12;

function predictWithPython(features) {
  return new Promise((resolve, reject) => {
    const py = spawn("python", [
      path.join(__dirname, "../ml/predict.py"),
      JSON.stringify(features),
    ]);

    let out = "";
    let err = "";

    py.stdout.on("data", (data) => (out += data.toString()));
    py.stderr.on("data", (data) => (err += data.toString()));

    py.on("close", (code) => {
      if (code !== 0) return reject(new Error(err || "Python prediction failed"));
      try {
        resolve(JSON.parse(out));
      } catch (e) {
        reject(e);
      }
    });
  });
}

const getPrediction = async (req, res) => {
  try {
    const { deviceId = "data" } = req.query;

    const latestRows = await SensorReading.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(15)
      .lean();

    if (latestRows.length < 3) {
      return res.status(400).json({
        success: false,
        message: "Need at least 3 readings for prediction",
      });
    }

    const bufferRows = latestRows.reverse();
    const features = buildFeaturesFromLiveBuffer(bufferRows);

    const prediction = await predictWithPython(features);

    const saved = await StressPrediction.create({
      deviceId,
      predictedClass: prediction.stress_label,
      stressIndex: prediction.stress_index,
      confidence: prediction.confidence,
      featureVector: features,
    });

    return res.json({
      success: true,
      data: saved,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPredictionHistory = async (req, res) => {
  try {
    const deviceId = req.query.deviceId || "data";
    const history = await StressPrediction.find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { getPrediction, getPredictionHistory };