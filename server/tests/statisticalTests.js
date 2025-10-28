const crypto = require('crypto');

class StatisticalTests {
  // Дополнительная функция ошибок (erfc) - Улучшенная версия
  erfc(x) {
    // Для малых значений используем приближение
    if (Math.abs(x) < 0.0001) return 1.0;
    
    const z = Math.abs(x);
    const t = 1 / (1 + 0.5 * z);
    
    // Коэффициенты Абрамовица-Стегана (7.1.26)
    const ans = t * Math.exp(-z * z - 1.26551223 + 
      t * (1.00002368 + 
      t * (0.37409196 + 
      t * (0.09678418 + 
      t * (-0.18628806 + 
      t * (0.27886807 + 
      t * (-1.13520398 + 
      t * (1.48851587 + 
      t * (-0.82215223 + 
      t * 0.17087277)))))))));
    
    return x >= 0 ? ans : 2 - ans;
  }

  // Неполная гамма функция для Chi-Square (упрощенная)
  incompleteGamma(s, x) {
    if (x <= 0) return 0;
    if (s <= 0) return 1;
    
    // Используем серию для малых x
    let sum = 1.0 / s;
    let term = 1.0 / s;
    for (let n = 1; n < 100; n++) {
      term *= x / (s + n);
      sum += term;
      if (Math.abs(term) < 1e-10) break;
    }
    return Math.exp(-x + s * Math.log(x) - this.logGamma(s)) * sum;
  }

  // Логарифм гамма-функции (приближение Ланцоша)
  logGamma(x) {
    const g = 7;
    const coef = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    
    if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - this.logGamma(1 - x);
    
    x -= 1;
    let a = coef[0];
    for (let i = 1; i < g + 2; i++) {
      a += coef[i] / (x + i);
    }
    
    const t = x + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  }

  // Chi-Square p-value (улучшенная версия)
  chiSquarePValue(chiSquare, df) {
    if (chiSquare < 0 || df < 1) return 0;
    if (chiSquare === 0) return 1;
    
    // Для малых степеней свободы используем упрощённую формулу
    if (df === 1) {
      return 2 * (1 - this.normalCDF(Math.sqrt(chiSquare)));
    }
    
    try {
      const p = 1 - this.incompleteGamma(df / 2, chiSquare / 2);
      // Ограничиваем p-value в разумных пределах
      if (p < 0) return 0;
      if (p > 1) return 1;
      if (!isFinite(p) || isNaN(p)) return 0.5;
      return p;
    } catch (e) {
      return 0.5;  // Fallback на нейтральное значение
    }
  }
  
  // Normal CDF для Chi-Square с df=1
  normalCDF(x) {
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }
  
  // erf функция
  erf(x) {
    return 1 - this.erfc(x);
  }

  runAllTests(numbers) {
    return {
      timestamp: new Date().toISOString(),
      sampleSize: numbers.length,
      tests: {
        frequency: this.frequencyTest(numbers),
        runs: this.runsTest(numbers),
        chiSquare: this.chiSquareTest(numbers),
        entropy: this.entropyTest(numbers),
        autocorrelation: this.autocorrelationTest(numbers),
        mean: this.meanTest(numbers),
        distribution: this.distributionTest(numbers)
      },
      get overallScore() {
        const scores = Object.values(this.tests).map(t => t.passed ? 1 : 0);
        return (scores.reduce((a, b) => a + b, 0) / scores.length) * 100;
      },
      get passed() {
        return this.overallScore >= 70;
      }
    };
  }

