const Review = require("../models/review");
const GrantApplication = require("../models/GrantApplication");

const exportRoundReviews = async (req, res) => {
  try {
    const { fundingRound } = req.query;

    if (!fundingRound) {
      return res.status(400).json({
        message: "Funding round is required",
      });
    }

    const applications = await GrantApplication.find({
      fundingRound,
    }).select("_id applicantOrganizationName");

    const applicationIds = applications.map((application) => application._id);

    const reviews = await Review.find({
      application: { $in: applicationIds },
      status: "COMPLETED",
    })
      .populate("reviewer", "name email")
      .populate("application", "applicantOrganizationName fundingRound")
      .sort({ createdAt: 1 });

    const escapeCsv = (value) => {
      if (value === null || value === undefined) {
        return "";
      }

      const stringValue = String(value).replace(/"/g, '""');

      return `"${stringValue}"`;
    };

    const headers = [
      "Application",
      "Reviewer",
      "Reviewer Email",
      "Impact",
      "Feasibility",
      "Budget Justification",
      "Comments",
    ];

    const rows = reviews.map((review) => [
      review.application?.applicantOrganizationName,
      review.reviewer?.name,
      review.reviewer?.email,
      review.impactScore,
      review.feasibilityScore,
      review.budgetJustificationScore,
      review.comments,
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fundingRound}-completed-reviews.csv"`
    );

    return res.send(csv);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to export reviews",
      error: error.message,
    });
  }
};

module.exports = {
  exportRoundReviews,
};