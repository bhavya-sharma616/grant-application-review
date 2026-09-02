const express = require("express");
const User = require("../models/User");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all Program Officers
router.get(
  "/program-officers",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  async (req, res) => {
    try {
      const programOfficers = await User.find({
        role: "PROGRAM_OFFICER",
      })
        .select("_id name email")
        .sort({ name: 1 });

      return res.json(programOfficers);
    } catch (error) {
      console.error("Failed to fetch program officers:", error);

      return res.status(500).json({
        message: "Failed to fetch program officers",
      });
    }
  }
);

module.exports = router;