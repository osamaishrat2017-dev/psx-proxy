export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const tickers = [
    { symbol: 'OGDC.KA',  key: 'OGDC'  },
    { symbol: 'PSO.KA',   key: 'PSO'   },
    { symbol: 'LUCK.KA',  key: 'LUCK'  },
    { symbol: 'FFC.KA',   key: 'FFC'   },
    { symbol: 'ENGROH.KA',key: 'ENGROH'},
    { symbol: 'SYS.KA',   key: 'SYS'   },
    { symbol: 'TRG.KA',   key: 'TRG'   },
    { symbol: 'AVN.KA',   key: 'AVN'   },
    { symbol: 'MLCF.KA',  key: 'MLCF'  },
  ];

  const symbols = tickers.map(t => t.symbol).join(',');
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketPreviousClose,regularMarketChangePercent,regularMarketTime,shortName`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Yahoo returned ${response.status}`);
    const data = await response.json();
    const quotes = data?.quoteResponse?.result || [];

    const prices = {};
    const meta = {};

    for (const t of tickers) {
      const q = quotes.find(q => q.symbol === t.symbol);
      if (q && q.regularMarketPrice) {
        prices[t.key] = parseFloat(q.regularMarketPrice.toFixed(2));
        meta[t.key] = {
          price:     parseFloat(q.regularMarketPrice.toFixed(2)),
          prevClose: parseFloat((q.regularMarketPreviousClose || q.regularMarketPrice).toFixed(2)),
          changePct: parseFloat((q.regularMarketChangePercent || 0).toFixed(2)),
          name:      q.shortName || t.key,
          time:      q.regularMarketTime ? new Date(q.regularMarketTime * 1000).toISOString() : null,
        };
      }
    }

    res.status(200).json({
      success: true,
      prices,
      meta,
      fetchedAt: new Date().toISOString(),
      source: 'Yahoo Finance (end-of-day)',
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
      prices: {},
      meta: {},
      fetchedAt: new Date().toISOString(),
    });
  }
}
