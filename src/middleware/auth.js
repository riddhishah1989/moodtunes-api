import { getUser } from '../utils/auth.js';

// ── Auth Middleware ───────────────────────────────────────────
// Protects routes that require login
// Usage: router.get('/protected', authMiddleware, handler)
export async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided. Please sign in.',
      });
    }

    const user = await getUser(token);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed.',
    });
  }
}