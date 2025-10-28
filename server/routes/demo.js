const express = require('express');
const router = express.Router();

const CUBeaconSource = require('../sources/cuBeacon');
const RandomOrgSource = require('../sources/randomOrg');
const SpaceWeatherSource = require('../sources/spaceWeather');
const NISTBeaconSource = require('../sources/nistBeacon');
const InternetEntropySource = require('../sources/internetEntropy');
const OpenWeatherMapSource = require('../sources/openWeatherMap');
const ISSPositionSource = require('../sources/issPosition');

const sources = {
  cubeacon: new CUBeaconSource(),
  randomorg: new RandomOrgSource(),
  spaceweather: new SpaceWeatherSource(),
  nist: new NISTBeaconSource(),
  internet: new InternetEntropySource(),
  openweather: new OpenWeatherMapSource(),
  iss: new ISSPositionSource()
};

// Функция описания источников
function getSourceDescription(type) {
  const descriptions = {
    'quantum_beacon': 'Квантовые вакуумные флуктуации от CU Boulder',
    'atmospheric_noise': 'Атмосферные радиошумы (Random.org)',
    'nist_beacon': 'Официальный beacon NIST с цифровой подписью',
    'space_weather': 'Космическая погода: солнечный ветер + магнитные бури + рентген от NOAA',
    'internet_entropy': 'Гибридная комбинация: blockchain mempool + крипто + timing',
    'atmospheric_weather': 'Real-time погодные данные: температура, давление, влажность, ветер (OpenWeatherMap)',
    'space_station': 'Позиция Международной космической станции (МКС) в реальном времени'
  };
  return descriptions[type] || 'Источник энтропии';
}

/**
 * GET /api/demo/steps
 * СЦЕНАРИЙ 3: Демонстрация - получение описания всех этапов
 */
router.get('/steps', (req, res) => {
  res.json({
    steps: [
      {
        id: 1,
        title: 'Сбор энтропии',
        description: 'Параллельный запрос к 4 независимым источникам случайности',
        sources: Object.values(sources).map(s => ({
          name: s.name,
          type: s.type,
          icon: s.icon,
          description: getSourceDescription(s.type)
        })),
        duration: '2-3 секунды'
      },
      {
        id: 2,
        title: 'Комбинирование',
        description: 'Криптографическое объединение результатов через SHA-512',
        methods: [
          { name: 'HASH', description: 'SHA-512 хеширование всех источников' },
          { name: 'XOR', description: 'Побитовое исключающее ИЛИ' },
          { name: 'WEIGHTED', description: 'Взвешенное комбинирование с приоритетами' }
        ],
        duration: '10-50 миллисекунд'
      },
      {
        id: 3,
        title: 'Тестирование',
        description: 'Запуск 7 статистических тестов качества случайности',
        tests: [
          { name: 'Frequency', description: 'Баланс 0 и 1 в битах' },
          { name: 'Runs', description: 'Отсутствие паттернов' },
          { name: 'Chi-Square', description: 'Равномерность распределения' },
          { name: 'Entropy', description: 'Информационная энтропия (≥95%)' },
          { name: 'Autocorrelation', description: 'Независимость значений' },
          { name: 'Mean', description: 'Центральность' },
          { name: 'Distribution', description: 'Визуальная равномерность' }
        ],
        duration: '10-100 миллисекунд'
      },
      {
        id: 4,
        title: 'Результат',
        description: 'Финальные случайные числа с полными доказательствами',
        includes: [
          'Сгенерированные числа',
          'SHA-256 хеш результата',
          'Proof данные от каждого источника',
          'Результаты статистических тестов',
          'Временные метки',
          'Ссылки для верификации'
        ]
      }
    ]
  });
});

router.getSourceDescription = function(type) {
  const descriptions = {
    'quantum_beacon': 'Квантовые вакуумные флуктуации от University of Colorado. Истинная случайность на уровне квантовой физики.',
    'radio_noise': 'Радиошумы коротковолнового диапазона (7-22 MHz). Атмосферные и космические электромагнитные помехи.',
    'nist_beacon': 'Публичный beacon от NIST с цифровой подписью. Обновление каждые 60 секунд, полный архив.',
    'internet_entropy': 'Гибридный источник: сетевые задержки API + погода в реальном времени + курсы криптовалют.'
  };
  return descriptions[type] || 'Источник случайности';
};

/**
 * POST /api/demo/simulate
 * Симуляция генерации на тестовых данных
 */
router.post('/simulate', async (req, res) => {
  try {
    const { step = 'all' } = req.body;

    const simulation = {
      timestamp: new Date().toISOString(),
      mode: 'DEMO',
      steps: []
    };

    if (step === 'all' || step === 1) {
      simulation.steps.push({
        step: 1,
        name: 'Сбор энтропии',
        status: 'completed',
        data: {
          cubeacon: { status: 'success', latency: '453ms', data: 'a1b2c3...' },
          websdr: { status: 'success', latency: '234ms', data: 'Freq: 22.68 MHz' },
          nist: { status: 'success', latency: '567ms', data: 'pulse: 123456' },
          internet: { status: 'success', latency: '891ms', data: 'Weather + Crypto + Latency' }
        }
      });
    }

    if (step === 'all' || step === 2) {
      simulation.steps.push({
        step: 2,
        name: 'Комбинирование',
        status: 'completed',
        data: {
          method: 'SHA-512',
          iterations: 4,
          inputHash: 'abc123...',
          outputHash: 'def456...'
        }
      });
    }

    if (step === 'all' || step === 3) {
      simulation.steps.push({
        step: 3,
        name: 'Тестирование',
        status: 'completed',
        data: {
          testsRun: 7,
          testsPassed: 7,
          score: 96.5,
          entropy: 0.983
        }
      });
    }

    if (step === 'all' || step === 4) {
      simulation.steps.push({
        step: 4,
        name: 'Результат',
        status: 'completed',
        data: {
          numbers: [7, 15, 23, 31, 42, 49],
          hash: '7f8a9b2c3d4e5f6a...',
          proofAvailable: true
        }
      });
    }

    res.json({
      success: true,
      simulation
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

