const Assignment = require("../models/Assignment");
const Conflict = require("../models/Conflict");
const User = require("../models/User");
const GrantApplication = require("../models/GrantApplication");

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

module.exports = {
  assignReviewer,
  getMyAssignments,
  updateAssignmentDueDate,
  removeAssignment,
};