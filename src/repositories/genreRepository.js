import { Genre } from "../models/genreModel.js";

// ── Genre Repository ──────────────────────────────────────────
// All database operations for Genre model live here.

export const genreRepository = {

  // Get all active genres sorted by name
  findAll: () =>
    Genre.find({ isActive: true }).sort({ name: 1 }),

  // Find genre by ID
  findById: (id) =>
    Genre.findById(id),

  // Find genre by name
  findByName: (name) =>
    Genre.findOne({ name }),

  // Create genre
  create: (data) =>
    Genre.create(data),

  // Count total genres
  count: () =>
    Genre.countDocuments(),
};
