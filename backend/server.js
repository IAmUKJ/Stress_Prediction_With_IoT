require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const sensorRoutes = require("./routes/sensorRoutes");
const stressRoutes = require("./routes/stressRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const interventionRoutes = require("./routes/interventionRoutes");
const { initFirebaseListener } = require("./controllers/sensorController");

const app = express();

connectDB();
initFirebaseListener().catch((err) => {
  console.error("Failed to start Firebase listener:", err.message);
});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("IoT Dashboard Backend Running");
});

app.use("/api/sensors", sensorRoutes);
app.use("/api/stress", stressRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/interventions", interventionRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});