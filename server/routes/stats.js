const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/auth');

// GET /api/stats — General stats for dashboards
router.get('/', authMiddleware, getStats);

module.exports = router;
