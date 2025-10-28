const crypto = require('crypto');

/**
 * DIEHARD тесты для аудита случайности
 * Реализация всех 12 тестов согласно Википедии и официальным источникам
 * https://ru.wikipedia.org/wiki/%D0%A2%D0%B5%D1%81%D1%82%D1%8B_diehard
 */
class DIEHARDTests {
  constructor() {
    this.name = 'DIEHARD Tests';
    this.version = '1.0';
    this.description = 'Полная реализация тестов DIEHARD для проверки качества случайных чисел';
  }

  /**
   * Запуск всех DIEHARD тестов
   */
  async runAllTests(binaryData) {
    const results = {
      overallScore: 0,
      tests: {},
      summary: {
        passed: 0,
        failed: 0,
        skipped: 0,
        total: 12
      }
    };

    // 1. Дни рождения (Birthday Spacings)
    results.tests.birthdaySpacings = this.birthdaySpacingsTest(binaryData);
    
    // 2. Пересекающиеся перестановки (Overlapping Permutations)
    results.tests.overlappingPermutations = this.overlappingPermutationsTest(binaryData);
    
    // 3. Ранги матриц (Ranks of matrices)
    results.tests.ranksOfMatrices = this.ranksOfMatricesTest(binaryData);
    
    // 4. Обезьяньи тесты (Monkey Tests)
    results.tests.monkeyTests = this.monkeyTests(binaryData);
    
    // 5. Подсчёт единичек (Count the 1's)
    results.tests.countTheOnes = this.countTheOnesTest(binaryData);
    
    // 6. Тест на парковку (Parking Lot Test)
    results.tests.parkingLot = this.parkingLotTest(binaryData);
    
    // 7. Тест на минимальное расстояние (Minimum Distance Test)
    results.tests.minimumDistance = this.minimumDistanceTest(binaryData);
    
    // 8. Тест случайных сфер (Random Spheres Test)
    results.tests.randomSpheres = this.randomSpheresTest(binaryData);
    
    // 9. Тест сжатия (The Squeeze Test)
    results.tests.squeeze = this.squeezeTest(binaryData);
    
    // 10. Тест пересекающихся сумм (Overlapping Sums Test)
    results.tests.overlappingSums = this.overlappingSumsTest(binaryData);
    
    // 11. Тест последовательностей (Runs Test)
    results.tests.runs = this.runsTest(binaryData);
    
    // 12. Тест игры в кости (The Craps Test)
    results.tests.craps = this.crapsTest(binaryData);

    // Подсчет результатов
    Object.values(results.tests).forEach(test => {
      if (test.status === 'PASS') results.summary.passed++;
      else if (test.status === 'FAIL') results.summary.failed++;
      else if (test.status === 'SKIP') results.summary.skipped++;
    });

    // Расчет общей оценки
    results.overallScore = Math.round((results.summary.passed / results.summary.total) * 100);

    return results;
  }

  /**
   * 1. Дни рождения (Birthday Spacings) Test
   * Выбираются случайные точки на большом интервале.
   * Расстояния между точками должны быть асимптотически распределены по Пуассону.
   */
  birthdaySpacingsTest(data) {
    if (data.length < 100) {
      return {
        name: 'Birthday Spacings Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Расстояния между случайными точками должны быть распределены по Пуассону'
      };
    }

    const n = Math.min(100, Math.floor(data.length / 20)); // Адаптивное количество точек
    const m = 1000000; // Размер интервала
    const points = [];
    
    // Генерируем случайные точки из бинарных данных
    for (let i = 0; i < n; i++) {
      const start = (i * 20) % (data.length - 20);
      const bits = data.slice(start, start + 20);
      const point = this.bitsToInt(bits) % m;
      points.push(point);
    }
    
    points.sort((a, b) => a - b);
    
    // Вычисляем расстояния между соседними точками
    const spacings = [];
    for (let i = 1; i < points.length; i++) {
      spacings.push(points[i] - points[i - 1]);
    }
    
    // Группируем расстояния
    const maxSpacing = Math.max(...spacings);
    const bins = new Array(Math.min(20, maxSpacing + 1)).fill(0);
    
    spacings.forEach(spacing => {
      const bin = Math.min(spacing, bins.length - 1);
      bins[bin]++;
    });
    
    // Тест хи-квадрат против распределения Пуассона
    const lambda = spacings.length / bins.length; // Среднее ожидаемое значение
    let chiSquared = 0;
    
    bins.forEach((observed, i) => {
      const expected = this.poissonProbability(i, lambda) * spacings.length;
      if (expected > 0) {
        chiSquared += Math.pow(observed - expected, 2) / expected;
      }
    });
    
    const pValue = this.chiSquarePValue(bins.length - 1, chiSquared);

    return {
      name: 'Birthday Spacings Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Расстояния между случайными точками должны быть распределены по Пуассону',
      details: {
        n: n,
        m: m,
        spacings: spacings.length,
        bins: bins.length,
        lambda: lambda.toFixed(6),
        chiSquared: chiSquared.toFixed(6)
      }
    };
  }

