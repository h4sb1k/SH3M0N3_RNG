const crypto = require('crypto');

/**
 * Оптимизированная система разделения чисел для тестов NIST и DIEHARD
 * Создает оптимальные размеры данных для каждого типа тестов
 */
class TestOptimizedDataSplitter {
  constructor() {
    // Требования NIST SP 800-22 тестов (в битах)
    this.nistRequirements = {
      frequency: 100,           // Test 1: Frequency (Monobit)
      blockFrequency: 100,      // Test 2: Block Frequency  
      cumulativeSums: 100,      // Test 3: Cumulative Sums
      runs: 100,                // Test 4: Runs
      longestRun: 128,          // Test 5: Longest Run
      binaryMatrix: 100000,     // Test 6: Binary Matrix Rank
      discreteFourier: 1000,   // Test 7: Discrete Fourier Transform
      nonOverlapping: 1000000, // Test 8: Non-overlapping Template
      overlapping: 1000000,   // Test 9: Overlapping Template
      universal: 1000000,      // Test 10: Universal Statistical
      approximateEntropy: 1000000, // Test 11: Approximate Entropy
      randomExcursions: 1000000,    // Test 12: Random Excursions
      randomExcursionsVariant: 1000000, // Test 13: Random Excursions Variant
      serial: 1000000,         // Test 14: Serial
      linearComplexity: 1000000 // Test 15: Linear Complexity
    };

    // Требования DIEHARD тестов (в битах)
    this.diehardRequirements = {
      birthdaySpacings: 10000,      // Минимум для корректной работы
      overlappingPermutations: 10000, // Минимум для корректной работы
      ranksOfMatrices: 20000,       // Минимум для корректной работы
      monkeyTests: 100000,          // Минимум для корректной работы
      countTheOnes: 100000,         // Минимум для корректной работы
      parkingLot: 50000,            // Минимум для корректной работы
      minimumDistance: 100000,      // Минимум для корректной работы
      randomSpheres: 100000,        // Минимум для корректной работы
      squeeze: 100000,              // Минимум для корректной работы
      overlappingSums: 100000,     // Минимум для корректной работы
      runs: 100000,                // Минимум для корректной работы
      craps: 200000                // Минимум для корректной работы
    };

    // Оптимальные размеры для разных сценариев
    this.optimalSizes = {
      // Быстрое тестирование (базовые тесты)
      quick: {
        nist: 1000,      // 1000 бит для базовых NIST тестов
        diehard: 10000,  // 10000 бит для базовых DIEHARD тестов
        total: 11000     // Общий размер
      },
      
      // Стандартное тестирование (рекомендуемое)
      standard: {
        nist: 100000,    // 100000 бит для большинства NIST тестов
        diehard: 100000, // 100000 бит для большинства DIEHARD тестов
        total: 200000    // Общий размер
      },
      
      // Полное тестирование (все тесты)
      full: {
        nist: 1000000,   // 1000000 бит для всех NIST тестов
        diehard: 200000, // 200000 бит для всех DIEHARD тестов
        total: 1200000   // Общий размер
      },
      
      // Профессиональное тестирование (максимальное качество)
      professional: {
        nist: 10000000,  // 10MB для профессионального анализа
        diehard: 1000000, // 1MB для профессионального анализа
        total: 11000000  // Общий размер
      }
    };
  }

  /**
   * Определяет оптимальный размер данных для заданного сценария
   */
  getOptimalSize(scenario = 'standard') {
    return this.optimalSizes[scenario] || this.optimalSizes.standard;
  }

  /**
   * Разделяет числа на оптимальные части для NIST и DIEHARD тестов
   */
  splitNumbersForTests(numbers, scenario = 'standard') {
    const optimalSize = this.getOptimalSize(scenario);
    
    // Преобразуем числа в биты
    const allBits = this.numbersToBits(numbers);
    
    console.log(`📊 Исходные данные: ${numbers.length} чисел → ${allBits.length} битов`);
    
    // Разделяем на части для разных тестов
    const split = {
      nist: {
        bits: allBits.slice(0, optimalSize.nist),
        count: optimalSize.nist,
        description: `NIST тесты (${optimalSize.nist} бит)`,
        tests: this.getAvailableNISTTests(optimalSize.nist)
      },
      diehard: {
        bits: allBits.slice(optimalSize.nist, optimalSize.nist + optimalSize.diehard),
        count: optimalSize.diehard,
        description: `DIEHARD тесты (${optimalSize.diehard} бит)`,
        tests: this.getAvailableDIEHARDTests(optimalSize.diehard)
      },
      total: {
        bits: allBits.slice(0, optimalSize.total),
        count: optimalSize.total,
        description: `Общий размер (${optimalSize.total} бит)`
      },
      scenario: scenario,
      efficiency: this.calculateEfficiency(numbers.length, optimalSize.total)
    };

    // Если недостаточно данных, расширяем через хеширование
    if (allBits.length < optimalSize.total) {
      console.log(`⚠️ Недостаточно данных: ${allBits.length}/${optimalSize.total} бит`);
      split.nist.bits = this.expandBits(split.nist.bits, optimalSize.nist, numbers);
      split.diehard.bits = this.expandBits(split.diehard.bits, optimalSize.diehard, numbers);
      split.total.bits = [...split.nist.bits, ...split.diehard.bits];
    }

    return split;
  }

