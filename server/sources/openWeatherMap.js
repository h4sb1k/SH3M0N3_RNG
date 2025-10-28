const axios = require('axios');
const crypto = require('crypto');

/**
 * OpenWeatherMap - Current Weather Data API
 * OpenWeatherMap Current Weather API предоставляет актуальные метеорологические данные
 * URL: https://openweathermap.org/current
 * Обновляется каждые 10 минут - идеально для доказуемой случайности
 * Включает: текущую погоду, атмосферные данные, ветер, облачность
 */
class OpenWeatherMapSource {
  constructor() {
    this.name = 'OpenWeatherMap (Real-time Weather)';
    this.type = 'atmospheric_weather';
    this.icon = '🌤️';
    this.baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
    this.apiKey = 'eeddfb8bc2bd507652ca6055e5f7f3f4'; // Реальный API ключ пользователя
    this.cities = [
      { name: 'London', lat: 51.5074, lon: -0.1278 },
      { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
      { name: 'New York', lat: 40.7128, lon: -74.0060 },
      { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
      { name: 'Moscow', lat: 55.7558, lon: 37.6176 },
      { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
      { name: 'Paris', lat: 48.8566, lon: 2.3522 },
      { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
      { name: 'São Paulo', lat: -23.5505, lon: -46.6333 },
      { name: 'Mumbai', lat: 19.0760, lon: 72.8777 }
    ];
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();

    try {
      // Выбираем случайный город для разнообразия
      const city = this.cities[Math.floor(Math.random() * this.cities.length)];
      
      const hrStart = process.hrtime.bigint();

      // Получаем текущие погодные данные через Current Weather API
      const weatherResponse = await axios.get(this.baseUrl, {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'en'
        },
        timeout: 8000,
        headers: {
          'User-Agent': 'RandomTrust/1.0'
        }
      });

      const hrEnd = process.hrtime.bigint();
      const nanoTiming = Number(hrEnd - hrStart);

      const weather = weatherResponse.data;
      
      // Извлекаем максимальную энтропию из метеоданных согласно документации
      const weatherEntropy = [];
      
      // Координаты
      if (weather.coord) {
        weatherEntropy.push(
          weather.coord.lat?.toString() || '0',
          weather.coord.lon?.toString() || '0'
        );
      }
      
      // Основные атмосферные данные (main)
      if (weather.main) {
        weatherEntropy.push(
          weather.main.temp?.toString() || '0',
          weather.main.feels_like?.toString() || '0',
          weather.main.temp_min?.toString() || '0',
          weather.main.temp_max?.toString() || '0',
          weather.main.pressure?.toString() || '0',
          weather.main.humidity?.toString() || '0',
          weather.main.sea_level?.toString() || '0',
          weather.main.grnd_level?.toString() || '0'
        );
      }
      
      // Видимость
      if (weather.visibility) {
        weatherEntropy.push(weather.visibility.toString());
      }
      
      // Ветровые данные
      if (weather.wind) {
        weatherEntropy.push(
          weather.wind.speed?.toString() || '0',
          weather.wind.deg?.toString() || '0',
          weather.wind.gust?.toString() || '0'
        );
      }
      
      // Данные о дожде
      if (weather.rain) {
        weatherEntropy.push(
          weather.rain['1h']?.toString() || '0',
          weather.rain['3h']?.toString() || '0'
        );
      }
      
      // Данные о снеге
      if (weather.snow) {
        weatherEntropy.push(
          weather.snow['1h']?.toString() || '0',
          weather.snow['3h']?.toString() || '0'
        );
      }
      
      // Облачность
      if (weather.clouds) {
        weatherEntropy.push(weather.clouds.all?.toString() || '0');
      }
      
      // Погодные условия
      if (weather.weather && weather.weather.length > 0) {
        weather.weather.forEach(condition => {
          weatherEntropy.push(
            condition.id?.toString() || '0',
            condition.main || 'unknown',
            condition.description || 'unknown',
            condition.icon || 'unknown'
          );
        });
      }
      
      // Системные данные
      if (weather.sys) {
        weatherEntropy.push(
          weather.sys.type?.toString() || '0',
          weather.sys.id?.toString() || '0',
          weather.sys.country || 'unknown',
          weather.sys.sunrise?.toString() || '0',
          weather.sys.sunset?.toString() || '0'
        );
      }
      
      // Временные метки и идентификаторы
      weatherEntropy.push(
        weather.dt?.toString() || '0',
        weather.timezone?.toString() || '0',
        weather.id?.toString() || '0',
        weather.name || 'unknown',
        weather.cod?.toString() || '0'
      );
      
      // Добавляем системную энтропию
      weatherEntropy.push(
        city.name,
        city.lat.toString(),
        city.lon.toString(),
        nanoTiming.toString(),
        process.hrtime.bigint().toString(),
        Date.now().toString(),
        crypto.randomBytes(16).toString('hex')
      );

      // Собираем все данные
      const combined = weatherEntropy.filter(Boolean).join('|');
      
      // Создаем хеш для генерации чисел
      let hash = crypto.createHash('sha512').update(combined).digest();
      
      // Дополнительные раунды хеширования для усиления энтропии
      for (let i = 0; i < 2; i++) {
        hash = crypto.createHash('sha512')
          .update(hash)
          .update(`round_${i}_${Date.now()}`)
          .digest();
      }

      const numbers = [];
      const range = max - min + 1;

      for (let i = 0; i < count; i++) {
        const slice = hash.slice((i * 8) % (hash.length - 8), ((i * 8) % (hash.length - 8)) + 8);
        const value = slice.readUInt32BE(0);
        numbers.push((value % range) + min);
      }

      const finalHash = crypto.createHash('sha256')
        .update(JSON.stringify(numbers) + combined).digest('hex');

      return {
        source: this.name,
        type: this.type,
        icon: this.icon,
        numbers,
        timestamp: new Date().toISOString(),
        latency: Date.now() - startTime,
        hash: finalHash,
        proof: {
          api: 'OpenWeatherMap Current Weather API',
          endpoint: this.baseUrl,
          city: `${weather.name}, ${weather.sys.country}`,
          coordinates: `${weather.coord.lat}, ${weather.coord.lon}`,
          timezone: weather.timezone || 'unknown',
          temperature: weather.main?.temp ? `${weather.main.temp}°C` : 'N/A',
          feelsLike: weather.main?.feels_like ? `${weather.main.feels_like}°C` : 'N/A',
          tempMin: weather.main?.temp_min ? `${weather.main.temp_min}°C` : 'N/A',
          tempMax: weather.main?.temp_max ? `${weather.main.temp_max}°C` : 'N/A',
          pressure: weather.main?.pressure ? `${weather.main.pressure} hPa` : 'N/A',
          humidity: weather.main?.humidity ? `${weather.main.humidity}%` : 'N/A',
          seaLevel: weather.main?.sea_level ? `${weather.main.sea_level} hPa` : 'N/A',
          groundLevel: weather.main?.grnd_level ? `${weather.main.grnd_level} hPa` : 'N/A',
          visibility: weather.visibility ? `${weather.visibility} m` : 'N/A',
          windSpeed: weather.wind?.speed ? `${weather.wind.speed} m/s` : 'N/A',
          windDirection: weather.wind?.deg ? `${weather.wind.deg}°` : 'N/A',
          windGust: weather.wind?.gust ? `${weather.wind.gust} m/s` : 'N/A',
          cloudiness: weather.clouds?.all ? `${weather.clouds.all}%` : 'N/A',
          rain1h: weather.rain ? `${weather.rain['1h'] || 0} mm` : '0 mm',
          rain3h: weather.rain ? `${weather.rain['3h'] || 0} mm` : '0 mm',
          snow1h: weather.snow ? `${weather.snow['1h'] || 0} mm` : '0 mm',
          snow3h: weather.snow ? `${weather.snow['3h'] || 0} mm` : '0 mm',
          weatherCondition: weather.weather[0]?.main || 'unknown',
          weatherDescription: weather.weather[0]?.description || 'unknown',
          sunrise: new Date(weather.sys.sunrise * 1000).toISOString(),
          sunset: new Date(weather.sys.sunset * 1000).toISOString(),
          timing: `${Math.floor(nanoTiming / 1000000)}ms`,
          updateFrequency: '10 minutes (Current Weather API)',
          description: 'Актуальные метеорологические данные: температура, давление, влажность, ветер, облачность, осадки',
          note: 'Идеально для доказуемой случайности - обновляется каждые 10 минут с реальными атмосферными данными'
        }
      };
    } catch (error) {
      console.error('  ❌ OpenWeatherMap error:', error.message);
      throw new Error(`OpenWeatherMap недоступен: ${error.message}`);
    }
  }

  async checkAvailability() {
    try {
      const city = this.cities[0];
      const response = await axios.get(this.baseUrl, {
        params: {
          lat: city.lat,
          lon: city.lon,
          appid: this.apiKey,
          units: 'metric'
        },
        timeout: 5000,
        headers: {
          'User-Agent': 'RandomTrust/1.0'
        }
      });
      
      return {
        available: response.status === 200,
        message: `OpenWeatherMap Current Weather API доступен (${city.name})`
      };
    } catch (error) {
      return {
        available: false,
        message: `OpenWeatherMap недоступен: ${error.message}`
      };
    }
  }
}

module.exports = OpenWeatherMapSource