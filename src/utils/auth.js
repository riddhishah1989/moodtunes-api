import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';
import { User } from './userModel.js';

// ── Sign a JWT token for a user ───────────────────────────────────────────
export function signToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// ── Verify token and return user (used in Apollo context) ─────────────────
export async function getUser(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId).select('-password');
    return user;
  } catch {
    return null; // Invalid or expired token — user is null (not logged in)
  }
}

// ── Guard: throw error if user is not logged in ───────────────────────────
export function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError('You must be logged in to do this.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}