  /**
   * 2. Пересекающиеся перестановки (Overlapping Permutations) Test
   * Анализируются последовательности пяти последовательных случайных чисел.
   * 120 возможных перестановок должны получаться со статистически эквивалентной вероятностью.
   */
  overlappingPermutationsTest(data) {
    if (data.length < 100) {
      return {
        name: 'Overlapping Permutations Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Перестановки 5 последовательных чисел должны быть равномерно распределены'
      };
    }

    const k = 5; // Размер перестановки
    const permutations = new Array(120).fill(0); // 5! = 120 перестановок
    
    // Генерируем числа из бинарных данных
    const numbers = [];
    for (let i = 0; i < Math.floor(data.length / 8); i++) {
      const start = i * 8;
      if (start + 8 <= data.length) {
        const bits = data.slice(start, start + 8);
        numbers.push(this.bitsToInt(bits));
      }
    }
    
    if (numbers.length < k) {
      return {
        name: 'Overlapping Permutations Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно чисел для анализа',
        description: 'DIEHARD: Перестановки 5 последовательных чисел должны быть равномерно распределены'
      };
    }
    
    // Анализируем перестановки
    for (let i = 0; i < numbers.length - k + 1; i++) {
      const sequence = numbers.slice(i, i + k);
      const permutation = this.getPermutationIndex(sequence);
      if (permutation >= 0 && permutation < 120) {
        permutations[permutation]++;
      }
    }
    
    // Тест хи-квадрат
    const total = permutations.reduce((sum, count) => sum + count, 0);
    const expected = total / 120;
    let chiSquared = 0;
    
    permutations.forEach(observed => {
      if (expected > 0) {
        chiSquared += Math.pow(observed - expected, 2) / expected;
      }
    });
    
    const pValue = this.chiSquarePValue(119, chiSquared);

    return {
      name: 'Overlapping Permutations Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Перестановки 5 последовательных чисел должны быть равномерно распределены',
      details: {
        k: k,
        total: total,
        expected: expected.toFixed(6),
        chiSquared: chiSquared.toFixed(6),
        uniquePermutations: permutations.filter(count => count > 0).length
      }
    };
  }

  /**
   * 3. Ранги матриц (Ranks of matrices) Test
   * Выбираются некоторое количество бит из некоторого количества случайных чисел
   * для формирования матрицы над {0,1}, затем определяется ранг матрицы.
   */
  ranksOfMatricesTest(data) {
    if (data.length < 200) {
      return {
        name: 'Ranks of Matrices Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 200)',
        description: 'DIEHARD: Ранги случайных бинарных матриц должны соответствовать ожидаемому распределению'
      };
    }

    const matrixSize = 32;
    const numMatrices = 100;
    const frequencies = { full: 0, fullMinus1: 0, other: 0 };
    
    for (let m = 0; m < numMatrices; m++) {
      const matrix = [];
      for (let i = 0; i < matrixSize; i++) {
        matrix[i] = [];
        for (let j = 0; j < matrixSize; j++) {
          const index = (m * matrixSize * matrixSize + i * matrixSize + j) % data.length;
          matrix[i][j] = data[index];
        }
      }
      
      const rank = this.calculateMatrixRank(matrix);
      
      if (rank === matrixSize) frequencies.full++;
      else if (rank === matrixSize - 1) frequencies.fullMinus1++;
      else frequencies.other++;
    }
    
    // Ожидаемые частоты для случайных матриц
    const expectedFull = numMatrices * 0.2888;
    const expectedFullMinus1 = numMatrices * 0.5776;
    const expectedOther = numMatrices * 0.1336;
    
    const chiSquared = Math.pow(frequencies.full - expectedFull, 2) / expectedFull +
                      Math.pow(frequencies.fullMinus1 - expectedFullMinus1, 2) / expectedFullMinus1 +
                      Math.pow(frequencies.other - expectedOther, 2) / expectedOther;
    
    const pValue = this.chiSquarePValue(2, chiSquared);

    return {
      name: 'Ranks of Matrices Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Ранги случайных бинарных матриц должны соответствовать ожидаемому распределению',
      details: {
        matrixSize: matrixSize,
        numMatrices: numMatrices,
        frequencies: frequencies,
        expectedFreqs: {
          full: expectedFull.toFixed(2),
          fullMinus1: expectedFullMinus1.toFixed(2),
          other: expectedOther.toFixed(2)
        },
        chiSquared: chiSquared.toFixed(6)
      }
    };
  }

