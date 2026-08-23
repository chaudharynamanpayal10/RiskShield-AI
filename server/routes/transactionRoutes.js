const express = require("express");

const {
  createTransaction,
  getTransactions,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// Protected routes
router.post("/", protect, createTransaction);

router.get("/", protect, getTransactions);

module.exports = router;