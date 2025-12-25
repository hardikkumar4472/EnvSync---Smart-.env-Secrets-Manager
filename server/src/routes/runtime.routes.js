const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");

const {
  getRuntimeSecrets,
} = require("../controllers/runtime.controller");
router.post("/secrets", auth, rbac("admin", "developer"), getRuntimeSecrets);

module.exports = router;
