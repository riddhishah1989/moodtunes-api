import mongoose from "mongoose";

const genreSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: null },
    emoji:       { type: String, default: null },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Genre = mongoose.model("Genre", genreSchema);
