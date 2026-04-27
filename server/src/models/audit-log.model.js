const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "envsync_user",
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
        "PROJECT_ASSIGN",
        "PROJECT_UNASSIGN",
        "REGISTER",
        "USER_DELETE",
        "SECRET_LEAK_PREVENTED", 
      ],
    },
    details: {
      type: String, 
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

// Performance Indexes for high-scale querying
auditLogSchema.index({ projectId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // Global feed optimization

module.exports = mongoose.model("AuditLog", auditLogSchema);
