import { User } from "../models/userModel.js";

export const userRepository = {

  findByEmail: (email) =>
    User.findOne({ email: email.toLowerCase() }),

  findById: (id) =>
    User.findById(id).select("-password"),

  create: (data) =>
    User.create(data),

  updateLastLogin: (id) =>
    User.findByIdAndUpdate(id, { lastLogin: new Date() }, { new: true }),

  updateProfile: (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select("-password"),

  updatePassword: async (id, newHashedPassword) =>
    User.findByIdAndUpdate(id, { password: newHashedPassword }, { new: true }),

  deleteById: (id) =>
    User.findByIdAndDelete(id),

  emailExists: async (email) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    return !!user;
  },

  // Find user with password (for password change)
  findByIdWithPassword: (id) =>
    User.findById(id),
};
