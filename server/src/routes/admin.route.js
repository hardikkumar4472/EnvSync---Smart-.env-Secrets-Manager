const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
router.get("/dashboard", auth, rbac("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});

module.exports = router;
