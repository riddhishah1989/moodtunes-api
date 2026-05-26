import express from "express";
import { User } from "../utils/userModel.js";
import { signToken } from "../utils/auth.js";
import {
  PASSWORD_REGEX,
  PASSWORD_ERROR,
  GENDER_OPTIONS,
} from "../utils/constants.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// ── POST /api/v1/auth/signup ──────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      profilePicture = null,
      birthDay = null,
      birthMonth = null,
      gender = null,
      country = null,
      preferredGenres = [],
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Name, email and password are required.",
      });
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, error: PASSWORD_ERROR });
    }

    // Validate birthDay and birthMonth if provided
    if (birthDay !== null && (birthDay < 1 || birthDay > 31)) {
      return res
        .status(400)
        .json({ success: false, error: "birthDay must be between 1 and 31." });
    }
    if (birthMonth !== null && (birthMonth < 1 || birthMonth > 12)) {
      return res.status(400).json({
        success: false,
        error: "birthMonth must be between 1 and 12.",
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "An account with this email already exists.",
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      profilePicture,
      birthDay,
      birthMonth,
      gender,
      country,
      preferredGenres,
    });

    const token = signToken(user._id.toString());

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          birthDay: user.birthDay,
          birthMonth: user.birthMonth,
          gender: user.gender,
          country: user.country,
          preferredGenres: user.preferredGenres,
          isVerified: user.isVerified,
          createdAt: user.createdAt.toISOString(),
        },
        message: `Welcome to MoodTunes, ${user.name}! 🎵`,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
});

// ── POST /api/v1/auth/signin ──────────────────────────────────────────────
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password are required.",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    // Verify password
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profilePicture: user.profilePicture,
          birthDay: user.birthDay,
          birthMonth: user.birthMonth,
          gender: user.gender,
          country: user.country,
          preferredGenres: user.preferredGenres,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin.toISOString(),
          createdAt: user.createdAt.toISOString(),
        },
        message: `Welcome back, ${user.name}! 🎵`,
      },
    });
  } catch (err) {
    console.error("Signin error:", err.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
});

// ── GET /api/v1/auth/me ───────────────────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // req.user is already set by middleware
    const user = req.user;
    return res.status(200).json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
        birthDay: user.birthDay,
        birthMonth: user.birthMonth,
        gender: user.gender,
        country: user.country,
        preferredGenres: user.preferredGenres,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Me error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

export default router;
