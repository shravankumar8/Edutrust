const express = require("express");
const {
  applyInstitution,
  getAllInstitutions,
  getInstitutionById,
  approveInstitution,
  dashboard,
} = require("../controllers/institution");
const authMiddleware = require("../middleware/auth.js");
const router = express.Router();

router.post("/register", authMiddleware.authUser, applyInstitution);
router.get("/list", getAllInstitutions);
// router.get("/:id", getInstitutionById);

router.post("/approve", approveInstitution);
router.get("/dashboard",authMiddleware.authAdmin, dashboard);


module.exports = router;