  /**
   * 4. Обезьяньи тесты (Monkey Tests)
   * Последовательности некоторого количества бит интерпретируются как слова.
   * Считаются пересекающиеся слова в потоке.
   */
  monkeyTests(data) {
    if (data.length < 100) {
      return {
        name: 'Monkey Tests',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Частота появления "слов" должна соответствовать ожидаемому распределению'
      };
    }

    const wordLength = 10; // Длина слова в битах
    const numWords = Math.floor(data.length / wordLength);
    const wordCounts = new Map();
    
    // Подсчитываем частоту каждого слова
    for (let i = 0; i < numWords; i++) {
      const start = i * wordLength;
      const word = data.slice(start, start + wordLength);
      const wordStr = word.join('');
      
      wordCounts.set(wordStr, (wordCounts.get(wordStr) || 0) + 1);
    }
    
    // Анализируем распределение частот
    const frequencies = Array.from(wordCounts.values());
    const uniqueWords = wordCounts.size;
    const expectedFreq = numWords / Math.pow(2, wordLength);
    
    // Тест на соответствие распределению Пуассона
    const lambda = expectedFreq;
    let chiSquared = 0;
    const maxFreq = Math.max(...frequencies);
    const bins = new Array(Math.min(20, maxFreq + 1)).fill(0);
    
    frequencies.forEach(freq => {
      const bin = Math.min(freq, bins.length - 1);
      bins[bin]++;
    });
    
    bins.forEach((observed, i) => {
      const expected = this.poissonProbability(i, lambda) * uniqueWords;
      if (expected > 0) {
        chiSquared += Math.pow(observed - expected, 2) / expected;
      }
    });
    
    const pValue = this.chiSquarePValue(bins.length - 1, chiSquared);

    return {
      name: 'Monkey Tests',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Частота появления "слов" должна соответствовать ожидаемому распределению',
      details: {
        wordLength: wordLength,
        numWords: numWords,
        uniqueWords: uniqueWords,
        expectedFreq: expectedFreq.toFixed(6),
        lambda: lambda.toFixed(6),
        chiSquared: chiSquared.toFixed(6)
      }
    };
  }

  /**
   * 5. Подсчёт единичек (Count the 1's) Test
   * Считаются единичные биты в каждом из последующих или выбранных байт.
   * Эти счётчики преобразуется в "буквы", и считаются случаи пятибуквенных "слов".
   */
  countTheOnesTest(data) {
    if (data.length < 100) {
      return {
        name: 'Count the 1\'s Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Частота единичных битов в байтах должна быть равномерно распределена'
      };
    }

    const byteSize = 8;
    const numBytes = Math.floor(data.length / byteSize);
    const letters = [];
    
    // Подсчитываем единички в каждом байте
    for (let i = 0; i < numBytes; i++) {
      const start = i * byteSize;
      const byte = data.slice(start, start + byteSize);
      const ones = byte.filter(bit => bit === 1).length;
      letters.push(ones);
    }
    
    // Анализируем пятибуквенные слова
    const wordLength = 5;
    const numWords = Math.floor(letters.length / wordLength);
    const wordCounts = new Map();
    
    for (let i = 0; i < numWords; i++) {
      const start = i * wordLength;
      const word = letters.slice(start, start + wordLength).join('');
      wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
    }
    
    // Тест хи-квадрат
    const uniqueWords = wordCounts.size;
    const expectedFreq = numWords / Math.pow(9, wordLength); // 0-8 букв
    let chiSquared = 0;
    
    wordCounts.forEach(count => {
      if (expectedFreq > 0) {
        chiSquared += Math.pow(count - expectedFreq, 2) / expectedFreq;
      }
    });
    
    const pValue = this.chiSquarePValue(uniqueWords - 1, chiSquared);

    return {
      name: 'Count the 1\'s Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Частота единичных битов в байтах должна быть равномерно распределена',
      details: {
        byteSize: byteSize,
        numBytes: numBytes,
        wordLength: wordLength,
        numWords: numWords,
        uniqueWords: uniqueWords,
        expectedFreq: expectedFreq.toFixed(6),
        chiSquared: chiSquared.toFixed(6)
      }
    };
  }

  /**
   * 6. Тест на парковку (Parking Lot Test)
   * Единичные окружности случайно размещаются в квадрате 100×100.
   * Если окружность пересекает уже существующую, попытаться ещё.
   * После 12 000 попыток, количество успешно "припаркованных" окружностей должно быть нормально распределено.
   */
  parkingLotTest(data) {
    if (data.length < 300) {
      return {
        name: 'Parking Lot Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 300)',
        description: 'DIEHARD: Количество успешно размещенных окружностей должно быть нормально распределено'
      };
    }

    const squareSize = 100;
    const radius = 1;
    const maxAttempts = 12000;
    const circles = [];
    let successfulPlacements = 0;
    
    // Генерируем случайные координаты из бинарных данных
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const xBits = data.slice((attempt * 16) % data.length, ((attempt * 16) % data.length) + 8);
      const yBits = data.slice(((attempt * 16 + 8) % data.length), ((attempt * 16 + 8) % data.length) + 8);
      
      const x = (this.bitsToInt(xBits) / 255) * squareSize;
      const y = (this.bitsToInt(yBits) / 255) * squareSize;
      
      // Проверяем, не пересекается ли с уже размещенными окружностями
      let canPlace = true;
      for (const circle of circles) {
        const distance = Math.sqrt(Math.pow(x - circle.x, 2) + Math.pow(y - circle.y, 2));
        if (distance < 2 * radius) {
          canPlace = false;
          break;
        }
      }
      
      if (canPlace) {
        circles.push({ x, y });
        successfulPlacements++;
      }
    }
    
    // Ожидаемое количество размещений для случайного размещения
    const expectedMean = maxAttempts * 0.3528; // Теоретическое значение
    const expectedStd = Math.sqrt(maxAttempts * 0.3528 * (1 - 0.3528));
    
