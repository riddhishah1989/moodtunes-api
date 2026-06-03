import jwt from "jsonwebtoken";
import { getUser } from "../config/auth.js";
import { userRepository } from "../repositories/userRepository.js";

// ── Auth Middleware ───────────────────────────────────────────
export async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided. Please sign in.",
      });
    }
    const user = await getUser(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired token.",
      });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({
      success: false,
      error: "Authentication failed.",
    });
  }
}

// ── Auth Middleware — Allow Expired Tokens ────────────────────
// Used only for refresh-token endpoint
export const authMiddlewareAllowExpired = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No token provided.",
      });
    }

    // ignoreExpiration: true — allows expired tokens through
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      ignoreExpiration: true,
    });

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("AuthMiddlewareAllowExpired error:", err.message);
    return res.status(401).json({
      success: false,
      error: "Invalid token.",
    });
  }
};
