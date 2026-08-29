const express = require("express");

const { declareConflict } = require("../controllers/conflictController");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/:applicationId",
  protect,
  allowRoles("REVIEWER"),
  declareConflict
);

module.exports = router;