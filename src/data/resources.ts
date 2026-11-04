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
    chapter: '圓錐截面',
    tags: ['動態3D', '數B專屬', '圓錐截面', '雙圓錐', '幾何解析', '日晷光影'],
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

  // 2. 高一上數學第一次段考複習卷
  {
    id: 'res-pdf-math-g10-exam1',
    title: '高一上第一次段考數學複習卷 (含題目卷與詳解)',
    subtitle: '實數運算、絕對值不等式、乘法公式與多項式餘式定理綜合演練',
    description: '精選第一學期第一次段考高頻題型，涵蓋絕對值幾何意涵、算幾不等式、多項式除法原理與綜合除法，附完整手寫詳細解析卷。',
    type: 'pdf-exam',
    stage: 'senior',
    grade: 's10-math',
    gradeLabel: '高一',
    subject: 'math',
    subjectLabel: '高中數學',
    chapter: '實數與絕對值不等式',
    tags: ['段考複習', '題目卷', '詳解卷', '多項式', '絕對值不等式'],
    filePath: '/papers/senior-math-g10-exam1-q.pdf',
    answerPath: '/papers/senior-math-g10-exam1-a.pdf',
    ahaInsight: '絕對值不等式 |x - a| < d 代表「數線上 x 到 a 的距離小於 d」，利用中心點與距離幾何法，秒殺代數聯立分段討論。',
    learningGoals: [
      '熟練利用距離概念拆解絕對值方程式與不等式',
      '掌握多項式除法原理 f(x) = g(x)q(x) + r(x) 的設式技巧'
    ],
    featured: true,
    date: '2026-10-15',
    downloads: 890,
    rating: 4.8
  },

  // 3. 高一下三角函數重點整理與精選練習
  {
    id: 'res-pdf-math-g10-trig',
    title: '高一下三角函數核心觀念整理與練習卷',
    subtitle: '銳角三角比、廣義角、正弦餘弦定理與三角測量統整',
    description: '濃縮 108 課綱高一下三角函數精華，整理特殊角、象限正負號規律、同界角與極坐標互換，隨附實戰模擬題與完整步驟解答。',
    type: 'pdf-lecture',
    stage: 'senior',
    grade: 's10-math',
    gradeLabel: '高一',
    subject: 'math',
    subjectLabel: '高中數學',
    chapter: '廣義角與三角比',
    tags: ['重點整理', '三角函數', '正弦餘弦', '公式彙整'],
    filePath: '/papers/senior-math-g10-trig-practice.pdf',
    answerPath: '/papers/senior-math-g10-trig-answer.pdf',
    ahaInsight: '廣義角三角函數不用死記正負號，只需牢記單位圓上「x 坐標是 cos，y 坐標是 sin」，象限正負立即自然浮現。',
    learningGoals: [
      '融會貫通單位圓定義與三角函數比值',
      '靈活運用正弦定理（外接圓直徑關係）與餘弦定理（三邊求一角）'
    ],
    featured: true,
    date: '2026-09-20',
    downloads: 1250,
    rating: 4.9
  },

  // 4. 高一物理全冊綜合測試卷
  {
    id: 'res-pdf-physics-g10-exam',
    title: '高一基礎物理全範圍評量測試卷',
    subtitle: '牛頓運動定律、能量守恆、電磁交互作用基礎診斷',
    description: '依據 108 課綱高中物理核心素養設計，題目結合日常生活情境題與跨單元觀念，含題目卷與完整解答卷。',
    type: 'pdf-exam',
    stage: 'senior',
    grade: 's10-phy',
    gradeLabel: '高一',
    subject: 'physics',
    subjectLabel: '高中物理',
    chapter: '物體的運動與牛頓力學',
    tags: ['基礎物理', '題目卷', '答案卷', '能量守恆', '牛頓力學'],
    filePath: '/papers/senior-physics-g10-exam-q.pdf',
    answerPath: '/papers/senior-physics-g10-exam-a.pdf',
    ahaInsight: '合力 F_net 是物體產生「加速度」的原因，而非「維持速度」的原因；沒有外力時，物體會保持等速直線運動。',
    learningGoals: [
      '精確繪製受力分析圖（自由體圖 FBD）',
      '辨別功能定理中作功正負與動能變化的物理實體'
    ],
    featured: false,
    date: '2026-08-30',
    downloads: 620,
    rating: 4.7
  },

  // 5. 高二選修物理I 直線運動與等加速度深度解析卷
  {
    id: 'res-pdf-physics-g11-linear',
    title: '高二上選修物理I：直線運動複習卷',
    subtitle: 'v-t 圖斜率與面積物理意義、等加速度三公式推導與應用',
    description: '深入探討瞬時速度、平均速度、加速度與微積分斜率面積意涵。包含經典落體運動、追趕問題與兩階段加速減速難題，附標準答案卷。',
    type: 'pdf-exam',
    stage: 'senior',
    grade: 's11-phy',
    gradeLabel: '高二 (選物)',
    subject: 'physics',
    subjectLabel: '高中物理',
    chapter: '直線運動 (v-t 圖、等加速度公式解析)',
    tags: ['選修物理', '直線運動', 'v-t圖', '加速度', '手寫解析'],
    filePath: '/papers/senior-physics-g11-linear-motion-q.pdf',
    answerPath: '/papers/senior-physics-g11-linear-motion-a.pdf',
    ahaInsight: '遇到複雜的等加速度與變速題目，不要急著代公式。「畫出 v-t 圖」：斜率就是加速度 a，圖形下方曲線面積就是位移 Δx。',
    learningGoals: [
      '透過幾何圖形直觀轉化運動學三公式',
      '熟練解決多階段運動與兩車追及相遇臨界判斷'
    ],
    featured: true,
    date: '2026-10-01',
    downloads: 940,
    rating: 4.9
  },

  // 6. 國中八年級數學第三冊第一章複習
  {
    id: 'res-pdf-junior-math-g8-ch1',
    title: '國二數學第三冊第一章：乘法公式與多項式複習卷',
    subtitle: '和平方、差平方、平方差公式與多項式四則運算素養卷',
    description: '針對國二上學期第一次段考第一單元精心命題，強化乘法公式幾何面積圖示推導、多項式直式分離係數法乘除運算，內附題目卷與答案卷。',
    type: 'pdf-exam',
    stage: 'junior',
    grade: 'j8',
    gradeLabel: '國二',
    subject: 'math',
    subjectLabel: '國中數學',
    chapter: '乘法公式',
    tags: ['國二數學', '乘法公式', '多項式四則', '段考複習', '題目與解答'],
    filePath: '/papers/junior-math-g8-ch1-review-q.pdf',
    answerPath: '/papers/junior-math-g8-ch1-review-a.pdf',
    ahaInsight: '(a + b)² = a² + 2ab + b² 不是冰冷的字母，畫一個邊長 (a+b) 的大正方形，它由 1 個邊長 a 的正方形、1 個邊長 b 的正方形與 2 個 a×b 長方形組成。',
    learningGoals: [
      '建立乘法公式的幾何直觀心像',
      '掌握多項式除法缺項補零與分離係數法的運算精準度'
    ],
    featured: true,
    date: '2026-09-12',
    downloads: 1100,
    rating: 4.8
  }
];
