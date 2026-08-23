const axios = require("axios");
const Transaction = require("../models/Transaction");

// =====================================================
// CREATE TRANSACTION
// =====================================================

const createTransaction = async (req, res) => {
  try {
    const {
      transactionId,
      amount,
      frequency,
      device,
      location,
    } = req.body;

    // ================= VALIDATION =================

    if (!transactionId) {
      return res.status(400).json({
        message: "Transaction ID is required",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      amount === ""
    ) {
      return res.status(400).json({
        message: "Transaction amount is required",
      });
    }

    const numericAmount = Number(amount);

    if (
      Number.isNaN(numericAmount) ||
      numericAmount <= 0
    ) {
      return res.status(400).json({
        message:
          "Transaction amount must be a valid positive number",
      });
    }

    if (
      frequency === undefined ||
      frequency === null ||
      frequency === ""
    ) {
      return res.status(400).json({
        message: "Transaction frequency is required",
      });
    }

    const numericFrequency = Number(frequency);

    if (
      Number.isNaN(numericFrequency) ||
      numericFrequency < 0
    ) {
      return res.status(400).json({
        message:
          "Transaction frequency must be a valid number",
      });
    }

    if (
      !device ||
      typeof device !== "string" ||
      device.trim() === ""
    ) {
      return res.status(400).json({
        message: "Device information is required",
      });
    }

    if (
      !location ||
      typeof location !== "string" ||
      location.trim() === ""
    ) {
      return res.status(400).json({
        message: "Location is required",
      });
    }

    // ================= LOGGED-IN USER =================

    // User ID comes from JWT
    // NOT from frontend

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication failed",
      });
    }

    // ================= ML SERVICE =================

    // Deployed Python ML service on Render
    const mlResponse = await axios.post(
      "https://riskshield-ml-service.onrender.com/predict",
      {
        amount: numericAmount,
        frequency: numericFrequency,
        device: device.trim(),
        location: location.trim(),
      },
      {
        timeout: 10000,
      }
    );

    const riskResult = mlResponse.data;

    // ================= VALIDATE ML RESPONSE =================

    if (
      riskResult === undefined ||
      riskResult.riskScore === undefined ||
      !riskResult.riskLevel ||
      !riskResult.action
    ) {
      return res.status(502).json({
        message:
          "Invalid response received from AI Risk Engine",
      });
    }

    // ================= SAVE TRANSACTION =================

    const transaction = await Transaction.create({
      transactionId,

      userId,

      amount: numericAmount,

      frequency: numericFrequency,

      device: device.trim(),

      location: location.trim(),

      riskScore: Number(riskResult.riskScore),

      riskLevel: riskResult.riskLevel,

      action: riskResult.action,

      riskReasons: Array.isArray(
        riskResult.riskReasons
      )
        ? riskResult.riskReasons
        : [],
    });

    // ================= RESPONSE =================

    return res.status(201).json({
      message:
        "Transaction analyzed and created successfully",

      riskAnalysis: {
        score: Number(riskResult.riskScore),

        level: riskResult.riskLevel,

        action: riskResult.action,

        reasons: Array.isArray(
          riskResult.riskReasons
        )
          ? riskResult.riskReasons
          : [],
      },

      transaction,
    });

  } catch (error) {

    console.error(
      "Transaction Analysis Error:",
      error.message
    );

    // ================= ML SERVICE NOT RUNNING =================

    if (
      error.code === "ECONNREFUSED" ||
      error.code === "ECONNABORTED" ||
      error.code === "ETIMEDOUT"
    ) {
      return res.status(503).json({
        message:
          "AI Risk Engine is unavailable. Please try again later.",
      });
    }

    // ================= AXIOS ERROR =================

    if (error.response) {
      return res.status(502).json({
        message:
          "AI Risk Engine returned an error",

        error:
          error.response.data?.message ||
          error.message,
      });
    }

    // ================= MONGODB DUPLICATE TRANSACTION =================

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "Transaction ID already exists",
      });
    }

    // ================= OTHER SERVER ERROR =================

    return res.status(500).json({
      message:
        "Failed to create transaction",

      error:
        error.message,
    });
  }
};


// =====================================================
// GET USER TRANSACTIONS
// =====================================================

const getTransactions = async (req, res) => {
  try {

    // Get logged-in user's ID from JWT

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message:
          "User authentication failed",
      });
    }

    // Fetch ONLY current user's transactions

    const transactions =
      await Transaction.find({
        userId: userId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50);

    return res.status(200).json({
      count: transactions.length,
      transactions,
    });

  } catch (error) {

    console.error(
      "Fetch Transactions Error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to fetch transactions",

      error:
        error.message,
    });
  }
};


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createTransaction,
  getTransactions,
};