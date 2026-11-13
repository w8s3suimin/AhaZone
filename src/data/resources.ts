import { ResourceItem } from '../types';

export const INITIAL_RESOURCES: ResourceItem[] = [
  // 1. 動態 3D 模擬：圓錐截面幾何解析
  {
    id: 'res-dynamic-conic-sections',
    title: '雙圓錐截面全域幾何分析',
    subtitle: '3D 空間沙漏錐面與 2D 投影漸近線幾何解析',
    description: '利用 Three.js 即時運算雙圓錐在任意傾角 θ (0°~90°) 與平移距離 d 下的截痕曲線。視覺化解析雙曲線、拋物線（臨界平行母線）、橢圓與正圓之幾何本質。',
    type: 'dynamic',
    categoryLabel: '動態 3D 幾何實驗室',
    actionLabel: '啟動 3D 幾何模擬室',
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
    operationTips: [
      {
        title: '1. 3D 視角自由旋轉：',
        desc: '在左側 3D 視圖中，按住滑鼠左鍵拖曳旋轉錐體視角，滾輪縮放視角。',
        color: 'sky'
      },
      {
        title: '2. 觀察漸近線嚴密對偶：',
        desc: '拖曳傾角 θ 至 0°~45°，點擊右上角「切換為：曲線中心對稱視圖」，直觀對比「剛體空間投影」與「標準代數坐標」。',
        color: 'amber'
      },
      {
        title: '3. 臨界拋物線：',
        desc: '將傾角 θ 調整到剛好 45.0°，截面正好平行圓錐母線，此時兩條漸近線夾角壓縮為 0° 重合！',
        color: 'emerald'
      }
    ],
    featured: true,
    date: '2026-11-03',
    downloads: 1420,
    rating: 4.9
  },

  // 2. 高一第一章【數與式】：指數律與常用對數 ｜ 動態訓練卷
  {
    id: 'res-dynamic-exp-log-worksheet',
    title: '指數律與常用對數 ｜ 動態訓練卷',
    description: '精熟高一數與式基礎運算：第一部分指數律化簡 (15題)，第二部分常用對數求值 (15題)。支援隨機出題與 A4 列印。',
    type: 'dynamic',
    categoryLabel: '動態訓練卷',
    actionLabel: '開啟動態訓練卷',
    stage: 'senior',
    grade: 's10-math',
    gradeLabel: '高一數學',
    subject: 'math',
    subjectLabel: '高中數學',
    chapter: '數與式',
    tags: ['動態訓練卷', '數與式', '高一數學', '指數律', '常用對數', 'A4列印'],
    filePath: '/tools/exp-log-worksheet.html',
    ahaInsight: '指數律化簡「同底相乘指數相加、負次方倒數反轉」；常用對數拆解質因數掌握小數估算與符號化簡！',
    learningGoals: [
      '熟練分數次方與負整數指數的快速化簡互換',
      '精熟常用對數真數相乘除拆解與小數運算估計',
      '隨機無限出題，建立學生扎實無死角的計算基本功'
    ],
    operationTips: [
      {
        title: '1. 重新隨機出題 (快捷鍵 R)：',
        desc: '點擊上方工具列「重新出題」按鈕（或按鍵盤 R 鍵），立即由演算法重新產生全新 30 道題目與對應解答。',
        color: 'sky'
      },
      {
        title: '2. 題目旁解答即時切換：',
        desc: '點擊「顯示答案」可在題目等號後方直接呈現答案，適合課堂投影演示、快速批改或自修檢驗。',
        color: 'amber'
      },
      {
        title: '3. 標準 A4 列印 / 存為 PDF (快捷鍵 P)：',
        desc: '點擊「列印 / 另存 PDF」，自動隱藏網頁邊界與按鈕，輸出精確兩頁（試卷與解答卷）標準 A4 考卷。',
        color: 'emerald'
      }
    ],
    featured: true,
    date: '2026-11-03',
    downloads: 1420,
    rating: 4.9
  },

  // 3. 高二【指數函數與對數函數】：對數律 ｜ 動態訓練卷
  {
    id: 'res-dynamic-log-laws-worksheet',
    title: '對數律 ｜ 動態訓練卷',
    subtitle: 'P1 基本題型 (20題) ｜ P2 綜合題型 (20題) ｜ 附即時解答',
    description: '精準掌握對數律運算技能：第一頁聚焦四大基本題型單一運算訓練，第二頁提供綜合題型隨機破題演練。支援自訂種子碼出題與標準 A4 列印。',
    type: 'dynamic',
    categoryLabel: '動態訓練卷',
    actionLabel: '開啟對數律訓練卷',
    stage: 'senior',
    grade: 's11-math',
    gradeLabel: '高二數學',
    subject: 'math',
    subjectLabel: '高中數學',
    chapter: '指數函數與對數函數',
    tags: ['動態訓練卷', '種子隨機', '指數函數與對數函數', '高二數學', '對數律', 'A4列印'],
    filePath: '/tools/log-laws-worksheet.html',
    ahaInsight: '對數運算關鍵在於觀察底數與真數：同底優先分合，不同底善用換底與連鎖，次方善用次係提降，指數型對數善用消底！',
    learningGoals: [
      '熟練分合公式的雙向拆項與合併運算',
      '掌握次係公式底數與真數次方的提降係數技巧',
      '靈活運用換底公式與倒數連鎖相消',
      '精熟指數型對數的底真對調與消底求值'
    ],
    operationTips: [
      {
        title: '1. 種子碼精準控制 (Seed PRNG)：',
        desc: '上方輸入框可輸入指定種子（如 LOG-8801），點擊「套用」即可產生固定試卷，全班共享同組題目。',
        color: 'sky'
      },
      {
        title: '2. 快速換卷 (快捷鍵 R)：',
        desc: '點擊「換一卷」或按鍵盤 R，即可動態生成全新隨機種子與 40 道運算題。',
        color: 'indigo'
      },
      {
        title: '3. 題目旁即時核對 (快捷鍵 A)：',
        desc: '點擊「顯示答案」可在每題等號後方顯示漂亮解答；亦可開啟第 3 頁獨立標準解答頁。',
        color: 'amber'
      },
      {
        title: '4. 雙頁標準 A4 輸出 (快捷鍵 P)：',
        desc: '點擊「列印 / PDF」，瀏覽器自動排版為第一頁（基本卷）、第二頁（綜合卷）及第三頁（解答單）。',
        color: 'emerald'
      }
    ],
    featured: true,
    date: '2026-11-13',
    downloads: 980,
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
