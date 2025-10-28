const express = require('express');
const router = express.Router();
const { getInstance: getDB } = require('../database/db');

const db = getDB();

/**
 * GET /api/history/generations
 * История генераций
 */
router.get('/generations', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const generations = db.getRecentGenerations(limit);

    res.json({
      success: true,
      generations,
      total: generations.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/history/generation/:id
 * Получить конкретную генерацию
 */
router.get('/generation/:id', (req, res) => {
  try {
    const { id } = req.params;
    const generation = db.getGeneration(id);

    if (!generation) {
      return res.status(404).json({ error: 'Генерация не найдена' });
    }

    res.json({
      success: true,
      generation
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/history/stats
 * Статистика базы данных
 */
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




