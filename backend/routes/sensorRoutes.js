const express = require("express");
const {
  startFirebaseListener,
  getLiveReading,
  getLatestReading,
  getReadingHistory,
} = require("../controllers/sensorController");

const router = express.Router();

router.get("/start-listener", startFirebaseListener);
router.get("/live", getLiveReading);
router.get("/latest", getLatestReading);
router.get("/history", getReadingHistory);

module.exports = router;