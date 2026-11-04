// AhaZone 教學資源智慧辨識與配對引擎
import { scanDrivePdfs } from './driveScanner.mjs';

// 課綱關鍵字與標準章節對應表 (擴充涵蓋國高中數學與自然常規章節)
const CHAPTER_MAPPINGS = [
  // 國中自然 (理化 / 生物)
  { keyword: '光學', chapter: '光、影像與顏色', subject: 'science', stage: 'junior', grade: 'j8-sci', gradeLabel: '國二理化' },
  { keyword: '透鏡', chapter: '光、影像與顏色', subject: 'science', stage: 'junior', grade: 'j8-sci', gradeLabel: '國二理化' },
  { keyword: '面鏡', chapter: '光、影像與顏色', subject: 'science', stage: 'junior', grade: 'j8-sci', gradeLabel: '國二理化' },
  { keyword: '直線運動', chapter: '直線運動', subject: 'physics', stage: 'senior', grade: 's10-physics', gradeLabel: '高一物理' },
  { keyword: '平面運動', chapter: '平面運動', subject: 'physics', stage: 'senior', grade: 's11-physics', gradeLabel: '高二物理' },
  { keyword: '牛頓力學', chapter: '牛頓運動定律', subject: 'physics', stage: 'senior', grade: 's11-physics', gradeLabel: '高二物理' },
  { keyword: '運動學', chapter: '直線運動', subject: 'physics', stage: 'senior', grade: 's10-physics', gradeLabel: '高一物理' },
  { keyword: '能量', chapter: '功與動能', subject: 'physics', stage: 'senior', grade: 's10-physics', gradeLabel: '高一物理' },
  { keyword: '電磁學', chapter: '電與磁', subject: 'physics', stage: 'senior', grade: 's10-physics', gradeLabel: '高一物理' },
  { keyword: '數列級數', chapter: '數列與級數', subject: 'math', stage: 'senior', grade: 's10-math', gradeLabel: '高一數學' },
  { keyword: '三角函數', chapter: '三角比', subject: 'math', stage: 'senior', grade: 's10-math', gradeLabel: '高一數學' },
  { keyword: '指數', chapter: '指數與對數', subject: 'math', stage: 'senior', grade: 's10-math', gradeLabel: '高一數學' },
  { keyword: '指對數', chapter: '指數與對數', subject: 'math', stage: 'senior', grade: 's10-math', gradeLabel: '高一數學' },
  { keyword: '標準分解式', chapter: '標準分解式與分數運算', subject: 'math', stage: 'junior', grade: 'j7', gradeLabel: '國一數學' },
  { keyword: '一元一次', chapter: '一元一次方程式', subject: 'math', stage: 'junior', grade: 'j7', gradeLabel: '國一數學' },
  { keyword: '二元一次', chapter: '二元一次聯立方程式', subject: 'math', stage: 'junior', grade: 'j7', gradeLabel: '國一數學' },
  { keyword: '直角坐標', chapter: '直角坐標與二元一次方程式圖形', subject: 'math', stage: 'junior', grade: 'j7', gradeLabel: '國一數學' },
  { keyword: '乘法公式', chapter: '乘法公式與多項式', subject: 'math', stage: 'junior', grade: 'j8', gradeLabel: '國二數學' },
  { keyword: '平方根', chapter: '平方根與畢氏定理', subject: 'math', stage: 'junior', grade: 'j8', gradeLabel: '國二數學' },
  { keyword: '因式分解', chapter: '因式分解', subject: 'math', stage: 'junior', grade: 'j8', gradeLabel: '國二數學' },
  { keyword: '二次函數', chapter: '二次函數', subject: 'math', stage: 'junior', grade: 'j9', gradeLabel: '國三數學' }
];

/**
 * 清洗出給學生看的高質感乾淨標題
 */
export function cleanStudentTitle(rawName) {
  let title = rawName.replace(/\.pdf$/i, '');
  
  // 移除常見內部題庫代碼 (例如: 60707-1, 50219-1, 109f719804)
  title = title.replace(/^\d{5,}(-\d+)?_?/g, '');
  title = title.replace(/\(\d{7,}\)/g, '');
  
  // 移除後綴卷別字眼
  title = title.replace(/[-_]?(題目卷|解析卷|答案卷|解答卷|練習卷|測試卷|試卷|題目|解析|解答|答案)$/g, '');
  title = title.replace(/\((解答卷|解析卷|答案卷|題目卷|解答|答案)\)$/g, '');
  title = title.replace(/（(解答卷|解析卷|答案卷|題目卷|解答|答案)）$/g, '');
  title = title.replace(/[-_]?(題目卷含解答|題目含解答|題目\+解答卷|題目&解析|題目含|含解答|含解析|\+解答卷|\+解答|&解析)$/g, '');
  
  // 移除重複的年級與科目字眼
  title = title.replace(/^(高[一二三]|國[一二三七八九])[上下]?(選修|基礎)?(物理|數學|理化|自然)[I|1]?[-_]?/g, '');
  
  // 去除多餘符號與空白
  title = title.replace(/[-_\s]+$/g, '').trim();
  return title || '精選複習試卷';
}

/**
 * 智慧分析檔案群組
 */
