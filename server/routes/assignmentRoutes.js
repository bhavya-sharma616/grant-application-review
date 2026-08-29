const express = require("express");

const {
  assignReviewer,
  getMyAssignments,
  updateAssignmentDueDate,
  removeAssignment,
} = require("../controllers/assignmentController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Reviewer sees their own assignments
router.get(
  "/my",
  protect,
  allowRoles("REVIEWER"),
  getMyAssignments
);

// Program Officer assigns reviewer
router.post(
  "/application/:applicationId",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  assignReviewer
);

// Program Officer changes due date
router.patch(
  "/:id/due-date",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  updateAssignmentDueDate
);

// Program Officer removes assignment
router.delete(
  "/:id",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  removeAssignment
);

module.exports = router;