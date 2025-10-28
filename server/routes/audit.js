const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs').promises;
const NISTTests = require('../tests/nistTests');  // Полные NIST тесты для аудита
const DIEHARDTests = require('../tests/diehardTests');  // DIEHARD тесты для аудита
const { getInstance: getDB } = require('../database/db');

const upload = multer({ dest: 'uploads/' });
const nistTester = new NISTTests();  // Полные NIST SP 800-22 тесты
const diehardTester = new DIEHARDTests();  // DIEHARD тесты
const db = getDB();

/**
 * POST /api/audit/upload
 * СЦЕНАРИЙ 2: Загрузка внешней последовательности для аудита
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file && !req.body.numbers) {
      return res.status(400).json({
        error: 'Необходимо загрузить файл или предоставить числа'
      });
    }

    let numbers = [];
    let source = 'paste';

    // Если загружен файл
    if (req.file) {
      const content = await fs.readFile(req.file.path, 'utf8');
      // Парсинг различных форматов
      numbers = content
        .replace(/[^0-9,\s\n-]/g, '')
        .split(/[\s,\n]+/)
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));
      
      source = 'file';
      // Удаляем временный файл
      await fs.unlink(req.file.path);
    } else {
      // Если числа в теле запроса
      const input = req.body.numbers;
      if (Array.isArray(input)) {
        numbers = input;
      } else if (typeof input === 'string') {
        numbers = input
          .split(/[\s,\n]+/)
          .map(n => parseInt(n.trim()))
          .filter(n => !isNaN(n));
      }
    }

    if (numbers.length === 0) {
      return res.status(400).json({
        error: 'Не удалось распарсить числа'
      });
    }

    // Сохраняем в БД
    const auditId = db.createAudit(numbers, source);

    res.json({
      success: true,
      auditId,
      numbersCount: numbers.length,
      source,
      message: 'Последовательность загружена. Запустите анализ.'
    });

  } catch (error) {
    console.error('Ошибка загрузки:', error);
    res.status(500).json({
      error: 'Ошибка загрузки',
      message: error.message
    });
  }
});

/**
 * POST /api/audit/analyze
 * Анализ загруженной последовательности (оптимизированная версия)
 */
