const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * Генератор файла с 1 000 000 бинарных значений
 * Для тестирования в NIST STS, Dieharder, TestU01
 */
class BinaryFileGenerator {
  async generateFile(sources, filename = null) {
    const startTime = Date.now();
    const targetBits = 1000000; // 1 миллион бит
    const bitsArray = [];
    
    console.log(`Генерация ${targetBits} бинарных значений...`);
    
    // Генерируем числа от источников
    const allNumbers = [];
    for (const source of sources) {
      allNumbers.push(...source.numbers);
    }
    
    // Конвертируем числа в биты
    for (const num of allNumbers) {
      const bits = num.toString(2).padStart(32, '0');
      bitsArray.push(...bits.split(''));
      if (bitsArray.length >= targetBits) break;
    }
    
    // Если недостаточно, генерируем дополнительно через хеширование
    let seed = sources.map(s => s.hash).join('');
    while (bitsArray.length < targetBits) {
      const hash = crypto.createHash('sha512').update(seed + bitsArray.length).digest();
      const bits = Array.from(hash).map(byte => byte.toString(2).padStart(8, '0')).join('');
      bitsArray.push(...bits.split(''));
      seed = hash.toString('hex');
    }
    
    // Обрезаем до ровно 1M
    const finalBits = bitsArray.slice(0, targetBits).join('');
    
    // Форматируем: 80 символов на строку для читаемости
    const lines = [];
    for (let i = 0; i < finalBits.length; i += 80) {
      lines.push(finalBits.substring(i, i + 80));
    }
    const content = lines.join('\n');
    
    // Сохраняем файл
    const fileName = filename || `random_bits_${Date.now()}.txt`;
    const filePath = path.join(process.cwd(), fileName);
    
    await fs.writeFile(filePath, content, 'utf8');
    
    const generationTime = Date.now() - startTime;
    
    console.log(`✅ Файл сгенерирован: ${fileName}`);
    console.log(`📊 Размер: ${targetBits} бит (${lines.length} строк)`);
    console.log(`⏱️  Время: ${generationTime}ms`);
    
    // Базовая статистика файла
    const zeros = (finalBits.match(/0/g) || []).length;
    const ones = (finalBits.match(/1/g) || []).length;
    const balance = Math.abs(zeros - ones) / targetBits;
    
    return {
      fileName,
      filePath,
      totalBits: targetBits,
      lines: lines.length,
      generationTime,
      statistics: {
        zeros,
        ones,
        balance: (balance * 100).toFixed(2) + '%',
        balanceGood: balance < 0.01
      },
      instructions: {
        nistSTS: `assess ${targetBits} < ${fileName}`,
        dieharder: `dieharder -a -g 202 -f ${fileName}`,
        testU01: 'Используйте программу TestU01 с файлом'
      },
      downloadUrl: `/download/${fileName}`
    };
  }

  async generateFromAPI(sourcesData) {
    return this.generateFile(sourcesData);
  }
}

module.exports = BinaryFileGenerator;




