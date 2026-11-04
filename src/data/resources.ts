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

  // --- 由 Python 發布器自動掛載的 Google Drive 資源 ---
  {
    "id": "res-drive-1a1a74cb443",
    "title": "高一下三角函數重點整理",
    "subtitle": "高一數學 三角比 精選練習",
    "description": "精選 三角比 練習卷，透過 Google 雲端即時載入，題目與解析齊備。",
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
    "ahaInsight": "掌握核心觀念與幾何幾何意涵，快速突破常見盲點。",
    "learningGoals": [
      "掌握考題題型與解法思維",
      "建立關鍵公式與定理直覺"
    ],
    "featured": false,
    "date": "2026-11-05",
    "downloads": 0,
    "rating": 5.0,
    "answerPath": "https://drive.google.com/file/d/1rVWwnW3QKc1tPzOaat7WKnRJhxpbHUtf/preview"
  },
];
