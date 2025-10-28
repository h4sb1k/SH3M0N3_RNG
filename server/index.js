const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Инициализация БД
const { getInstance: getDB } = require('./database/db');
const db = getDB();

// Импорт маршрутов
const generateRoutes = require('./routes/generate');
const auditRoutes = require('./routes/audit');
const demoRoutes = require('./routes/demo');
const testsRoutes = require('./routes/tests');
const verifyRoutes = require('./routes/verify');
const historyRoutes = require('./routes/history');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Для загрузки файлов
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.locals.upload = upload;

// API Routes
app.use('/api/generate', generateRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/history', historyRoutes);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'RandomTrust Server работает',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: err.message 
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 RandomTrust Server запущен на порту ${PORT}`);
  console.log(`📊 Режим: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📖 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
