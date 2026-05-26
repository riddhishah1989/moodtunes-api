import { Favourite } from "../models/favouriteModel.js";

export const favouriteRepository = {

  findByUserId: (userId, limit = 50, offset = 0) =>
    Favourite.find({ userId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit),

  countByUser: (userId) =>
    Favourite.countDocuments({ userId }),

  findByUserAndSong: (userId, songId) =>
    Favourite.findOne({ userId, songId }),

  isFavourite: async (userId, songId) => {
    const fav = await Favourite.findOne({ userId, songId });
    return !!fav;
  },

  upsert: (userId, songId, data) =>
    Favourite.findOneAndUpdate(
      { userId, songId },
      { userId, songId, ...data },
      { upsert: true, new: true }
    ),

  deleteByUserAndSong: (userId, songId) =>
    Favourite.deleteOne({ userId, songId }),

  deleteAllByUser: (userId) =>
    Favourite.deleteMany({ userId }),
};
