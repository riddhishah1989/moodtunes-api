import express from "express";
import bcrypt from "bcryptjs";
import { signToken } from "../config/auth.js";
import { authMiddleware } from "../middleware/auth.js";
import { userRepository } from "../repositories/userRepository.js";
import { sessionRepository } from "../repositories/sessionRepository.js";
import { favouriteRepository } from "../repositories/favouriteRepository.js";
import { PASSWORD_REGEX, PASSWORD_ERROR } from "../config/constants.js";
import bcrypt from "bcryptjs";
import { sendOTPEmail } from "../config/emailService.js";
import UserRepository from "../repositories/userRepository.js";
import { signToken } from "../config/auth.js";

const router = express.Router();

// ── POST /api/v1/auth/signup ──────────────────────────────────
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

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Name, email and password are required.",
        });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ success: false, error: PASSWORD_ERROR });
    }
    if (birthDay !== null && (birthDay < 1 || birthDay > 31)) {
      return res
        .status(400)
        .json({ success: false, error: "birthDay must be between 1 and 31." });
    }
    if (birthMonth !== null && (birthMonth < 1 || birthMonth > 12)) {
      return res
        .status(400)
        .json({
          success: false,
          error: "birthMonth must be between 1 and 12.",
        });
    }

    const exists = await userRepository.emailExists(email);
    if (exists) {
      return res
        .status(400)
        .json({
          success: false,
          error: "An account with this email already exists.",
        });
    }

    const user = await userRepository.create({
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
        user: formatUser(user),
        message: `Welcome to MoodTunes, ${user.name}! 🎵`,
      },
    });
  } catch (err) {
    console.error("Signup error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Something went wrong. Please try again.",
      });
  }
});

// ── POST /api/v1/auth/signin ──────────────────────────────────
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required." });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    await userRepository.updateLastLogin(user._id);
    user.lastLogin = new Date();
    const token = signToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: formatUser(user),
        message: `Welcome back, ${user.name}! 🎵`,
      },
    });
  } catch (err) {
    console.error("Signin error:", err.message);
    res
      .status(500)
      .json({
        success: false,
        error: "Something went wrong. Please try again.",
      });
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
      name,
      profilePicture,
      birthDay,
      birthMonth,
      gender,
      country,
      preferredGenres,
    } = req.body;

    // Build update object with only provided fields
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;
    if (birthDay !== undefined) {
      if (birthDay !== null && (birthDay < 1 || birthDay > 31)) {
        return res
          .status(400)
          .json({
            success: false,
            error: "birthDay must be between 1 and 31.",
          });
      }
      updates.birthDay = birthDay;
    }
    if (birthMonth !== undefined) {
      if (birthMonth !== null && (birthMonth < 1 || birthMonth > 12)) {
        return res
          .status(400)
          .json({
            success: false,
            error: "birthMonth must be between 1 and 12.",
          });
      }
      updates.birthMonth = birthMonth;
    }
    if (gender !== undefined) updates.gender = gender;
    if (country !== undefined) updates.country = country;
    if (preferredGenres !== undefined)
      updates.preferredGenres = preferredGenres;

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No fields provided to update." });
    }

    const updated = await userRepository.updateProfile(req.user._id, updates);
    res.status(200).json({
      success: true,
      data: {
        user: formatUser(updated),
        message: "Profile updated successfully.",
      },
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
      return res
        .status(400)
        .json({
          success: false,
          error: "current_password and new_password are required.",
        });
    }
    if (!PASSWORD_REGEX.test(new_password)) {
      return res.status(400).json({ success: false, error: PASSWORD_ERROR });
    }
    if (current_password === new_password) {
      return res
        .status(400)
        .json({
          success: false,
          error: "New password must be different from current password.",
        });
    }

    // Get user with password to verify
    const user = await userRepository.findByIdWithPassword(req.user._id);
    const valid = await user.comparePassword(current_password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, error: "Current password is incorrect." });
    }

    // Hash new password and save
    const hashed = await bcrypt.hash(new_password, 12);
    await userRepository.updatePassword(req.user._id, hashed);

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
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
      return res
        .status(400)
        .json({
          success: false,
          error: "Password is required to delete your account.",
        });
    }

    // Verify password before deleting
    const user = await userRepository.findByIdWithPassword(req.user._id);
    const valid = await user.comparePassword(password);
    if (!valid) {
      return res
        .status(401)
        .json({ success: false, error: "Incorrect password." });
    }

    // Delete all user data — sessions, favourites, account
    await Promise.all([
      sessionRepository.deleteAllByUser(req.user._id),
      favouriteRepository.deleteAllByUser(req.user._id),
      userRepository.deleteById(req.user._id),
    ]);

    res
      .status(200)
      .json({
        success: true,
        message: "Account and all data deleted successfully.",
      });
  } catch (err) {
    console.error("Delete account error:", err.message);
    res.status(500).json({ success: false, error: "Something went wrong." });
  }
});
// ── Helper: generate 4-digit OTP ─────────────────────────────────────────
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 1000–9999
};

