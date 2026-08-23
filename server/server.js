const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("node:dns");
const authRoutes = require("./routes/authRoutes");

require("dotenv").config();

// Use public DNS for MongoDB SRV lookup
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "RiskShield AI Backend is running",
    status: "Online",
  });
});

app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`RiskShield AI server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });