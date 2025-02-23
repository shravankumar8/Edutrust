const express = require("express");
const router = express.Router();
const issueCredential  = require("../controllers/credential");
// const { checkValidity } = require("../controllers/credentialController"); // From earlier
const authMiddleware = require("../middleware/auth");
const verifyRoutes = require("../controllers/certificate");
router.use("/pubish", authMiddleware.authAdmin, issueCredential);
router.use("/verify", verifyRoutes);
// router.post("/check-validity/:tokenId", authMiddleware(), checkValidity);

module.exports = router;
