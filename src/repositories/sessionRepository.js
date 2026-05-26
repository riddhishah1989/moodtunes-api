import { Session } from "../models/sessionModel.js";

// ── Session Repository ────────────────────────────────────────
// All database operations for Session model live here.

export const sessionRepository = {

  // Get all sessions for a user (paginated)
  findByUserId: (userId, limit = 20, offset = 0) =>
    Session.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit),

  // Count total sessions for a user
  countByUserId: (userId) =>
    Session.countDocuments({ userId }),

  // Get single session by ID and userId
  findByIdAndUser: (id, userId) =>
    Session.findOne({ _id: id, userId }),

  // Create a new session
  create: (data) =>
    Session.create(data),

  // Delete single session
  deleteByIdAndUser: (id, userId) =>
    Session.deleteOne({ _id: id, userId }),

  // Delete all sessions for a user
  deleteAllByUser: (userId) =>
    Session.deleteMany({ userId }),
};
