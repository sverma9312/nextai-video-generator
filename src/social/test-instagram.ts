import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function testConnection() {
  const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  console.log(`🔍 Testing Meta Graph API connection for Account ID: ${accountId}...`);

  const url = `https://graph.facebook.com/v19.0/${accountId}?fields=id,username,name,biography,media_count&access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();

  if (res.ok) {
    console.log('🎉 [SUCCESS] Instagram API Connected Successfully!');
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.error('❌ [FAILED] Instagram API returned error:');
    console.error(JSON.stringify(data, null, 2));
  }
}

testConnection();

