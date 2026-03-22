const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const rbac = require("../middleware/rbac.middleware");
const { listUsers, assignProjectToUser, unassignProjectFromUser, deleteUser } = require("../controllers/admin.controller");

router.get("/dashboard", auth, rbac("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
    user: req.user,
  });
});

router.get("/users", auth, rbac("admin"), listUsers);
router.post("/assign-project", auth, rbac("admin"), assignProjectToUser);
router.post("/unassign-project", auth, rbac("admin"), unassignProjectFromUser);
router.delete("/users/:userId", auth, rbac("admin"), deleteUser);

module.exports = router;