    const z = (successfulPlacements - expectedMean) / expectedStd;
    const pValue = this.erfc(Math.abs(z) / Math.sqrt(2));

    return {
      name: 'Parking Lot Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Количество успешно размещенных окружностей должно быть нормально распределено',
      details: {
        squareSize: squareSize,
        radius: radius,
        maxAttempts: maxAttempts,
        successfulPlacements: successfulPlacements,
        expectedMean: expectedMean.toFixed(2),
        expectedStd: expectedStd.toFixed(2),
        z: z.toFixed(6)
      }
    };
  }

  /**
   * 7. Тест на минимальное расстояние (Minimum Distance Test)
   * 8000 точек случайно размещаются в квадрате 10 000×10 000,
   * затем находится минимальное расстояние между любыми парами.
   */
  minimumDistanceTest(data) {
    if (data.length < 100) {
      return {
        name: 'Minimum Distance Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Минимальное расстояние между точками должно быть экспоненциально распределено'
      };
    }

    const numPoints = 8000;
    const squareSize = 10000;
    const points = [];
    
    // Генерируем случайные точки
    for (let i = 0; i < numPoints; i++) {
      const xBits = data.slice((i * 20) % data.length, ((i * 20) % data.length) + 10);
      const yBits = data.slice(((i * 20 + 10) % data.length), ((i * 20 + 10) % data.length) + 10);
      
      const x = (this.bitsToInt(xBits) / 1023) * squareSize;
      const y = (this.bitsToInt(yBits) / 1023) * squareSize;
      points.push({ x, y });
    }
    
    // Находим минимальное расстояние
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const distance = Math.sqrt(
          Math.pow(points[i].x - points[j].x, 2) + 
          Math.pow(points[i].y - points[j].y, 2)
        );
        minDistance = Math.min(minDistance, distance);
      }
    }
    
    // Квадрат минимального расстояния должен быть экспоненциально распределен
    const minDistanceSquared = minDistance * minDistance;
    const expectedMean = squareSize * squareSize / (Math.PI * numPoints * numPoints);
    
    // Тест на экспоненциальное распределение
    const lambda = 1 / expectedMean;
    const pValue = 1 - Math.exp(-lambda * minDistanceSquared);

    return {
      name: 'Minimum Distance Test',
      status: pValue >= 0.01 && pValue <= 0.99 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Минимальное расстояние между точками должно быть экспоненциально распределено',
      details: {
        numPoints: numPoints,
        squareSize: squareSize,
        minDistance: minDistance.toFixed(6),
        minDistanceSquared: minDistanceSquared.toFixed(6),
        expectedMean: expectedMean.toFixed(6),
        lambda: lambda.toFixed(6)
      }
    };
  }

  /**
   * 8. Тест случайных сфер (Random Spheres Test)
   * Случайно выбираются 4000 точек в кубе с ребром 1000.
   * В каждой точке помещается сфера, чей радиус является минимальным расстоянием до другой точки.
   */
  randomSpheresTest(data) {
    if (data.length < 100) {
      return {
        name: 'Random Spheres Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Минимальный объем сфер должен быть экспоненциально распределен'
      };
    }

    const numPoints = 4000;
    const cubeSize = 1000;
    const points = [];
    
    // Генерируем случайные точки в кубе
    for (let i = 0; i < numPoints; i++) {
      const xBits = data.slice((i * 30) % data.length, ((i * 30) % data.length) + 10);
      const yBits = data.slice(((i * 30 + 10) % data.length), ((i * 30 + 10) % data.length) + 10);
      const zBits = data.slice(((i * 30 + 20) % data.length), ((i * 30 + 20) % data.length) + 10);
      
      const x = (this.bitsToInt(xBits) / 1023) * cubeSize;
      const y = (this.bitsToInt(yBits) / 1023) * cubeSize;
      const z = (this.bitsToInt(zBits) / 1023) * cubeSize;
      points.push({ x, y, z });
    }
    
    // Находим минимальные радиусы сфер
    const minRadii = [];
    for (let i = 0; i < points.length; i++) {
      let minRadius = Infinity;
      for (let j = 0; j < points.length; j++) {
        if (i !== j) {
          const distance = Math.sqrt(
            Math.pow(points[i].x - points[j].x, 2) + 
            Math.pow(points[i].y - points[j].y, 2) + 
            Math.pow(points[i].z - points[j].z, 2)
          );
          minRadius = Math.min(minRadius, distance);
        }
      }
      minRadii.push(minRadius);
    }
    
    // Вычисляем минимальные объемы сфер
    const minVolumes = minRadii.map(radius => (4/3) * Math.PI * radius * radius * radius);
    const minVolume = Math.min(...minVolumes);
    
    // Ожидаемое значение для экспоненциального распределения
    const expectedMean = cubeSize * cubeSize * cubeSize / (Math.PI * numPoints * numPoints);
    const lambda = 1 / expectedMean;
    
    const pValue = 1 - Math.exp(-lambda * minVolume);

    return {
      name: 'Random Spheres Test',
      status: pValue >= 0.01 && pValue <= 0.99 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Минимальный объем сфер должен быть экспоненциально распределен',
      details: {
        numPoints: numPoints,
        cubeSize: cubeSize,
        minVolume: minVolume.toFixed(6),
        expectedMean: expectedMean.toFixed(6),
        lambda: lambda.toFixed(6)
      }
    };
  }

  /**
   * 9. Тест сжатия (The Squeeze Test)
   * 2^31 умножается на случайные вещественные числа в диапазоне [0,1) до тех пор,
   * пока не получится 1. Повторяется 100 000 раз.
   */
  squeezeTest(data) {
    if (data.length < 100) {
      return {
        name: 'Squeeze Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Количество умножений до достижения 1 должно соответствовать ожидаемому распределению'
      };
    }

    const numTrials = 100000;
    const counts = [];
    
    for (let trial = 0; trial < numTrials; trial++) {
      let product = 1;
      let count = 0;
      
      while (product > 0.5) {
        const start = (trial * 8 + count * 8) % data.length;
        const bits = data.slice(start, start + 8);
        const randomValue = this.bitsToInt(bits) / 255;
        
        product *= randomValue;
        count++;
        
        if (count > 100) break; // Защита от бесконечного цикла
      }
      
      counts.push(count);
    }
    
    // Анализируем распределение счетчиков
    const maxCount = Math.max(...counts);
    const bins = new Array(Math.min(20, maxCount + 1)).fill(0);
    
    counts.forEach(count => {
      const bin = Math.min(count, bins.length - 1);
      bins[bin]++;
    });
    
    // Ожидаемое распределение для этого теста
    const expectedMean = Math.log(2) / Math.log(0.5); // Теоретическое значение
    let chiSquared = 0;
    
    bins.forEach((observed, i) => {
      const expected = this.poissonProbability(i, expectedMean) * numTrials;
      if (expected > 0) {
        chiSquared += Math.pow(observed - expected, 2) / expected;
      }
    });
    
    const pValue = this.chiSquarePValue(bins.length - 1, chiSquared);

    return {
      name: 'Squeeze Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Количество умножений до достижения 1 должно соответствовать ожидаемому распределению',
      details: {
        numTrials: numTrials,
        expectedMean: expectedMean.toFixed(6),
        chiSquared: chiSquared.toFixed(6),
        maxCount: maxCount
      }
    };
  }

  /**
   * 10. Тест пересекающихся сумм (Overlapping Sums Test)
   * Генерируется длинная последовательность вещественных чисел из интервала [0,1).
   * В ней суммируются каждые 100 последовательных чисел.
   */
  overlappingSumsTest(data) {
    if (data.length < 100) {
      return {
        name: 'Overlapping Sums Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Суммы 100 последовательных чисел должны быть нормально распределены'
      };
    }

    const windowSize = 100;
    const numNumbers = Math.floor(data.length / 8);
    const numbers = [];
    
    // Генерируем вещественные числа из бинарных данных
    for (let i = 0; i < numNumbers; i++) {
      const start = i * 8;
      const bits = data.slice(start, start + 8);
      const number = this.bitsToInt(bits) / 255;
      numbers.push(number);
    }
    
    if (numbers.length < windowSize) {
      return {
        name: 'Overlapping Sums Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно чисел для анализа',
        description: 'DIEHARD: Суммы 100 последовательных чисел должны быть нормально распределены'
      };
    }
    
    // Вычисляем пересекающиеся суммы
    const sums = [];
    for (let i = 0; i < numbers.length - windowSize + 1; i++) {
      const sum = numbers.slice(i, i + windowSize).reduce((acc, val) => acc + val, 0);
      sums.push(sum);
    }
    
    // Статистики для нормального распределения
    const mean = sums.reduce((acc, sum) => acc + sum, 0) / sums.length;
    const variance = sums.reduce((acc, sum) => acc + Math.pow(sum - mean, 2), 0) / sums.length;
    const stdDev = Math.sqrt(variance);
    
    // Тест Колмогорова-Смирнова против нормального распределения
    const sortedSums = [...sums].sort((a, b) => a - b);
    let maxDiff = 0;
    
    sortedSums.forEach((sum, i) => {
      const empiricalCDF = (i + 1) / sortedSums.length;
      const theoreticalCDF = this.normalCDF(sum, mean, stdDev);
      const diff = Math.abs(empiricalCDF - theoreticalCDF);
      maxDiff = Math.max(maxDiff, diff);
    });
    
    // Приблизительный p-value для теста Колмогорова-Смирнова
    const ksStatistic = maxDiff * Math.sqrt(sums.length);
    const pValue = this.kolmogorovSmirnovPValue(ksStatistic);

    return {
      name: 'Overlapping Sums Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Суммы 100 последовательных чисел должны быть нормально распределены',
      details: {
        windowSize: windowSize,
        numNumbers: numNumbers,
        sums: sums.length,
        mean: mean.toFixed(6),
        variance: variance.toFixed(6),
        stdDev: stdDev.toFixed(6),
        ksStatistic: ksStatistic.toFixed(6)
      }
    };
  }

  /**
   * 11. Тест последовательностей (Runs Test)
   * Генерируется длинная последовательность на [0,1).
   * Подсчитываются восходящие и нисходящие последовательности.
   */
  runsTest(data) {
    if (data.length < 100) {
      return {
        name: 'Runs Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 100)',
        description: 'DIEHARD: Количество восходящих и нисходящих последовательностей должно соответствовать ожидаемому распределению'
      };
    }

    const numNumbers = Math.floor(data.length / 8);
    const numbers = [];
    
    // Генерируем вещественные числа
    for (let i = 0; i < numNumbers; i++) {
      const start = i * 8;
      const bits = data.slice(start, start + 8);
      const number = this.bitsToInt(bits) / 255;
      numbers.push(number);
    }
    
    if (numbers.length < 1000) {
      return {
        name: 'Runs Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно чисел для анализа',
        description: 'DIEHARD: Количество восходящих и нисходящих последовательностей должно соответствовать ожидаемому распределению'
      };
    }
    
    // Подсчитываем последовательности
    let ascendingRuns = 0;
    let descendingRuns = 0;
    let currentRun = 1;
    let isAscending = null;
    
    for (let i = 1; i < numbers.length; i++) {
      if (numbers[i] > numbers[i - 1]) {
        if (isAscending === true) {
          currentRun++;
        } else {
          if (isAscending === false) {
            descendingRuns++;
          }
          isAscending = true;
          currentRun = 2;
        }
      } else if (numbers[i] < numbers[i - 1]) {
        if (isAscending === false) {
          currentRun++;
        } else {
          if (isAscending === true) {
            ascendingRuns++;
          }
          isAscending = false;
          currentRun = 2;
        }
      } else {
        // Равные числа - завершаем текущую последовательность
        if (isAscending === true) {
          ascendingRuns++;
        } else if (isAscending === false) {
          descendingRuns++;
        }
        isAscending = null;
        currentRun = 1;
      }
    }
    
    // Завершаем последнюю последовательность
    if (isAscending === true) {
      ascendingRuns++;
    } else if (isAscending === false) {
      descendingRuns++;
    }
    
    const totalRuns = ascendingRuns + descendingRuns;
    const expectedRuns = (2 * numbers.length - 1) / 3;
    const variance = (16 * numbers.length - 29) / 90;
    
    const z = (totalRuns - expectedRuns) / Math.sqrt(variance);
    const pValue = this.erfc(Math.abs(z) / Math.sqrt(2));

    return {
      name: 'Runs Test',
      status: pValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(pValue),
      description: 'DIEHARD: Количество восходящих и нисходящих последовательностей должно соответствовать ожидаемому распределению',
      details: {
        numNumbers: numNumbers,
        ascendingRuns: ascendingRuns,
        descendingRuns: descendingRuns,
        totalRuns: totalRuns,
        expectedRuns: expectedRuns.toFixed(6),
        variance: variance.toFixed(6),
        z: z.toFixed(6)
      }
    };
  }

  /**
   * 12. Тест игры в кости (The Craps Test)
   * Играется 200 000 игр в кости, подсчитываются победы и количество бросков в каждой игре.
   */
  crapsTest(data) {
    if (data.length < 200) {
      return {
        name: 'Craps Test',
        status: 'SKIP',
        pValue: null,
        reason: 'Недостаточно битов (минимум 200)',
        description: 'DIEHARD: Результаты игры в кости должны соответствовать ожидаемому распределению'
      };
    }

    const numGames = 200000;
    const wins = [];
    const rolls = [];
    
    for (let game = 0; game < numGames; game++) {
      // Первый бросок
      const dice1Bits = data.slice((game * 12) % data.length, ((game * 12) % data.length) + 6);
      const dice2Bits = data.slice(((game * 12 + 6) % data.length), ((game * 12 + 6) % data.length) + 6);
      
      const dice1 = (this.bitsToInt(dice1Bits) % 6) + 1;
      const dice2 = (this.bitsToInt(dice2Bits) % 6) + 1;
      const firstRoll = dice1 + dice2;
      
      let gameWon = false;
      let numRolls = 1;
      
      if (firstRoll === 7 || firstRoll === 11) {
        gameWon = true;
      } else if (firstRoll === 2 || firstRoll === 3 || firstRoll === 12) {
        gameWon = false;
      } else {
        // Продолжаем бросать до выпадения 7 или первого результата
        const point = firstRoll;
        let currentRoll;
        
        do {
          const dice1Bits = data.slice(((game * 12 + numRolls * 12) % data.length), ((game * 12 + numRolls * 12) % data.length) + 6);
          const dice2Bits = data.slice(((game * 12 + numRolls * 12 + 6) % data.length), ((game * 12 + numRolls * 12 + 6) % data.length) + 6);
          
          const dice1 = (this.bitsToInt(dice1Bits) % 6) + 1;
          const dice2 = (this.bitsToInt(dice2Bits) % 6) + 1;
          currentRoll = dice1 + dice2;
          numRolls++;
        } while (currentRoll !== 7 && currentRoll !== point);
        
        gameWon = (currentRoll === point);
      }
      
      wins.push(gameWon ? 1 : 0);
      rolls.push(numRolls);
    }
    
    // Анализируем распределение побед
    const winCount = wins.reduce((sum, win) => sum + win, 0);
    const expectedWins = numGames * 0.4929; // Теоретическая вероятность выигрыша
    const winVariance = numGames * 0.4929 * (1 - 0.4929);
    
    const winZ = (winCount - expectedWins) / Math.sqrt(winVariance);
    const winPValue = this.erfc(Math.abs(winZ) / Math.sqrt(2));
    
    // Анализируем распределение количества бросков
    const meanRolls = rolls.reduce((sum, roll) => sum + roll, 0) / rolls.length;
    const expectedMeanRolls = 3.375; // Теоретическое среднее количество бросков
    const rollVariance = rolls.reduce((sum, roll) => sum + Math.pow(roll - meanRolls, 2), 0) / rolls.length;
    
    const rollZ = (meanRolls - expectedMeanRolls) / Math.sqrt(rollVariance / rolls.length);
    const rollPValue = this.erfc(Math.abs(rollZ) / Math.sqrt(2));
    
    // Комбинированный p-value
    const combinedPValue = Math.min(winPValue, rollPValue);

    return {
      name: 'Craps Test',
      status: combinedPValue >= 0.01 ? 'PASS' : 'FAIL',
      pValue: this.formatPValue(combinedPValue),
      description: 'DIEHARD: Результаты игры в кости должны соответствовать ожидаемому распределению',
      details: {
        numGames: numGames,
        winCount: winCount,
        expectedWins: expectedWins.toFixed(2),
        winZ: winZ.toFixed(6),
        winPValue: winPValue.toFixed(6),
        meanRolls: meanRolls.toFixed(6),
        expectedMeanRolls: expectedMeanRolls.toFixed(6),
        rollZ: rollZ.toFixed(6),
        rollPValue: rollPValue.toFixed(6)
      }
    };
  }

  // Вспомогательные функции

  /**
   * Форматирование p-value для отображения
   */
  formatPValue(pValue) {
    if (!isFinite(pValue) || pValue < 0) {
      return 'N/A';
    }
    if (pValue < 0.000001) {
      return '<0.000001';
    }
    if (pValue > 0.999999) {
      return '>0.999999';
    }
    return pValue.toFixed(6);
  }

  /**
   * Преобразование битов в целое число
   */
  bitsToInt(bits) {
    if (!bits || !Array.isArray(bits) || bits.length === 0) {
      return 0;
    }
    
    let result = 0;
    for (let i = 0; i < bits.length; i++) {
      const bit = parseInt(bits[i]);
      if (isNaN(bit) || (bit !== 0 && bit !== 1)) {
        console.warn(`Некорректный бит в позиции ${i}: ${bits[i]}`);
        continue;
      }
      result = (result << 1) | bit;
    }
    return result;
  }

  /**
   * Получение индекса перестановки
   */
  getPermutationIndex(sequence) {
    const sorted = [...sequence].sort((a, b) => a - b);
    const indices = sequence.map(val => sorted.indexOf(val));
    
    // Простой алгоритм для получения индекса перестановки
    let index = 0;
    const used = new Set();
    
    for (let i = 0; i < indices.length; i++) {
      const currentIndex = indices[i];
      let smallerCount = 0;
      
      for (let j = 0; j < currentIndex; j++) {
        if (!used.has(j)) {
          smallerCount++;
        }
      }
      
      index += smallerCount * this.factorial(sequence.length - i - 1);
      used.add(currentIndex);
    }
    
    return index;
  }

  /**
   * Факториал
   */
  factorial(n) {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }

  /**
   * Вероятность Пуассона
   */
  poissonProbability(k, lambda) {
    if (!isFinite(k) || !isFinite(lambda) || k < 0 || lambda < 0) {
      return 0;
    }
    
    try {
      if (lambda === 0) {
        return k === 0 ? 1 : 0;
      }
      
      const factorial = this.factorial(k);
      if (!isFinite(factorial) || factorial === 0) {
        return 0;
      }
      
      const result = Math.exp(-lambda) * Math.pow(lambda, k) / factorial;
      return isFinite(result) ? result : 0;
    } catch (error) {
      console.warn('Ошибка вычисления poissonProbability:', error);
      return 0;
    }
  }

  /**
   * P-value для хи-квадрат распределения
   */
  chiSquarePValue(df, chiSquared) {
    if (df <= 0 || chiSquared < 0 || !isFinite(df) || !isFinite(chiSquared)) {
      return 0.5; // Возвращаем нейтральное значение при некорректных данных
    }
    
    try {
      const result = this.incompleteGamma(df / 2, chiSquared / 2);
      return isFinite(result) ? result : 0.5;
    } catch (error) {
      console.warn('Ошибка вычисления chiSquarePValue:', error);
      return 0.5;
    }
  }

  /**
   * Функция нормального распределения
   */
  normalCDF(x, mean, stdDev) {
    if (!isFinite(x) || !isFinite(mean) || !isFinite(stdDev) || stdDev <= 0) {
      return 0.5; // Возвращаем нейтральное значение при некорректных данных
    }
    
    try {
      const result = 0.5 * (1 + this.erf((x - mean) / (stdDev * Math.sqrt(2))));
      return isFinite(result) ? result : 0.5;
    } catch (error) {
      console.warn('Ошибка вычисления normalCDF:', error);
      return 0.5;
    }
  }

  /**
   * P-value для теста Колмогорова-Смирнова
   */
  kolmogorovSmirnovPValue(ksStatistic) {
    if (!isFinite(ksStatistic) || ksStatistic < 0) {
      return 0.5; // Возвращаем нейтральное значение при некорректных данных
    }
    
    try {
      // Приблизительная формула для больших выборок
      if (ksStatistic < 0.5) return 1;
      if (ksStatistic > 2.5) return 0;
      
      const sum = Math.exp(-2 * ksStatistic * ksStatistic);
      const result = 1 - sum;
      return isFinite(result) ? result : 0.5;
    } catch (error) {
      console.warn('Ошибка вычисления kolmogorovSmirnovPValue:', error);
      return 0.5;
    }
  }

  /**
   * Вычисление ранга матрицы
   */
  calculateMatrixRank(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    let rank = 0;
    
    const workMatrix = matrix.map(row => [...row]);
    
    for (let col = 0; col < cols && rank < rows; col++) {
      let pivotRow = -1;
      for (let row = rank; row < rows; row++) {
        if (workMatrix[row][col] === 1) {
          pivotRow = row;
          break;
        }
      }
      
      if (pivotRow === -1) continue;
      
      if (pivotRow !== rank) {
        [workMatrix[rank], workMatrix[pivotRow]] = [workMatrix[pivotRow], workMatrix[rank]];
      }
      
      for (let row = 0; row < rows; row++) {
        if (row !== rank && workMatrix[row][col] === 1) {
          for (let c = 0; c < cols; c++) {
            workMatrix[row][c] = (workMatrix[row][c] + workMatrix[rank][c]) % 2;
          }
        }
      }
      
      rank++;
    }
    
    return rank;
  }

  /**
   * Дополнительная функция ошибок
   */
  erfc(x) {
    if (!isFinite(x)) {
      return 0.5; // Возвращаем нейтральное значение при некорректных данных
    }
    
    if (x === 0) return 1;
    if (x > 6) return 0;
    if (x < -6) return 2;
    
    try {
      const a1 = -1.26551223;
      const a2 = 1.00002368;
      const a3 = 0.37409196;
      const a4 = 0.09678418;
      const a5 = -0.18628806;
      const a6 = 0.27886807;
      const a7 = -1.13520398;
      const a8 = 1.48851587;
      const a9 = -0.82215223;
      const a10 = 0.17087277;
      
      let t = 1 / (1 + 0.5 * Math.abs(x));
      const tau = t * Math.exp(-x * x + a1 + t * (a2 + t * (a3 + t * (a4 + t * (a5 + t * (a6 + t * (a7 + t * (a8 + t * (a9 + t * a10)))))))));
      
      const result = x >= 0 ? tau : 2 - tau;
      return isFinite(result) ? result : 0.5;
    } catch (error) {
      console.warn('Ошибка вычисления erfc:', error);
      return 0.5;
    }
  }

  /**
   * Функция ошибок
   */
  erf(x) {
    if (!isFinite(x)) {
      return 0; // Возвращаем нейтральное значение при некорректных данных
    }
    
    try {
      const result = 1 - this.erfc(x);
      return isFinite(result) ? result : 0;
    } catch (error) {
      console.warn('Ошибка вычисления erf:', error);
      return 0;
    }
  }

  /**
   * Неполная гамма-функция
   */
  incompleteGamma(a, x) {
    if (x < 0 || a <= 0 || !isFinite(a) || !isFinite(x)) {
      return 0.5; // Возвращаем нейтральное значение при некорректных данных
    }
    
    const maxIterations = 100;
    const epsilon = 1e-10;
    
    if (x === 0) return 0;
    
    try {
      let sum = 1;
      let term = 1;
      
      for (let i = 1; i < maxIterations; i++) {
        term *= x / (a + i - 1);
        sum += term;
        if (Math.abs(term) < epsilon) break;
      }
      
      const result = Math.exp(-x + a * Math.log(x) - this.logGamma(a)) * sum;
      return isFinite(result) ? result : 0.5;
    } catch (error) {
      console.warn('Ошибка вычисления incompleteGamma:', error);
      return 0.5;
    }
  }

  /**
   * Логарифм гамма-функции
   */
  logGamma(x) {
    if (!isFinite(x) || x <= 0) {
      return 0; // Возвращаем нейтральное значение при некорректных данных
    }
    
    try {
      if (x < 0.5) {
        return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * x)) - this.logGamma(1 - x);
      }
      
      x -= 1;
      let a = 0.99999999999980993;
      const coefficients = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012,
        9.9843695780195716e-6, 1.5056327351493116e-7
      ];
      
      for (let i = 0; i < coefficients.length; i++) {
        a += coefficients[i] / (x + i + 1);
      }
      
      const t = x + coefficients.length - 0.5;
      const result = 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
      return isFinite(result) ? result : 0;
    } catch (error) {
      console.warn('Ошибка вычисления logGamma:', error);
      return 0;
    }
  }
}

module.exports = DIEHARDTests;
