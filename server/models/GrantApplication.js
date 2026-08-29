const mongoose = require("mongoose");

const grantApplicationSchema = new mongoose.Schema(
  {
    applicantOrganizationName: {
      type: String,
      required: true,
      trim: true,
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    fundingRound: {
      type: String,
      required: true,
      trim: true,
    },

    amountRequested: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    submissionDate: {
      type: Date,
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["SUBMITTED", "ASSIGNED", "UNDER_REVIEW", "DECIDED"],
      default: "SUBMITTED",
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GrantApplication = mongoose.model(
  "GrantApplication",
  grantApplicationSchema
);

module.exports = GrantApplication;