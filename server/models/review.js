const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GrantApplication",
      required: true,
    },

    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    impactScore: {
      type: Number,
      min: 1,
      max: 5,
    },

    feasibilityScore: {
      type: Number,
      min: 1,
      max: 5,
    },

    budgetJustificationScore: {
      type: Number,
      min: 1,
      max: 5,
    },

    comments: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "COMPLETED"],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
  },
);

// One review per reviewer per application
reviewSchema.index({ application: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
