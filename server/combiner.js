const crypto = require('crypto');

class RandomnessCombiner {
  combine(sources, method = 'hash') {
    switch (method) {
      case 'xor': return this.combineXOR(sources);
      case 'hash': return this.combineHash(sources);
      case 'weighted': return this.combineWeighted(sources);
      default: return this.combineHash(sources);
    }
  }

  combineXOR(sources) {
    const maxLen = Math.max(...sources.map(s => s.numbers.length));
    const combined = [];
    
    for (let i = 0; i < maxLen; i++) {
      let xor = 0;
      let count = 0;
      
      sources.forEach(s => { 
        if (s.numbers[i] !== undefined) {
          // Добавляем дополнительную энтропию от индекса и времени
          const entropy = s.numbers[i] ^ (i * 7) ^ (Date.now() % 1000);
          xor ^= entropy;
          count++;
        }
      });
      
      // Если нет данных, используем хеш от индекса
      if (count === 0) {
        const hash = crypto.createHash('sha256')
          .update(`${i}-${Date.now()}-${Math.random()}`)
          .digest('hex');
        xor = parseInt(hash.substring(0, 8), 16);
      }
      
      combined.push(xor);
    }
    
    return {
      method: 'XOR',
      numbers: combined,
      sources: sources.map(s => ({ name: s.source, type: s.type, icon: s.icon })),
      timestamp: new Date().toISOString(),
      hash: crypto.createHash('sha256').update(JSON.stringify(combined)).digest('hex')
    };
  }

  combineHash(sources) {
    const allData = {
      sources: sources.map(s => ({
        name: s.source,
        numbers: s.numbers,
        hash: s.hash,
        timestamp: s.timestamp
      })),
      combinedAt: new Date().toISOString()
    };
    
    const avgCount = Math.floor(sources.reduce((sum, s) => sum + s.numbers.length, 0) / sources.length);
    const numbers = [];
    
    // ИСПРАВЛЕНИЕ: Генерируем уникальный хеш для каждого числа!
    for (let i = 0; i < avgCount; i++) {
      // Добавляем индекс и случайность для каждого числа
      const uniqueData = {
        ...allData,
        index: i,
        randomSeed: Math.random() * Date.now(), // Дополнительная энтропия
        counter: i * 1000 + Date.now() % 1000
      };
      
      const hash = crypto.createHash('sha512').update(JSON.stringify(uniqueData)).digest('hex');
      const hashBuffer = Buffer.from(hash, 'hex');
      
      // Берём разные части хеша для каждого числа
      const offset = (i * 7) % (hashBuffer.length - 4); // Сдвигаем на 7 байт каждый раз
      numbers.push(hashBuffer.readUInt32BE(offset));
    }
    
    return {
      method: 'HASH',
      numbers,
      sources: sources.map(s => ({ name: s.source, type: s.type, icon: s.icon })),
      timestamp: new Date().toISOString(),
      hash: crypto.createHash('sha256').update(JSON.stringify(numbers)).digest('hex')
    };
  }

  combineWeighted(sources) {
    const weights = {
      'quantum_beacon': 0.25,      // CURBy (увеличено с 20% до 25%)
      'atmospheric_noise': 0.20,   // Random.org (увеличено с 15% до 20%)
      'nist_beacon': 0.20,         // NIST (увеличено с 15% до 20%)
      'space_weather': 0.15,        // Космос (увеличено с 10% до 15%)
      'internet_entropy': 0.10,    // Гибрид (blockchain + crypto)
      'atmospheric_weather': 0.10   // OpenWeatherMap Real-time (уменьшено с 15% до 10%)
    };
    
    const weighted = sources.map(s => ({ ...s, weight: weights[s.type] || 0.1 }));
    const total = weighted.reduce((sum, s) => sum + s.weight, 0);
    weighted.forEach(s => s.normalizedWeight = s.weight / total);
    
    const maxLen = Math.max(...sources.map(s => s.numbers.length));
    const combined = [];
    
    for (let i = 0; i < maxLen; i++) {
      let sum = 0;
      let hasData = false;
      
      weighted.forEach(s => { 
        if (s.numbers[i] !== undefined) {
          // Добавляем дополнительную энтропию
          const entropy = s.numbers[i] + (i * 13) + (Date.now() % 100);
          sum += entropy * s.normalizedWeight;
          hasData = true;
        }
      });
      
      // Если нет данных, используем хеш
      if (!hasData) {
        const hash = crypto.createHash('sha256')
          .update(`${i}-${Date.now()}-${Math.random()}`)
          .digest('hex');
        sum = parseInt(hash.substring(0, 8), 16);
      }
      
      combined.push(Math.round(sum));
    }
    
    return {
      method: 'WEIGHTED',
      numbers: combined,
      sources: weighted.map(s => ({ name: s.source, type: s.type, icon: s.icon, weight: s.normalizedWeight })),
      timestamp: new Date().toISOString(),
      hash: crypto.createHash('sha256').update(JSON.stringify(combined)).digest('hex')
    };
  }

  normalizeToRange(numbers, min, max) {
    const range = max - min + 1;
    return numbers.map(num => Math.abs(num) % range + min);
  }
}

module.exports = RandomnessCombiner;
