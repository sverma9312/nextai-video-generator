import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

const clientId = process.env.YOUTUBE_CLIENT_ID;
const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
const PORT = 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!clientId || !clientSecret) {
  console.error('\n❌ ERROR: YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET must be set in your .env file first!');
  console.log('👉 Please add them to your .env file:\n');
  console.log('YOUTUBE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com');
  console.log('YOUTUBE_CLIENT_SECRET=your_client_secret_here\n');
  process.exit(1);
}

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
].join(' ');

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
  clientId
)}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI
)}&response_type=code&scope=${encodeURIComponent(
  SCOPES
)}&access_type=offline&prompt=consent`;

console.log('\n========================================================');
console.log('🔐 YouTube OAuth 2.0 Authorization Token Generator');
console.log('========================================================\n');
console.log('1. Click the link below (or copy and paste it into your browser):');
console.log(`\n🔗 ${authUrl}\n`);
console.log('2. Log in with your YouTube account (nextaiapps.team@gmail.com).');
console.log('3. If you see "Google hasn\'t verified this app", click "Advanced" -> "Go to NextAI Video Studio (unsafe)".');
console.log('4. Click "Continue" / "Allow" to grant upload permissions.\n');
console.log(`⏳ Listening for authorization callback on http://localhost:${PORT}/oauth2callback...\n`);

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url || '', `http://localhost:${PORT}`);
    if (!reqUrl.pathname.startsWith('/oauth2callback')) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const code = reqUrl.searchParams.get('code');
    const error = reqUrl.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h2>Authorization Failed</h2><p>Error: ${error}</p>`);
      console.error(`❌ Authorization failed: ${error}`);
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end('<h2>Missing code parameter</h2>');
      return;
    }

    console.log('🔄 Authorization code received! Exchanging for refresh token...');

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h2>Token Exchange Failed</h2><pre>${errText}</pre>`);
      console.error('❌ Token exchange failed:', errText);
      process.exit(1);
    }

    const data = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    if (!data.refresh_token) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h2>Warning: No Refresh Token Returned</h2>
        <p>Google did not return a refresh token. This usually happens if consent was already given without prompt=consent.</p>
        <p>Go to <a href="https://myaccount.google.com/permissions">Google Account Permissions</a>, revoke access to your app, and run this script again.</p>
      `);
      console.warn('⚠️ No refresh_token returned. Revoke app permissions at https://myaccount.google.com/permissions and retry.');
      process.exit(1);
    }

    console.log('\n🎉 SUCCESS! YouTube Refresh Token obtained:');
    console.log(`\n🔑 REFRESH TOKEN:\n${data.refresh_token}\n`);

    // Update .env automatically
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    if (envContent.includes('YOUTUBE_REFRESH_TOKEN=')) {
      envContent = envContent.replace(
        /YOUTUBE_REFRESH_TOKEN=.*/,
        `YOUTUBE_REFRESH_TOKEN=${data.refresh_token}`
      );
    } else {
      envContent += `\nYOUTUBE_REFRESH_TOKEN=${data.refresh_token}\n`;
    }

    fs.writeFileSync(envPath, envContent, 'utf8');
    console.log(`💾 Automatically saved YOUTUBE_REFRESH_TOKEN to ${envPath}`);

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <body style="font-family: system-ui; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 90vh; background: #0A0D14; color: #fff;">
          <h1 style="color: #38BDF8;">YouTube Authorization Successful!</h1>
          <p style="font-size: 18px; color: #94A3B8;">The refresh token has been automatically saved to your .env file.</p>
          <p style="font-size: 16px; color: #10B981;">You can close this browser tab and return to the terminal.</p>
        </body>
      </html>
    `);

    setTimeout(() => {
      console.log('✅ Server closed. Setup complete!');
      process.exit(0);
    }, 2000);
  } catch (err) {
    console.error('❌ Server error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
    process.exit(1);
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Helper server running on http://localhost:${PORT}`);
});

