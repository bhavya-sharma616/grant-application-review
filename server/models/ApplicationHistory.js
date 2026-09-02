const mongoose = require("mongoose");

const applicationHistorySchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrantApplication",
      required: true,
      index: true,
    },

    action: {
      type: String,
      enum: [
        "CREATED",
        "STATUS_CHANGED",
        "REVIEWER_ASSIGNED",
        "REVIEWER_REMOVED",
        "COMMENT_ADDED",
        "CONFLICT_DECLARED",
        "REVIEW_COMPLETED",
        "ASSIGNMENT_DECLINED"
      ],
      required: true,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    oldStatus: {
      type: String,
      default: null,
    },

    newStatus: {
      type: String,
      default: null,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    comment: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "ApplicationHistory",
  applicationHistorySchema
);