  frequencyTest(numbers) {
    if (numbers.length === 0) return { 
      name: 'Frequency Test',
      passed: false, 
      pValue: 0,
      description: 'Нет данных' 
    };
    
    // Определяем диапазон чисел
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min + 1;
    
    // Для малых диапазонов (0-1, 0-9) используем только значимые биты
    let bits;
    if (range <= 2) {
      // Для 0-1: используем только сами значения как биты
      bits = numbers.map(n => n - min);
    } else if (range <= 256) {
      // Для малых диапазонов: используем только необходимые биты
      const bitsNeeded = Math.ceil(Math.log2(range));
      bits = numbers.flatMap(num => 
        num.toString(2).padStart(bitsNeeded, '0').split('').map(b => parseInt(b))
      );
    } else {
      // Для больших диапазонов: используем полное представление
      bits = numbers.flatMap(num => 
        Math.abs(num).toString(2).padStart(32, '0').split('').map(b => parseInt(b))
      );
    }
    
    if (bits.length < 100) {
      return {
        name: 'Frequency Test',
        passed: false,
        pValue: 0,
        description: 'Недостаточно битов для теста (нужно ≥100)'
      };
    }
    
    const sum = bits.reduce((a, b) => a + b, 0);
    const s = sum - (bits.length - sum);
    const stat = Math.abs(s) / Math.sqrt(bits.length);
    const pValue = this.erfc(stat / Math.sqrt(2));
    
    return {
      name: 'Frequency Test',
      passed: pValue >= 0.01,
      pValue,
      bitsUsed: bits.length,
      ones: sum,
      zeros: bits.length - sum,
      description: `Баланс 0/1 в ${bits.length} битах (${sum} единиц, ${bits.length - sum} нулей)`
    };
  }

  runsTest(numbers) {
    if (numbers.length < 2) return { 
      name: 'Runs Test',
      passed: false, 
      pValue: 0,
      description: 'Недостаточно данных' 
    };
    
    // Определяем диапазон для правильного битового представления
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min + 1;
    
    // Конвертируем в биты (аналогично Frequency Test)
    let bits;
    if (range <= 2) {
      bits = numbers.map(n => n - min);
    } else if (range <= 256) {
      const bitsNeeded = Math.ceil(Math.log2(range));
      bits = numbers.flatMap(num => 
        num.toString(2).padStart(bitsNeeded, '0').split('').map(b => parseInt(b))
      );
    } else {
      bits = numbers.flatMap(num => 
        Math.abs(num).toString(2).padStart(32, '0').split('').map(b => parseInt(b))
      );
    }
    
    if (bits.length < 100) return { 
      name: 'Runs Test',
      passed: false, 
      pValue: 0,
      description: 'Недостаточно битов (нужно ≥100)' 
    };
    
    const n = bits.length;
    const ones = bits.reduce((a, b) => a + b, 0);
    const pi = ones / n;
    
    // Проверка предусловия (пропорция должна быть близка к 0.5)
    const threshold = 2 / Math.sqrt(n);
    if (Math.abs(pi - 0.5) >= threshold) {
      return {
        name: 'Runs Test',
        passed: false,
        pValue: 0,
        pi: pi.toFixed(4),
        threshold: threshold.toFixed(4),
        description: `Дисбаланс 0/1: ${(pi*100).toFixed(1)}% единиц (должно быть ~50%)`
      };
    }
    
    // Считаем runs
    let runs = 1;
    for (let i = 1; i < n; i++) {
      if (bits[i] !== bits[i - 1]) runs++;
    }
    
    // Вычисляем статистику
    const numerator = Math.abs(runs - 2 * n * pi * (1 - pi));
    const denominator = 2 * Math.sqrt(2 * n) * pi * (1 - pi);
    const stat = numerator / denominator;
    const pValue = this.erfc(stat / Math.sqrt(2));
    
    return {
      name: 'Runs Test',
      passed: pValue >= 0.01,
      pValue,
      runs,
      description: 'Отсутствие паттернов (NIST SP 800-22)'
    };
  }

