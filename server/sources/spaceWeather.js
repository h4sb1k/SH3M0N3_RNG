const axios = require('axios');
const crypto = require('crypto');

/**
 * Space Weather - Космическая погода
 * Использует данные о солнечной активности, магнитных бурях и космическом излучении
 * Источник: NOAA Space Weather Prediction Center
 */
class SpaceWeatherSource {
  constructor() {
    this.name = 'Space Weather';
    this.type = 'space_weather';
    this.icon = '🌌';
    this.baseUrl = 'https://services.swpc.noaa.gov';
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();
    
    try {
      // Получаем данные о солнечной активности (реальные рабочие endpoints!)
      // Источник: https://services.swpc.noaa.gov/
      const [plasma, mag, xray] = await Promise.allSettled([
        // 1. Плазма солнечного ветра (обновляется каждые ~1 мин)
        axios.get(`${this.baseUrl}/json/rtsw/rtsw_mag_1m.json`, { timeout: 5000 }),
        
        // 2. Магнитное поле (обновляется каждую минуту)
        axios.get(`${this.baseUrl}/json/goes/primary/magnetometers-6-hour.json`, { timeout: 5000 }),
        
        // 3. X-ray поток (обновляется каждую минуту)
        axios.get(`${this.baseUrl}/json/goes/primary/xrays-6-hour.json`, { timeout: 5000 })
      ]);

      // Собираем энтропию из космических данных
      const entropyData = [];
      let successfulCount = 0;
      const sourceStatus = [];
      
      // Данные плазмы (меняются каждую минуту!)
      if (plasma.status === 'fulfilled' && plasma.value.data && Array.isArray(plasma.value.data)) {
        // Берём последние 10 измерений для max энтропии
        const recent = plasma.value.data.slice(-10);
        entropyData.push(JSON.stringify(recent));
        successfulCount++;
        sourceStatus.push(`✅ Solar Plasma (${recent.length} samples)`);
      } else {
        sourceStatus.push('❌ Solar Plasma');
      }
      
      // Данные магнитометра (меняются каждую минуту!)
      if (mag.status === 'fulfilled' && mag.value.data && Array.isArray(mag.value.data)) {
        const recent = mag.value.data.slice(-10);
        entropyData.push(JSON.stringify(recent));
        successfulCount++;
        sourceStatus.push(`✅ Magnetometer (${recent.length} samples)`);
      } else {
        sourceStatus.push('❌ Magnetometer');
      }
      
      // X-ray данные (меняются каждую минуту!)
      if (xray.status === 'fulfilled' && xray.value.data && Array.isArray(xray.value.data)) {
        const recent = xray.value.data.slice(-10);
        entropyData.push(JSON.stringify(recent));
        successfulCount++;
        sourceStatus.push(`✅ X-Ray Flux (${recent.length} samples)`);
      } else {
        sourceStatus.push('❌ X-Ray Flux');
      }

      // Если не удалось получить данные, используем fallback
      if (entropyData.length === 0) {
        console.log('  ⚠️ Space Weather: API недоступен, используем fallback');
        entropyData.push(
          Date.now().toString(),
          process.hrtime.bigint().toString(),
          crypto.randomBytes(32).toString('hex')
        );
      }

      // Добавляем дополнительные источники энтропии
      entropyData.push(
        Date.now().toString(),
        process.hrtime.bigint().toString(),
        process.cpuUsage().user.toString(),
        crypto.randomBytes(16).toString('hex')
      );

      // Комбинируем всё через SHA-512
      const combinedEntropy = entropyData.join('|');
      let hash = crypto.createHash('sha512').update(combinedEntropy).digest();
      
      const numbers = [];
      const range = max - min + 1;
      
      for (let i = 0; i < count; i++) {
        hash = crypto.createHash('sha512')
          .update(hash)
          .update(i.toString())
          .update(process.hrtime.bigint().toString())
          .digest();
        const value = hash.readUInt32BE(0);
        numbers.push((value % range) + min);
      }
      
      const finalHash = crypto.createHash('sha256')
        .update(JSON.stringify(numbers) + combinedEntropy).digest('hex');

      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers,
        timestamp: new Date().toISOString(),
        latency: Date.now() - startTime,
        hash: finalHash,
        proof: {
          dataSources: sourceStatus,
          successfulSources: successfulCount,
          totalSources: 3,
          description: 'Реальные космические данные (обновляется каждую минуту)',
          dataProvider: 'NOAA Space Weather Prediction Center',
          updateFrequency: '~1 минута',
          verifyUrl: 'https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json',
          apiEndpoints: [
            'json/rtsw/rtsw_mag_1m.json',
            'json/goes/primary/magnetometers-6-hour.json',
            'json/goes/primary/xrays-6-hour.json'
          ]
        }
      };
    } catch (error) {
      throw new Error(`Space Weather недоступен: ${error.message}`);
    }
  }

  async checkAvailability() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/products/summary/solar-wind-mag-field.json`,
        { timeout: 5000 }
      );
      return { 
        available: true, 
        message: 'NOAA Space Weather доступен' 
      };
    } catch (error) {
      return { available: false, message: error.message };
    }
  }
}

module.exports = SpaceWeatherSource;

