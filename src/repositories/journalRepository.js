import { Journal } from "../models/journalModel.js";

export const journalRepository = {

  // Create a new journal entry
  create: (data) =>
    Journal.create(data),

  // Get all entries for a user (paginated, newest first)
  findByUserId: (userId, limit = 20, offset = 0) =>
    Journal.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit),

  // Count total entries for a user
  countByUserId: (userId) =>
    Journal.countDocuments({ userId }),

  // Get single entry by ID and userId
  findByIdAndUser: (id, userId) =>
    Journal.findOne({ _id: id, userId }),

  // Get entries within a date range — used for insights
  findByDateRange: (userId, startDate, endDate) =>
    Journal.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 }),

  // Get mood frequency counts — used for insights
  getMoodCounts: (userId, startDate) =>
    Journal.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $group: { _id: "$mood", count: { $sum: 1 }, emoji: { $first: "$moodEmoji" }, avgRating: { $avg: "$rating" } } },
      { $sort: { count: -1 } },
    ]),

  // Get average rating per mood — used for insights
  getAvgRatingPerMood: (userId, startDate) =>
    Journal.aggregate([
      { $match: { userId, createdAt: { $gte: startDate } } },
      { $group: { _id: "$mood", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      { $sort: { avgRating: -1 } },
    ]),

  // Delete a single entry
  deleteByIdAndUser: (id, userId) =>
    Journal.deleteOne({ _id: id, userId }),

  // Delete all entries for a user
  deleteAllByUser: (userId) =>
    Journal.deleteMany({ userId }),
};
