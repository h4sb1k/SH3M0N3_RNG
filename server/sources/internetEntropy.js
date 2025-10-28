const axios = require('axios');
const crypto = require('crypto');

/**
 * Internet Entropy - Расширенный гибридный источник (5-в-1)
 * 1. Network Latency (время откликов API)
 * 2. Crypto Rates (курсы криптовалют)
 * 3. Blockchain Mempool (данные блокчейна)
 * 4. Traditional Currencies (традиционные валюты)
 * 5. Financial Markets (финансовые рынки)
 */
class InternetEntropySource {
  constructor() {
    this.name = 'Internet Entropy';
    this.type = 'internet_entropy';
    this.icon = '🌐';
    this.pingAPIs = [
      'https://api.github.com',
      'https://api.coinbase.com/v2/time',
      'https://worldtimeapi.org/api/timezone/UTC',
      'https://api.ipify.org?format=json',
      'https://httpbin.org/uuid',
      'https://api.exchangerate-api.com/v4/latest/USD',
      'https://api.fixer.io/latest',
      'https://api.coingecko.com/api/v3/ping',
      'https://api.binance.com/api/v3/time',
      'https://api.kraken.com/0/public/Time',
      'https://api.poloniex.com/public?command=returnTicker',
      'https://api.bitfinex.com/v1/pubticker/btcusd',
      'https://api.huobi.pro/market/detail/merged?symbol=btcusdt',
      'https://api.bitstamp.net/v2/ticker/btcusd/',
      'https://api.coinmarketcap.com/v1/ticker/bitcoin/'
    ];
  }

  async generateNumbers(count = 1, min = 1, max = 100) {
    const startTime = Date.now();
    
    const [latency, blockchain, cryptoData, currencies, markets] = await Promise.all([
      this.collectLatencyEntropy(),
      this.collectBlockchainEntropy(),
      this.collectCryptoEntropy(),
      this.collectCurrencyEntropy(),
      this.collectMarketEntropy()
    ]);
    
    const combined = Buffer.concat([
      latency.entropy,
      blockchain.entropy,
      cryptoData.entropy,
      currencies.entropy,
      markets.entropy,
      Buffer.from(Date.now().toString()),
      Buffer.from(process.hrtime.bigint().toString())
    ]);
    
    let hash = require('crypto').createHash('sha512').update(combined).digest();
    for (let i = 0; i < 3; i++) {
      hash = require('crypto').createHash('sha512').update(hash).update(`round_${i}`).digest();
    }
    
    const numbers = [];
    const range = max - min + 1;
    
    for (let i = 0; i < count; i++) {
      const slice = hash.slice((i * 8) % (hash.length - 8), ((i * 8) % (hash.length - 8)) + 8);
      const value = slice.readUInt32BE(0);
      numbers.push((value % range) + min);
    }
    
    const finalHash = require('crypto').createHash('sha256')
      .update(JSON.stringify(numbers) + hash.toString('hex')).digest('hex');

    return {
      source: this.name,
      type: this.type,
      icon: this.icon,
      numbers,
      timestamp: new Date().toISOString(),
      latency: Date.now() - startTime,
      hash: finalHash,
      proof: {
        components: ['Network Latency', 'Blockchain Mempool', 'Crypto Rates', 'Traditional Currencies', 'Financial Markets'],
        latencyStats: latency.stats,
        blockchainInfo: blockchain.info,
        cryptoInfo: cryptoData.info,
        currencyInfo: currencies.info,
        marketInfo: markets.info,
        method: 'SHA-512 × 4 rounds',
        note: 'Расширенные источники: сетевые задержки + блокчейн + криптовалюты + валюты + рынки'
      }
    };
  }

  async collectLatencyEntropy() {
    const latencies = [];
    const timestamps = [];
    
    const results = await Promise.all(
      this.pingAPIs.map(async (url) => {
        try {
          const start = process.hrtime.bigint();
          await axios.get(url, { timeout: 3000, validateStatus: () => true });
          const end = process.hrtime.bigint();
          return { latency: Number(end - start), timestamp: Date.now() };
        } catch (error) {
          return { latency: Date.now() * 1000000, timestamp: Date.now(), error: true };
        }
      })
    );
    
    results.forEach(r => {
      latencies.push(r.latency);
      timestamps.push(r.timestamp);
    });
    
    return {
      entropy: Buffer.from(latencies.join('|') + timestamps.join('|')),
      stats: {
        apis: results.length,
        avgLatency: Math.floor(latencies.reduce((a, b) => a + b, 0) / latencies.length / 1000000) + 'ms'
      }
    };
  }

