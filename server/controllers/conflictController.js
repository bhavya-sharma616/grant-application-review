const Conflict = require("../models/conflict");
const GrantApplication = require("../models/GrantApplication");
const Assignment = require("../models/assignment");
const ApplicationHistory = require("../models/ApplicationHistory");
const declareConflict = async (req, res) => {
  try {
    const { reason } = req.body;
    const { applicationId } = req.params;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Conflict reason is required",
      });
    }

    const application = await GrantApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const assignment = await Assignment.findOne({
      application: applicationId,
      reviewer: req.user._id,
      isActive: true,
    });

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to this application",
      });
    }

    const conflict = await Conflict.create({
      application: applicationId,
      reviewer: req.user._id,
      reason: reason.trim(),
    });

    // Remove reviewer from active assignment
    await Assignment.findOneAndUpdate(
      {
        application: applicationId,
        reviewer: req.user._id,
        isActive: true,
      },
      {
        isActive: false,
      },
    );

    // Tell PO through application audit trail
    await ApplicationHistory.create({
      application: applicationId,
      action: "CONFLICT_DECLARED",
      performedBy: req.user._id,
      reviewer : req.user._id,
      comment: reason.trim(),
    });

    return res.status(201).json({
      message: "Conflict of interest declared successfully",
      conflict,
    });
  } catch (error) {
    // Duplicate conflict
    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already declared a conflict for this application",
      });
    }

    return res.status(500).json({
      message: "Failed to declare conflict",
      error: error.message,
    });
  }
};

const getConflicts = async (req, res) => {
  try {
    const conflicts = await Conflict.find({
      reviewer: req.user._id,
    })
      .populate(
        "application",
        "applicantOrganizationName contactEmail fundingRound",
      )
      .sort({ createdAt: -1 });

    return res.json({
      conflicts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch conflicts",
      error: error.message,
    });
  }
};

const getApplicationConflicts = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const conflicts = await Conflict.find({
      application: applicationId,
    })
      .populate("reviewer", "name email")
      .sort({ createdAt: -1 });

    return res.json({
      conflicts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch application conflicts",
      error: error.message,
    });
  }
};

module.exports = { declareConflict, getConflicts, getApplicationConflicts};
