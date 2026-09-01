const Alert = require("../models/Alert");
const Assignment = require("../models/Assignment");

const getAlerts = async (req, res) => {
  try {
    if (req.user.role !== "PROGRAM_OFFICER") {
      return res.status(403).json({
        message: "Only Program Officers can access alerts",
      });
    }

    const now = new Date();

    const overdueAssignments = await Assignment.find({
      isActive: true,
      dueDate: { $lt: now },
    })
      .populate("application", "applicantOrganizationName fundingRound")
      .populate("reviewer", "name email");

    const alerts = [];

    for (const assignment of overdueAssignments) {
      let alert = await Alert.findOne({
        assignment: assignment._id,
      });

      // Create alert if one does not exist
      if (!alert) {
        alert = await Alert.create({
          assignment: assignment._id,
        });
      }

      // If due date changed after dismissal, allow the alert to return
      if (
        alert.dismissedAt &&
        alert.dueDateAtDismissal &&
        assignment.dueDate > alert.dueDateAtDismissal
      ) {
        alert.dismissedAt = null;
        alert.dueDateAtDismissal = null;
        await alert.save();
      }

      // Only show non-dismissed alerts
      if (!alert.dismissedAt) {
        alerts.push({
          ...alert.toObject(),
          assignment,
        });
      }
    }

    return res.json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch alerts",
      error: error.message,
    });
  }
};

const dismissAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id).populate("assignment");

    if (!alert) {
      return res.status(404).json({
        message: "Alert not found",
      });
    }

    alert.dismissedAt = new Date();
    alert.dueDateAtDismissal = alert.assignment.dueDate;

    await alert.save();

    return res.json({
      message: "Alert dismissed successfully",
      alert,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to dismiss alert",
      error: error.message,
    });
  }
};

module.exports = {
  getAlerts,
  dismissAlert,
};
