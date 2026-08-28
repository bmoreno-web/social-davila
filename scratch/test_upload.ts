import { uploadFileToDrive } from '../src/lib/drive/google-drive';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log('Testing upload to folder:', process.env.GOOGLE_DRIVE_FOLDER_ID);
  
  const testBuffer = Buffer.from('Test asset content for Davila PM Social');
  try {
    const res = await uploadFileToDrive({
      buffer: testBuffer,
      fileName: 'davila-test-asset.txt',
      mimeType: 'text/plain',
      clientName: 'Acesco Colombia'
    });
    console.log('✅ File uploaded successfully to Google Drive!');
    console.log('Drive URL:', res.driveUrl);
    console.log('Details:', res);
  } catch (err: any) {
    console.error('❌ Upload error:', err?.message || err);
  }
}

main();
