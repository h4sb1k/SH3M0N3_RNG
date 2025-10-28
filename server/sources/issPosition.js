const axios = require('axios');
const crypto = require('crypto');

/**
 * ISS Position Source - Источник энтропии на основе позиции МКС
 * Использует реальные данные о местоположении Международной космической станции
 * МКС движется со скоростью 27,600 км/ч на высоте 400 км над Землей
 */
class ISSPositionSource {
  constructor() {
    this.name = 'ISS Position';
    this.type = 'space_station';
    this.icon = '🛰️';
    this.baseUrl = 'https://api.wheretheiss.at/v1/satellites/25544';
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();
    
    try {
      console.log(`🛰️ Получение позиции МКС...`);
      
      // Получаем текущую позицию МКС
      const response = await axios.get(this.baseUrl, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'RandomTrust/1.0'
        }
      });
      
      const issData = response.data;
      
      // Извлекаем данные для энтропии
      const entropyData = {
        latitude: parseFloat(issData.latitude),
        longitude: parseFloat(issData.longitude),
        altitude: parseFloat(issData.altitude || 400),
        velocity: parseFloat(issData.velocity || 27600),
        timestamp: parseInt(issData.timestamp || Date.now() / 1000),
        visibility: issData.visibility || 'unknown'
      };
      
      console.log(`🛰️ МКС: ${entropyData.latitude.toFixed(6)}°, ${entropyData.longitude.toFixed(6)}°, ${entropyData.altitude.toFixed(2)}км`);
      
      // Создаем энтропию из координат МКС
      const entropyString = [
        entropyData.latitude.toString(),
        entropyData.longitude.toString(),
        entropyData.altitude.toString(),
        entropyData.velocity.toString(),
        entropyData.timestamp.toString(),
        Date.now().toString(),
        Math.random().toString()
      ].join('');
      
      // Хешируем данные для получения равномерного распределения
      let hash = crypto.createHash('sha512').update(entropyString).digest();
      
      // Дополнительные раунды хеширования для улучшения качества
      for (let i = 0; i < 3; i++) {
        hash = crypto.createHash('sha512')
          .update(hash)
          .update(`iss_round_${i}_${Date.now()}`)
          .digest();
      }
      
      // Генерируем числа в заданном диапазоне
      const numbers = [];
      const range = max - min + 1;
      
      for (let i = 0; i < count; i++) {
        const slice = hash.slice((i * 8) % (hash.length - 8), ((i * 8) % (hash.length - 8)) + 8);
        const value = slice.readUInt32BE(0);
        numbers.push((value % range) + min);
      }
      
      const finalHash = crypto.createHash('sha256')
        .update(JSON.stringify(numbers) + hash.toString('hex'))
        .digest('hex');
      
      const latency = Date.now() - startTime;
      
      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers: numbers,
        method: 'ISS_POSITION',
        hash: finalHash,
        timestamp: new Date().toISOString(),
        latency: latency,
        proof: {
          iss_data: entropyData,
          api_response: issData,
          entropy_string_length: entropyString.length,
          hash_rounds: 4
        }
      };
      
    } catch (error) {
      console.error(`❌ Ошибка получения позиции МКС: ${error.message}`);
      
      // Fallback: используем системное время и случайные данные
      const fallbackData = {
        latitude: (Math.random() - 0.5) * 180,
        longitude: (Math.random() - 0.5) * 360,
        altitude: 400 + Math.random() * 50,
        velocity: 27600 + Math.random() * 1000,
        timestamp: Math.floor(Date.now() / 1000),
        visibility: 'unknown'
      };
      
      const entropyString = [
        fallbackData.latitude.toString(),
        fallbackData.longitude.toString(),
        fallbackData.altitude.toString(),
        fallbackData.velocity.toString(),
        fallbackData.timestamp.toString(),
        Date.now().toString(),
        Math.random().toString()
      ].join('');
      
      let hash = crypto.createHash('sha512').update(entropyString).digest();
      
      const numbers = [];
      const range = max - min + 1;
      
      for (let i = 0; i < count; i++) {
        const slice = hash.slice((i * 8) % (hash.length - 8), ((i * 8) % (hash.length - 8)) + 8);
        const value = slice.readUInt32BE(0);
        numbers.push((value % range) + min);
      }
      
      const finalHash = crypto.createHash('sha256')
        .update(JSON.stringify(numbers) + hash.toString('hex'))
        .digest('hex');
      
      const latency = Date.now() - startTime;
      
      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers: numbers,
        method: 'ISS_POSITION_FALLBACK',
        hash: finalHash,
        timestamp: new Date().toISOString(),
        latency: latency,
        proof: {
          iss_data: fallbackData,
          error: error.message,
          fallback: true,
          entropy_string_length: entropyString.length,
          hash_rounds: 1
        }
      };
    }
  }

  async checkAvailability() {
    try {
      const response = await axios.get(this.baseUrl, { 
        timeout: 5000,
        headers: { 'Accept': 'application/json' }
      });
      
      const data = response.data;
      return { 
        available: data && typeof data.latitude === 'number' && typeof data.longitude === 'number', 
        message: 'ISS API доступен'
      };
    } catch (error) {
      return { available: false, message: error.message };
    }
  }
}

module.exports = ISSPositionSource;
