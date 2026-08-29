const GrantApplication = require("../models/GrantApplication");

// Create application
const createApplication = async (req, res) => {
  try {
    const {
      applicantOrganizationName,
      contactEmail,
      fundingRound,
      amountRequested,
      submissionDate,
    } = req.body;

    if (
      !applicantOrganizationName ||
      !contactEmail ||
      !fundingRound ||
      !amountRequested ||
      !submissionDate
    ) {
      return res.status(400).json({
        message: "All application fields are required",
      });
    }

    const application = await GrantApplication.create({
      applicantOrganizationName,
      contactEmail,
      fundingRound,
      amountRequested,
      submissionDate,
      owner: req.user._id,
    });

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create application",
      error: error.message,
    });
  }
};

// Get one application
const getApplicationById = async (req, res) => {
  try {
    const application = await GrantApplication.findById(req.params.id)
      .populate("owner", "name email role");

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    return res.json(application);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch application",
      error: error.message,
    });
  }
};

// Update application
const updateApplication = async (req, res) => {
  try {
    const application = await GrantApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    const allowedFields = [
      "applicantOrganizationName",
      "contactEmail",
      "fundingRound",
      "amountRequested",
      "submissionDate",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();

    return res.json(application);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update application",
      error: error.message,
    });
  }
};

// Archive application
const archiveApplication = async (req, res) => {
  try {
    const application = await GrantApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.isArchived = true;
    application.archivedAt = new Date();

    await application.save();

    return res.json({
      message: "Application archived successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to archive application",
      error: error.message,
    });
  }
};

// Restore application
const restoreApplication = async (req, res) => {
  try {
    const application = await GrantApplication.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    application.isArchived = false;
    application.archivedAt = null;

    await application.save();

    return res.json({
      message: "Application restored successfully",
      application,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to restore application",
      error: error.message,
    });
  }
};

module.exports = {
  createApplication,
  getApplicationById,
  updateApplication,
  archiveApplication,
  restoreApplication,
};