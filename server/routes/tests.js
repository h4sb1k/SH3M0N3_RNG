const express = require('express');
const router = express.Router();
const path = require('path');
const NISTTests = require('../tests/nistTests');  // НАСТОЯЩИЕ NIST тесты!
const BinaryFileGenerator = require('../tests/fileGenerator');
const TestOptimizedDataSplitter = require('../tests/testOptimizedDataSplitter');
const { getInstance: getDB } = require('../database/db');

const tester = new NISTTests();
const fileGen = new BinaryFileGenerator();
const dataSplitter = new TestOptimizedDataSplitter();
const db = getDB();

/**
 * POST /api/tests/run
 * Запуск статистических тестов на последовательности
 */
router.post('/run', (req, res) => {
  try {
    const { numbers } = req.body;

    if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
      return res.status(400).json({ error: 'Необходим массив чисел' });
    }

    const results = tester.runAllNISTTests(numbers);

    res.json({
      success: true,
      results,
      metadata: {
        sampleSize: numbers.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/tests/generate-file
 * Генерация файла с оптимизированным разделением для NIST и DIEHARD тестов
 */
router.post('/generate-file', async (req, res) => {
  try {
    const { 
      count = 1000000, 
      min = 0, 
      max = 1, 
      sources: sourceNames, 
      method = 'hash',
      scenario = 'standard' // quick, standard, full, professional
    } = req.body;

    if (!sourceNames || !Array.isArray(sourceNames) || sourceNames.length === 0) {
      return res.status(400).json({
        error: 'Необходимы источники для генерации'
      });
    }

    // Получаем оптимальный размер для выбранного сценария
    const optimalSize = dataSplitter.getOptimalSize(scenario);
    console.log(`📝 Генерация файла для сценария "${scenario}"...`);
    console.log(`📊 Целевой размер: ${optimalSize.total} бит (NIST: ${optimalSize.nist}, DIEHARD: ${optimalSize.diehard})`);

    // Импортируем источники и комбайнер
    const CUBeaconSource = require('../sources/cuBeacon');
    const RandomOrgSource = require('../sources/randomOrg');
    const SpaceWeatherSource = require('../sources/spaceWeather');
    const NISTBeaconSource = require('../sources/nistBeacon');
    const InternetEntropySource = require('../sources/internetEntropy');
    const OpenWeatherMapSource = require('../sources/openWeatherMap');
    const RandomnessCombiner = require('../combiner');

    const sources = {
      cubeacon: new CUBeaconSource(),
      randomorg: new RandomOrgSource(),
      spaceweather: new SpaceWeatherSource(),
      nist: new NISTBeaconSource(),
      internet: new InternetEntropySource(),
      openweather: new OpenWeatherMapSource()
    };

    const combiner = new RandomnessCombiner();

    // Генерируем числа от выбранных источников
    const sourceData = [];
    const errors = [];
    
    // Адаптируем размер запроса под сценарий
    const maxRequestSize = 10000; // Максимум для Random.org
    const scenarioMultiplier = {
      quick: 0.1,
      standard: 0.5,
      full: 1.0,
      professional: 2.0
    };
    const optimalRequestSize = Math.min(1000 * scenarioMultiplier[scenario] || 1, maxRequestSize);
    const actualRequestSize = Math.min(count, optimalRequestSize);
    
    console.log(`  📊 Запрашиваем ${actualRequestSize} чисел от каждого источника (сценарий: ${scenario})`);
    
    for (const sourceName of sourceNames) {
      if (sources[sourceName]) {
        try {
          const source = sources[sourceName];
          const result = await source.generateNumbers(actualRequestSize, min, max);
          sourceData.push({
            source: sourceName,
            type: source.type,
            icon: source.icon,
            numbers: result.numbers,
            hash: result.hash,
            timestamp: result.timestamp
          });
          console.log(`  ✅ ${source.name}: ${result.numbers.length} чисел`);
        } catch (error) {
          console.error(`  ❌ Ошибка источника ${sourceName}:`, error.message);
          errors.push({ source: sourceName, error: error.message });
        }
      }
    }

    if (sourceData.length === 0) {
      return res.status(400).json({
        error: 'Не удалось получить данные ни от одного источника',
        errors: errors
      });
    }

    console.log(`  📊 Используем ${sourceData.length} из ${sourceNames.length} источников`);

    // Комбинируем данные
    const combinedResult = combiner.combine(sourceData, method);

    // Используем оптимизированное разделение данных
    console.log(`  🔄 Оптимизированное разделение данных для тестов...`);
    const dataSplit = dataSplitter.splitNumbersForTests(combinedResult.numbers, scenario);
    
    // Создаем отчет о разделении
    const splitReport = dataSplitter.createSplitReport(dataSplit);
    
    console.log(`  📊 NIST: ${dataSplit.nist.count} бит (${dataSplit.nist.tests.available.length} тестов доступно)`);
    console.log(`  📊 DIEHARD: ${dataSplit.diehard.count} бит (${dataSplit.diehard.tests.available.length} тестов доступно)`);
    console.log(`  📊 Эффективность: ${dataSplit.efficiency.efficiency}`);
    
    // Форматируем файлы для разных тестов
    const files = {
      nist: formatBitsToFile(dataSplit.nist.bits, 'nist'),
      diehard: formatBitsToFile(dataSplit.diehard.bits, 'diehard'),
      combined: formatBitsToFile(dataSplit.total.bits, 'combined')
    };
    
    const fileSize = Buffer.byteLength(files.combined.content, 'utf8');
    
    console.log(`✅ Файлы сгенерированы для сценария "${scenario}"`);
    console.log(`📊 Общий размер: ${dataSplit.total.count} бит`);
    console.log(`📊 Размер файла: ${(fileSize / 1024).toFixed(1)} KB`);
    console.log(`📄 Строк: ${files.combined.lines}`);
    
    res.json({
      success: true,
      scenario: scenario,
      count: dataSplit.total.count,
      fileSize,
      fileContent: files.combined.content,
      sources: sourceNames,
      method,
      lines: files.combined.lines,
      splitReport: splitReport,
      files: {
        nist: {
          content: files.nist.content,
          lines: files.nist.lines,
          bits: dataSplit.nist.count
        },
        diehard: {
          content: files.diehard.content,
          lines: files.diehard.lines,
          bits: dataSplit.diehard.count
        },
        combined: {
          content: files.combined.content,
          lines: files.combined.lines,
          bits: dataSplit.total.count
        }
      },
      message: `Файлы сгенерированы успешно для сценария "${scenario}"`
    });

  } catch (error) {
    console.error('Ошибка генерации файла:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * GET /download/:filename
 * Скачивание сгенерированного файла
 */
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), filename);
    
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Ошибка скачивания:', err);
        res.status(404).json({ error: 'Файл не найден' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Вспомогательная функция для форматирования битов в файл
function formatBitsToFile(bits, type) {
  const bitsString = bits.join('');
  
  // Форматируем: 80 символов на строку для читаемости
  const lines = [];
  for (let i = 0; i < bitsString.length; i += 80) {
    lines.push(bitsString.substring(i, i + 80));
  }
  
  const content = lines.join('\n');
  
  return {
    content,
    lines: lines.length,
    bits: bits.length,
    type: type
  };
}

// Вспомогательная функция для определения метода расширения
function getExpansionMethod(targetBits, currentBits) {
  const efficiency = (currentBits / targetBits) * 100;
  
  if (efficiency >= 50) {
    return 'Высокая эффективность (≥50%)';
  } else if (efficiency >= 20) {
    return 'Средняя эффективность (≥20%)';
  } else if (efficiency >= 5) {
    return 'Низкая эффективность (≥5%)';
  } else {
    return 'Минимальная эффективность (<5%)';
  }
}

module.exports = router;