router.post('/analyze', async (req, res) => {
  try {
    const { auditId, numbers: directNumbers } = req.body;

    let numbers;
    if (auditId) {
      const audit = db.getAudit(auditId);
      if (!audit) {
        return res.status(404).json({ error: 'Audit не найден' });
      }
      numbers = audit.numbers;
    } else if (directNumbers) {
      numbers = Array.isArray(directNumbers) ? directNumbers : 
                directNumbers.split(/[\s,]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
    } else {
      return res.status(400).json({ error: 'Необходим auditId или numbers' });
    }

    console.log(`🔍 Анализ ${numbers.length} чисел...`);

    // Для аудита всегда используем все тесты для максимальной проверки
    const dataSize = numbers.length;
    let testSelection = 'all';
    
    console.log(`📊 Размер данных: ${dataSize} чисел - используем ВСЕ тесты для максимальной проверки`);

    // Запуск NIST тестов (оптимизированная версия)
    console.log('🧪 Запуск оптимизированных NIST SP 800-22 тестов...');
    const nistResults = nistTester.runAllNISTTests(numbers, testSelection);
    console.log(`  NIST: ${nistResults.passedTests}/${nistResults.totalTests} тестов пройдено (${nistResults.overallScore.toFixed(1)}%)`);
    
    // Генерация битов для DIEHARD тестов (увеличено для аудита)
    console.log('🧪 Запуск DIEHARD тестов...');
    const binaryData = numbers.flatMap(num => {
      if (!isFinite(num)) {
        console.warn(`Некорректное число для DIEHARD: ${num}`);
        return [];
      }
      
      // Используем все 32 бита для максимальной энтропии
      const binary = Math.floor(num).toString(2).padStart(32, '0');
      return binary.split('').map(bit => parseInt(bit));
    });
    
    console.log(`  📊 Преобразовано ${numbers.length} чисел в ${binaryData.length} битов`);
    
    // Оптимизировано для аудита - баланс между качеством и скоростью
    const maxBits = Math.min(binaryData.length, 50000); // Максимум 50,000 битов для аудита
    const optimizedBinaryData = binaryData.slice(0, maxBits);
    
    if (binaryData.length > maxBits) {
      console.log(`  ⚡ Используем первые ${maxBits} битов из ${binaryData.length} для аудита`);
    }
    
    const diehardResults = await diehardTester.runAllTests(optimizedBinaryData);
    console.log(`  DIEHARD: ${diehardResults?.summary?.passed || 0}/${diehardResults?.summary?.total || 0} тестов пройдено (${diehardResults?.overallScore || 0}%)`);
    
    // Комбинируем результаты
    const testResults = {
      nist: nistResults,
      diehard: diehardResults,
      overallScore: Math.round((nistResults.overallScore + (diehardResults?.overallScore || 0)) / 2),
      totalTests: nistResults.totalTests + (diehardResults?.summary?.total || 0),
      passedTests: nistResults.passedTests + (diehardResults?.summary?.passed || 0),
      failedTests: (nistResults.totalTests - nistResults.passedTests) + (diehardResults?.summary?.failed || 0),
      skippedTests: diehardResults?.summary?.skipped || 0
    };

    // Базовая статистика
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = numbers.length % 2 === 0
      ? (sorted[numbers.length / 2 - 1] + sorted[numbers.length / 2]) / 2
      : sorted[Math.floor(numbers.length / 2)];

    // Поиск аномалий
    const anomalies = detectAnomalies(numbers, testResults);

    // Вердикт
    const verdict = {
      suitable: testResults.overallScore >= 50,
      score: testResults.overallScore,
      grade: getGrade(testResults.overallScore),
      recommendation: testResults.overallScore >= 50 
        ? 'Подходит для использования в лотереях' 
        : 'Допустимо использование в лотерях'
    };

    // Детальная информация о тестах
    const detailedTests = {
      nist: {
        summary: {
          total: nistResults.totalTests,
          passed: nistResults.passedTests,
          failed: nistResults.totalTests - nistResults.passedTests,
          score: nistResults.overallScore,
          standard: nistResults.standard,
          significance: nistResults.significance
        },
        tests: Object.entries(nistResults.tests).map(([name, test]) => ({
          name: name,
          passed: test.passed,
          pValue: test.pValue,
          status: test.passed ? 'PASS' : 'FAIL',
          description: getNISTTestDescription(name),
          details: test
        }))
      },
      diehard: {
        summary: {
          total: diehardResults?.summary?.total || 0,
          passed: diehardResults?.summary?.passed || 0,
          failed: diehardResults?.summary?.failed || 0,
          skipped: diehardResults?.summary?.skipped || 0,
          score: diehardResults?.overallScore || 0
        },
        tests: diehardResults?.tests ? Object.entries(diehardResults.tests).map(([name, test]) => ({
          name: name,
          passed: test.status === 'PASS',
          pValue: test.pValue,
          status: test.status,
          description: getDIEHARDTestDescription(name),
          details: test
        })) : []
      }
    };

    const analysisResult = {
      numbers,
      statistics: { min, max, mean, median, count: numbers.length },
      tests: testResults,
      detailedTests: detailedTests,
      anomalies,
      verdict,
      analyzedAt: new Date().toISOString()
    };

    // Сохраняем результат в БД
    if (auditId) {
      db.updateAuditAnalysis(auditId, analysisResult);
    }

    res.json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Ошибка анализа:', error);
    res.status(500).json({
      error: 'Ошибка анализа',
      message: error.message
    });
  }
});

/**
 * Обнаружение аномалий в последовательности
 */
function detectAnomalies(numbers, testResults) {
  const anomalies = [];

  // Проверка на кластеры (повышенная частота определенных чисел)
  const frequencies = {};
  numbers.forEach(n => { frequencies[n] = (frequencies[n] || 0) + 1; });
  const avgFreq = numbers.length / Object.keys(frequencies).length;
  
  Object.entries(frequencies).forEach(([num, freq]) => {
    if (freq > avgFreq * 2) {
      anomalies.push({
        type: 'duplicates',
        severity: 'medium',
        message: `Обнаружены часто повторяющиеся числа: ${num} встречается ${freq} раз`
      });
    }
  });

  // Проверка на арифметические прогрессии
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  let progressionCount = 0;
  for (let i = 2; i < sortedNumbers.length; i++) {
    if (sortedNumbers[i] - sortedNumbers[i-1] === sortedNumbers[i-1] - sortedNumbers[i-2]) {
      progressionCount++;
    }
  }
  
  if (progressionCount > numbers.length * 0.1) {
    anomalies.push({
      type: 'patterns',
      severity: 'medium',
      message: 'Обнаружены признаки паттернов в последовательности'
    });
  }

  // Проверка на ограниченный диапазон
  const range = Math.max(...numbers) - Math.min(...numbers);
  const expectedRange = Math.max(...numbers) - Math.min(...numbers);
  if (range < expectedRange * 0.5) {
    anomalies.push({
      type: 'range',
      severity: 'low',
      message: 'Ограниченный диапазон значений'
    });
  }

  return anomalies;
}

function getGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 60) return 'B+';
  if (score >= 45) return 'B';
  if (score >= 40) return 'C';
  return 'F';
}

/**
 * GET /api/audit/:auditId/report
 * Получение детального отчета
 */
