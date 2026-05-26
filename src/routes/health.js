import express from 'express';
const router = express.Router();

// GET /api/v1/health
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status:  'ok',
    service: 'MoodTunes API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
