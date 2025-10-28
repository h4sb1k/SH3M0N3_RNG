const express = require('express');
const router = express.Router();

const CUBeaconSource = require('../sources/cuBeacon');
const RandomOrgSource = require('../sources/randomOrg');
const SpaceWeatherSource = require('../sources/spaceWeather');
const NISTBeaconSource = require('../sources/nistBeacon');
const InternetEntropySource = require('../sources/internetEntropy');
const OpenWeatherMapSource = require('../sources/openWeatherMap');
const ISSPositionSource = require('../sources/issPosition');
const RandomnessCombiner = require('../combiner');
const NISTTests = require('../tests/nistTests');  // Оригинальные NIST тесты с выбором
const { getInstance: getDB } = require('../database/db');

const sources = {
  cubeacon: new CUBeaconSource(),
  randomorg: new RandomOrgSource(),
  spaceweather: new SpaceWeatherSource(),
  nist: new NISTBeaconSource(),
  internet: new InternetEntropySource(),
  openweather: new OpenWeatherMapSource(),
  iss: new ISSPositionSource()
};

const combiner = new RandomnessCombiner();
const tester = new NISTTests();  // Оригинальные NIST тесты с выбором
const db = getDB();

/**
 * POST /api/generate
 * СЦЕНАРИЙ 1: Проведение лотерейного тиража
 * Real-time генерация с визуализацией процесса
 */
router.post('/', async (req, res) => {
  try {
    const { 
      count = 6, 
      min = 1, 
      max = 49, 
      sourcesToUse = ['cubeacon', 'nist', 'internet', 'iss'],
      combineMethod = 'hash',
      runTests = true
    } = req.body;

    console.log(`🎲 Генерация ${count} чисел (${min}-${max})`);
    console.log(`📡 Источники: ${sourcesToUse.join(', ')}`);

    const results = [];
    const errors = [];

    // Параллельный сбор энтропии от источников
    const promises = sourcesToUse.map(async (name) => {
      try {
        const source = sources[name];
        if (!source) throw new Error(`Источник ${name} не найден`);
        
        console.log(`  Запрос к ${source.name}...`);
        const result = await source.generateNumbers(count, min, max);
        console.log(`  ✅ ${source.name}: ${result.latency}ms`);
        return result;
      } catch (error) {
        console.error(`  ❌ ${name}: ${error.message}`);
        errors.push({ source: name, error: error.message });
        return null;
      }
    });

    const sourceResults = (await Promise.all(promises)).filter(r => r !== null);

    if (sourceResults.length === 0) {
      return res.status(500).json({
        error: 'Все источники недоступны',
        errors
      });
    }

    // Комбинирование
    let finalResult;
    if (sourceResults.length > 1) {
      finalResult = combiner.combine(sourceResults, combineMethod);
      finalResult.numbers = combiner.normalizeToRange(finalResult.numbers, min, max);
    } else {
      finalResult = sourceResults[0];
      finalResult.method = 'SINGLE_SOURCE';
    }

    // Запуск НАСТОЯЩИХ NIST SP 800-22 тестов
    let testResults = null;
    if (runTests) {
      console.log(`🧪 Запуск NIST SP 800-22 тестов...`);
      testResults = tester.runAllNISTTests(finalResult.numbers, 'quick');
      if (testResults && testResults.overallScore !== undefined) {
        console.log(`  Балл: ${testResults.overallScore.toFixed(1)}% (${testResults.passedTests}/${testResults.totalTests} тестов)`);
        console.log(`  Битов проанализировано: ${testResults.bits}`);
        if (!testResults.passed) {
          console.log(`  ⚠️ ВНИМАНИЕ: Генератор НЕ прошёл строгие NIST критерии!`);
        }
      } else {
        console.log(`  ⚠️ Ошибка выполнения тестов`);
      }
    }

    // Сохраняем в БД
    const generationId = db.saveGeneration({
      numbers: finalResult.numbers,
      sources: sourceResults.map(s => ({
        name: s.source,
        type: s.type,
        hash: s.hash
      })),
      method: finalResult.method,
      hash: finalResult.hash,
      test_results: testResults,
      metadata: {
        range: { min, max },
        sourcesUsed: sourcesToUse
      }
    });

    res.json({
      success: true,
      generationId,
      result: finalResult,
      sources: sourceResults,
      tests: testResults,
      errors: errors.length > 0 ? errors : undefined,
      metadata: {
        requestedCount: count,
        range: { min, max },
        sourcesRequested: sourcesToUse.length,
        sourcesSucceeded: sourceResults.length,
        combineMethod,
        testsRun: runTests
      }
    });

  } catch (error) {
    console.error('❌ Ошибка генерации:', error);
    res.status(500).json({
      error: 'Ошибка генерации',
      message: error.message
    });
  }
});

/**
 * GET /api/generate/sources
 * Получение статуса всех источников
 */
router.get('/sources', async (req, res) => {
  try {
    const status = await Promise.all(
      Object.entries(sources).map(async ([name, source]) => {
        const avail = await source.checkAvailability();
        return {
          name,
          displayName: source.name,
          type: source.type,
          icon: source.icon,
          available: avail.available,
          message: avail.message
        };
      })
    );

    res.json({
      sources: status,
      totalSources: status.length,
      availableSources: status.filter(s => s.available).length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

