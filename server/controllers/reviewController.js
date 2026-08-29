const Review = require("../models/review");
const Assignment = require("../models/Assignment");
const GrantApplication = require("../models/GrantApplication");

// Create or save a draft review
const createReview = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const {
      impactScore,
      feasibilityScore,
      budgetJustificationScore,
      comments,
    } = req.body;

    // Check application exists
    const application = await GrantApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Check reviewer is assigned to this application
    const assignment = await Assignment.findOne({
      application: applicationId,
      reviewer: req.user._id,
      isActive: true,
    });

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to review this application",
      });
    }

    // Prevent duplicate review
    const existingReview = await Review.findOne({
      application: applicationId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You already have a review for this application",
      });
    }

    const review = await Review.create({
      application: applicationId,
      reviewer: req.user._id,
      impactScore,
      feasibilityScore,
      budgetJustificationScore,
      comments,
      status: "DRAFT",
    });

    return res.status(201).json({
      message: "Review draft created successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// Edit a draft review
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    // Only the reviewer who created it can edit it
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot edit someone else's review",
      });
    }

    // Completed reviews are locked
    if (review.status === "COMPLETED") {
      return res.status(400).json({
        message: "Completed reviews cannot be edited",
      });
    }

    const allowedFields = [
      "impactScore",
      "feasibilityScore",
      "budgetJustificationScore",
      "comments",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        review[field] = req.body[field];
      }
    });

    await review.save();

    return res.json({
      message: "Review draft updated successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// Complete a review
const completeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You cannot complete someone else's review",
      });
    }

    if (review.status === "COMPLETED") {
      return res.status(400).json({
        message: "Review is already completed",
      });
    }

    review.status = "COMPLETED";
    await review.save();

    // Review is finished, so this assignment is no longer active
    await Assignment.findOneAndUpdate(
      {
        application: review.application,
        reviewer: req.user._id,
      },
      {
        isActive: false,
      }
    );

    return res.json({
      message: "Review completed successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to complete review",
      error: error.message,
    });
  }
};

// Get all completed reviews for an application
const getCompletedReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      application: req.params.applicationId,
      status: "COMPLETED",
    })
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });

    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  updateReview,
  completeReview,
  getCompletedReviews,
};