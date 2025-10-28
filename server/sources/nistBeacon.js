const axios = require('axios');
const crypto = require('crypto');

/**
 * NIST Randomness Beacon
 * Официальный публичный beacon с цифровой подписью
 */
class NISTBeaconSource {
  constructor() {
    this.baseUrl = 'https://beacon.nist.gov/beacon/2.0';
    this.name = 'NIST Randomness Beacon';
    this.type = 'nist_beacon';
    this.icon = '🏛️';
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();
    
    try {
      const response = await axios.get(`${this.baseUrl}/pulse/last`, {
        timeout: 10000,
        headers: { 'Accept': 'application/json' }
      });
      
      const data = response.data.pulse;
      if (!data) throw new Error('Нет pulse данных');
      
      // Используем outputValue (512 бит финальное значение после хеширования)
      // Fallback на localRandomValue если outputValue недоступен
      let randomHex = data.outputValue || data.localRandomValue;
      
      if (!randomHex) {
        throw new Error('Нет outputValue или localRandomValue');
      }
      
      // Удаляем пробелы и переводы строк если есть
      randomHex = randomHex.replace(/\s/g, '');
      
      const buffer = Buffer.from(randomHex, 'hex');
      const numbers = [];
      const range = max - min + 1;
      
      // Генерируем числа из 512-битного значения
      for (let i = 0; i < count; i++) {
        const offset = (i * 4) % Math.max(1, buffer.length - 4);
        const value = buffer.readUInt32BE(offset);
        numbers.push((value % range) + min);
      }
      
      const hash = crypto.createHash('sha256')
        .update(JSON.stringify(numbers) + data.timeStamp).digest('hex');

      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers,
        timestamp: new Date().toISOString(),
        latency: Date.now() - startTime,
        hash,
        proof: {
          version: data.version || '2.0',
          chainIndex: data.chainIndex,
          pulseIndex: data.pulseIndex,
          timeStamp: data.timeStamp,
          period: data.period || 60000, // 60 секунд между pulse
          outputValue: randomHex.substring(0, 32) + '...',
          localRandomValue: data.localRandomValue ? data.localRandomValue.replace(/\s/g, '').substring(0, 32) + '...' : null,
          signature: data.signatureValue ? data.signatureValue.replace(/\s/g, '').substring(0, 64) + '...' : null,
          certificateId: data.certificateId || null,
          statusCode: data.statusCode || 0,
          verifyUrl: `https://beacon.nist.gov/beacon/2.0/chain/${data.chainIndex}/pulse/${data.pulseIndex}`,
          description: 'NIST Beacon v2.0 - 512-bit randomness every 60 seconds with RSA signature'
        }
      };
    } catch (error) {
      throw new Error(`NIST Beacon недоступен: ${error.message}`);
    }
  }

  async checkAvailability() {
    try {
      await axios.get(`${this.baseUrl}/pulse/last`, { timeout: 5000 });
      return { available: true, message: 'Доступен' };
    } catch (error) {
      return { available: false, message: error.message };
    }
  }
}

module.exports = NISTBeaconSource;
