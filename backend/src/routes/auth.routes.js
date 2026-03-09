const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/auth.controller");
const { requireAuth } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);

router.get("/me", requireAuth, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

module.exports = router;