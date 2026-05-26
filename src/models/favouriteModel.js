import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    songId:     { type: String, required: true },
    title:      String,
    artist:     String,
    album:      String,
    genre:      String,
    albumArt:   String,
    spotifyUrl: String,
    youtubeUrl: String,
  },
  { timestamps: true }
);

favouriteSchema.index({ userId: 1, songId: 1 }, { unique: true });

export const Favourite = mongoose.models.Favourite || mongoose.model("Favourite", favouriteSchema);
