const admin = require("../config/firebase");
const SensorReading = require("../models/sensorReading");
const SensorStreamState = require("../models/sensorStreamState");

let firebaseListenerStarted = false;

const deviceId = process.env.FIREBASE_PATH || "data";
const MIN_HEART_RATE = 30;

function getByPath(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function pickFirstNumber(source, paths) {
  for (const p of paths) {
    const value = getByPath(source, p);
    if (value === undefined || value === null) continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function parseFirebasePayload(data) {
  return {
    accelX: pickFirstNumber(data, ["accelX", "accel_x", "imu.accelX", "imu.ax"]),
    accelY: pickFirstNumber(data, ["accelY", "accel_y", "imu.accelY", "imu.ay"]),
    activity: pickFirstNumber(data, ["activity", "Activity", "imu.activity", "imuActivity"]),
    hrv: pickFirstNumber(data, ["hrv", "HRV", "heartRateVariability", "imu.hrv"]),
    spo2: pickFirstNumber(data, ["spo2", "SpO2", "oxygen", "oxygenSaturation"]),
    heartRateAvg: pickFirstNumber(data, ["heartRate", "hr", "heart_rate", "avgHeartRate"]),
    firebaseUpdatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
  };
}

async function getLatestLiveSnapshot() {
  try {
    const snapshot = await admin.database().ref(deviceId).once("value");
    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    const parsed = parseFirebasePayload(data);

    return {
      activity: parsed.activity,
      accelX: parsed.accelX,
      accelY: parsed.accelY,
      hrv: parsed.hrv,
      spo2: parsed.spo2,
      firebaseHeartRateAvg: parsed.heartRateAvg,
      firebaseUpdatedAt: parsed.firebaseUpdatedAt,
    };
  } catch (error) {
    console.error("Error reading live Firebase snapshot:", error.message);
    return null;
  }
}

async function cleanupInvalidReadings() {
  const result = await SensorReading.deleteMany({
    derivedHeartRate: { $lt: MIN_HEART_RATE },
  });

  if (result.deletedCount > 0) {
    console.log(
      `Deleted ${result.deletedCount} invalid heart rate records (< ${MIN_HEART_RATE})`
    );
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
      const parsed = parseFirebasePayload(data);

      const accelX = parsed.accelX;
      const accelY = parsed.accelY;
      const activity = parsed.activity;
      const hrv = parsed.hrv;
      const spo2 = parsed.spo2;

      const firebaseHeartRateAvg = Number(parsed.heartRateAvg ?? 0);
      const firebaseUpdatedAt = parsed.firebaseUpdatedAt;

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

      // Store only when reconstructed/latest heart rate is valid.
      if (!Number.isFinite(derivedHeartRate) || derivedHeartRate < MIN_HEART_RATE) {
        console.log(
          `Skipping Firebase reading: latest heart rate ${derivedHeartRate} is below ${MIN_HEART_RATE}`
        );
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
      derivedHeartRate: { $gte: MIN_HEART_RATE },
    })
      .sort({ createdAt: -1 });

    const live = await getLatestLiveSnapshot();

    let data = latest ? latest.toObject() : null;

    if (live) {
      if (!data) {
        data = {
          deviceId,
          accelX: live.accelX,
          accelY: live.accelY,
          activity: live.activity,
          hrv: live.hrv,
          spo2: live.spo2,
          firebaseHeartRateAvg: live.firebaseHeartRateAvg,
          derivedHeartRate: null,
          firebaseUpdatedAt: live.firebaseUpdatedAt,
          receivedAt: new Date(),
          liveOnly: true,
        };
      } else {
        data.activity = live.activity;
        data.accelX = live.accelX;
        data.accelY = live.accelY;
        data.hrv = live.hrv;
        data.spo2 = live.spo2;
        data.firebaseHeartRateAvg = live.firebaseHeartRateAvg;
        data.firebaseUpdatedAt = live.firebaseUpdatedAt;
      }
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLiveReading = async (req, res) => {
  try {
    const live = await getLatestLiveSnapshot();
    return res.status(200).json({
      success: true,
      data: live,
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
      derivedHeartRate: { $gte: MIN_HEART_RATE },
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
  getLiveReading,
  getLatestReading,
  getReadingHistory,
};