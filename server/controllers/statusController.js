const GrantApplication = require("../models/GrantApplication");
const Review = require("../models/Review");
const Assignment = require("../models/Assignment");
const ApplicationHistory = require("../models/ApplicationHistory");

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const application = await GrantApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const currentStatus = application.status;

    // SUBMITTED → ASSIGNED
    if (currentStatus === "SUBMITTED") {
      if (status !== "ASSIGNED") {
        return res.status(400).json({
          message: `Application can only move from SUBMITTED to ASSIGNED`,
        });
      }

      const assignmentCount = await Assignment.countDocuments({
        application: application._id,
        isActive:true
      });

      if (assignmentCount === 0) {
        return res.status(400).json({
          message:
            "Application cannot move to ASSIGNED until at least one reviewer is assigned",
        });
      }
    }

    // ASSIGNED → UNDER_REVIEW
    else if (currentStatus === "ASSIGNED") {
      if (status !== "UNDER_REVIEW") {
        return res.status(400).json({
          message: "Application can only move from ASSIGNED to UNDER_REVIEW",
        });
      }
    }

    // UNDER_REVIEW → DECIDED
    else if (currentStatus === "UNDER_REVIEW") {
      if (status !== "DECIDED") {
        return res.status(400).json({
          message: "Application can only move from UNDER_REVIEW to DECIDED",
        });
      }

      const completedReviews = await Review.countDocuments({
        application: application._id,
        status: "COMPLETED",
      });

      if (completedReviews < 3) {
        return res.status(400).json({
          message:
            "Application cannot move to DECIDED until at least 3 completed reviews exist",
        });
      }
    }

    // DECIDED is final
    else if (currentStatus === "DECIDED") {
      return res.status(400).json({
        message: "A DECIDED application cannot change status",
      });
    }

    const oldStatus = application.status;

    application.status = status;
    await application.save();

    await ApplicationHistory.create({
      application: application._id,
      action: "STATUS_CHANGED",
      performedBy: req.user._id,
      oldStatus,
      newStatus: status,
    });

    return res.json({
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

module.exports = {
  updateApplicationStatus,
};
