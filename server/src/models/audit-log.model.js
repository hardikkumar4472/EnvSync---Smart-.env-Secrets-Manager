const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "SECRET_CREATE",
        "SECRET_VIEW",
        "SECRET_UPDATE",
        "SECRET_DELETE",
        "SECRET_BULK_DELETE",
        "RUNTIME_SECRET_ACCESS",
        "PROJECT_CREATE",
        "PROJECT_UPDATE",
        "PROJECT_DELETE",
        "PROJECT_PERMANENT_DELETE",
      ],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    environment: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
