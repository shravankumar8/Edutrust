const Institution = require("../models/Institution");

const verifyInstitution = async (req, res, next) => {
  try {

    // Ensure user is authenticated
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: Only institutions can access this" });
    }

    // Check if institution is verified
    const institution = await Institution.findOne({
      _id: req.user.id,
      isVerified: true,
    });
    if (!institution) {
      return res
        .status(403)
        .json({ error: "Forbidden: Institution is not verified" });
    }

    req.institution = institution; // Attach institution data to request
    next();
  } catch (error) {
    console.error("Institution verification error:", error);
    res.status(500).json({ error: "Server error, please try again" });
  }
};

module.exports = verifyInstitution;
