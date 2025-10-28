const crypto = require('crypto');

/**
 * ПРАКТИЧНЫЕ NIST SP 800-22 тесты
 * Адаптированы для реального использования
 * С разумными требованиями к объёму данных
 */
class PracticalNISTTests {
  
  // ==================== МАТЕМАТИЧЕСКИЕ ФУНКЦИИ ====================
  
  // Complementary Error Function (erfc) - точная реализация
  erfc(x) {
    const z = Math.abs(x);
    const t = 1.0 / (1.0 + 0.5 * z);
    
    const ans = t * Math.exp(-z * z - 1.26551223 +
      t * (1.00002368 +
      t * (0.37409196 +
      t * (0.09678418 +
      t * (-0.18628806 +
      t * (0.27886807 +
      t * (-1.13520398 +
      t * (1.48851587 +
      t * (-0.82215223 +
      t * 0.17087277))))))))));
    
    return x >= 0.0 ? ans : 2.0 - ans;
  }
  
  // Incomplete Gamma Function (для Chi-Square)
  igamc(a, x) {
    if (x < 0 || a <= 0) return 0;
    if (x < 1.0 || x < a) return 1 - this.igam(a, x);
    
    let ans, ax, c, r;
    ax = a * Math.log(x) - x - this.lgam(a);
    if (ax < -709.78271289338399) return 0;
    ax = Math.exp(ax);
    r = a;
    c = 1.0;
    ans = 1.0;
    
    do {
      r += 1.0;
      c *= x / r;
      ans += c;
    } while (c / ans > 1.0e-15);
    
    return ans * ax / a;
  }
  
  igam(a, x) {
    if (x <= 0 || a <= 0) return 0;
    if (x > 1.0 && x > a) return 1.0 - this.igamc(a, x);
    
    let ans, ax, c, r;
    ax = a * Math.log(x) - x - this.lgam(a);
    if (ax < -709.78271289338399) return 0;
    
    ax = Math.exp(ax);
    r = a;
    c = 1.0;
    ans = 1.0;
    
    do {
      r += 1.0;
      c *= x / r;
      ans += c;
    } while (c > 1.0e-15);
    
    return ans * ax / a;
  }
  
  // Log Gamma функция
  lgam(x) {
    const cof = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.1208650973866179e-2, -0.5395239384953e-5
    ];
    
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    
    for (let j = 0; j <= 5; j++) {
      ser += cof[j] / ++y;
    }
    
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }
  
  // ==================== ПРАКТИЧНЫЕ NIST ТЕСТЫ ====================
  
  /**
   * Test 1: Frequency (Monobit) Test
   * Адаптирован для малых объёмов данных
   */
  frequencyMonobitTest(epsilon) {
    const n = epsilon.length;
    
    if (n < 20) {
      return {
        name: 'Frequency (Monobit) Test',
        passed: false,
        pValue: 0,
        description: `Недостаточно битов: ${n} (минимум 20)`
      };
    }
    
    // Конвертируем биты в +1/-1
    const X = epsilon.map(bit => bit === 1 ? 1 : -1);
    
    // Сумма
    const S_n = X.reduce((sum, val) => sum + val, 0);
    
    // Тестовая статистика
    const s_obs = Math.abs(S_n) / Math.sqrt(n);
    
    // P-value
    const p_value = this.erfc(s_obs / Math.sqrt(2));
    
    return {
      name: 'Frequency (Monobit) Test',
      passed: p_value >= 0.01,
      pValue: p_value,
      statistic: s_obs,
      sum: S_n,
      bits: n,
      description: `NIST SP 800-22 Section 2.1 (адаптирован)`
    };
  }
  
  /**
   * Test 2: Block Frequency Test
   * Адаптирован для малых объёмов
   */
  blockFrequencyTest(epsilon, M = 4) {
    const n = epsilon.length;
    
    if (n < 20) {
      return {
        name: 'Block Frequency Test',
        passed: false,
        pValue: 0,
        description: 'Недостаточно битов'
      };
    }
    
    const N = Math.floor(n / M);
    if (N < 3) {
      return {
        name: 'Block Frequency Test',
        passed: false,
        pValue: 0,
        description: `Недостаточно блоков: ${N} (минимум 3)`
      };
    }
    
    // Разбиваем на блоки и считаем пропорции
    let chiSquared = 0;
    
    for (let i = 0; i < N; i++) {
      const block = epsilon.slice(i * M, (i + 1) * M);
      const pi = block.reduce((sum, bit) => sum + bit, 0) / M;
      chiSquared += Math.pow(pi - 0.5, 2);
    }
    
    chiSquared *= 4 * M;
    
    // P-value через incomplete gamma
    const p_value = this.igamc(N / 2.0, chiSquared / 2.0);
    
    return {
      name: 'Block Frequency Test',
      passed: p_value >= 0.01,
      pValue: p_value,
      chiSquared,
      blocks: N,
      blockSize: M,
      description: `NIST SP 800-22 Section 2.2 (M=${M}, адаптирован)`
    };
  }
  
  /**
   * Test 3: Runs Test
   * Адаптирован для малых объёмов
   */
  runsTest(epsilon) {
    const n = epsilon.length;
    
    if (n < 20) {
      return {
        name: 'Runs Test',
        passed: false,
        pValue: 0,
        description: 'Недостаточно битов'
      };
    }
    
    // Пропорция единиц
    const pi = epsilon.reduce((sum, bit) => sum + bit, 0) / n;
    
    // Предусловие - пропорция должна быть близка к 0.5
    const tau = 2 / Math.sqrt(n);
    if (Math.abs(pi - 0.5) >= tau) {
      return {
        name: 'Runs Test',
        passed: false,
        pValue: 0,
        pi: pi.toFixed(4),
        tau: tau.toFixed(4),
        description: `ПРОВАЛ предусловия: π=${(pi*100).toFixed(1)}% должно быть ~50%`
      };
    }
    
    // Считаем runs
    let V_n = 1;
    for (let k = 0; k < n - 1; k++) {
      if (epsilon[k] !== epsilon[k + 1]) {
        V_n++;
      }
    }
    
    // P-value
    const numerator = Math.abs(V_n - 2 * n * pi * (1 - pi));
    const denominator = 2 * Math.sqrt(2 * n) * pi * (1 - pi);
    const p_value = this.erfc(numerator / denominator);
    
    return {
      name: 'Runs Test',
      passed: p_value >= 0.01,
      pValue: p_value,
      runs: V_n,
      pi: pi.toFixed(4),
      description: `NIST SP 800-22 Section 2.3 (адаптирован)`
    };
  }
  
  /**
   * Test 4: Longest Run of Ones Test
   * Адаптирован для малых объёмов
   */
  longestRunOfOnesTest(epsilon) {
    const n = epsilon.length;
    
    if (n < 20) {
      return {
        name: 'Longest Run of Ones Test',
        passed: false,
        pValue: 0,
        description: 'Недостаточно битов (минимум 20)'
      };
    }
    
    // Адаптивные параметры в зависимости от размера
    let M, K, N;
    let pi_values;
    
    if (n < 100) {
      M = 4;
      K = 2;
      pi_values = [0.5, 0.5];  // Упрощённые вероятности
    } else if (n < 1000) {
      M = 8;
      K = 3;
      pi_values = [0.2148, 0.3672, 0.4180];  // Адаптированные вероятности
    } else {
      M = 128;
      K = 5;
      pi_values = [0.1174, 0.2430, 0.2493, 0.1752, 0.2151];
    }
    
    N = Math.floor(n / M);
    const nu = new Array(K + 1).fill(0);
    
    for (let i = 0; i < N; i++) {
      const block = epsilon.slice(i * M, (i + 1) * M);
      let maxRun = 0;
      let currentRun = 0;
      
      for (let bit of block) {
        if (bit === 1) {
          currentRun++;
          maxRun = Math.max(maxRun, currentRun);
        } else {
          currentRun = 0;
        }
      }
      
      // Классифицируем run
      if (M === 4) {
        if (maxRun <= 1) nu[0]++;
        else nu[1]++;
      } else if (M === 8) {
        if (maxRun <= 1) nu[0]++;
        else if (maxRun === 2) nu[1]++;
        else nu[2]++;
      } else {
        if (maxRun <= 4) nu[0]++;
        else if (maxRun === 5) nu[1]++;
        else if (maxRun === 6) nu[2]++;
        else if (maxRun === 7) nu[3]++;
        else nu[4]++;
      }
    }
    
    // Chi-Square статистика
    let chi2 = 0;
    for (let i = 0; i <= K; i++) {
      if (pi_values[i] > 0) {
        chi2 += Math.pow(nu[i] - N * pi_values[i], 2) / (N * pi_values[i]);
      }
    }
    
    const p_value = this.igamc(K / 2.0, chi2 / 2.0);
    
    return {
      name: 'Longest Run of Ones Test',
      passed: p_value >= 0.01,
      pValue: p_value,
      chiSquared: chi2,
      blocks: N,
      blockSize: M,
      description: `NIST SP 800-22 Section 2.4 (M=${M}, K=${K}, адаптирован)`
    };
  }
  
  /**
   * Test 5: Binary Matrix Rank Test
   * Адаптирован для малых объёмов
   */
  binaryMatrixRankTest(epsilon) {
    const n = epsilon.length;
    
    if (n < 32) {
      return {
        name: 'Binary Matrix Rank Test',
        passed: false,
        pValue: 0,
        description: `Недостаточно битов: ${n} (минимум 32)`
      };
    }
    
    // Адаптивные параметры
    const M = Math.min(8, Math.floor(Math.sqrt(n / 4)));
    const Q = M;
    
    const N = Math.floor(n / (M * Q));
    
    if (N < 2) {
      return {
        name: 'Binary Matrix Rank Test',
        passed: false,
        pValue: 0,
        description: `Недостаточно матриц: ${N} (минимум 2)`
      };
    }
    
    let F_M = 0, F_M_1 = 0;
    
    for (let i = 0; i < N; i++) {
      // Создаём матрицу MxQ из битов
      const matrix = [];
      for (let row = 0; row < M; row++) {
        matrix[row] = [];
        for (let col = 0; col < Q; col++) {
          const idx = i * M * Q + row * Q + col;
          matrix[row][col] = epsilon[idx] || 0;
        }
      }
      
      // Вычисляем ранг матрицы
      const rank = this.computeRank(matrix, M, Q);
      
      if (rank === M) F_M++;
      else if (rank === M - 1) F_M_1++;
    }
    
    // Chi-Square статистика (адаптированная)
    const expected_F_M = 0.2888 * N;
    const expected_F_M_1 = 0.5776 * N;
    const expected_other = 0.1336 * N;
    
    const chi2 = Math.pow(F_M - expected_F_M, 2) / expected_F_M +
                 Math.pow(F_M_1 - expected_F_M_1, 2) / expected_F_M_1 +
                 Math.pow((N - F_M - F_M_1) - expected_other, 2) / expected_other;
    
    const p_value = Math.exp(-chi2 / 2.0);
    
    return {
      name: 'Binary Matrix Rank Test',
      passed: p_value >= 0.01,
      pValue: p_value,
      chiSquared: chi2,
      matrices: N,
      fullRank: F_M,
      description: `NIST SP 800-22 Section 2.5 (${M}x${Q} matrices, адаптирован)`
    };
  }
  
  // Вычисление ранга бинарной матрицы (Гауссово исключение)
  computeRank(matrix, M, Q) {
    const m = M;
    const n = Q;
    let rank = 0;
    
    // Копируем матрицу
    const A = matrix.map(row => [...row]);
    
    for (let i = 0; i < Math.min(m, n); i++) {
      // Находим pivot
      let pivot = i;
      for (let j = i + 1; j < m; j++) {
        if (A[j][i] === 1) {
          pivot = j;
          break;
        }
      }
      
      if (A[pivot][i] === 0) continue;
      
      // Swap rows
      if (pivot !== i) {
        [A[i], A[pivot]] = [A[pivot], A[i]];
      }
      
      rank++;
      
      // Eliminate
      for (let j = i + 1; j < m; j++) {
        if (A[j][i] === 1) {
          for (let k = i; k < n; k++) {
            A[j][k] ^= A[i][k];  // XOR для GF(2)
          }
        }
      }
    }
    
    return rank;
  }
  
  /**
   * Test 6: Spectral (DFT) Test
   * Адаптирован для малых объёмов
   */
  spectralTest(epsilon) {
    const n = epsilon.length;
    
    if (n < 100) {
      return {
        name: 'Spectral (DFT) Test',
        passed: false,
        pValue: 0,
        description: 'Недостаточно битов (минимум 100)'
      };
    }
    
    // Конвертируем в ±1
    const X = epsilon.map(bit => bit === 1 ? 1 : -1);
    
    // Вычисляем DFT (упрощённая версия через суммы)
    const S = [];
    const n_half = Math.floor(n / 2);
    
    for (let k = 0; k < n_half; k++) {
      let real = 0, imag = 0;
      for (let j = 0; j < n; j++) {
        const angle = 2 * Math.PI * k * j / n;
        real += X[j] * Math.cos(angle);
        imag += X[j] * Math.sin(angle);
      }
      S[k] = Math.sqrt(real * real + imag * imag);
    }
    
    // Threshold (адаптированный)
    const T = Math.sqrt(Math.log(1 / 0.05) * n);
    
    // Подсчитываем сколько пиков превышают threshold
    let N_0 = 0;
    for (let k = 0; k < n_half; k++) {
      if (S[k] < T) N_0++;
    }
    
    // Ожидаемое значение
    const N_1 = 0.95 * n_half;
    
    // Тестовая статистика
    const d = (N_0 - N_1) / Math.sqrt(n * 0.95 * 0.05 / 4);
    
    const p_value = this.erfc(Math.abs(d) / Math.sqrt(2));
    
    return {
      name: 'Spectral (DFT) Test',
      passed: p_value >= 0.01,
      pValue: p_value,
      peaks: N_0,
      expected: N_1,
      description: `NIST SP 800-22 Section 2.6 (адаптирован)`
    };
  }
  
  /**
   * Запуск всех ПРАКТИЧНЫХ NIST тестов
   */
  runAllNISTTests(numbers) {
    // Конвертируем числа в биты (правильно!)
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min + 1;
    
    let epsilon;
    if (range <= 2) {
      epsilon = numbers.map(n => n - min);
    } else if (range <= 256) {
      const bitsNeeded = Math.ceil(Math.log2(range));
      epsilon = numbers.flatMap(num => 
        num.toString(2).padStart(bitsNeeded, '0').split('').map(b => parseInt(b))
      );
    } else {
      epsilon = numbers.flatMap(num => 
        Math.abs(num).toString(2).padStart(32, '0').split('').map(b => parseInt(b))
      );
    }
    
    // Запускаем ПРАКТИЧНЫЕ NIST тесты
    const tests = {
      monobit: this.frequencyMonobitTest(epsilon),
      blockFrequency: this.blockFrequencyTest(epsilon, Math.min(8, Math.floor(epsilon.length / 4))),
      runs: this.runsTest(epsilon),
      longestRun: this.longestRunOfOnesTest(epsilon),
      matrixRank: this.binaryMatrixRankTest(epsilon),
      spectral: this.spectralTest(epsilon)
    };
    
    // Подсчёт результатов
    const passedCount = Object.values(tests).filter(t => t.passed).length;
    const totalCount = Object.keys(tests).length;
    
    return {
      timestamp: new Date().toISOString(),
      sampleSize: numbers.length,
      bits: epsilon.length,
      tests,
      passedTests: passedCount,
      totalTests: totalCount,
      overallScore: (passedCount / totalCount) * 100,
      passed: passedCount >= Math.ceil(totalCount * 0.67),  // Практично: ≥67% тестов
      standard: 'NIST SP 800-22 Rev. 1a (Practical)',
      significance: 0.01  // α = 0.01
    };
  }
}

module.exports = PracticalNISTTests;



