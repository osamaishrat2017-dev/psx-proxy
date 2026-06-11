export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const tickers = [
    { symbol: 'OGDC.KA',   key: 'OGDC'   },
    { symbol: 'PSO.KA',    key: 'PSO'    },
    { symbol: 'LUCK.KA',   key: 'LUCK'   },
    { symbol: 'FFC.KA',    key: 'FFC'    },
    { symbol: 'ENGROH.KA', key: 'ENGROH' },
    { symbol: 'SYS.KA',    key: 'SYS'    },
    { symbol: 'TRG.KA',    key: 'TRG'    },
    { symbol: 'AVN.KA',    key: 'AVN'    },
    { symbol: 'MLCF.KA',   key: 'MLCF'   },
  ];

  const results = {};
  const meta = {};

  await Promise.all(tickers.map(async (t) => {
    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${t.symbol}?interval=1d&range=2d`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': '*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com',
        },
      });
      if (!r.ok) return;
      const data = await r.json();
      const quote = data?.chart?.result?.[0]?.meta;
      if (quote && quote.regularMarketPrice) {
        const price = parseFloat(quote.regularMarketPrice.toFixed(2));
        const prev  = parseFloat((quote.chartPreviousClose || quote.regularMarketPrice).toFixed(2));
        const chg   = parseFloat((((price - prev) / prev) * 100).toFixed(2));
        results[t.key] = price;
        meta[t.key] = { price, prevClose: prev, changePct: chg, name: t.key, time: new Date().toISOString() };
      }
    } catch (_) {}
  }));

  const success = Object.keys(results).length > 0;
  res.status(success ? 200 : 502).json({
    success,
    prices: results,
    meta,
    fetchedAt: new Date().toISOString(),
    source: 'Yahoo Finance (end-of-day)',
    error: success ? undefined : 'All tickers failed',
  });
}
