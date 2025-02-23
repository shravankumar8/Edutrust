const express = require("express");
const { register, login, getMe } = require("../controllers/auth");
const router = express.Router();
const authMiddleware = require("../middleware/auth.js");
router.post("/register", register);
router.post("/login", login);

// Correct path

// router.get("/profile", authMiddleware(), (req, res) => {
//   res.json({ message: "Welcome!", user: req.user });
// });

module.exports = router;
