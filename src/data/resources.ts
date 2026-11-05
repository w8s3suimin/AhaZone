import { ResourceItem } from '../types';

export const INITIAL_RESOURCES: ResourceItem[] = [
  // 1. 動態 3D 模擬：圓錐截面幾何解析
  {
    id: 'res-dynamic-conic-sections',
    title: '雙圓錐截面全域幾何分析',
    subtitle: '3D 空間沙漏錐面與 2D 投影漸近線幾何解析',
    description: '利用 Three.js 即時運算雙圓錐在任意傾角 θ (0°~90°) 與平移距離 d 下的截痕曲線。視覺化解析雙曲線、拋物線（臨界平行母線）、橢圓與正圓之幾何本質。',
    type: 'dynamic',
    stage: 'senior',
    grade: 's11-math',
    gradeLabel: '高二 (數B專屬)',
    subject: 'math',
    subjectLabel: '高中數學',
    chapter: '空間概念與空間坐標',
    tags: ['動態3D', '數B專屬', '空間概念與空間坐標', '圓錐截面', '日晷光影'],
    filePath: '/simulations/conic-sections.html',
    ahaInsight: '當平面傾角 θ = 半頂角 α (45°) 時，截面平行母線形成「拋物線」臨界；θ < α 同時割雙錐兩葉成「雙曲線」；θ > α 則截斷單葉封閉成「橢圓」。',
    learningGoals: [
      '理解錐體截面角度與二次曲線分類的幾何關係',
      '觀察過頂點基準面 π₀ 漸近線母線如何與平移截面 π_d 的曲線在無窮遠處貼合',
      '切換「剛體垂直投影」與「曲線中心對稱視圖」驗證對稱軸與中心位移'
    ],
    featured: true,
    date: '2026-11-03',
    downloads: 1420,
    rating: 4.9
  },

  // 2. 指數律與對數律動態隨機出題卷（無限題庫）
  {
    id: 'res-dynamic-exp-log-worksheet',
    title: '指數律與對數律自動化出題訓練卷（無限隨機題庫）',
    subtitle: '一鍵動態出題 ｜ 仿真 A4 試卷 ｜ 支援即時列印與標準答案頁',
    description: '依據高中數學常考運算演算法，一鍵隨機生成 30 道精選指數律與常用對數律基礎運算題。具備仿真標準 A4 試卷排版，點擊重新整理即可產生全新試卷與對應解答，支援瀏覽器一鍵列印成實體紙本測驗卷。',
    type: 'dynamic',
    stage: 'senior',
    grade: 's11-math',
    gradeLabel: '高二數學',
    subject: 'math',
    subjectLabel: '高中數學',
    chapter: '指數函數與對數函數',
    tags: ['動態出題', '無限題庫', '指數律', '對數律', 'A4列印', '課堂測驗'],
    filePath: '/tools/exp-log-worksheet.html',
    ahaInsight: '指數律化簡「底數同次先對消、負次方倒數反轉」；對數律將真數質因數相乘拆解為對數相加減，隨心掌握精準四位小數與符號化簡！',
    learningGoals: [
      '熟練分數次方與負整數指數的快速化簡互換',
      '精熟常用對數真數相乘除拆解與小數運算估計',
      '隨機無限出題，建立學生扎實無死角的計算基本功'
    ],
    featured: true,
    date: '2026-11-05',
    downloads: 856,
    rating: 5.0
  },

  // --- 由 Python 發布器自動掛載的 Google Drive 資源 ---
  {
    "id": "res-drive-1a1a74cb443",
    "title": "高一下三角函數重點整理",
    "subtitle": "三角比性質、公式推導與實戰試卷",
    "description": "精選高一數學三角比單元重點練習卷，內含核心公式解析與常考題型，隨附完整詳解卷，可線上預覽或下載列印。",
    "type": "pdf-exam",
    "stage": "senior",
    "grade": "s10-math",
    "gradeLabel": "高一數學",
    "subject": "math",
    "subjectLabel": "高中數學",
    "chapter": "三角比",
    "tags": [
      "高一數學",
      "三角比",
      "含題目與詳解"
    ],
    "filePath": "https://drive.google.com/file/d/1-DsoKOxKeVXdJdupGGRWJT93aBtN4qy_/preview",
    "featured": false,
    "date": "2026-11-05",
    "downloads": 0,
    "rating": 5.0,
    "answerPath": "https://drive.google.com/file/d/1rVWwnW3QKc1tPzOaat7WKnRJhxpbHUtf/preview"
  },
];
