const express = require("express");

const {
  exportRoundReviews,
} = require("../controllers/exportController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/reviews",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  exportRoundReviews
);

module.exports = router;