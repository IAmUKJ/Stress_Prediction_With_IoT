const express = require("express");
const {
  getPrediction,
  getPredictionHistory,
} = require("../controllers/stressController");

const router = express.Router();

router.get("/predict", getPrediction);
router.get("/history", getPredictionHistory);

module.exports = router;