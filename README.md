# PSX Price Proxy

Serverless Vercel proxy that fetches end-of-day PSX stock prices from Yahoo Finance.

## Deploy to Vercel (free, 2 minutes)

1. Go to https://vercel.com and sign up with GitHub (free)
2. Install Vercel CLI: `npm i -g vercel`
3. Run `vercel` in this folder and follow the prompts
4. Your API will be live at: `https://YOUR-PROJECT.vercel.app/api/prices`

## Endpoint

**GET** `/api/prices`

Returns:
```json
{
  "success": true,
  "prices": { "OGDC": 155.5, "PSO": 312.0, ... },
  "meta": {
    "OGDC": { "price": 155.5, "prevClose": 153.0, "changePct": 1.63, "name": "...", "time": "..." }
  },
  "fetchedAt": "2026-06-11T10:00:00.000Z",
  "source": "Yahoo Finance (end-of-day)"
}
```

## Tickers used
OGDC.KA, PSO.KA, LUCK.KA, FFC.KA, ENGROH.KA, SYS.KA, TRG.KA, AVN.KA, MLCF.KA