// ── Helper: hash OTP before storing ──────────────────────────────────────
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

// ── Helper: verify OTP ────────────────────────────────────────────────────
const verifyOTP = async (otp, hashedOTP) => {
  return bcrypt.compare(otp, hashedOTP);
};

// ════════════════════════════════════════════════════════════════════════
// 1. POST /api/v1/auth/forgot-password
//    User enters email → generate OTP → send email → store hashed OTP
// ════════════════════════════════════════════════════════════════════════
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
      });
    }

    // Check if user exists
    const user = await UserRepository.findByEmail(email.toLowerCase().trim());

    // Security: always return same message whether email exists or not
    // This prevents email enumeration attacks
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is registered, you will receive an OTP shortly.",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save hashed OTP + expiry to user
    await UserRepository.saveOTP(user._id, hashedOTP, expiry);

    // Send email
    await sendOTPEmail(email, otp, user.name);

    return res.status(200).json({
      success: true,
      message: "If this email is registered, you will receive an OTP shortly.",
      // In development only — remove in production!
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

// ════════════════════════════════════════════════════════════════════════
// 2. POST /api/v1/auth/verify-otp
//    User enters 4-digit OTP → verify → mark as verified
// ════════════════════════════════════════════════════════════════════════
export const verifyOTPHandler = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required.",
      });
    }

    if (otp.length !== 4 || !/^\d{4}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        error: "OTP must be a 4-digit number.",
      });
    }

    // Find user
    const user = await UserRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid request.",
      });
    }

    // Check if OTP exists
    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        error: "No OTP found. Please request a new one.",
      });
    }

    // Check if OTP expired
    if (new Date() > new Date(user.otpExpiry)) {
      // Clear expired OTP
      await UserRepository.clearOTP(user._id);
      return res.status(400).json({
        success: false,
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Verify OTP
    const isValid = await verifyOTP(otp, user.otpCode);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP. Please check and try again.",
      });
    }

    // Mark OTP as verified — user can now reset password
    await UserRepository.markOTPVerified(user._id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
      data: { email: user.email },
    });
  } catch (err) {
    console.error("verifyOTP error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

// ════════════════════════════════════════════════════════════════════════
// 3. POST /api/v1/auth/resend-otp
//    User requests new OTP → generate new OTP → send email
//    Rate limited: must wait 60 seconds between resends
// ════════════════════════════════════════════════════════════════════════
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        error: "Email is required.",
      });
    }

    const user = await UserRepository.findByEmail(email.toLowerCase().trim());

    // Always return same message for security
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email is registered, a new OTP will be sent.",
      });
    }

    // Rate limit: check if last OTP was sent less than 60 seconds ago
    if (user.otpExpiry) {
      const otpCreatedAt = new Date(user.otpExpiry).getTime() - 15 * 60 * 1000;
      const secondsPassed = (Date.now() - otpCreatedAt) / 1000;
      if (secondsPassed < 60) {
        const waitSeconds = Math.ceil(60 - secondsPassed);
        return res.status(429).json({
          success: false,
          error: `Please wait ${waitSeconds} seconds before requesting a new OTP.`,
        });
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Save new OTP
    await UserRepository.saveOTP(user._id, hashedOTP, expiry);

    // Send email
    await sendOTPEmail(email, otp, user.name);

    return res.status(200).json({
      success: true,
      message: "A new OTP has been sent to your email.",
      ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
    });
  } catch (err) {
    console.error("resendOTP error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

// ════════════════════════════════════════════════════════════════════════
// 4. POST /api/v1/auth/reset-password
//    User enters new password → verify OTP was verified → update password
// ════════════════════════════════════════════════════════════════════════
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validate all fields present
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Email, new password and confirm password are required.",
      });
    }

    // Passwords match check
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Passwords do not match.",
      });
    }

    // Password strength validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^])[^\s]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        error:
          "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit and 1 special character.",
      });
    }

    // Find user
    const user = await UserRepository.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid request.",
      });
    }

    // Check OTP was verified
    if (!user.otpVerified) {
      return res.status(400).json({
        success: false,
        error: "OTP not verified. Please verify your OTP first.",
      });
    }

    // Check OTP not expired
    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      await UserRepository.clearOTP(user._id);
      return res.status(400).json({
        success: false,
        error: "OTP session expired. Please start again.",
      });
    }

    // Update password + clear OTP fields
    await UserRepository.resetPassword(user._id, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

// ── Helper ────────────────────────────────────────────────────
function formatUser(user) {
  return {
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
  };
}

export default router;
