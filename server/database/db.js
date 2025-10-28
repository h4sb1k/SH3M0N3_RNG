const Database = require('better-sqlite3');
const path = require('path');

/**
 * SQLite база данных для RandomTrust
 * Хранит: результаты генераций, аудиты, историю
 */
class DatabaseManager {
  constructor() {
    const dbPath = path.join(__dirname, '../../randomtrust.db');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL'); // Для производительности
    this.initTables();
  }

  /**
   * Инициализация таблиц
   */
  initTables() {
    // Таблица генераций
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS generations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        generation_id TEXT UNIQUE NOT NULL,
        numbers TEXT NOT NULL,
        sources TEXT NOT NULL,
        method TEXT NOT NULL,
        hash TEXT NOT NULL,
        test_results TEXT,
        created_at TEXT NOT NULL,
        metadata TEXT
      )
    `);

    // Таблица аудитов
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS audits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        audit_id TEXT UNIQUE NOT NULL,
        numbers TEXT NOT NULL,
        source_type TEXT NOT NULL,
        analysis TEXT,
        analyzed BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        current_step TEXT DEFAULT '',
        error TEXT,
        created_at TEXT NOT NULL,
        analyzed_at TEXT,
        updated_at TEXT
      )
    `);

    // Таблица истории тестов
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS test_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id TEXT UNIQUE NOT NULL,
        filename TEXT NOT NULL,
        filepath TEXT NOT NULL,
        total_bits INTEGER NOT NULL,
        statistics TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Индексы для быстрого поиска
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_generations_created 
      ON generations(created_at DESC)
    `);
    
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_audits_created 
      ON audits(created_at DESC)
    `);

    console.log('✅ База данных инициализирована');
  }

  // ==================== ГЕНЕРАЦИИ ====================

  /**
   * Сохранить результат генерации
   */
  saveGeneration(data) {
    const stmt = this.db.prepare(`
      INSERT INTO generations (
        generation_id, numbers, sources, method, hash, 
        test_results, created_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const generationId = data.generation_id || `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    stmt.run(
      generationId,
      JSON.stringify(data.numbers),
      JSON.stringify(data.sources),
      data.method,
      data.hash,
      data.test_results ? JSON.stringify(data.test_results) : null,
      data.created_at || new Date().toISOString(),
      data.metadata ? JSON.stringify(data.metadata) : null
    );

    return generationId;
  }

  /**
   * Получить генерацию по ID
   */
  getGeneration(generationId) {
    const stmt = this.db.prepare(`
      SELECT * FROM generations WHERE generation_id = ?
    `);
    
    const row = stmt.get(generationId);
    
    if (!row) return null;

    return {
      id: row.id,
      generation_id: row.generation_id,
      numbers: JSON.parse(row.numbers),
      sources: JSON.parse(row.sources),
      method: row.method,
      hash: row.hash,
      test_results: row.test_results ? JSON.parse(row.test_results) : null,
      created_at: row.created_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : null
    };
  }

  /**
   * Получить последние генерации
   */
  getRecentGenerations(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM generations 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(limit);
    
    return rows.map(row => ({
      id: row.id,
      generation_id: row.generation_id,
      numbers: JSON.parse(row.numbers),
      sources: JSON.parse(row.sources),
      method: row.method,
      hash: row.hash,
      created_at: row.created_at
    }));
  }

  // ==================== АУДИТЫ ====================

  /**
   * Создать новый аудит
   */
  createAudit(numbers, sourceType, customId = null) {
    const auditId = customId || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO audits (audit_id, numbers, source_type, created_at, status, progress, current_step)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      auditId,
      JSON.stringify(numbers),
      sourceType,
      new Date().toISOString(),
      'pending',
      0,
      ''
    );

    console.log(`📊 Создан аудит ${auditId} с ${numbers.length} числами`);
    return auditId;
  }

  /**
   * Обновить результаты анализа аудита
   */
  updateAuditAnalysis(auditId, analysis) {
    const stmt = this.db.prepare(`
      UPDATE audits 
      SET analysis = ?, analyzed = 1, analyzed_at = ?
      WHERE audit_id = ?
    `);

    stmt.run(
      JSON.stringify(analysis),
      new Date().toISOString(),
      auditId
    );
  }

  /**
   * Обновить статус аудита
   */
  updateAuditStatus(auditId, status, progress = 0, currentStep = '', error = null) {
    const stmt = this.db.prepare(`
      UPDATE audits 
      SET status = ?, progress = ?, current_step = ?, error = ?, updated_at = ?
      WHERE audit_id = ?
    `);

    stmt.run(
      status,
      progress,
      currentStep,
      error,
      new Date().toISOString(),
      auditId
    );
  }

  /**
   * Получить аудит по ID
   */
  getAudit(auditId) {
    const stmt = this.db.prepare(`
      SELECT * FROM audits WHERE audit_id = ?
    `);
    
    const row = stmt.get(auditId);
    
    if (!row) return null;

    return {
      id: row.id,
      audit_id: row.audit_id,
      numbers: JSON.parse(row.numbers),
      source_type: row.source_type,
      analysis: row.analysis ? JSON.parse(row.analysis) : null,
      analyzed: row.analyzed === 1,
      created_at: row.created_at,
      analyzed_at: row.analyzed_at
    };
  }

  /**
   * Получить последние аудиты
   */
  getRecentAudits(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT * FROM audits 
      ORDER BY created_at DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(limit);
    
    return rows.map(row => ({
      id: row.id,
      audit_id: row.audit_id,
      numbers_count: JSON.parse(row.numbers).length,
      analyzed: row.analyzed === 1,
      created_at: row.created_at
    }));
  }

  // ==================== ТЕСТОВЫЕ ФАЙЛЫ ====================

  /**
   * Сохранить информацию о сгенерированном файле
   */
  saveTestFile(fileData) {
    const stmt = this.db.prepare(`
      INSERT INTO test_files (
        file_id, filename, filepath, total_bits, statistics, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    const fileId = `file_${Date.now()}`;

    stmt.run(
      fileId,
      fileData.fileName,
      fileData.filePath,
      fileData.totalBits,
      JSON.stringify(fileData.statistics),
      new Date().toISOString()
    );

    return fileId;
  }

  /**
   * Получить информацию о файле
   */
  getTestFile(fileId) {
    const stmt = this.db.prepare(`
      SELECT * FROM test_files WHERE file_id = ?
    `);
    
    const row = stmt.get(fileId);
    
    if (!row) return null;

    return {
      file_id: row.file_id,
      filename: row.filename,
      filepath: row.filepath,
      total_bits: row.total_bits,
      statistics: JSON.parse(row.statistics),
      created_at: row.created_at
    };
  }

  /**
   * Получить статистику базы данных
   */
  getStats() {
    const generations = this.db.prepare('SELECT COUNT(*) as count FROM generations').get();
    const audits = this.db.prepare('SELECT COUNT(*) as count FROM audits').get();
    const files = this.db.prepare('SELECT COUNT(*) as count FROM test_files').get();

    return {
      totalGenerations: generations.count,
      totalAudits: audits.count,
      totalTestFiles: files.count,
      databaseSize: this.getDatabaseSize()
    };
  }

  /**
   * Получить размер БД
   */
  getDatabaseSize() {
    const fs = require('fs');
    const dbPath = path.join(__dirname, '../../randomtrust.db');
    
    try {
      const stats = fs.statSync(dbPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      return `${sizeKB} KB`;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Закрытие БД
   */
  close() {
    this.db.close();
  }
}

// Singleton instance
let instance = null;

module.exports = {
  getInstance: () => {
    if (!instance) {
      instance = new DatabaseManager();
    }
    return instance;
  }
};




