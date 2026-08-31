const express = require("express");

const {
  getApplicationHistory,
} = require("../controllers/historyController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/application/:applicationId",
  protect,
  getApplicationHistory
);

module.exports = router;