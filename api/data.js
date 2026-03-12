// API endpoint to serve trading data
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check if KV env vars exist
    if (!process.env.KV_REST_API_URL) {
      return res.status(500).json({ 
        error: 'KV not connected',
        hint: 'Go to Vercel dashboard → Storage → Connect Redis to this project'
      });
    }

    // Import KV
    const { kv } = await import('@vercel/kv');

    if (req.method === 'GET') {
      // Fetch data from Vercel KV
      const data = await kv.get('trading_data');
      
      if (!data) {
        // Return default empty data
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
    }

    if (req.method === 'POST') {
      // Update data in Vercel KV
      const data = req.body;
      await kv.set('trading_data', data);
      return res.status(200).json({ success: true, updated_at: data.updated_at });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
