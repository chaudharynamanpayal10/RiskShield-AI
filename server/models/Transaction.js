const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // ================= TRANSACTION ID =================

    transactionId: {
      type: String,
      required: [true, "Transaction ID is required"],
      unique: true,
      trim: true,
    },

    // ================= USER =================

    userId: {
      type: String,
      required: [true, "User ID is required"],
      trim: true,
    },

    // ================= TRANSACTION DETAILS =================

    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },

    frequency: {
      type: Number,
      required: [true, "Transaction frequency is required"],
      min: [0, "Frequency cannot be negative"],
      default: 1,
    },

    device: {
      type: String,
      required: [true, "Device information is required"],
      trim: true,
      default: "Known Device",
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      default: "Unknown",
    },

    // ================= AI RISK RESULT =================

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },

    action: {
      type: String,
      enum: ["Allowed", "Review", "Blocked"],
      default: "Allowed",
    },

    riskReasons: {
      type: [String],
      default: [],
    },
  },

  // ================= TIMESTAMPS =================

  {
    timestamps: true,
  }
);

// =====================================================
// INDEX
// =====================================================

// Prevent duplicate transaction IDs
transactionSchema.index(
  { transactionId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "Transaction",
  transactionSchema
);