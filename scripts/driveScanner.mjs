// AhaZone Google Drive PDF 掃描與分析模組
const API_KEY = 'AIzaSyDJMCs1DLoPCZLAEzuAmVeerBNetX_wpI4';
const ROOT_FOLDER_ID = '1fu_i-yZBr6bZipxT5sok_UqLDeenV05n';

const IGNORED_FOLDERS = new Set([
  '命題題庫', 'hanlin', 'Database', 'Help', 'Files', '.gemini', 'node_modules', '.git'
]);

/**
 * 掃描指定雲端資料夾下的 PDF 檔案
 */
export async function scanDrivePdfs(folderId = ROOT_FOLDER_ID, currentPath = '') {
  const pdfList = [];

  async function crawl(fId, path) {
    let nextToken = null;
    do {
      const url = new URL('https://www.googleapis.com/drive/v3/files');
      url.searchParams.set('q', `'${fId}' in parents and trashed = false`);
      url.searchParams.set('key', API_KEY);
      url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, webViewLink, webContentLink)');
      url.searchParams.set('pageSize', '100');
      if (nextToken) url.searchParams.set('pageToken', nextToken);

      const res = await fetch(url);
      if (!res.ok) {
        console.error(`掃描失敗 [${path}]:`, await res.text());
        return;
      }
      const data = await res.json();
      if (data.files) {
        const subfolders = [];
        for (const file of data.files) {
          if (file.mimeType === 'application/vnd.google-apps.folder') {
            if (!IGNORED_FOLDERS.has(file.name)) {
              subfolders.push(file);
            }
          } else if (file.mimeType === 'application/pdf') {
            pdfList.push({
              id: file.id,
              name: file.name,
              path: path,
              fullPath: `${path}/${file.name}`,
              webViewLink: file.webViewLink,
              previewUrl: `https://drive.google.com/file/d/${file.id}/preview`
            });
          }
        }

        // 平行處理子目錄以加速掃描
        await Promise.all(subfolders.map(sub => crawl(sub.id, `${path}/${sub.name}`)));
      }
      nextToken = data.nextPageToken;
    } while (nextToken);
  }

  await crawl(folderId, currentPath);
  return pdfList;
}

if (process.argv[1]?.endsWith('driveScanner.mjs')) {
  console.log('開始快速掃描 Google Drive 教學 PDF (略過題庫安裝檔)...');
  const start = Date.now();
  scanDrivePdfs().then(list => {
    console.log(`掃描完成！耗時 ${((Date.now() - start) / 1000).toFixed(1)} 秒，共找到 ${list.length} 個教學 PDF：`);
    list.forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.path}] ${p.name}`);
    });
  }).catch(console.error);
}
