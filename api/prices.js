export default async function handler(req, res) {
  // Set CORS headers on EVERY response including errors
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const tickers = [
    { symbol: 'OGDC.KA',   key: 'OGDC'   },
    { symbol: 'PSO.KA',    key: 'PSO'    },
    { symbol: 'LUCK.KA',   key: 'LUCK'   },
    { symbol: 'FFC.KA',    key: 'FFC'    },
    { symbol: 'ENGROH.KA', key: 'ENGROH' },
    { symbol: 'SYS.KA',    key: 'SYS'    },
    { symbol: 'TRG.KA',    key: 'TRG'    },
    { symbol: 'AVN.KA',    key: 'AVN'    },
    { symbol: 'MLCF.KA',   key: 'MLCF'  },
  ];

  const results = {};
  const meta = {};

  await Promise.all(tickers.map(async (t) => {
    try {
      const url = `https://query2.finance.yahoo.com/v8/finance/chart/${t.symbol}?interval=1d&range=5d`;
      const r = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Referer': 'https://finance.yahoo.com/',
          'Origin': 'https://finance.yahoo.com',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-site',
          'Cache-Control': 'no-cache',
        },
      });

      if (!r.ok) return;
      const data = await r.json();
      const m = data?.chart?.result?.[0]?.meta;
      if (!m) return;

      const price   = parseFloat((m.regularMarketPrice || 0).toFixed(2));
      const prev    = parseFloat((m.chartPreviousClose || m.regularMarketPrice || price).toFixed(2));
      const changePct = prev > 0 ? parseFloat((((price - prev) / prev) * 100).toFixed(2)) : 0;

      if (price > 0) {
        results[t.key] = price;
        meta[t.key] = {
          price,
          prevClose: prev,
          changePct,
          name: m.shortName || t.key,
          currency: m.currency || 'PKR',
          time: new Date().toISOString(),
        };
      }
    } catch (e) {
      // silently skip failed tickers
    }
  }));

  const count = Object.keys(results).length;

  res.status(200).json({
    success: count > 0,
    count,
    prices: results,
    meta,
    fetchedAt: new Date().toISOString(),
    source: 'Yahoo Finance (end-of-day, KSE)',
    error: count === 0 ? 'Yahoo Finance blocked all requests' : undefined,
  });
}
