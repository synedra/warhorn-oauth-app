// netlify/functions/exchange_token.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    const { code } = JSON.parse(event.body);
    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing code' })
      };
    }

    const CLIENT_ID = process.env.WARHORN_CLIENT_ID;
    const CLIENT_SECRET = process.env.WARHORN_CLIENT_SECRET;
    const REDIRECT_URI = 'https://paizo.netlify.com'; // Must match your app settings

    const response = await fetch('https://warhorn.net/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    });
    const data = await response.json();
    if (data.error) {
      return {
        statusCode: 400,
        body: JSON.stringify(data)
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Token exchange failed', details: err.message })
    };
  }
};
