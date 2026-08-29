const mongoose = require("mongoose");

const conflictSchema = new mongoose.Schema(
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

    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One reviewer can declare only one conflict per application
conflictSchema.index(
  { application: 1, reviewer: 1 },
  { unique: true }
);

module.exports = mongoose.model("Conflict", conflictSchema);