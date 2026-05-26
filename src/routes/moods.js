import express from 'express';
import { PRESET_MOODS } from '../utils/constants';
const router = express.Router();

// GET /api/v1/moods
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: { moods: PRESET_MOODS, count: PRESET_MOODS.length },
  });
});

// GET /api/v1/moods/:id
router.get('/:id', (req, res) => {
  const mood = PRESET_MOODS.find(m => m.id === req.params.id);
  if (!mood) {
    return res.status(404).json({ success: false, error: `Mood '${req.params.id}' not found.` });
  }
  res.status(200).json({ success: true, data: mood });
});

export default router;
