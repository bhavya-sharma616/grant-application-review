const Conflict = require("../models/Conflict");
const GrantApplication = require("../models/GrantApplication");
const Assignment = require("../models/Assignment");

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
      reason,
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

module.exports = { declareConflict };
