const express = require('express');
const router = express.Router();
const crypto = require('crypto');

/**
 * POST /api/verify/proof
 * Верификация доказательств результата
 */
router.post('/proof', (req, res) => {
  try {
    const { result, sources } = req.body;

    if (!result) {
      return res.status(400).json({ error: 'Необходим result для проверки' });
    }

    const checks = [];

    // Проверка 1: Наличие хеша
    checks.push({
      name: 'Hash Presence',
      passed: !!result.hash && result.hash.length === 64,
      message: result.hash ? 'Хеш присутствует' : 'Хеш отсутствует'
    });

    // Проверка 2: Временная метка
    if (result.timestamp) {
      const timestamp = new Date(result.timestamp);
      const now = new Date();
      const diffMinutes = Math.abs(now - timestamp) / 1000 / 60;
      
      checks.push({
        name: 'Timestamp Validity',
        passed: diffMinutes < 60,
        message: `Временная метка: ${result.timestamp} (${diffMinutes.toFixed(1)} мин назад)`
      });
    }

    // Проверка 3: Наличие чисел
    if (result.numbers && Array.isArray(result.numbers)) {
      const valid = result.numbers.every(n => typeof n === 'number' && !isNaN(n));
      checks.push({
        name: 'Numbers Validity',
        passed: valid,
        message: valid ? `Все ${result.numbers.length} чисел валидны` : 'Некоторые числа невалидны'
      });
    }

    // Проверка 4: Proof данные источников
    if (sources && Array.isArray(sources)) {
      const allHaveProof = sources.every(s => s.proof !== undefined);
      checks.push({
        name: 'Sources Proof',
        passed: allHaveProof,
        message: allHaveProof ? 'Все источники имеют proof данные' : 'У некоторых источников нет proof'
      });
    }

    // Проверка 5: Формат хеша
    const hashValid = /^[a-f0-9]{64}$/.test(result.hash);
    checks.push({
      name: 'Hash Format',
      passed: hashValid,
      message: hashValid ? 'Формат SHA-256 корректен' : 'Неверный формат хеша'
    });

    const allPassed = checks.every(c => c.passed);

    res.json({
      valid: allPassed,
      checks,
      summary: {
        total: checks.length,
        passed: checks.filter(c => c.passed).length,
        failed: checks.filter(c => !c.passed).length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/verify/hash
 * Проверка хеша данных
 */
router.post('/hash', (req, res) => {
  try {
    const { data, hash } = req.body;

    if (!data || !hash) {
      return res.status(400).json({ error: 'Необходимы data и hash' });
    }

    const calculated = crypto.createHash('sha256')
      .update(JSON.stringify(data)).digest('hex');

    res.json({
      valid: calculated === hash,
      providedHash: hash,
      calculatedHash: calculated,
      match: calculated === hash
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/verify/sources
 * Верификация источников через их публичные API
 */
router.post('/sources', async (req, res) => {
  try {
    const { sources } = req.body;

    if (!sources || !Array.isArray(sources)) {
      return res.status(400).json({ error: 'Необходим массив sources' });
    }

    const verifications = sources.map(source => {
      const checks = [];

      // CU Beacon
      if (source.type === 'quantum_beacon' && source.proof) {
        checks.push({
          type: 'CU Beacon Verification',
          verifyUrl: source.proof.verifyUrl,
          pulseIndex: source.proof.pulseIndex,
          instructions: `Проверьте pulse на ${source.proof.verifyUrl}`
        });
      }

      // NIST Beacon
      if (source.type === 'nist_beacon' && source.proof) {
        checks.push({
          type: 'NIST Beacon Verification',
          verifyUrl: source.proof.verifyUrl,
          pulseIndex: source.proof.pulseIndex,
          signature: source.proof.signature,
          instructions: 'Проверьте цифровую подпись через NIST сертификат'
        });
      }

      // Internet Entropy
      if (source.type === 'internet_entropy' && source.proof) {
        checks.push({
          type: 'Internet Entropy Verification',
          components: source.proof.components,
          weatherInfo: source.proof.weatherInfo,
          cryptoInfo: source.proof.cryptoInfo,
          instructions: 'Проверьте погоду и крипто курсы за указанное время'
        });
      }

      return {
        source: source.source,
        type: source.type,
        verifiable: checks.length > 0,
        verificationSteps: checks
      };
    });

    res.json({
      success: true,
      verifications,
      message: 'Инструкции по верификации источников'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;




