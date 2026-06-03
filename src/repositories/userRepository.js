import { User } from "../models/userModel.js";

export const userRepository = {
  findByEmail: (email) => User.findOne({ email: email.toLowerCase() }),

  findById: (id) => User.findById(id).select("-password"),

  create: (data) => User.create(data),

  updateLastLogin: (id) =>
    User.findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true }),

  updateProfile: (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select(
      "-password",
    ),

  updatePassword: async (id, newHashedPassword) =>
    User.findByIdAndUpdate(id, { password: newHashedPassword }, { new: true }),

  deleteById: (id) => User.findByIdAndDelete(id),

  emailExists: async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  },

  findByIdWithPassword: (id) => User.findById(id),

  // ── NEW: OTP methods ──────────────────────────────────────────────

  saveOTP: (id, hashedOTP, expiry) =>
    User.findByIdAndUpdate(
      id,
      {
        otpCode: hashedOTP,
        otpExpiry: expiry,
        otpVerified: false,
      },
      { new: true },
    ),

  markOTPVerified: (id) =>
    User.findByIdAndUpdate(id, { otpVerified: true }, { new: true }),

  clearOTP: (id) =>
    User.findByIdAndUpdate(
      id,
      {
        otpCode: null,
        otpExpiry: null,
        otpVerified: false,
      },
      { new: true },
    ),

  resetPassword: async (id, newPassword) => {
    const user = await User.findById(id);
    user.password = newPassword; // pre-save hook hashes it
    user.otpCode = null;
    user.otpExpiry = null;
    user.otpVerified = false;
    return user.save();
  },
};
