const express = require("express");

const {
  createReview,
  updateReview,
  completeReview,
  getCompletedReviews,
} = require("../controllers/reviewController");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Reviewer creates a draft
router.post(
  "/application/:applicationId",
  protect,
  allowRoles("REVIEWER"),
  createReview
);

// Reviewer edits their draft
router.patch(
  "/:id",
  protect,
  allowRoles("REVIEWER"),
  updateReview
);

// Reviewer completes review
router.patch(
  "/:id/complete",
  protect,
  allowRoles("REVIEWER"),
  completeReview
);

// View completed reviews
router.get(
  "/application/:applicationId",
  protect,
  getCompletedReviews
);

module.exports = router;