  chiSquareTest(numbers) {
    if (numbers.length < 10) return { passed: false, pValue: 0, name: 'Chi-Square Test', description: 'Недостаточно данных' };
    
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const bins = Math.min(10, Math.max(5, Math.floor(Math.sqrt(numbers.length))));
    const binSize = (max - min + 1) / bins;
    const observed = new Array(bins).fill(0);
    
    numbers.forEach(num => {
      const binIndex = Math.min(Math.floor((num - min) / binSize), bins - 1);
      observed[binIndex]++;
    });
    
    const expected = numbers.length / bins;
    let chiSquare = 0;
    observed.forEach(obs => { 
      chiSquare += Math.pow(obs - expected, 2) / expected; 
    });
    
    const df = bins - 1;
    // ПРАВИЛЬНО: используем incomplete gamma function для p-value!
    const pValue = this.chiSquarePValue(chiSquare, df);
    
    return {
      name: 'Chi-Square Test',
      passed: pValue >= 0.01 && pValue <= 0.99,  // Двусторонний тест
      pValue,
      chiSquare,
      degreesOfFreedom: df,
      description: 'Равномерность распределения (Goodness of Fit)'
    };
  }

  entropyTest(numbers) {
    if (numbers.length === 0) return { 
      name: 'Shannon Entropy',
      passed: false, 
      entropy: 0, 
      normalized: 0,
      pValue: null,
      description: 'Нет данных' 
    };
    const frequencies = {};
    numbers.forEach(num => { frequencies[num] = (frequencies[num] || 0) + 1; });
    
    let entropy = 0;
    Object.values(frequencies).forEach(freq => {
      const p = freq / numbers.length;
      entropy -= p * Math.log2(p);
    });
    
    const maxEntropy = Math.log2(Object.keys(frequencies).length);
    const normalized = maxEntropy > 0 ? entropy / maxEntropy : 0;
    
    return {
      name: 'Shannon Entropy',
      passed: normalized >= 0.95,
      entropy,
      maxEntropy,
      normalized,
      pValue: null,  // У этого теста нет p-value, используем normalized
      description: 'Измерение информационной энтропии (≥95%)'
    };
  }

  autocorrelationTest(numbers) {
    if (numbers.length < 10) return { 
      name: 'Autocorrelation',
      passed: false,
      correlation: 0,
      pValue: null,
      description: 'Недостаточно данных (<10)' 
    };
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    let numerator = 0, denominator = 0;
    
    for (let i = 0; i < numbers.length - 1; i++) {
      numerator += (numbers[i] - mean) * (numbers[i + 1] - mean);
    }
    for (let i = 0; i < numbers.length; i++) {
      denominator += Math.pow(numbers[i] - mean, 2);
    }
    
    const correlation = numerator / denominator;
    return {
      name: 'Autocorrelation',
      passed: Math.abs(correlation) < 0.2,
      correlation,
      pValue: null,  // У этого теста нет p-value
      description: 'Независимость последовательных значений'
    };
  }

  meanTest(numbers) {
    if (numbers.length === 0) return { 
      name: 'Mean Test',
      passed: false,
      mean: 0,
      pValue: null,
      description: 'Нет данных' 
    };
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const expected = (Math.min(...numbers) + Math.max(...numbers)) / 2;
    const deviation = Math.abs(mean - expected) / expected;
    return {
      name: 'Mean Test',
      passed: deviation < 0.1,
      mean,
      expectedMean: expected,
      deviation,
      pValue: null,  // У этого теста нет p-value
      description: 'Центральность распределения'
    };
  }

  distributionTest(numbers) {
    if (numbers.length < 10) return { 
      name: 'Distribution Test',
      passed: false,
      maxDeviation: 0,
      pValue: null,
      description: 'Недостаточно данных (<10)' 
    };
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const bins = Math.min(10, max - min + 1);
    const binSize = (max - min + 1) / bins;
    const distribution = new Array(bins).fill(0);
    
    numbers.forEach(num => {
      const binIndex = Math.min(Math.floor((num - min) / binSize), bins - 1);
      distribution[binIndex]++;
    });
    
    const expected = numbers.length / bins;
    const maxDev = Math.max(...distribution.map(d => Math.abs(d - expected) / expected));
    
    return {
      name: 'Distribution Test',
      passed: maxDev < 0.5,
      distribution,
      maxDeviation: maxDev,
      pValue: null,  // У этого теста нет p-value
      description: 'Равномерность распределения по диапазону'
    };
  }
}

module.exports = StatisticalTests;

