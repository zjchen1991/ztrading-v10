// API endpoint to serve trading data
// Vercel Serverless Function

export default async function handler(req, res) {
  // Dynamic import to handle KV
  const { kv } = await import('@vercel/kv');
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      // Fetch data from Vercel KV
      const data = await kv.get('trading_data');
      
      if (!data) {
        return res.status(200).json({
          updated_at: new Date().toISOString(),
          equity: 10000,
          open_positions: 0,
          total_pnl: 0,
          win_rate: 0,
          total_trades: 0,
          positions: [],
          prices: {}
        });
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('KV fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Update data in Vercel KV
      const data = req.body;
      await kv.set('trading_data', data);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('KV write error:', error);
      return res.status(500).json({ error: 'Failed to update data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
