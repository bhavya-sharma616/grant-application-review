const express = require("express");

const {
  getAlerts,
  dismissAlert,
} = require("../controllers/alertController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Program Officers can view overdue alerts
router.get(
  "/",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  getAlerts
);

// Program Officers can dismiss an alert
router.patch(
  "/:id/dismiss",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  dismissAlert
);

module.exports = router;