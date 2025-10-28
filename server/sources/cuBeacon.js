const axios = require('axios');
const crypto = require('crypto');

/**
 * CURBy (Colorado University Random Bytes) - Квантовый генератор
 * University of Colorado Boulder
 * API: https://api.rand.by/v1/
 * Использует квантовую случайность из вакуумных флуктуаций
 */
class CUBeaconSource {
  constructor() {
    this.baseUrl = 'https://api.rand.by/v1';
    this.name = 'CU Randomness Beacon';
    this.type = 'quantum_beacon';
    this.icon = '⚛️';
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();
    
    try {
      // Используем официальное CURBy API для получения случайных целых чисел
      const response = await axios.get(`${this.baseUrl}/integer`, {
        params: {
          count: count,
          min: min,
          max: max,
          round: 0  // Без округления
        },
        timeout: 10000,
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'RandomTrust/1.0'
        }
      });
      
      // API возвращает объект с полем items: { items: [...] }
      const data = response.data;
      const numbers = data.items || data;
      
      // Проверка что получили массив
      if (!Array.isArray(numbers) || numbers.length === 0) {
        throw new Error('API вернул некорректные данные');
      }
      
      // Создаём hash для proof
      const dataString = JSON.stringify({
        numbers,
        timestamp: Date.now(),
        source: 'CURBy'
      });
      const hash = crypto.createHash('sha256').update(dataString).digest('hex');

      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers,
        timestamp: new Date().toISOString(),
        latency: Date.now() - startTime,
        hash,
        proof: {
          api: 'CURBy v1 Integer API',
          endpoint: `${this.baseUrl}/integer`,
          parameters: { count, min, max },
          dataHash: hash.substring(0, 32) + '...',
          verifyUrl: 'https://api.rand.by/v1/integer',
          type: 'Quantum Random (Vacuum Fluctuations)',
          description: 'Квантовая случайность из вакуумных флуктуаций'
        }
      };
    } catch (error) {
      console.error('  ❌ CURBy API error:', error.message);
      throw new Error(`CU Beacon недоступен: ${error.message}`);
    }
  }

  async checkAvailability() {
    try {
      // Проверяем доступность API простым запросом
      const response = await axios.get(`${this.baseUrl}/integer`, { 
        params: { count: 1, min: 1, max: 10 },
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      const data = response.data;
      const numbers = data.items || data;
      return { 
        available: Array.isArray(numbers) && numbers.length > 0, 
        message: 'CURBy API доступен'
      };
    } catch (error) {
      return { available: false, message: error.message };
    }
  }
}

module.exports = CUBeaconSource;
