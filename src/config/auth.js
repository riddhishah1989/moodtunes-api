import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";

// ── Sign a JWT token for a user ───────────────────────────────
export function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// ── Verify token and return user ──────────────────────────────
export async function getUser(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId).select("-password");
    return user;
  } catch {
    return null;
  }
}
