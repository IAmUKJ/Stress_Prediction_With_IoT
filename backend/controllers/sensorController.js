const admin = require("../config/firebase");
const SensorReading = require("../models/sensorReading");
const SensorStreamState = require("../models/sensorStreamState");

let firebaseListenerStarted = false;

const deviceId = process.env.FIREBASE_PATH || "data";

async function cleanupInvalidReadings() {
  const result = await SensorReading.deleteMany({
    $and: [
      { derivedHeartRate: { $lte: 0 } },
      { firebaseHeartRateAvg: { $lte: 0 } },
    ],
  });

  if (result.deletedCount > 0) {
    console.log(`Deleted ${result.deletedCount} invalid zero/negative heart rate records`);
  }
}

async function initFirebaseListener() {
  if (firebaseListenerStarted) {
    return false;
  }

  await cleanupInvalidReadings();

  const ref = admin.database().ref(deviceId);

  ref.on("value", async (snapshot) => {
    try {
      if (!snapshot.exists()) return;

      const data = snapshot.val();

      const accelX = data.accelX !== undefined ? Number(data.accelX) : null;
      const accelY = data.accelY !== undefined ? Number(data.accelY) : null;
      const activity = data.activity !== undefined ? Number(data.activity) : null;
      const hrv = data.hrv !== undefined ? Number(data.hrv) : null;
      const spo2 = data.spo2 !== undefined ? Number(data.spo2) : null;

      const firebaseHeartRateAvg = Number(data.heartRate ?? 0);
      const firebaseUpdatedAt = data.updatedAt
        ? new Date(data.updatedAt)
        : new Date();

      let state = await SensorStreamState.findOne({ deviceId });

      if (!state) {
        state = await SensorStreamState.create({
          deviceId,
          sampleIndex: 0,
          lastAvgHeartRate: null,
          lastFirebaseUpdatedAt: null,
        });
      }

      let derivedHeartRate = firebaseHeartRateAvg;

      if (state.sampleIndex >= 1 && state.lastAvgHeartRate !== null) {
        const newCount = state.sampleIndex + 1;
        const oldCount = state.sampleIndex;

        // reconstructed raw/interval heart rate
        derivedHeartRate =
          newCount * firebaseHeartRateAvg - oldCount * state.lastAvgHeartRate;
      }

      // prevent weird negative values if data is noisy
      if (!Number.isFinite(derivedHeartRate)) {
        derivedHeartRate = firebaseHeartRateAvg;
      }

      // Only store when there is valid heart rate data
      if (derivedHeartRate <= 0 && firebaseHeartRateAvg <= 0) {
        console.log("Skipping empty Firebase reading: no heart rate data");
        return;
      }

      await SensorReading.create({
        deviceId,
        accelX,
        accelY,
        activity,
        hrv,
        spo2,
        firebaseHeartRateAvg,
        derivedHeartRate,
        firebaseUpdatedAt,
        receivedAt: new Date(),
      });

      state.sampleIndex += 1;
      state.lastAvgHeartRate = firebaseHeartRateAvg;
      state.lastFirebaseUpdatedAt = firebaseUpdatedAt;
      await state.save();

      console.log("Stored reading:", {
        firebaseHeartRateAvg,
        derivedHeartRate,
      });
    } catch (err) {
      console.error("Error saving Firebase reading:", err.message);
    }
  });

  firebaseListenerStarted = true;
  console.log("Firebase listener started for deviceId:", deviceId);
  return true;
}

// Start listening to Firebase and storing data in MongoDB
const startFirebaseListener = async (req, res) => {
  try {
    const started = await initFirebaseListener();
    return res.status(200).json({
      success: true,
      message: started
        ? "Firebase listener started successfully"
        : "Firebase listener already running",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get latest stored reading
const getLatestReading = async (req, res) => {
  try {
    const latest = await SensorReading.findOne({
      $or: [
        { derivedHeartRate: { $gt: 0 } },
        { firebaseHeartRateAvg: { $gt: 0 } },
      ],
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: latest,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get history
const getReadingHistory = async (req, res) => {
  try {
    const limit = Number(req.query.limit || 100);

    const history = await SensorReading.find({
      $or: [
        { derivedHeartRate: { $gt: 0 } },
        { firebaseHeartRateAvg: { $gt: 0 } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  initFirebaseListener,
  startFirebaseListener,
  getLatestReading,
  getReadingHistory,
};