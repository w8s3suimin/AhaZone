// AhaZone 互動式 Google Drive 教學資源挑選與發布工具
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanDrivePdfs } from './driveScanner.mjs';
import { analyzeAndGroupFiles, cleanStudentTitle } from './matchResources.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESOURCES_FILE_PATH = path.resolve(__dirname, '../src/data/resources.ts');

function formatCleanTitle(rawTitle) {
  let title = cleanStudentTitle(rawTitle);
  title = title.replace(/[-_\s]+$/g, '').trim();
  if (!title) title = '精選複習卷';
  return title;
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('\n======================================================');
    console.log('   🚀 AhaZone Google Drive 教學資源智慧發布精靈');
    console.log('======================================================');
    console.log('正在掃描您的 Google 雲端硬碟 (約需 2~3 秒)...');

    const pdfList = await scanDrivePdfs();
    const matched = analyzeAndGroupFiles(pdfList);

    const validCandidates = matched.filter(m => m.type === 'pair' || m.type === 'combined');
    const recommended = validCandidates.filter(m => m.mapping !== null);
    const others = validCandidates.filter(m => m.mapping === null);

    console.log(`\n✔ 掃描完成！共發現 ${validCandidates.length} 組可用試卷/講義 (成對雙卷 + 題解合一卷)`);
    console.log(`✔ 其中 ${recommended.length} 組已自動智慧命中 108 課綱推薦章節！\n`);

    console.log('------------------------------------------------------');
    console.log('【系統智慧推薦清單】(已自動配對且命中課綱章節)');
    console.log('------------------------------------------------------');
    recommended.forEach((item, idx) => {
      const typeLabel = item.type === 'pair' ? '雙卷 (題目+詳解)' : '合一卷 (題解合一)';
      const cleanTitle = formatCleanTitle(item.cleanTitle);
      console.log(`[${idx + 1}] 【${item.mapping.gradeLabel} · ${item.mapping.chapter}】${cleanTitle}`);
      console.log(`    類型: ${typeLabel}`);
      if (item.type === 'pair') {
        console.log(`    - 題目卷: ${item.questionFile.name}`);
        console.log(`    - 詳解卷: ${item.answerFile.name}`);
      } else {
        console.log(`    - 完整卷: ${item.combinedFile.name}`);
      }
      console.log('');
    });

    console.log('------------------------------------------------------');
    console.log('操作選項：');
    console.log(' - 輸入編號 (如 1 或 1,3,5) 進行挑選與自訂');
    console.log(' - 輸入 "all" 批次處理所有推薦');
    console.log(' - 輸入 "q" 離開 (安全退出，不變更任何檔案)');
    console.log('------------------------------------------------------');

    const answer = await rl.question('請選擇要處理的項目編號 [q]: ');
    if (!answer || answer.trim().toLowerCase() === 'q') {
      console.log('已退出，未做任何修改。');
      return;
    }

    let selectedIndices = [];
    if (answer.trim().toLowerCase() === 'all') {
      selectedIndices = recommended.map((_, i) => i);
    } else {
      selectedIndices = answer.split(',')
        .map(s => parseInt(s.trim(), 10) - 1)
        .filter(i => i >= 0 && i < recommended.length);
    }

    if (selectedIndices.length === 0) {
      console.log('未選取任何有效項目，已結束。');
      return;
    }

    console.log(`\n您共選取了 ${selectedIndices.length} 個項目，開始逐一確認展示資訊：\n`);

    const finalConfigs = [];

    for (const idx of selectedIndices) {
      const item = recommended[idx];
      const defaultTitle = formatCleanTitle(item.cleanTitle);
      console.log(`======================================================`);
      console.log(`正在設定第 [${idx + 1}] 項: ${item.baseKey}`);
      console.log(`原檔名: ${item.questionFile?.name || item.combinedFile?.name}`);
      console.log(`對應章節: ${item.mapping.gradeLabel} · ${item.mapping.chapter}`);
      
      const customTitle = await rl.question(`請確認學生端看到的展示標題 [直接按 Enter 採用: "${defaultTitle}"]: `);
      const title = customTitle.trim() || defaultTitle;

      const customChapter = await rl.question(`請確認章節名稱 [直接按 Enter 採用: "${item.mapping.chapter}"]: `);
      const chapter = customChapter.trim() || item.mapping.chapter;

      finalConfigs.push({
        id: `res-drive-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`,
        title,
        subtitle: `${item.mapping.gradeLabel} ${chapter} 精選練習`,
        description: `精選 ${chapter} 練習卷，透過 Google 雲端即時載入，題目與解析齊備。`,
        type: item.type === 'pair' ? 'pdf-exam' : 'pdf-paper',
        stage: item.mapping.stage,
        grade: item.mapping.grade,
        gradeLabel: item.mapping.gradeLabel,
        subject: item.mapping.subject,
        subjectLabel: item.mapping.gradeLabel.includes('物理') ? '高中物理' : (item.mapping.gradeLabel.includes('自然') ? '國中自然' : '中學數學'),
        chapter,
        tags: [item.mapping.gradeLabel, chapter, item.type === 'pair' ? '含題目與詳解' : '題解合一'],
        filePath: item.type === 'pair' ? item.questionFile.previewUrl : item.combinedFile.previewUrl,
        answerPath: item.type === 'pair' ? item.answerFile.previewUrl : undefined,
        ahaInsight: '掌握核心觀念與幾何幾何意涵，快速突破常見盲點。',
        learningGoals: ['掌握考題題型與解法思維', '建立關鍵公式與定理直覺'],
        featured: false,
        date: new Date().toISOString().split('T')[0],
        downloads: 0,
        rating: 5.0
      });

      console.log(`✔ 已完成設定：【${chapter}】${title}\n`);
    }

    console.log('\n======================================================');
    console.log('【即將發布的資源預覽】');
    console.log('======================================================');
    console.log(JSON.stringify(finalConfigs, null, 2));

    const confirmWrite = await rl.question('\n請問是否確定將以上資源寫入 AhaZone？(y/N) [預設 N，不修改專案]: ');
    if (confirmWrite.trim().toLowerCase() === 'y') {
      console.log('正在寫入 src/data/resources.ts...');
      let content = await fs.readFile(RESOURCES_FILE_PATH, 'utf-8');
      
      // 在 INITIAL_RESOURCES 陣列末尾注入
      const injection = finalConfigs.map(c => `  ${JSON.stringify(c, null, 2).replace(/\n/g, '\n  ')},`).join('\n\n');
      
      const lastBracket = content.lastIndexOf('];');
      if (lastBracket !== -1) {
        content = content.slice(0, lastBracket) + '\n  // --- Google Drive 自動掛載資源 ---\n' + injection + '\n' + content.slice(lastBracket);
        await fs.writeFile(RESOURCES_FILE_PATH, content, 'utf-8');
        console.log('🎉 寫入成功！您可隨時執行 git commit & push 進行上線發布。');
      } else {
        console.error('找不到 INITIAL_RESOURCES 陣列結尾，未修改。');
      }
    } else {
      console.log('\n🛡️ 安全模式：已取消寫入，專案程式碼與線上網站未做任何變更！');
    }

  } finally {
    rl.close();
  }
}

main().catch(console.error);
