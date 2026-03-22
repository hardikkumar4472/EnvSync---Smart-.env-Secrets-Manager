const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const { login, register, adminCreateUser } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/admin-create-user", auth, rbac("admin"), adminCreateUser);

module.exports = router;
