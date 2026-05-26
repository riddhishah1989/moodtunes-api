import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { GENDER_OPTIONS } from "./constants.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#^])[A-Za-z\d@$!%*?&_#^]{8,}$/.test(
            value,
          );
        },
        message:
          "Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, 1 special character (@$!%*?&_#^), and no spaces.",
      },
    },
    profilePicture: { type: String, default: null },
    birthDay: { type: Number, min: 1, max: 31, default: null }, // day only
    birthMonth: { type: Number, min: 1, max: 12, default: null }, // month only
    gender: { type: String, enum: GENDER_OPTIONS, default: null },
    country: { type: String, default: null },
    // NEW — stores Genre ObjectIDs
    preferredGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    isVerified: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
