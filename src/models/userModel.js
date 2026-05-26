import mongoose from "mongoose";
import bcrypt    from "bcryptjs";
import { GENDER_OPTIONS, PASSWORD_REGEX, PASSWORD_ERROR } from "../config/constants.js";

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: (value) => PASSWORD_REGEX.test(value),
        message: PASSWORD_ERROR,
      },
    },
    profilePicture:  { type: String,   default: null },
    birthDay:        { type: Number,   min: 1, max: 31, default: null },
    birthMonth:      { type: Number,   min: 1, max: 12, default: null },
    gender:          { type: String,   enum: GENDER_OPTIONS, default: null },
    country:         { type: String,   default: null },
    preferredGenres: [{ type: mongoose.Schema.Types.ObjectId, ref: "Genre" }],
    isVerified:      { type: Boolean,  default: false },
    lastLogin:       { type: Date,     default: null },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model("User", userSchema);