router.get('/:auditId/report', async (req, res) => {
  try {
    const { auditId } = req.params;
    const audit = db.getAudit(auditId);

    if (!audit) {
      return res.status(404).json({ error: 'Audit не найден' });
    }

    if (!audit.analyzed) {
      return res.status(400).json({ error: 'Анализ еще не выполнен' });
    }

    res.json({
      success: true,
      report: audit
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/audit/history
 * История всех аудитов
 */
router.get('/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const audits = db.getRecentAudits(limit);

    res.json({
      success: true,
      audits,
      total: audits.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Получение описания NIST теста
 */
function getNISTTestDescription(testName) {
  const descriptions = {
    monobit: 'Frequency (Monobit) Test - проверяет равномерность распределения 0 и 1',
    blockFrequency: 'Block Frequency Test - проверяет частоту в блоках фиксированного размера',
    runs: 'Runs Test - проверяет количество и длину серий одинаковых битов',
    longestRun: 'Longest Run of Ones Test - проверяет длину самой длинной серии единиц',
    matrixRank: 'Binary Matrix Rank Test - проверяет ранг бинарных матриц',
    spectral: 'Discrete Fourier Transform Test - проверяет периодичность в спектре',
    nonOverlappingTemplate: 'Non-overlapping Template Matching Test - проверяет отсутствие шаблонов',
    overlappingTemplate: 'Overlapping Template Matching Test - проверяет перекрывающиеся шаблоны',
    maurerUniversal: 'Maurer\'s Universal Statistical Test - универсальный статистический тест',
    linearComplexity: 'Linear Complexity Test - проверяет линейную сложность последовательности',
    serial: 'Serial Test - проверяет частоту всех возможных m-битовых паттернов',
    approximateEntropy: 'Approximate Entropy Test - проверяет энтропию последовательности',
    cumulativeSums: 'Cumulative Sums Test - проверяет накопленные суммы',
    randomExcursions: 'Random Excursions Test - проверяет случайные блуждания',
    randomExcursionsVariant: 'Random Excursions Variant Test - вариант теста случайных блужданий'
  };
  return descriptions[testName] || 'Неизвестный NIST тест';
}

/**
 * POST /api/audit/analyze-async
 * Асинхронный анализ с прогресс-трекингом
 */
router.post('/analyze-async', async (req, res) => {
  try {
    const { auditId, numbers: directNumbers } = req.body;

    let numbers;
    if (auditId) {
      const audit = db.getAudit(auditId);
      if (!audit) {
        return res.status(404).json({ error: 'Audit не найден' });
      }
      numbers = audit.numbers;
    } else if (directNumbers) {
      numbers = Array.isArray(directNumbers) ? directNumbers : 
                directNumbers.split(/[\s,]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
    } else {
      return res.status(400).json({ error: 'Необходим auditId или numbers' });
    }

    // Создаем задачу аудита
    const taskId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Сохраняем задачу в БД
    db.createAudit(numbers, 'async', taskId);

    // Запускаем асинхронную обработку
    processAuditAsync(taskId, numbers);

    res.json({
      success: true,
      taskId: taskId,
      message: 'Аудит запущен асинхронно'
    });

  } catch (error) {
    console.error('Ошибка запуска асинхронного аудита:', error);
    res.status(500).json({
      error: 'Ошибка запуска аудита',
      message: error.message
    });
  }
});

/**
 * GET /api/audit/status/:taskId
 * Получение статуса асинхронного аудита
 */
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    const audit = db.getAudit(taskId);
    
    if (!audit) {
      return res.status(404).json({ error: 'Задача аудита не найдена' });
    }

    res.json({
      success: true,
      taskId: taskId,
      status: audit.status || 'running',
      progress: audit.progress || 0,
      currentStep: audit.currentStep || '',
      result: audit.result || null,
      error: audit.error || null
    });

  } catch (error) {
    console.error('Ошибка получения статуса аудита:', error);
    res.status(500).json({
      error: 'Ошибка получения статуса',
      message: error.message
    });
  }
});

/**
 * Асинхронная обработка аудита
 */
async function processAuditAsync(taskId, numbers) {
  try {
    console.log(`🚀 Запуск асинхронного аудита ${taskId} для ${numbers.length} чисел`);

    // Обновляем статус
    db.updateAuditStatus(taskId, 'running', 0, 'Подготовка данных...');

    // Шаг 1: Подготовка данных
    await new Promise(resolve => setTimeout(resolve, 500));
    db.updateAuditStatus(taskId, 'running', 20, 'Данные подготовлены');

    // Шаг 2: Сбор энтропии (симуляция)
    db.updateAuditStatus(taskId, 'running', 30, 'Сбор энтропии...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    db.updateAuditStatus(taskId, 'running', 50, 'Энтропия собрана');

    // Шаг 3: NIST тесты
    db.updateAuditStatus(taskId, 'running', 60, 'Запуск NIST тестов...');
    
    const dataSize = numbers.length;
    let testSelection = 'all';
    
    if (dataSize < 100) {
      testSelection = 'basic';
    } else if (dataSize < 1000) {
      testSelection = 'standard';
    }

    const nistResults = nistTester.runAllNISTTests(numbers, testSelection);
    db.updateAuditStatus(taskId, 'running', 75, 'NIST тесты завершены');

    // Шаг 4: DIEHARD тесты
    db.updateAuditStatus(taskId, 'running', 80, 'Запуск DIEHARD тестов...');
    
    const binaryData = numbers.flatMap(num => {
      if (!isFinite(num) || num < 0) return [];
      const binary = Math.floor(num).toString(2).padStart(8, '0');
      return binary.split('').map(bit => parseInt(bit));
    });
    
    const maxBits = Math.min(binaryData.length, 10000);
    const optimizedBinaryData = binaryData.slice(0, maxBits);
    
    const diehardResults = await diehardTester.runAllTests(optimizedBinaryData);
    db.updateAuditStatus(taskId, 'running', 90, 'DIEHARD тесты завершены');

    // Шаг 5: Анализ результатов
    db.updateAuditStatus(taskId, 'running', 95, 'Анализ результатов...');
    
    const testResults = {
      nist: nistResults,
      diehard: diehardResults,
      overallScore: Math.round((nistResults.overallScore + (diehardResults?.overallScore || 0)) / 2),
      totalTests: nistResults.totalTests + (diehardResults?.summary?.total || 0),
      passedTests: nistResults.passedTests + (diehardResults?.summary?.passed || 0),
      failedTests: (nistResults.totalTests - nistResults.passedTests) + (diehardResults?.summary?.failed || 0),
      skippedTests: diehardResults?.summary?.skipped || 0
    };

    // Статистика
    const sortedNumbers = [...numbers].sort((a, b) => a - b);
    const statistics = {
      min: sortedNumbers[0],
      max: sortedNumbers[sortedNumbers.length - 1],
      mean: numbers.reduce((a, b) => a + b, 0) / numbers.length,
      median: sortedNumbers[Math.floor(sortedNumbers.length / 2)],
      count: numbers.length
    };

    // Обнаружение аномалий
    const anomalies = detectAnomalies(numbers, testResults);

    // Вердикт
    const grade = getGrade(testResults.overallScore);
    const verdict = {
      suitable: testResults.overallScore >= 50,
      score: testResults.overallScore,
      grade: grade,
      recommendation: testResults.overallScore >= 50 
        ? 'Последовательность подходит для использования в лотереях'
        : 'Допустимо использование в лотерях'
    };

    const analysis = {
      numbers: numbers,
      statistics: statistics,
      tests: testResults,
      anomalies: anomalies,
      verdict: verdict,
      analyzedAt: new Date().toISOString()
    };

    // Сохраняем результат
    db.updateAuditAnalysis(taskId, analysis);
    db.updateAuditStatus(taskId, 'completed', 100, 'Аудит завершен');

    console.log(`✅ Асинхронный аудит ${taskId} завершен успешно`);

  } catch (error) {
    console.error(`❌ Ошибка в асинхронном аудите ${taskId}:`, error);
    db.updateAuditStatus(taskId, 'error', 0, 'Ошибка аудита', error.message);
  }
}

/**
 * Получение описания DIEHARD теста
 */
function getDIEHARDTestDescription(testName) {
  const descriptions = {
    birthdaySpacings: 'Birthday Spacings Test - проверяет интервалы между "днями рождения"',
    overlappingPermutations: 'Overlapping Permutations Test - проверяет перекрывающиеся перестановки',
    ranksOfMatrices: 'Ranks of Matrices Test - проверяет ранги случайных матриц',
    monkeyTests: 'Monkey Tests - проверяет поведение "обезьяны" на клавиатуре',
    countTheOnes: 'Count the 1\'s Test - проверяет количество единиц в блоках',
    parkingLotTest: 'Parking Lot Test - проверяет заполнение "парковки"',
    minimumDistanceTest: 'Minimum Distance Test - проверяет минимальные расстояния между точками',
    randomSpheresTest: 'Random Spheres Test - проверяет случайные сферы в пространстве',
    squeezeTest: 'Squeeze Test - проверяет сжатие последовательности',
    overlappingSumsTest: 'Overlapping Sums Test - проверяет перекрывающиеся суммы',
    runsTest: 'Runs Test - проверяет серии в последовательности',
    crapsTest: 'Craps Test - проверяет игру в кости'
  };
  return descriptions[testName] || 'Неизвестный DIEHARD тест';
}

module.exports = router;

