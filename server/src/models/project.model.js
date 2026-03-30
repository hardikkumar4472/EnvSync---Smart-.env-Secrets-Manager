const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "envsync_user",
      required: true,
    },
  },
  { timestamps: true }
);

projectSchema.index({ name: 1, createdBy: 1 }, { unique: true });

module.exports = mongoose.model("Project", projectSchema);
