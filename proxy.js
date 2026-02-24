const http = require('http');

const SHOPIFY_DOMAIN = 'msreadshop.myshopify.com';
const API_VERSION = '2024-01';

const server = http.createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Shopify-Access-Token');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the incoming URL to get the endpoint
  const url = new URL(req.url, `http://localhost:3000`);
  // Remove leading slash and get the Shopify endpoint
  let endpoint = url.pathname.replace(/^\/+/, '');
  
  // Get token from header
  const token = req.headers['x-shopify-access-token'];
  
  if (!token) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing X-Shopify-Access-Token header' }));
    return;
  }

  // Build the Shopify API path
  const shopifyPath = `/admin/api/${API_VERSION}/${endpoint}?${url.searchParams.toString()}`;
  
  console.log(`Proxying: ${req.method} ${shopifyPath}`);

  const proxyReq = http.request({
    hostname: SHOPIFY_DOMAIN,
    port: 443,
    path: shopifyPath,
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
      'Host': SHOPIFY_DOMAIN
    }
  }, proxyRes => {
    let data = '';
    proxyRes.on('data', chunk => data += chunk);
    proxyRes.on('end', () => {
      res.writeHead(proxyRes.statusCode, { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(data);
    });
  });

  req.on('data', chunk => proxyReq.write(chunk));
  req.on('end', () => proxyReq.end());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Proxy server running on http://localhost:${PORT}`));
