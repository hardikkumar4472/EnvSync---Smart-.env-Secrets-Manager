const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const { listAuditLogs } = require("../controllers/audit.controller");

router.get("/", auth, rbac("admin"), listAuditLogs);

module.exports = router;
