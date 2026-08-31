const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
      unique: true,
    },

    dismissedAt: {
      type: Date,
      default: null,
    },

    dueDateAtDismissal: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Alert", alertSchema);