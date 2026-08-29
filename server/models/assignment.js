const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
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

    dueDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent the same reviewer from being assigned twice
assignmentSchema.index(
  { application: 1, reviewer: 1 },
  { unique: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);