import express            from "express";
import bcrypt             from "bcryptjs";
import { signToken }      from "../config/auth.js";
import { authMiddleware } from "../middleware/auth.js";
import { userRepository } from "../repositories/userRepository.js";
import { sessionRepository }   from "../repositories/sessionRepository.js";
import { favouriteRepository } from "../repositories/favouriteRepository.js";
import { PASSWORD_REGEX, PASSWORD_ERROR } from "../config/constants.js";

const router = express.Router();

// ── POST /api/v1/auth/signup ──────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const {
      name, email, password,
      profilePicture = null,
      birthDay       = null,
      birthMonth     = null,
      gender         = null,
      country        = null,
      preferredGenres = [],
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: "Name, email and password are required." });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, error: PASSWORD_ERROR });
    }
    if (birthDay   !== null && (birthDay   < 1 || birthDay   > 31)) {
      return res.status(400).json({ success: false, error: "birthDay must be between 1 and 31." });
    }
    if (birthMonth !== null && (birthMonth < 1 || birthMonth > 12)) {
      return res.status(400).json({ success: false, error: "birthMonth must be between 1 and 12." });
    }

    const exists = await userRepository.emailExists(email);
    if (exists) {
      return res.status(400).json({ success: false, error: "An account with this email already exists." });
    }

    const user  = await userRepository.create({
      name: name.trim(), email: email.toLowerCase(),
      password, profilePicture, birthDay, birthMonth,
      gender, country, preferredGenres,
    });
    const token = signToken(user._id.toString());

    return res.status(201).json({
      success: true,
      data: { token, user: formatUser(user), message: `Welcome to MoodTunes, ${user.name}! 🎵` },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
  }
});

// ── POST /api/v1/auth/signin ──────────────────────────────────
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required." });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    await userRepository.updateLastLogin(user._id);
    user.lastLogin = new Date();
    const token = signToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: { token, user: formatUser(user), message: `Welcome back, ${user.name}! 🎵` },
    });
  } catch (err) {
    console.error("Signin error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong. Please try again." });
  }
});

// ── GET /api/v1/auth/me ───────────────────────────────────────
router.get("/me", authMiddleware, async (req, res) => {
  try {
    res.status(200).json({ success: true, data: formatUser(req.user) });
  } catch (err) {
    console.error("Me error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── PUT /api/v1/auth/profile ──────────────────────────────────
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const {
      name, profilePicture,
      birthDay, birthMonth,
      gender, country, preferredGenres,
    } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (name           !== undefined) updates.name           = name.trim();
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    if (birthDay       !== undefined) {
      if (birthDay !== null && (birthDay < 1 || birthDay > 31)) {
        return res.status(400).json({ success: false, error: "birthDay must be between 1 and 31." });
      }
      updates.birthDay = birthDay;
    }
    if (birthMonth !== undefined) {
      if (birthMonth !== null && (birthMonth < 1 || birthMonth > 12)) {
        return res.status(400).json({ success: false, error: "birthMonth must be between 1 and 12." });
      }
      updates.birthMonth = birthMonth;
    }
    if (gender          !== undefined) updates.gender          = gender;
    if (country         !== undefined) updates.country         = country;
    if (preferredGenres !== undefined) updates.preferredGenres = preferredGenres;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: "No fields provided to update." });
    }

    const updated = await userRepository.updateProfile(req.user._id, updates);
    res.status(200).json({
      success: true,
      data: { user: formatUser(updated), message: "Profile updated successfully." },
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── PUT /api/v1/auth/password ─────────────────────────────────
router.put("/password", authMiddleware, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, error: "current_password and new_password are required." });
    }
    if (!PASSWORD_REGEX.test(new_password)) {
      return res.status(400).json({ success: false, error: PASSWORD_ERROR });
    }
    if (current_password === new_password) {
      return res.status(400).json({ success: false, error: "New password must be different from current password." });
    }

    // Get user with password to verify
    const user = await userRepository.findByIdWithPassword(req.user._id);
    const valid = await user.comparePassword(current_password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Current password is incorrect." });
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(new_password, 12);
    await userRepository.updatePassword(req.user._id, hashed);

    res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── DELETE /api/v1/auth/account ───────────────────────────────
router.delete("/account", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ success: false, error: "Password is required to delete your account." });
    }

    // Verify password before deleting
    const user  = await userRepository.findByIdWithPassword(req.user._id);
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Incorrect password." });
    }

    // Delete all user data — sessions, favourites, account
    await Promise.all([
      sessionRepository.deleteAllByUser(req.user._id),
      favouriteRepository.deleteAllByUser(req.user._id),
      userRepository.deleteById(req.user._id),
    ]);

    res.status(200).json({ success: true, message: "Account and all data deleted successfully." });
  } catch (err) {
    console.error("Delete account error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});

// ── Helper ────────────────────────────────────────────────────
function formatUser(user) {
  return {
    id:              user._id.toString(),
    name:            user.name,
    email:           user.email,
    profilePicture:  user.profilePicture,
    birthDay:        user.birthDay,
    birthMonth:      user.birthMonth,
    gender:          user.gender,
    country:         user.country,
    preferredGenres: user.preferredGenres,
    isVerified:      user.isVerified,
    lastLogin:       user.lastLogin?.toISOString() || null,
    createdAt:       user.createdAt.toISOString(),
  };
}

export default router;