  async collectBlockchainEntropy() {
    // Blockchain Mempool - данные из блокчейна
    try {
      const hrStart = process.hrtime.bigint();
      
      // Получаем данные из mempool различных блокчейнов
      const [bitcoinMempool, ethereumGas] = await Promise.all([
        axios.get('https://mempool.space/api/mempool', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YourApiKeyToken', { timeout: 5000 }).catch(() => null)
      ]);
      
      const hrEnd = process.hrtime.bigint();
      const nanoTiming = Number(hrEnd - hrStart);
      
      const blockchainData = [];
      const info = {
        sources: [],
        timing: `${Math.floor(nanoTiming / 1000000)}ms`,
        updateFreq: 'Real-time blockchain data'
      };
      
      if (bitcoinMempool && bitcoinMempool.data) {
        const mempool = bitcoinMempool.data;
        blockchainData.push(
          mempool.count?.toString() || '0',
          mempool.totalFee?.toString() || '0',
          mempool.vsize?.toString() || '0',
          mempool.size?.toString() || '0'
        );
        info.sources.push('Bitcoin Mempool');
        info.bitcoinTx = mempool.count || 0;
      }
      
      if (ethereumGas && ethereumGas.data) {
        const gas = ethereumGas.data.result;
        blockchainData.push(
          gas.SafeGasPrice?.toString() || '0',
          gas.ProposeGasPrice?.toString() || '0',
          gas.FastGasPrice?.toString() || '0',
          gas.suggestBaseFee?.toString() || '0'
        );
        info.sources.push('Ethereum Gas Prices');
        info.ethereumGas = gas.SafeGasPrice || '0';
      }
      
      // Добавляем системную энтропию
      blockchainData.push(
        nanoTiming.toString(),
        process.hrtime.bigint().toString(),
        Date.now().toString(),
        crypto.randomBytes(16).toString('hex')
      );
      
      const combined = blockchainData.filter(Boolean).join('|');
      
      return {
        entropy: crypto.createHash('sha256').update(combined).digest(),
        info
      };
    } catch (error) {
      return {
        entropy: crypto.createHash('sha256')
          .update(process.hrtime.bigint().toString())
          .update(Math.random().toString())
          .digest(),
        info: {
          sources: ['Blockchain Mempool (Fallback)'],
          error: error.message,
          updateFreq: 'Fallback (system timing)'
        }
      };
    }
  }

  async collectCryptoEntropy() {
    try {
      const hrStart = process.hrtime.bigint();
      
      // Получаем данные от множества крипто-бирж и API
      const [coinbase, coingecko, binance, kraken, poloniex] = await Promise.all([
        axios.get('https://api.coinbase.com/v2/exchange-rates?currency=BTC', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,cardano,solana,polkadot,chainlink,uniswap,litecoin,stellar&vs_currencies=usd', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.kraken.com/0/public/Ticker?pair=XBTUSD', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.poloniex.com/public?command=returnTicker', { timeout: 5000 }).catch(() => null)
      ]);
      
      const hrEnd = process.hrtime.bigint();
      const nanoTiming = Number(hrEnd - hrStart);
      
      const cryptoData = [];
      const info = {
        sources: [],
        timing: `${Math.floor(nanoTiming / 1000000)}ms`,
        updateFreq: 'Real-time crypto data'
      };
      
      // Coinbase данные
      if (coinbase && coinbase.data && coinbase.data.data && coinbase.data.data.rates) {
        const rates = coinbase.data.data.rates;
        cryptoData.push(
          rates.USD?.toString() || '0',
          rates.EUR?.toString() || '0',
          rates.GBP?.toString() || '0',
          rates.JPY?.toString() || '0'
        );
        info.sources.push('Coinbase Exchange Rates');
        info.btc_usd = rates.USD;
      }
      
      // CoinGecko данные (множество криптовалют)
      if (coingecko && coingecko.data) {
        const prices = coingecko.data;
        Object.entries(prices).forEach(([coin, data]) => {
          if (data.usd) {
            cryptoData.push(data.usd.toString());
            info[coin] = data.usd;
          }
        });
        info.sources.push(`CoinGecko (${Object.keys(prices).length} coins)`);
      }
      
      // Binance данные
      if (binance && binance.data) {
        cryptoData.push(binance.data.price);
        info.sources.push('Binance');
        info.binance_btc = binance.data.price;
      }
      
      // Kraken данные
      if (kraken && kraken.data && kraken.data.result) {
        const ticker = kraken.data.result.XXBTZUSD;
        cryptoData.push(
          ticker.c[0], // последняя цена
          ticker.v[1], // объем за 24ч
          ticker.h[0], // максимальная цена
          ticker.l[0]  // минимальная цена
        );
        info.sources.push('Kraken');
        info.kraken_btc = ticker.c[0];
      }
      
      // Poloniex данные
      if (poloniex && poloniex.data) {
        const btcData = poloniex.data.BTC_USDT;
        if (btcData) {
          cryptoData.push(
            btcData.last?.toString() || '0',
            btcData.lowestAsk?.toString() || '0',
            btcData.highestBid?.toString() || '0',
            btcData.percentChange?.toString() || '0'
          );
          info.sources.push('Poloniex');
          info.poloniex_btc = btcData.last;
        }
      }
      
      // Добавляем системную энтропию
      cryptoData.push(
        nanoTiming.toString(),
        process.hrtime.bigint().toString(),
        Date.now().toString(),
        crypto.randomBytes(16).toString('hex')
      );
      
      const combined = cryptoData.filter(Boolean).join('|');
      
      return {
        entropy: crypto.createHash('sha256').update(combined).digest(),
        info
      };
    } catch (error) {
      return {
        entropy: crypto.createHash('sha256')
          .update(process.hrtime.bigint().toString())
          .update(Math.random().toString())
          .digest(),
        info: {
          sources: ['Crypto Rates (Fallback)'],
          error: error.message,
          updateFreq: 'Fallback (system timing)'
        }
      };
    }
  }

  async collectCurrencyEntropy() {
    try {
      const hrStart = process.hrtime.bigint();
      
      // Получаем данные о традиционных валютах
      const [exchangerate, fixer, currencylayer] = await Promise.all([
        axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.fixer.io/latest?access_key=demo_key&base=USD&symbols=EUR,GBP,JPY,CHF,CAD,AUD,NZD', { timeout: 5000 }).catch(() => null),
        axios.get('https://api.currencylayer.com/live?access_key=demo_key&currencies=EUR,GBP,JPY,CHF,CAD,AUD,NZD,SEK,NOK,DKK', { timeout: 5000 }).catch(() => null)
      ]);
      
      const hrEnd = process.hrtime.bigint();
      const nanoTiming = Number(hrEnd - hrStart);
      
      const currencyData = [];
      const info = {
        sources: [],
        timing: `${Math.floor(nanoTiming / 1000000)}ms`,
        updateFreq: 'Real-time currency data'
      };
      
      // ExchangeRate-API данные
      if (exchangerate && exchangerate.data && exchangerate.data.rates) {
        const rates = exchangerate.data.rates;
        const majorCurrencies = ['EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD', 'NZD', 'SEK', 'NOK', 'DKK'];
        majorCurrencies.forEach(currency => {
          if (rates[currency]) {
            currencyData.push(rates[currency].toString());
            info[`usd_${currency.toLowerCase()}`] = rates[currency];
          }
        });
        info.sources.push(`ExchangeRate-API (${majorCurrencies.length} currencies)`);
      }
      
      // Fixer.io данные
      if (fixer && fixer.data && fixer.data.rates) {
        const rates = fixer.data.rates;
        Object.entries(rates).forEach(([currency, rate]) => {
          currencyData.push(rate.toString());
          info[`fixer_${currency.toLowerCase()}`] = rate;
        });
        info.sources.push('Fixer.io');
      }
      
      // CurrencyLayer данные
      if (currencylayer && currencylayer.data && currencylayer.data.quotes) {
        const quotes = currencylayer.data.quotes;
        Object.entries(quotes).forEach(([pair, rate]) => {
          currencyData.push(rate.toString());
          info[`currencylayer_${pair.toLowerCase()}`] = rate;
        });
        info.sources.push('CurrencyLayer');
      }
      
      // Добавляем системную энтропию
      currencyData.push(
        nanoTiming.toString(),
        process.hrtime.bigint().toString(),
        Date.now().toString(),
        crypto.randomBytes(16).toString('hex')
      );
      
      const combined = currencyData.filter(Boolean).join('|');
      
      return {
        entropy: crypto.createHash('sha256').update(combined).digest(),
        info
      };
    } catch (error) {
      return {
        entropy: crypto.createHash('sha256')
          .update(process.hrtime.bigint().toString())
          .update(Math.random().toString())
          .digest(),
        info: {
          sources: ['Currency Rates (Fallback)'],
          error: error.message,
          updateFreq: 'Fallback (system timing)'
        }
      };
    }
  }

  async collectMarketEntropy() {
    try {
      const hrStart = process.hrtime.bigint();
      
      // Получаем данные о финансовых рынках
      const [alphaVantage, yahooFinance, finnhub] = await Promise.all([
        axios.get('https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPY&apikey=demo_key', { timeout: 5000 }).catch(() => null),
        axios.get('https://query1.finance.yahoo.com/v8/finance/chart/^GSPC', { timeout: 5000 }).catch(() => null),
        axios.get('https://finnhub.io/api/v1/quote?symbol=AAPL&token=demo_key', { timeout: 5000 }).catch(() => null)
      ]);
      
      const hrEnd = process.hrtime.bigint();
      const nanoTiming = Number(hrEnd - hrStart);
      
      const marketData = [];
      const info = {
        sources: [],
        timing: `${Math.floor(nanoTiming / 1000000)}ms`,
        updateFreq: 'Real-time market data'
      };
      
      // Alpha Vantage данные (S&P 500)
      if (alphaVantage && alphaVantage.data && alphaVantage.data['Global Quote']) {
        const quote = alphaVantage.data['Global Quote'];
        marketData.push(
          quote['02. open']?.toString() || '0',
          quote['03. high']?.toString() || '0',
          quote['04. low']?.toString() || '0',
          quote['05. price']?.toString() || '0',
          quote['06. volume']?.toString() || '0',
          quote['09. change']?.toString() || '0',
          quote['10. change percent']?.toString() || '0'
        );
        info.sources.push('Alpha Vantage (S&P 500)');
        info.spy_price = quote['05. price'];
      }
      
      // Yahoo Finance данные
      if (yahooFinance && yahooFinance.data && yahooFinance.data.chart && yahooFinance.data.chart.result && yahooFinance.data.chart.result[0]) {
        const chart = yahooFinance.data.chart.result[0];
        const meta = chart.meta;
        
        if (meta) {
          marketData.push(
            meta.regularMarketPrice?.toString() || '0',
            meta.regularMarketHigh?.toString() || '0',
            meta.regularMarketLow?.toString() || '0',
            meta.regularMarketVolume?.toString() || '0',
            meta.previousClose?.toString() || '0'
          );
          info.sources.push('Yahoo Finance');
          info.yahoo_sp500 = meta.regularMarketPrice;
        }
      }
      
      // Finnhub данные (Apple как пример)
      if (finnhub && finnhub.data) {
        marketData.push(
          finnhub.data.c?.toString() || '0', // текущая цена
          finnhub.data.h?.toString() || '0', // максимальная цена
          finnhub.data.l?.toString() || '0', // минимальная цена
          finnhub.data.o?.toString() || '0',  // цена открытия
          finnhub.data.pc?.toString() || '0'  // предыдущая цена закрытия
        );
        info.sources.push('Finnhub (AAPL)');
        info.finnhub_aapl = finnhub.data.c;
      }
      
      // Добавляем товарные рынки (золото, нефть)
      try {
        const commodities = await Promise.all([
          axios.get('https://api.metals.live/v1/spot/gold', { timeout: 3000 }).catch(() => null),
          axios.get('https://api.oilpriceapi.com/v1/prices/latest', { timeout: 3000 }).catch(() => null)
        ]);
        
        if (commodities[0] && commodities[0].data) {
          marketData.push(commodities[0].data.price?.toString() || '0');
          info.sources.push('Metals.live (Gold)');
          info.gold_price = commodities[0].data.price;
        }
        
        if (commodities[1] && commodities[1].data) {
          marketData.push(commodities[1].data.data.price?.toString() || '0');
          info.sources.push('OilPriceAPI');
          info.oil_price = commodities[1].data.data.price;
        }
      } catch (commodityError) {
        // Игнорируем ошибки товарных рынков
      }
      
      // Добавляем системную энтропию
      marketData.push(
        nanoTiming.toString(),
        process.hrtime.bigint().toString(),
        Date.now().toString(),
        crypto.randomBytes(16).toString('hex')
      );
      
      const combined = marketData.filter(Boolean).join('|');
      
      return {
        entropy: crypto.createHash('sha256').update(combined).digest(),
        info
      };
    } catch (error) {
      return {
        entropy: crypto.createHash('sha256')
          .update(process.hrtime.bigint().toString())
          .update(Math.random().toString())
          .digest(),
        info: {
          sources: ['Market Data (Fallback)'],
          error: error.message,
          updateFreq: 'Fallback (system timing)'
        }
      };
    }
  }

  async checkAvailability() {
    try {
      await axios.get(this.pingAPIs[0], { timeout: 3000 });
      return { available: true, message: 'Доступен' };
    } catch (error) {
      return { available: true, message: 'Доступен (fallback)' };
    }
  }
}

module.exports = InternetEntropySource;
