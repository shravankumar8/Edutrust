const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.register = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body; // ❌ No role in req.body

    // Check if email or wallet address already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (await User.findOne({ walletAddress })) {
      return res.status(400).json({ message: "Wallet address already in use" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (force role to "user")
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      walletAddress,
      role: "user", // 🔒 Role is always "user" by default
    });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error, please try again" });
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // 🔒 Prevents leaking info by keeping response generic
      await new Promise((resolve) => setTimeout(resolve, 500));
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 🔒 Adds slight delay
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error, please try again" });
  }
};