export function analyzeAndGroupFiles(pdfList) {
  const groups = new Map();

  for (const file of pdfList) {
    const name = file.name;
    const isCombined = /(含解答|\+解答|題目&解析|題目含解答)/i.test(name);
    const isAnswer = !isCombined && /(解答|解析|答案)/i.test(name);

    // 計算配對用基底名稱 (Base Key)
    let baseKey = name.replace(/\.pdf$/i, '');
    if (!isCombined) {
      baseKey = baseKey
        .replace(/[-_]?(題目卷|解析卷|答案卷|解答卷|練習卷|測試卷|題目|解析|解答|答案)$/g, '')
        .replace(/\((解答卷|解析卷|答案卷|題目卷|解答|答案)\)$/g, '')
        .replace(/（(解答卷|解析卷|答案卷|題目卷|解答|答案)）$/g, '')
        .trim();
    }

    if (!groups.has(baseKey)) {
      groups.set(baseKey, {
        baseKey,
        questionFile: null,
        answerFile: null,
        combinedFile: null
      });
    }

    const g = groups.get(baseKey);
    if (isCombined) {
      g.combinedFile = file;
    } else if (isAnswer) {
      g.answerFile = file;
    } else {
      g.questionFile = file;
    }
  }

  // 整理成匹配結果
  const matchedEntries = [];

  for (const [baseKey, group] of groups.entries()) {
    // 判斷關聯的章節
    let mapping = CHAPTER_MAPPINGS.find(m => baseKey.includes(m.keyword));
    if (!mapping) {
      const samplePath = (group.questionFile || group.combinedFile || group.answerFile)?.path || '';
      mapping = CHAPTER_MAPPINGS.find(m => samplePath.includes(m.keyword));
    }

    const cleanTitle = cleanStudentTitle(baseKey);
    const hasPair = group.questionFile && group.answerFile;
    const isCombined = !!group.combinedFile;

    matchedEntries.push({
      baseKey,
      cleanTitle,
      mapping: mapping || null,
      type: hasPair ? 'pair' : (isCombined ? 'combined' : 'single'),
      questionFile: group.questionFile,
      answerFile: group.answerFile,
      combinedFile: group.combinedFile || (!hasPair ? group.questionFile : null)
    });
  }

  return matchedEntries;
}

if (process.argv[1]?.endsWith('matchResources.mjs')) {
  console.log('正在快速掃描雲端硬碟並分析配對...\n');
  scanDrivePdfs().then(list => {
    const matched = analyzeAndGroupFiles(list);
    
    const paired = matched.filter(m => m.type === 'pair');
    const combined = matched.filter(m => m.type === 'combined');
    const pairedMapped = paired.filter(m => m.mapping !== null);
    const combinedMapped = combined.filter(m => m.mapping !== null);
    const unmappedPairs = paired.filter(m => m.mapping === null);

    console.log(`========================================================================`);
    console.log(`📊 掃描統計總結：共檢索出 ${matched.length} 組可用教材單元`);
    console.log(`  ✔ 成雙成對試卷 (題目卷 + 詳解卷)：${paired.length} 組`);
    console.log(`  ✔ 題解合一完整卷 (單一 PDF)：${combined.length} 組`);
    console.log(`  ✔ 自動高把握度命中課綱：${pairedMapped.length + combinedMapped.length} 組`);
    console.log(`========================================================================\n`);

    console.log(`------------------------------------------------------------------------`);
    console.log(`【第一類：智慧推薦成對試卷】(已成對且自動比對到課綱章節)`);
    console.log(`------------------------------------------------------------------------`);
    pairedMapped.forEach((m, i) => {
      console.log(`[P${i + 1}] 【${m.mapping.gradeLabel} · ${m.mapping.chapter}】${m.cleanTitle}`);
      console.log(`     題目卷 📄: ${m.questionFile.name}`);
      console.log(`     詳解卷 📝: ${m.answerFile.name}`);
    });

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`【第二類：題解合一完整卷】(題目與解答在同一份 PDF 內)`);
    console.log(`------------------------------------------------------------------------`);
    combined.slice(0, 8).forEach((m, i) => {
      const chapterLabel = m.mapping ? `【${m.mapping.gradeLabel} · ${m.mapping.chapter}】` : '【待指定章節】';
      console.log(`[C${i + 1}] ${chapterLabel} ${m.cleanTitle}`);
      console.log(`     合一卷 📑: ${m.combinedFile.name}`);
    });

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`【第三類：成對但未設定單元關鍵字】(題目卷與詳解卷齊全，待自訂單元)`);
    console.log(`------------------------------------------------------------------------`);
    unmappedPairs.slice(0, 10).forEach((m, i) => {
      console.log(`[U${i + 1}] ${m.cleanTitle} (原檔名: ${m.baseKey})`);
      console.log(`     題目卷 📄: ${m.questionFile.name}`);
      console.log(`     詳解卷 📝: ${m.answerFile.name}`);
    });

    console.log(`\n💡 提示：目前為安全預覽模式，專案程式碼與線上網站「未做任何變更」。`);
    console.log(`   若要挑選特定幾份並自訂名稱掛載，請執行：npm run pick:drive`);
  }).catch(console.error);
}
