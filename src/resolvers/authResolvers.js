import { GraphQLError } from 'graphql';
import { User }         from '../utils/userModel.js';
import { signToken, requireAuth } from '../utils/auth.js';

export const authResolvers = {
  Query: {
    // ── GET logged-in user profile ────────────────────────────────────────
    me: async (_, __, context) => {
      const user = requireAuth(context);
      return {
        id:        user._id.toString(),
        name:      user.name,
        email:     user.email,
        createdAt: user.createdAt.toISOString(),
      };
    },
  },

  Mutation: {
    // ── SIGN UP ───────────────────────────────────────────────────────────
    signUp: async (_, { input }) => {
      const { name, email, password } = input;

      // Check if email already registered
      const existing = await User.findOne({ email });
      if (existing) {
        throw new GraphQLError('An account with this email already exists.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Validate inputs
      if (!name?.trim()) {
        throw new GraphQLError('Name is required.', { extensions: { code: 'BAD_USER_INPUT' } });
      }
      if (password.length < 6) {
        throw new GraphQLError('Password must be at least 6 characters.', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      // Create user (password hashed automatically by Mongoose pre-save hook)
      const user  = await User.create({ name: name.trim(), email, password });
      const token = signToken(user._id.toString());

      return {
        token,
        user: {
          id:        user._id.toString(),
          name:      user.name,
          email:     user.email,
          createdAt: user.createdAt.toISOString(),
        },
        message: `Welcome to MoodTunes, ${user.name}! 🎵`,
      };
    },

    // ── SIGN IN ───────────────────────────────────────────────────────────
    signIn: async (_, { input }) => {
      const { email, password } = input;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      // Verify password
      const valid = await user.comparePassword(password);
      if (!valid) {
        throw new GraphQLError('Invalid email or password.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const token = signToken(user._id.toString());

      return {
        token,
        user: {
          id:        user._id.toString(),
          name:      user.name,
          email:     user.email,
          createdAt: user.createdAt.toISOString(),
        },
        message: `Welcome back, ${user.name}! 🎵`,
      };
    },
  },
};
