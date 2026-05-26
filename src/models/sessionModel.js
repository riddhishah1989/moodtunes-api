import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  title:             String,
  artist:            String,
  album:             String,
  genre:             String,
  year:              Number,
  reason:            String,
  energyLevel:       { type: String, enum: ["LOW", "MEDIUM", "HIGH"] },
  tempo:             { type: String, enum: ["SLOW", "MODERATE", "FAST"] },
  spotifyUrl:        String,
  spotifyPreviewUrl: String,
  albumArt:          String,
  albumArtThumb:     String,
  popularity:        Number,
  youtubeUrl:        String,
  youtubeThumbnail:  String,
  youtubeTitle:      String,
});

const sessionSchema = new mongoose.Schema(
  {
    userId:             { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mood:               { type: String, required: true },
    customText:         String,
    moodInterpretation: String,
    songs:              [songSchema],
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
