const GrantApplication = require("../models/GrantApplication");
const Assignment = require("../models/assignment");
const ApplicationHistory = require("../models/ApplicationHistory");

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

    await ApplicationHistory.create({
      application: application._id,
      action: "CREATED",
      performedBy: req.user._id,
    });

    return res.status(201).json(application);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create application",
      error: error.message,
    });
  }
};

// Get applications with search, filters, sorting and pagination
const getApplications = async (req, res) => {
  try {
    const {
      search = "",
      fundingRound,
      status,
      owner,
      overdue,
      sortBy = "submissionDate",
      order = "desc",
      page = 1,
      limit = 10,
      archived = "false",
    } = req.query;

    const query = {};
    query.isArchived = archived === "true";
    // Reviewers can only see applications assigned to them
    if (req.user.role === "REVIEWER") {
      const assignments = await Assignment.find({
        reviewer: req.user._id,
        isActive: true,
      }).select("application");

      const applicationIds = assignments.map(
        (assignment) => assignment.application,
      );

      query._id = { $in: applicationIds };
    }

    // Search by organization name or contact email
    if (search.trim()) {
      query.$or = [
        {
          applicantOrganizationName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          contactEmail: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Funding round filter
    if (fundingRound) {
      query.fundingRound = fundingRound;
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Owner filter - only useful for Program Officers
    if (owner && req.user.role === "PROGRAM_OFFICER") {
      query.owner = owner;
    }

    // Overdue review filter
    if (overdue === "true") {
      const overdueAssignments = await Assignment.find({
        isActive: true,
        dueDate: { $lt: new Date() },
      }).select("application");

      const overdueApplicationIds = overdueAssignments.map(
        (assignment) => assignment.application,
      );

      query._id = query._id
        ? {
            $in: overdueApplicationIds.filter((applicationId) =>
              query._id.$in.some(
                (id) => id.toString() === applicationId.toString(),
              ),
            ),
          }
        : { $in: overdueApplicationIds };
    }

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);
    const skip = (pageNumber - 1) * limitNumber;

    // Only allow valid sorting fields
    const allowedSortFields = ["submissionDate", "amountRequested", "status"];

    const safeSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "submissionDate";

    const sortOrder = order === "asc" ? 1 : -1;

    const total = await GrantApplication.countDocuments(query);

    const applications = await GrantApplication.find(query)
      .populate("owner", "name email")
      .sort({ [safeSortBy]: sortOrder })
      .skip(skip)
      .limit(limitNumber);

    return res.json({
      applications,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch applications",
      error: error.message,
    });
  }
};

// Get one application
const getApplicationById = async (req, res) => {
  try {
    const application = await GrantApplication.findById(req.params.id).populate(
      "owner",
      "name email role",
    );

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }
    if (req.user.role === "REVIEWER") {
      const assignment = await Assignment.findOne({
        application: application._id,
        reviewer: req.user._id,
        isActive: true,
      });

      if (!assignment) {
        return res.status(403).json({
          message: "You are not assigned to this application",
        });
      }
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
  getApplications,
  getApplicationById,
  updateApplication,
  archiveApplication,
  restoreApplication,
};
