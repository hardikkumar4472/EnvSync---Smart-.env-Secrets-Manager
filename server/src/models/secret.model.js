const mongoose = require("mongoose");

const secretSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    environment: {
      type: String,
      enum: ["dev", "staging", "prod"],
      required: true,
    },
    key: { type: String, required: true },

    encryptedValue: {
      iv: String,
      content: String,
      tag: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

secretSchema.index({ projectId: 1, environment: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("Secret", secretSchema);