  /**
   * Преобразует числа в биты с оптимизацией
   */
  numbersToBits(numbers) {
    const bits = [];
    
    for (const num of numbers) {
      if (!isFinite(num) || num < 0) {
        console.warn(`Некорректное число: ${num}`);
        continue;
      }
      
      // Оптимизированное преобразование в зависимости от диапазона
      const binary = Math.floor(num).toString(2);
      bits.push(...binary.split('').map(bit => parseInt(bit)));
    }
    
    return bits;
  }

  /**
   * Расширяет биты до нужного размера через хеширование
   */
  expandBits(bits, targetSize, originalNumbers) {
    if (bits.length >= targetSize) {
      return bits.slice(0, targetSize);
    }

    const expandedBits = [...bits];
    let seed = originalNumbers.slice(0, 10).join('') + bits.length;
    let hashCount = 0;

    while (expandedBits.length < targetSize) {
      const hashInput = seed + expandedBits.length + Date.now() + Math.random();
      const hash = crypto.createHash('sha512').update(hashInput).digest();
      
      const newBits = Array.from(hash).map(byte => 
        byte.toString(2).padStart(8, '0')
      ).join('').split('').map(bit => parseInt(bit));
      
      expandedBits.push(...newBits);
      seed = crypto.createHash('sha256').update(seed + hash.toString('hex')).digest('hex');
      hashCount++;
      
      // Защита от бесконечного цикла
      if (hashCount > 10000) break;
    }

    console.log(`🔄 Расширено до ${targetSize} бит (${hashCount} хешей)`);
    return expandedBits.slice(0, targetSize);
  }

  /**
   * Определяет доступные NIST тесты для заданного размера данных
   */
  getAvailableNISTTests(bitCount) {
    const available = [];
    const unavailable = [];

    Object.entries(this.nistRequirements).forEach(([test, required]) => {
      if (bitCount >= required) {
        available.push({ name: test, required, status: 'available' });
      } else {
        unavailable.push({ name: test, required, status: 'unavailable', reason: `Требуется минимум ${required} бит` });
      }
    });

    return { available, unavailable };
  }

  /**
   * Определяет доступные DIEHARD тесты для заданного размера данных
   */
  getAvailableDIEHARDTests(bitCount) {
    const available = [];
    const unavailable = [];

    Object.entries(this.diehardRequirements).forEach(([test, required]) => {
      if (bitCount >= required) {
        available.push({ name: test, required, status: 'available' });
      } else {
        unavailable.push({ name: test, required, status: 'unavailable', reason: `Требуется минимум ${required} бит` });
      }
    });

    return { available, unavailable };
  }

  /**
   * Вычисляет эффективность использования данных
   */
  calculateEfficiency(inputNumbers, outputBits) {
    const inputBits = inputNumbers * 8; // Предполагаем 8 бит на число
    const efficiency = (inputBits / outputBits) * 100;
    
    return {
      inputBits,
      outputBits,
      efficiency: efficiency.toFixed(1) + '%',
      quality: efficiency >= 50 ? 'high' : efficiency >= 20 ? 'medium' : 'low'
    };
  }

  /**
   * Создает отчет о разделении данных
   */
  createSplitReport(split) {
    return {
      summary: {
        scenario: split.scenario,
        totalBits: split.total.count,
        nistBits: split.nist.count,
        diehardBits: split.diehard.count,
        efficiency: split.efficiency
      },
      nist: {
        bits: split.nist.count,
        availableTests: split.nist.tests.available.length,
        unavailableTests: split.nist.tests.unavailable.length,
        tests: split.nist.tests
      },
      diehard: {
        bits: split.diehard.count,
        availableTests: split.diehard.tests.available.length,
        unavailableTests: split.diehard.tests.unavailable.length,
        tests: split.diehard.tests
      },
      recommendations: this.getRecommendations(split)
    };
  }

  /**
   * Получает рекомендации по улучшению
   */
  getRecommendations(split) {
    const recommendations = [];

    if (split.efficiency.quality === 'low') {
      recommendations.push({
        type: 'warning',
        message: 'Низкая эффективность использования данных. Рекомендуется увеличить количество исходных чисел.'
      });
    }

    if (split.nist.tests.unavailable.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Для полного NIST тестирования требуется минимум ${Math.max(...Object.values(this.nistRequirements))} бит`
      });
    }

    if (split.diehard.tests.unavailable.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Для полного DIEHARD тестирования требуется минимум ${Math.max(...Object.values(this.diehardRequirements))} бит`
      });
    }

    return recommendations;
  }
}

module.exports = TestOptimizedDataSplitter;

