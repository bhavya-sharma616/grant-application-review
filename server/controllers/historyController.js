const ApplicationHistory = require("../models/ApplicationHistory");

const getApplicationHistory = async (req, res) => {
  try {
    const history = await ApplicationHistory.find({
      application: req.params.applicationId,
    })
      .populate("performedBy", "name email role")
      .populate("reviewer", "name email")
      .sort({ createdAt: 1 });

    return res.json(history);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch application history",
      error: error.message,
    });
  }
};

module.exports = {
  getApplicationHistory,
};