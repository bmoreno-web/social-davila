import { google } from 'googleapis';
import { Readable } from 'stream';

function getDriveClient() {
  const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  let privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    throw new Error('Faltan las credenciales GOOGLE_DRIVE_CLIENT_EMAIL o GOOGLE_DRIVE_PRIVATE_KEY');
  }

  // Handle escaped newlines from environment variables
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/drive']
  });

  return google.drive({ version: 'v3', auth });
}

export async function testDriveConnection() {
  try {
    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!folderId) {
      return {
        success: false,
        error: 'GOOGLE_DRIVE_FOLDER_ID no está configurado en las variables de entorno'
      };
    }

    // Get folder metadata
    const folderRes = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, mimeType, webViewLink'
    });

    // List recent files in folder
    const listRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      pageSize: 5,
      fields: 'files(id, name, mimeType, webViewLink, createdTime)'
    });

    return {
      success: true,
      folder: folderRes.data,
      recentFiles: listRes.data.files || []
    };
  } catch (err: any) {
    console.error('Google Drive test connection error:', err);
    return {
      success: false,
      error: err?.message || String(err)
    };
  }
}

export async function uploadFileToDrive(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
  clientName?: string;
}) {
  const { buffer, fileName, mimeType, clientName = 'General' } = params;
  const drive = getDriveClient();
  const parentFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!parentFolderId) {
    throw new Error('GOOGLE_DRIVE_FOLDER_ID no está configurado');
  }

  // 1. Find or create Client Subfolder
  let targetFolderId = parentFolderId;
  try {
    const searchRes = await drive.files.list({
      q: `'${parentFolderId}' in parents and name = '${clientName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true
    });

    if (searchRes.data.files && searchRes.data.files.length > 0) {
      targetFolderId = searchRes.data.files[0].id!;
    } else {
      // Create subfolder
      const createFolderRes = await drive.files.create({
        requestBody: {
          name: clientName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentFolderId]
        },
        fields: 'id',
        supportsAllDrives: true
      });
      targetFolderId = createFolderRes.data.id!;
    }
  } catch (folderErr) {
    console.warn('Error creating/finding subfolder, uploading to root folder:', folderErr);
    targetFolderId = parentFolderId;
  }

  // 2. Convert Buffer to Stream
  const readableStream = new Readable();
  readableStream.push(buffer);
  readableStream.push(null);

  // 3. Upload File
  const fileRes = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [targetFolderId]
    },
    media: {
      mimeType,
      body: readableStream
    },
    fields: 'id, name, mimeType, webViewLink, webContentLink',
    supportsAllDrives: true
  });

  const fileId = fileRes.data.id!;

  // 4. Set Public View Permission so anyone with link can see/play
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      },
      supportsAllDrives: true
    });
  } catch (permErr) {
    console.warn('Could not set public permission on uploaded file:', permErr);
  }

  const driveUrl = `https://drive.google.com/file/d/${fileId}/view`;

  return {
    fileId,
    name: fileRes.data.name,
    mimeType: fileRes.data.mimeType,
    driveUrl,
    webViewLink: fileRes.data.webViewLink,
    webContentLink: fileRes.data.webContentLink
  };
}
