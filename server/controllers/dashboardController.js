const GrantApplication = require("../models/GrantApplication");
const Assignment = require("../models/Assignment");
const Review = require("../models/Review");

const getDashboard = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Open applications = anything not decided and not archived
    const openApplications = await GrantApplication.countDocuments({
      isArchived: false,
      status: { $ne: "DECIDED" },
    });

    // Overdue active assignments
    const overdueAssignments = await Assignment.countDocuments({
      isActive: true,
      dueDate: { $lt: new Date() },
    });

    // Applications with at least 3 completed reviews
    const readyForDecisionData = await Review.aggregate([
      {
        $match: {
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: "$application",
          completedReviews: { $sum: 1 },
        },
      },
      {
        $match: {
          completedReviews: { $gte: 3 },
        },
      },
    ]);

    const readyForDecision = await GrantApplication.countDocuments({
      _id: {
        $in: readyForDecisionData.map((item) => item._id),
      },
      status: "UNDER_REVIEW",
      isArchived: false,
    });

    // Amount requested this month
    const amountRequestedThisMonth = await GrantApplication.aggregate([
      {
        $match: {
          submissionDate: { $gte: startOfMonth },
          isArchived: false,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amountRequested" },
        },
      },
    ]);

    // Applications by status
    const byStatus = await GrantApplication.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Applications by funding round
    const byFundingRound = await GrantApplication.aggregate([
      {
        $match: {
          isArchived: false,
        },
      },
      {
        $group: {
          _id: "$fundingRound",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    // Applications decided per week for the last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const decidedPerWeek = await GrantApplication.aggregate([
      {
        $match: {
          status: "DECIDED",
          updatedAt: { $gte: eightWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$updatedAt" },
            week: { $isoWeek: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1,
        },
      },
    ]);

    return res.json({
      headlineNumbers: {
        openApplications,
        overdueApplications: overdueAssignments,
        readyForDecision,
        amountRequestedThisMonth:
          amountRequestedThisMonth[0]?.total || 0,
      },

      byStatus,

      byFundingRound,

      decidedPerWeek,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
};