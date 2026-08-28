import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

  console.log('Testing Drive with client_email:', clientEmail);
  if (!privateKey) {
    console.error('No private key found');
    return;
  }

  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  const drive = google.drive({ version: 'v3', auth });

  try {
    console.log('Authenticating with Google Drive API...');
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, shared, owners, parents)'
    });

    console.log('✅ Google Drive API connection SUCCESSFUL!');
    console.log('Files/Folders accessible by this Service Account:', res.data.files);
  } catch (err: any) {
    console.error('❌ Connection error:', err?.message || err);
  }
}

main();
