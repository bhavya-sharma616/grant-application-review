const Assignment = require("../models/Assignment");
const Conflict = require("../models/Conflict");
const User = require("../models/User");
const GrantApplication = require("../models/GrantApplication");
const ApplicationHistory = require("../models/ApplicationHistory");

// Assign a reviewer to an application
const assignReviewer = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reviewerId, dueDate } = req.body;

    if (!reviewerId || !dueDate) {
      return res.status(400).json({
        message: "Reviewer and due date are required",
      });
    }

    // Check application exists
    const application = await GrantApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // Check reviewer exists and actually has REVIEWER role
    const reviewer = await User.findById(reviewerId);

    if (!reviewer || reviewer.role !== "REVIEWER") {
      return res.status(400).json({
        message: "Selected user is not a valid reviewer",
      });
    }

    // Check for conflict of interest
    const conflict = await Conflict.findOne({
      application: applicationId,
      reviewer: reviewerId,
    });

    if (conflict) {
      return res.status(400).json({
        message:
          "Reviewer cannot be assigned because they declared a conflict of interest",
      });
    }

    // Check if already assigned
    const existingAssignment = await Assignment.findOne({
      application: applicationId,
      reviewer: reviewerId,
      isActive: true,
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: "Reviewer is already assigned to this application",
      });
    }

    // Count active assignments
    const activeAssignmentCount = await Assignment.countDocuments({
      reviewer: reviewerId,
      isActive: true,
    });

    if (activeAssignmentCount >= 5) {
      return res.status(400).json({
        message:
          "Reviewer cannot be assigned because they already have 5 active assignments",
      });
    }

    // Create assignment
    const assignment = await Assignment.create({
      application: applicationId,
      reviewer: reviewerId,
      dueDate,
    });

    application.status = "ASSIGNED";
    await application.save();

    await ApplicationHistory.create({
      application: applicationId,
      action: "REVIEWER_ASSIGNED",
      performedBy: req.user._id,
      reviewer: reviewerId,
    });

    return res.status(201).json({
      message: "Reviewer assigned successfully",
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to assign reviewer",
      error: error.message,
    });
  }
};

// Get all applications assigned to the logged-in reviewer
const getMyAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      reviewer: req.user._id,
      isActive: true,
    })
      .populate("application")
      .sort({ dueDate: 1 });

    return res.json(assignments);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch assignments",
      error: error.message,
    });
  }
};

// Update due date
const updateAssignmentDueDate = async (req, res) => {
  try {
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({
        message: "Due date is required",
      });
    }

    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    if (!assignment.isActive) {
      return res.status(400).json({
        message:
          "Due date cannot be changed because the review is already completed",
      });
    }

    assignment.dueDate = dueDate;
    await assignment.save();

    return res.json({
      message: "Assignment due date updated successfully",
      assignment,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update assignment",
      error: error.message,
    });
  }
};

// Remove assignment
const removeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found",
      });
    }

    if (!assignment.isActive) {
      return res.status(400).json({
        message:
          "Assignment cannot be removed because the review is already completed",
      });
    }

    await assignment.deleteOne();

    await ApplicationHistory.create({
      application: assignment.application,
      action: "REVIEWER_REMOVED",
      performedBy: req.user._id,
      reviewer: assignment.reviewer,
    });

    return res.json({
      message: "Assignment removed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove assignment",
      error: error.message,
    });
  }
};

// Reviewer declines an assignment with a reason
const declineAssignment = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Decline reason is required",
      });
    }

    const assignment = await Assignment.findOne({
      _id: req.params.id,
      reviewer: req.user._id,
      isActive: true,
    });

    if (!assignment) {
      return res.status(404).json({
        message: "Active assignment not found",
      });
    }

    await assignment.deleteOne();

    await ApplicationHistory.create({
      application: assignment.application,
      action: "ASSIGNMENT_DECLINED",
      performedBy: req.user._id,
      reviewer: assignment.reviewer,
      comment: reason.trim(),
    });

    return res.json({
      message: "Assignment declined successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to decline assignment",
      error: error.message,
    });
  }
};

// Bulk assign reviewers to every application in a funding round
const bulkAssignReviewers = async (req, res) => {
  try {
    const { fundingRound, reviewerIds, dueDate } = req.body;

    if (
      !fundingRound ||
      !Array.isArray(reviewerIds) ||
      reviewerIds.length === 0 ||
      !dueDate
    ) {
      return res.status(400).json({
        message: "Funding round, reviewers and due date are required",
      });
    }

    // Find all applications in the selected funding round
    const applications = await GrantApplication.find({
      fundingRound,
      isArchived: false,
    });

    if (applications.length === 0) {
      return res.status(404).json({
        message: "No applications found in this funding round",
      });
    }

    const results = [];

    for (const reviewerId of reviewerIds) {
      const reviewer = await User.findById(reviewerId);

      if (!reviewer || reviewer.role !== "REVIEWER") {
        for (const application of applications) {
          results.push({
            applicationId: application._id,
            reviewerId,
            status: "REFUSED",
            reason: "Selected user is not a valid reviewer",
          });
        }

        continue;
      }

      for (const application of applications) {
        // Check conflict of interest
        const conflict = await Conflict.findOne({
          application: application._id,
          reviewer: reviewerId,
        });

        if (conflict) {
          results.push({
            applicationId: application._id,
            reviewerId,
            status: "REFUSED",
            reason: "Reviewer has declared a conflict of interest",
          });

          continue;
        }

        // Check duplicate assignment
        const existingAssignment = await Assignment.findOne({
          application: application._id,
          reviewer: reviewerId,
        });

        if (existingAssignment) {
          results.push({
            applicationId: application._id,
            reviewerId,
            status: "REFUSED",
            reason: "Reviewer is already assigned to this application",
          });

          continue;
        }

        // Check active assignment limit
        const activeAssignmentCount = await Assignment.countDocuments({
          reviewer: reviewerId,
          isActive: true,
        });

        if (activeAssignmentCount >= 5) {
          results.push({
            applicationId: application._id,
            reviewerId,
            status: "REFUSED",
            reason: "Reviewer already has 5 active assignments",
          });

          continue;
        }

        // Create assignment
        const assignment = await Assignment.create({
          application: application._id,
          reviewer: reviewerId,
          dueDate,
          isActive: true,
        });
        application.status = "ASSIGNED";
        await application.save();
        
        // Add immutable history
        await ApplicationHistory.create({
          application: application._id,
          action: "REVIEWER_ASSIGNED",
          performedBy: req.user._id,
          reviewer: reviewerId,
        });

        results.push({
          applicationId: application._id,
          reviewerId,
          assignmentId: assignment._id,
          status: "SUCCEEDED",
        });
      }
    }

    return res.status(201).json({
      message: "Bulk reviewer assignment completed",
      fundingRound,
      totalApplications: applications.length,
      totalAssignmentsAttempted: applications.length * reviewerIds.length,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to bulk assign reviewers",
      error: error.message,
    });
  }
};

const getReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({
      role: "REVIEWER",
    }).select("name email");

    return res.json({
      reviewers,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch reviewers",
      error: error.message,
    });
  }
};

const getApplicationAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      application: req.params.applicationId,
      isActive: true,
    }).populate("reviewer", "name email");

    return res.json({
      assignments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch application assignments",
      error: error.message,
    });
  }
};

module.exports = {
  assignReviewer,
  getMyAssignments,
  updateAssignmentDueDate,
  removeAssignment,
  bulkAssignReviewers,
  getReviewers,
  getApplicationAssignments,
  declineAssignment
};
