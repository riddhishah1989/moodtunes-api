import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mood: { type: String, required: true }, // e.g. "Happy"
    moodEmoji: { type: String, required: true }, // e.g. "😊"
    note: { type: String, default: null }, // optional free text
    rating: { type: Number, min: 1, max: 5, required: true }, // 1-5 stars
    tags: { type: [String], default: [] }, // optional e.g. ["work", "family"]
  },
  { timestamps: true },
);

export const Journal = mongoose.model("Journal", journalSchema);
