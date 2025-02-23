require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const CLERK_PEM_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7yZbF/Qq0btlNEMh421f
Hg0VQJISUSOG5aZ6g6N6DQFEYv+WzkCXDH6WCt15ornYjTDw1PwOkJEGa5yfwqC7
+os9dAv9wEcF8T5H21l5j3UjnLnmR4AeBa2ahNzomlz9JLUPNgmnSZ2U10gl/wpk
DUDR3UsNmVMxOQdeJSVKiZ7aYNbc1epQ13W6vV7Kvb8iPBU3qmg4MBglpelrW/M2
+U8xgS1xmMPYyoZZokSwUmw/LLVuKb0rgdPL6kYJUEkrj5SlJZtfcAPy/pvgJ4g/
7nXugYl2NCe1f+c0R4Cl7iOan4LFGLr6hCrQQtoOjMw4oTCQdpDizRVzPC5HLpGB
QwIDAQAB
-----END PUBLIC KEY-----`;

const PERMITTED_ORIGINS = ["http://localhost:5173"];

const auth =
  (roles = []) =>
  async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      console.log("Auth Header:", authHeader);

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
          .status(401)
          .json({ error: "Unauthorized: No token provided" });
      }

      const token = authHeader.replace("Bearer ", "");
      console.log("Token:", token);

      const decoded = jwt.verify(token, CLERK_PEM_PUBLIC_KEY, {
        algorithms: ["RS256"],
      });
      console.log("Decoded Token:", decoded);

      const currentTime = Math.floor(Date.now() / 1000);
      if (decoded.exp < currentTime) {
        throw new Error("Token has expired");
      }
      if (decoded.nbf > currentTime) {
        throw new Error("Token is not yet valid");
      }

      if (decoded.azp && !PERMITTED_ORIGINS.includes(decoded.azp)) {
        throw new Error("Invalid 'azp' claim: Unauthorized origin");
      }

      let user = await User.findOne({ clerkId: decoded.sub });
      if (!user) {
        user = await User.create({
          clerkId: decoded.sub,
          role: "user",
          walletAddress: null,
          institutionApplicationStatus: "none",
        });
        console.log("Created new user:", user);
      }
      req.user = { id: user.clerkId, role: user.role };
      console.log("User from DB:", user);
      console.log("Requested roles:", roles);
      console.log("User role:", user.role);

      if(user.role=="admin"){

        return next();
      }

      if (roles.length && !roles.includes(user.role)) {
        console.log(
          "Role check failed - roles required:",
          roles,
          "user role:",
          user.role
        );
        return res
          .status(403)
          .json({ error: "Forbidden: Insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Verification Error:", error.message, error.stack);
      res
        .status(401)
        .json({ error: error.message || "Unauthorized: Invalid token" });
    }
  };

const authUser = auth(["user"]);
const authInstitution = auth(["institution"]);
const authAdmin = auth(["admin"]);

module.exports = { auth, authUser, authInstitution, authAdmin };
