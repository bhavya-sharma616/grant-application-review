const express = require("express");

const {
  assignReviewer,
  getMyAssignments,
  updateAssignmentDueDate,
  removeAssignment,
  bulkAssignReviewers,
  getReviewers,
  getApplicationAssignments,
  declineAssignment
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

// Program Officer bulk assigns reviewers to a funding round
router.post(
  "/bulk",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  bulkAssignReviewers
);

router.get(
  "/reviewers",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  getReviewers
);

// Program Officer changes due date
router.patch(
  "/:id/due-date",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  updateAssignmentDueDate
);

// Reviewer declines their assignment
router.post(
  "/:id/decline",
  protect,
  allowRoles("REVIEWER"),
  declineAssignment
);

// Program Officer removes assignment
router.delete(
  "/:id",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  removeAssignment
);

router.get(
  "/application/:applicationId",
  protect,
  allowRoles("PROGRAM_OFFICER"),
  getApplicationAssignments
);

module.exports = router;