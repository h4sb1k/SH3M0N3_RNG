const axios = require('axios');
const crypto = require('crypto');

/**
 * Random.org - Атмосферные радиошумы
 * Использует атмосферный шум как источник истинной случайности
 * API: https://www.random.org/
 */
class RandomOrgSource {
  constructor() {
    this.name = 'Random.org (Atmospheric)';
    this.type = 'atmospheric_noise';
    this.icon = '🌩️';
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();
    
    try {
      // Random.org официальный API с ключом
      const apiKey = 'aa4f6583-100a-4300-b3f1-d998d81d76c5';
      
      const response = await axios.post('https://api.random.org/json-rpc/2/invoke', {
        jsonrpc: "2.0",
        method: "generateIntegers",
        params: {
          apiKey: apiKey,
          n: Math.min(count, 10000), // Максимум 10000 за запрос
          min: min,
          max: max,
          replacement: true,
          base: 10
        },
        id: 1
      }, {
        timeout: 15000,
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'RandomTrust/1.0'
        }
      });
      
      const result = response.data.result;
      
      if (!result || !result.random || !result.random.data) {
        throw new Error('Random.org API не вернул данные');
      }
      
      const numbers = result.random.data;
      
      if (numbers.length === 0) {
        throw new Error('Random.org не вернул данные');
      }
      
      // Если получили меньше чисел чем нужно, дополняем через хеширование
      let finalNumbers = [...numbers];
      if (finalNumbers.length < count) {
        const crypto = require('crypto');
        const seed = JSON.stringify(numbers) + result.random.completionTime;
        while (finalNumbers.length < count) {
          const hash = crypto.createHash('sha256').update(seed + finalNumbers.length).digest('hex');
          const hashNum = parseInt(hash.substring(0, 8), 16);
          finalNumbers.push((hashNum % (max - min + 1)) + min);
        }
      }
      
      const hash = crypto.createHash('sha256')
        .update(JSON.stringify(finalNumbers) + result.random.completionTime).digest('hex');

      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers: finalNumbers.slice(0, count),
        hash,
        timestamp: new Date().toISOString(),
        latency: Date.now() - startTime,
        proof: {
          api: 'Random.org Official API',
          endpoint: 'https://api.random.org/json-rpc/2/invoke',
          apiKey: apiKey.substring(0, 8) + '...',
          license: 'developer',
          parameters: { n: count, min, max },
          completionTime: result.random.completionTime,
          bitsUsed: result.random.bitsUsed,
          bitsLeft: result.random.bitsLeft,
          requestsLeft: result.random.requestsLeft,
          verifyUrl: 'https://www.random.org/',
          type: 'Atmospheric Noise',
          description: 'Истинная случайность от атмосферных радиошумов (официальный API)',
          fallbackUsed: finalNumbers.length > numbers.length
        }
      };
      
    } catch (error) {
      console.error('  ❌ Random.org error:', error.message);
      
      // FALLBACK: Генерируем через криптографически стойкий PRNG
      console.log('  🔄 Используем fallback: криптографический PRNG');
      
      const crypto = require('crypto');
      const numbers = [];
      const seed = crypto.randomBytes(32).toString('hex') + Date.now();
      
      for (let i = 0; i < count; i++) {
        const hash = crypto.createHash('sha256').update(seed + i).digest('hex');
        const hashNum = parseInt(hash.substring(0, 8), 16);
        numbers.push((hashNum % (max - min + 1)) + min);
      }
      
      const hash = crypto.createHash('sha256')
        .update(JSON.stringify(numbers) + seed).digest('hex');

      return {
        source: this.name + ' (Fallback)',
        type: this.type,
        icon: this.icon,
        numbers,
        timestamp: new Date().toISOString(),
        latency: Date.now() - startTime,
        hash,
        proof: {
          fallback: true,
          method: 'SHA-256 based PRNG',
          seed: seed.substring(0, 16) + '...',
          description: 'Fallback: криптографически стойкий PRNG (Random.org недоступен)',
          originalError: error.message,
          verifyUrl: 'https://www.random.org/'
        }
      };
    }
  }

  async checkAvailability() {
    try {
      const apiKey = 'aa4f6583-100a-4300-b3f1-d998d81d76c5';
      
      const response = await axios.post('https://api.random.org/json-rpc/2/invoke', {
        jsonrpc: "2.0",
        method: "generateIntegers",
        params: {
          apiKey: apiKey,
          n: 1,
          min: 1,
          max: 10,
          replacement: true,
          base: 10
        },
        id: 1
      }, {
        timeout: 5000,
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'RandomTrust/1.0'
        }
      });
      
      const result = response.data.result;
      return { 
        available: result && result.random && result.random.data && result.random.data.length > 0, 
        message: 'Random.org Official API доступен',
        bitsLeft: result?.random?.bitsLeft || 'unknown',
        requestsLeft: result?.random?.requestsLeft || 'unknown'
      };
    } catch (error) {
      return { 
        available: false, 
        message: `Random.org недоступен: ${error.message}` 
      };
    }
  }
}

module.exports = RandomOrgSource;


