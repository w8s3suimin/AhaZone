import { CURRICULUM_DATA } from './curriculum';

export interface ChapterSummary {
  chapter: string;
  mathTrack?: 'mathA' | 'mathB' | 'common' | 'none'; // 數A / 數B / 數A+B共同 / 非高中數學
  scopeNotice?: string; // 課綱進度與考試定位
  ahaInsight: string; // 核心觀念精要
  coreConcepts: {
    title: string;
    description: string;
    formula?: string;
  }[];
  pitfalls: string[]; // 常見迷思與避坑提醒
}

export const CHAPTER_SUMMARIES: Record<string, ChapterSummary> = {
  // =========================================================================
  // 【國中自然 - 七年級生物】
  // =========================================================================
  '生命現象與細胞構造': {
    chapter: '生命現象與細胞構造',
    mathTrack: 'none',
    scopeNotice: '【國一上第一次段考核心】國中生物基礎。重點在於動植物細胞構造差異、顯微鏡操作倍率與視野關係，以及物質進出細胞的擴散與滲透機制。',
    ahaInsight: '細胞膜如同門禁管制，不是所有物質都能自由進出！脂溶性物質與微小氣體分子（水、氧氣、二氧化碳）靠「單純擴散」直接穿透磷脂質；葡萄糖、胺基酸與離子則必須藉由細胞膜上的「蛋白質通道」才能通過。',
    coreConcepts: [
      {
        title: '動植物細胞構造對照',
        description: '植物細胞特有「細胞壁（維持細胞形狀、保護）」與「葉綠體（光合作用）」；植物成熟細胞具有大型中央「液胞（儲存水分與廢物）」，動物細胞液胞則小而多。細胞核含有遺傳物質 DNA，為生命中樞。'
      },
      {
        title: '顯微鏡操作關鍵法則',
        description: '低倍鏡轉高倍鏡時：視野變小、視野變暗、細胞變大、看到的細胞數變少。複式顯微鏡成像為「倒立放大虛像（上下左右皆顛倒）」，標本偏向左上方時，玻片需往「左上方」移動才能移回視野中央。'
      },
      {
        title: '滲透作用與細胞吸水失水',
        description: '置於高濃度食鹽水（高張溶液）中：水分向外滲透，植物細胞壁不變但「原生質萎縮分離」，動物紅血球「萎縮」；置於純水中：紅血球「膨脹破裂」，植物細胞因有細胞壁而「膨脹不破裂」。'
      }
    ],
    pitfalls: [
      '混淆「細胞壁」與「細胞膜」的功能：控制物質進出的守門員是「細胞膜」，細胞壁只提供支持與保護，全透性無選擇能力。',
      '複式顯微鏡調整焦距時，高倍鏡下嚴禁轉動「粗調節輪」，否則易壓碎玻片標本。'
    ]
  },

  '生物體的組成層次與養分': {
    chapter: '生物體的組成層次與養分',
    mathTrack: 'none',
    scopeNotice: '【國一上學期】理解單細胞生物與多細胞生物在組織分工上的演化優勢，以及人體六大營養素、酵素活性受溫度酸鹼值影響。',
    ahaInsight: '酵素是生物體內的催化劑，成分是蛋白質！酵素具有「專一性」（一種酵素只催化一種特定受質，如澱粉酶只分解澱粉）。酵素不是消耗品，反應前後質量與性質不變。',
    coreConcepts: [
      {
        title: '生物體的組成層次',
        description: '動物：細胞 ➜ 組織 ➜ 器官 ➜ 器官系統 ➜ 個體；植物「沒有器官系統」，層次為：細胞 ➜ 組織 ➜ 器官（根莖葉花果實種子） ➜ 個體。單細胞生物（如草履蟲、變形蟲）一個細胞即為一個完整個體。'
      },
      {
        title: '光合作用兩階段反應',
        description: '光反應在葉綠體基粒進行：吸收光能將水分解為氧氣（釋放）與能量；碳反應（暗反應）在葉綠體基質進行：利用能量將二氧化碳合成為葡萄糖與水。'
      }
    ],
    pitfalls: [
      '植物不只有營養器官，花、果實、種子是「生殖器官」，根、莖、葉才是「營養器官」。',
      '酵素高溫（通常超過 60°C）會變性永久失去活性，即使降溫也無法復原；低溫僅是活性降低，回溫後仍可恢復催化功能。'
    ]
  },

  '生物體內部的運輸與消化循環': {
    chapter: '生物體內部的運輸與消化循環',
    mathTrack: 'none',
    scopeNotice: '【國一上學期】植物維管束（木質部、韌皮部）水分養分運送方向，以及人體雙循環系統（體循環、肺循環）與心臟瓣膜結構。',
    ahaInsight: '水往高處爬靠的是「蒸散作用」強大的拉力！木質部運送水分與礦物質，方向永遠「由下往上」；韌皮部運送光合作用製造的養分（糖類），方向可「由上往下」或「由下往上」雙向運送。',
    coreConcepts: [
      {
        title: '心臟腔室與血流方向',
        description: '心房接收血液，心室將血液射出：右心房 ➜ 右心室 ➜ 肺動脈 ➜ 肺部微血管 ➜ 肺靜脈 ➜ 左心房 ➜ 左心室 ➜ 主動脈 ➜ 全身微血管 ➜ 上下大靜脈 ➜ 回到右心房。'
      },
      {
        title: '消化系統與酵素分解',
        description: '口腔（唾液澱粉酶）➜ 胃（胃蛋白酶、鹽酸殺菌）➜ 小腸（胰液、腸液，分解醣類、蛋白質、脂質，膽汁乳化脂肪但不含酵素）➜ 大腸（吸收水分形成糞便）。'
      }
    ],
    pitfalls: [
      '肺動脈流的是缺氧血（暗紅色），肺靜脈流的是充氧血（鮮紅色），動脈不等於充氧血！',
      '膽汁由「肝臟」製造，儲存於「膽囊」，在「小腸」注入發揮乳化作用。膽汁中不含任何消化酵素。'
    ]
  },

  // =========================================================================
  // 【國中理化】
  // =========================================================================
  '基本測量與密度': {
    chapter: '基本測量與密度',
    mathTrack: 'none',
    scopeNotice: '【國二上第一次段考】國中理化起點，涵蓋長度體積測量、估計值、天平操作原則與密度定義。',
    ahaInsight: '測量結果必包含「一組準確數值」加上「一位估計數值」！最小刻度是哪一位，估計值就落在最小刻度的下一位。密度是物質的特性，與物體的形狀、大小、體積無關。',
    coreConcepts: [
      {
        title: '密度定義公式',
        description: '密度 D = 質量 M / 體積 V。同種物質在固定溫度壓力下，質量與體積成正比，其比值（密度）為定值。',
        formula: 'D = \\frac{M}{V}'
      },
      {
        title: '浮沉判斷法則',
        description: '物體密度小於液體密度則浮於液面；物體密度大於液體密度則沉入底端；物體密度等於液體密度則懸浮於液體中任意位置。'
      }
    ],
    pitfalls: [
      '量筒內測量水銀體積時，視線須與「凸面最高點」等高；測量水體積時，視線須與「凹面最低點」等高。',
      '天平使用前必須「歸零」；校準時若左盤較重，校準螺盤需向「右」調節。'
    ]
  },

  '光學 (光的反射、折射與面鏡透鏡成像)': {
    chapter: '光學 (光的反射、折射與面鏡透鏡成像)',
    mathTrack: 'none',
    scopeNotice: '【國二上學期核心】反射定律、折射偏向規律（快慢介質判別）、凸透鏡與凹透鏡實像虛像作圖。',
    ahaInsight: '光走得快的介質角度大，走得慢的介質角度小！光從空氣（快）進入水或玻璃（慢）時，折射角小於入射角（偏向法線）；從慢入快時，折射角大於入射角（偏離法線）。',
    coreConcepts: [
      {
        title: '凸透鏡成像規律（三條特殊光線）',
        description: '1. 物在兩倍焦距外：成倒立縮小實像（照相機原理）；2. 物在兩倍焦距上：成倒立等大實像；3. 物在一倍至兩倍焦距間：成倒立放大實像（投影機原理）；4. 物在一倍焦距內：成正立放大虛像（放大鏡原理）。'
      },
      {
        title: '凹透鏡成像特點',
        description: '不論物體置於凹透鏡前方任何距離，皆只能生成「正立、縮小、正向同側」的虛像（近視眼鏡原理）。'
      }
    ],
    pitfalls: [
      '實像必為「倒立」，虛像必為「正立」；實像能呈現在紙屏上，虛像無法投影在紙屏上，只能用肉眼透過鏡片觀察。',
      '近視眼是由於眼球前後徑過長或水晶體折光力太強，成像於視網膜「前方」，需配戴「凹透鏡」矯正。'
    ]
  },

  '化學反應與質量守恆定律': {
    chapter: '化學反應與質量守恆定律',
    mathTrack: 'none',
    scopeNotice: '【國二下學期核心】原子說、化學反應式平衡、莫耳數與亞佛加厥常數、化學計量計算。',
    ahaInsight: '化學反應只是「原子的重新排列組合」，反應前後原子的種類、數目與質量永遠不增不減！質量守恆定律在密閉系統中恆成立。',
    coreConcepts: [
      {
        title: '莫耳數的三大轉換橋樑',
        description: '1. 莫耳數 = 質量(g) / 原子量或分子量；2. 莫耳數 = 粒子總數 / (6 × 10²³)；3. 反應式係數比 = 反應消耗或生成的「莫耳數比」=「分子數比」≠「質量比」。',
        formula: 'n = \\frac{m}{M} = \\frac{N}{6.02 \\times 10^{23}}'
      }
    ],
    pitfalls: [
      '開放容器中燃燒木炭，質量看似減輕是因為生成二氧化碳氣體逸散至空氣中，若計入氣體質量依然守恆。',
      '平衡化學反應式時，絕不可隨意更改化合物右下角的原子下標，只能更動式子前方的平衡係數。'
    ]
  },

  // =========================================================================
  // 【國中數學】
  // =========================================================================
  '整數的運算與數線': {
    chapter: '整數的運算與數線',
    mathTrack: 'none',
    scopeNotice: '【國一上第一次段考】國中數學奠基章節。掌握正負數幾何意義、相反數、絕對值與乘除正負號法則。',
    ahaInsight: '減一個數，等於「加上它的相反數」！數線上的距離就是大數減小數，兩點 A(a)、B(b) 的距離永遠等於 |a - b|，絕無負距離。',
    coreConcepts: [
      {
        title: '正負數運算法則',
        description: '同號相乘除得正，異號相乘除得負。遇括號先算小括號、中括號，先乘除後加減。',
        formula: '(-a) \\times (-b) = a \\times b, \\quad (-a) \\times b = -(a \\times b)'
      },
      {
        title: '相反數與絕對值幾何意義',
        description: '數線上與原點距離相等的相異兩點互為相反數（a + (-a) = 0）。點 x 到原點的距離即為 |x|。'
      }
    ],
    pitfalls: [
      '負數連乘時：負號個數為偶數個則積為正，負號個數為奇數個則積為負。',
      '注意 (-3)² 與 -3² 的差異：(-3)² = 9，而 -3² = -(3×3) = -9。'
    ]
  },

  '因數分解與標準分解式': {
    chapter: '因數分解與標準分解式',
    mathTrack: 'none',
    scopeNotice: '【國一上第一次段考】掌握質數判別法、短除法、標準分解式求最大公因數 (GCD) 與最小公倍數 (LCM)。',
    ahaInsight: '將合數寫成標準分解式就像拆解樂高積木！求最大公因數就找「共同質因數的最低次方」；求最小公倍數就找「所有出現質因數的最高次方」。兩數乘積恆等於其 GCD 與 LCM 之積！',
    coreConcepts: [
      {
        title: '標準分解式求 GCD 與 LCM',
        description: '設 A = 2³ × 3² × 5，B = 2² × 3³ × 7。則 GCD(A, B) = 2² × 3² = 36；LCM(A, B) = 2³ × 3³ × 5 × 7 = 7560。',
        formula: 'A \\times B = \\gcd(A, B) \\times \\text{lcm}(A, B)'
      },
      {
        title: '質數判別法',
        description: '檢驗正整數 n 是否為質數，只需檢查小於等於 √n 的所有質數能否整除 n 即可。'
      }
    ],
    pitfalls: [
      '1 不是質數也不是合數；2 是唯一的偶數質數。',
      '互質的兩數不一定要各自是質數（例如 8 與 9 互質，但兩者皆為合數）。'
    ]
  },

  '乘法公式與多項式運算': {
    chapter: '乘法公式與多項式運算',
    mathTrack: 'none',
    scopeNotice: '【國二上第一次段考重點】銜接因式分解與一元二次方程式的關鍵基石。',
    ahaInsight: '(a + b)² = a² + 2ab + b² 代表邊長 (a+b) 的正方形面積，切成 a²、b² 兩個正方形與 2 個 ab 長方形。牢記中間項是 2ab！',
    coreConcepts: [
      {
        title: '三大核心乘法公式',
        description: '和平方：(a+b)² = a² + 2ab + b²；差平方：(a-b)² = a² - 2ab + b²；平方差：(a+b)(a-b) = a² - b²。',
        formula: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2, \\quad a^2 - b^2 = (a+b)(a-b)'
      },
      {
        title: '多項式除法原理',
        description: '被除式 = 除式 × 商式 + 餘式。餘式的次數必嚴格小於除式的次數（若除式為一次式，餘式必為常數）。'
      }
    ],
    pitfalls: [
      '漏掉中間項：常誤寫 (a + b)² = a² + b²。',
      '多項式直式除法缺項時未補 0 導致位數對齊錯誤。'
    ]
  },

  // =========================================================================
  // 【高中數學】
  // =========================================================================
  '實數與絕對值不等式': {
    chapter: '實數與絕對值不等式',
    mathTrack: 'common',
    scopeNotice: '【高一上第 1 冊 數A+B 共同核心】絕對值幾何意義、算幾不等式求極值、雙重根號化簡。',
    ahaInsight: '絕對值 |x - c| < r 代表「數線上點 x 到中心 c 的距離小於半徑 r」，解集直接寫成 c - r < x < c + r，免去代數正負分段討論。',
    coreConcepts: [
      {
        title: '絕對值幾何距離法',
        description: '方程式 |x - a| = d 表示數線上與 a 距離為 d 的兩點 (a ± d)。不等式 |x - a| < d 即區間 (a-d, a+d)。',
        formula: '|x - c| < r \\iff c - r < x < c + r'
      },
      {
        title: '算幾不等式',
        description: '若 a, b > 0，則 (a+b)/2 ≥ √(ab)。當且僅當 a = b 時等號成立。常用於「和為定值求積的最大值」或「積為定值求和的最小值」。',
        formula: '\\frac{a+b}{2} \\ge \\sqrt{ab}'
      }
    ],
    pitfalls: [
      '使用算幾不等式時未檢查條件是否「全為正數」，以及等號成立條件能否發生。',
      '循環小數化分數時公式背錯：純循環小數分母全為 9，混循環小數循環位補 9，不循環位補 0。'
    ]
  },

  '多項式函數 (餘式定理、綜合除法)': {
    chapter: '多項式函數 (餘式定理、綜合除法)',
    mathTrack: 'common',
    scopeNotice: '【高一上第 1 冊 數A+B 共同核心】多項式除法原理、餘式定理 f(a)、因式定理與牛頓一次因式檢驗法。',
    ahaInsight: '多項式 f(x) 除以 (x - a) 的餘式就是「令除式為零代入」的函數值 f(a)！求餘式不需要真正做長除法，代入 x = a 即可求出。',
    coreConcepts: [
      {
        title: '除法原理與餘式定理',
        description: '設 f(x) 除以 g(x) 商為 q(x)，餘式為 r(x)，則 f(x) = g(x)q(x) + r(x)，其中 deg(r) < deg(g)。若除式為一次式 (x - c)，則餘式常數 r = f(c)。',
        formula: 'f(x) = (x - c)q(x) + f(c)'
      },
      {
        title: '三次函數對稱中心與圖形局部分析',
        description: '三次函數 f(x) = ax³ + bx² + cx + d 的圖形必關於反曲點對稱中心 (h, k) 點對稱，其中 h = -b / (3a)。'
      }
    ],
    pitfalls: [
      '除式為 (ax - b) 時，餘式依然是 f(b/a)，但綜合除法求出的商式各項係數必須再除以 a。',
      '高次不等式畫數線穿針引線法時，偶數次方根「切點不穿透」，奇數次方根「穿透交點」。'
    ]
  },

  '廣義角與三角比': {
    chapter: '廣義角與三角比',
    mathTrack: 'common',
    scopeNotice: '【高一下第 2 冊 數A+B 共同核心】有向角、象限角、特殊角三角比、同界角與極坐標。',
    ahaInsight: '廣義角三角函數不用死記「正負號口訣」！在單位圓上，任意角度 θ 的終邊與圓交點坐標就是 (cos θ, sin θ)。看交點在第幾象限，坐標的正負立即決定三角比的正負！',
    coreConcepts: [
      {
        title: '單位圓上的三角函數定義',
        description: '以原點為圓心、半徑為 1 的單位圓上，有向角 θ 的終邊交點 P 坐標定義為 (cos θ, sin θ)。斜率即為 tan θ = sin θ / cos θ。',
        formula: 'x = \\cos\\theta, \\quad y = \\sin\\theta, \\quad \\sin^2\\theta + \\cos^2\\theta = 1'
      },
      {
        title: '化任意角為銳角 (奇變偶不變，符號看象限)',
        description: 'sin(180° - θ) = sin θ, cos(180° - θ) = -cos θ；sin(90° - θ) = cos θ, cos(90° - θ) = sin θ。'
      }
    ],
    pitfalls: [
      '計算 tan 90° 與 tan 270° 時未注意無意義（分母 cos θ = 0）。',
      '極坐標 [r, θ] 中，半徑 r 規定必須大於等於 0。'
    ]
  },

  '正弦定理、餘弦定理與三角測量': {
    chapter: '正弦定理、餘弦定理與三角測量',
    mathTrack: 'common',
    scopeNotice: '【高一下第 2 冊 數A+B 共同核心】斜三角形邊角關係、外接圓半徑 R、三角形面積公式與海龍公式。',
    ahaInsight: '何時用正弦？何時用餘弦？「已知對邊對角」或「外接圓直徑」用正弦定理；「已知兩邊夾一角」或「三邊求角」必用餘弦定理！',
    coreConcepts: [
      {
        title: '正弦定理與外接圓',
        description: 'a / sin A = b / sin B = c / sin C = 2R，其中 R 為 ΔABC 外接圓半徑。',
        formula: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R'
      },
      {
        title: '餘弦定理',
        description: 'a² = b² + c² - 2bc cos A；變形為 cos A = (b² + c² - a²) / (2bc)。',
        formula: 'a^2 = b^2 + c^2 - 2bc \\cos A'
      },
      {
        title: '三角形面積公式全家桶',
        description: 'Area = (1/2)ab sin C = abc / (4R) = rs = √[s(s-a)(s-b)(s-c)]，其中 s = (a+b+c)/2。'
      }
    ],
    pitfalls: [
      '正弦定理利用兩邊與其中一邊對角 (SSA) 求另一個角時，可能出現「一解或兩解（鈍角銳角皆可能）」的情況，需檢驗三角形內角和大於 180° 的限制。'
    ]
  },

  '差角公式與倍半角公式': {
    chapter: '差角公式與倍半角公式',
    mathTrack: 'mathA',
    scopeNotice: '【高二上第 3A 冊 數A專屬】差角、和角、二倍角、半角公式僅於數A評量；數B不考此單元。',
    ahaInsight: '所有差角和角公式皆可由「單位圓上兩向量內積」推得：向量 u=(cosα, sinα) 與 v=(cosβ, sinβ) 的內積即為 cos(α-β) = cosα cosβ + sinα sinβ。',
    coreConcepts: [
      {
        title: '正餘弦和差角公式',
        description: 'cos(α ∓ β) = cosα cosβ ± sinα sinβ；sin(α ± β) = sinα cosβ ± cosα sinβ。',
        formula: '\\cos(\\alpha - \\beta) = \\cos\\alpha \\cos\\beta + \\sin\\alpha \\sin\\beta'
      },
      {
        title: '二倍角公式與降次',
        description: 'sin 2θ = 2sinθ cosθ；cos 2θ = 2cos²θ - 1 = 1 - 2sin²θ。常用於將平方項降為一次項求積分或疊合。',
        formula: '\\cos 2\\theta = 2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta'
      }
    ],
    pitfalls: [
      '正切和角公式分母為減號：tan(α+β) = (tanα + tanβ) / (1 - tanα tanβ)。',
      '半角公式開根號正負號由半角所在的象限決定，而非原角度。'
    ]
  },

  '圓錐截面與二次曲線 (拋物線、橢圓、雙曲線)': {
    chapter: '圓錐截面與二次曲線 (拋物線、橢圓、雙曲線)',
    mathTrack: 'mathA',
    scopeNotice: '【高二下第 4A 冊 數A專屬】數A評量二次曲線之焦點、準線、貫軸、漸近線代數標準式；數B僅於空間幾何直觀介紹截面光影與日晷。',
    ahaInsight: '二次曲線是由雙圓錐在不同截面角度下的連續過渡：正圓(水平) ➜ 橢圓 ➜ 拋物線(平行母線臨界) ➜ 雙曲線(切過兩葉)。',
    coreConcepts: [
      {
        title: '拋物線定義與標準式',
        description: '動點到焦點距離等於到準線距離 (PF = d(P, L))。(y-k)² = 4c(x-h)，焦距為 |c|，正焦弦長為 4|c|。',
        formula: 'PF = d(P, L), \\quad (y-k)^2 = 4c(x-h)'
      },
      {
        title: '橢圓定義與標準式',
        description: '到兩焦點距離和為定值 2a (PF₁ + PF₂ = 2a > 2c)。關係式為 a² = b² + c²。',
        formula: 'PF_1 + PF_2 = 2a, \\quad a^2 = b^2 + c^2'
      },
      {
        title: '雙曲線定義與漸近線',
        description: '到兩焦點距離差為定值 2a (|PF₁ - PF₂| = 2a < 2c)。關係式為 c² = a² + b²。漸近線為 (x-h)²/a² - (y-k)²/b² = 0。',
        formula: '|PF_1 - PF_2| = 2a, \\quad c^2 = a^2 + b^2'
      }
    ],
    pitfalls: [
      '混淆橢圓 (a 最大，a² = b² + c²) 與雙曲線 (c 最大，c² = a² + b²) 的參數關係。',
      '雙曲線漸近線斜率為 ±b/a（左右型）或 ±a/b（上下型），需依貫軸方向判別。'
    ]
  },

  '雙圓錐截面立體幾何與漸近線對偶': {
    chapter: '雙圓錐截面立體幾何與漸近線對偶',
    mathTrack: 'mathA',
    scopeNotice: '【數A進階幾何】探討空間沙漏雙錐與截面夾角、母線漸近線空間對偶。',
    ahaInsight: '雙曲線的兩條漸近線就是通過錐體頂點且平行於截面的兩條母線在截面上的極限貼合。',
    coreConcepts: [
      {
        title: '截面傾角 θ 與母線半頂角 α (45°)',
        description: 'θ > 45° 截斷單葉封閉為橢圓；θ = 45° 平行母線臨界為拋物線；θ < 45° 穿透雙葉開口為雙曲線。'
      }
    ],
    pitfalls: [
      '誤以為拋物線有漸近線；拋物線因平行母線夾角壓縮為 0°，無漸近線。'
    ]
  },

  // =========================================================================
  // 【高中物理】
  // =========================================================================
  '直線運動 (v-t 圖、等加速度公式解析)': {
    chapter: '直線運動 (v-t 圖、等加速度公式解析)',
    mathTrack: 'none',
    scopeNotice: '【高中選修物理 I 力學進階】高二物理奠基單元，也是學測自然科與分科測驗物理科必考重點。',
    ahaInsight: '解運動學難題，優先畫出 v-t 圖！斜率代表加速度 a，曲線與時間軸夾的面積代表位移 Δx。善用梯形面積與對稱性，免去繁複公式代入。',
    coreConcepts: [
      {
        title: '等加速度運動三大公式',
        description: '1. v = v₀ + at；2. Δx = v₀t + (1/2)at²；3. v² = v₀² + 2aΔx。平均速度 v_avg = (v₀ + v) / 2。',
        formula: 'v = v_0 + at, \\quad \\Delta x = v_0 t + \\frac{1}{2}at^2, \\quad v^2 = v_0^2 + 2a\\Delta x'
      },
      {
        title: '自由落體與鉛直上拋',
        description: '加速度恆為向下 g = 9.8 m/s²。最高點速度瞬時為 0，但加速度仍為向下 g，非零！上升時間等於對稱下降時間。'
      }
    ],
    pitfalls: [
      '速度與加速度皆為向量，必須設定正方向，反向運動與減速時須代入負號。',
      '混淆「路徑長（純量）」與「位移（向量，初位置到末位置的有向線段）」。'
    ]
  },

  '物體的運動與牛頓力學': {
    chapter: '物體的運動與牛頓力學',
    mathTrack: 'none',
    scopeNotice: '【高一基礎物理】牛頓三大運動定律與日常生活應用。',
    ahaInsight: '合力 F 是物體改變運動狀態（產生加速度 a）的原因，而非維持速度的原因！沒有合外力時，靜者恆靜，動者恆作等速度直線運動。',
    coreConcepts: [
      {
        title: '牛頓第二運動定律 (F = ma)',
        description: '物體的加速度與所受合外力大小成正比，與物體質量成反比，方向與合力方向相同。',
        formula: '\\vec{F}_{\\text{net}} = m\\vec{a}'
      },
      {
        title: '牛頓第三定律（作用力與反作用力）',
        description: '大小相等、方向相反、作用在同一直線上，且「作用在不同物體上」，因此絕不可相互抵消！'
      }
    ],
    pitfalls: [
      '誤將「作用力與反作用力」和「兩力平衡」混為一談：兩力平衡是作用在「同一個物體」上，合力為 0；作用力與反作用力作用在「兩個相異物體」上。'
    ]
  }
};

/**
 * 智慧取得單元概念精要：
 * 若已有專屬精編重點直接回傳；
 * 若為新增單元，依據課綱學科（數學/物理/生物/化學）動態產生符合真實學科特色的導讀。
 */
export function getChapterSummary(chapterName: string): ChapterSummary {
  // 1. 精確或包含比對
  const matchKey = Object.keys(CHAPTER_SUMMARIES).find(k => 
    chapterName.includes(k) || k.includes(chapterName)
  );

  if (matchKey && CHAPTER_SUMMARIES[matchKey]) {
    return CHAPTER_SUMMARIES[matchKey];
  }

  // 2. 查閱課綱層級資訊
  let foundSubject: 'math' | 'physics' | 'science' = 'math';
  let foundTrack: 'mathA' | 'mathB' | 'common' | 'none' = 'none';

  for (const s of CURRICULUM_DATA) {
    for (const g of s.grades) {
      for (const sem of g.semesters) {
        const found = sem.chapters.find(c => c.name === chapterName);
        if (found) {
          foundSubject = s.id;
          foundTrack = found.mathTrack || 'none';
          break;
        }
      }
    }
  }

  // 3. 依據學科類別產生合適的素養架構
  if (foundSubject === 'science' || chapterName.includes('生物') || chapterName.includes('細胞') || chapterName.includes('遺傳') || chapterName.includes('生態')) {
    return {
      chapter: chapterName,
      mathTrack: 'none',
      scopeNotice: '【國中自然領域核心單元】著重實驗觀察、生理調節機制與因果因應分析。',
      ahaInsight: `💡 探索「${chapterName}」的科學本質：以實驗觀察為基礎，掌握結構與功能的對應關係，而非死記名詞。`,
      coreConcepts: [
        {
          title: '生理機制與系統因果律',
          description: '分析生命現象在分子、細胞、組織與器官間的互動調節，掌握各變因在平衡恆定中所扮演的角色。'
        },
        {
          title: '實驗探究與變因控制',
          description: '清楚區分「操作變因（操縱變因）」、「控制變因」與「應變變因」，掌握對照組與實驗組的設計原則。'
        }
      ],
      pitfalls: [
        '審題時務必看清題目所設定的環境條件（如溫度、酸鹼度、光照、溶質濃度）對實驗結果的影響。',
        '圖表題請先看清楚橫軸（通常為操作變因）與縱軸（應變變因）之單位與趨勢變化。'
      ]
    };
  }

  if (foundSubject === 'physics' || chapterName.includes('力') || chapterName.includes('電') || chapterName.includes('熱') || chapterName.includes('光') || chapterName.includes('運動')) {
    return {
      chapter: chapterName,
      mathTrack: 'none',
      scopeNotice: '【中學物理核心單元】強調物理圖景建構、受力分析與能量動量守恆律。',
      ahaInsight: `💡 探索「${chapterName}」的物理精髓：先建立清晰的物理圖像與受力圖（FBD），再列守恆方程式，切忌盲目帶入公式。`,
      coreConcepts: [
        {
          title: '物理圖景與狀態分析',
          description: '選定研究對象與坐標系，繪製清晰的受力圖或運動狀態變化圖，找出系統的邊界條件。'
        },
        {
          title: '基本守恆律與轉換方程',
          description: '檢視系統是否滿足機械能守恆、動量守恆或電荷守恆，以最高層級定律列式求解。'
        }
      ],
      pitfalls: [
        '注意向量的正負方向定義，在同一個方程式中所有位移、速度、加速度與力的方向正負號必須嚴格一致。',
        '代入公式前，必須先確認題目給予的物理量單位是否已轉換為標準 SI 國際單位制（m, kg, s, N, J）。'
      ]
    };
  }

  // 預設為數學科架構
  const isMathA = chapterName.includes('數A') || foundTrack === 'mathA';
  const isMathB = chapterName.includes('數B') || foundTrack === 'mathB';
  const isCommon = foundTrack === 'common';

  return {
    chapter: chapterName,
    mathTrack: isMathA ? 'mathA' : isMathB ? 'mathB' : isCommon ? 'common' : 'none',
    scopeNotice: isMathA 
      ? '【數A 專屬單元】強調高維度空間坐標、幾何推導與代數嚴密性。' 
      : isMathB 
      ? '【數B 專屬單元】著重生活生活情境模型化、圓形空間直觀與跨領域應用。' 
      : isCommon
      ? '【數A + 數B 共同核心】學測自然組與社會組皆必考之核心命題單元。'
      : '【108課綱標準單元】依據最新教學進度與大考素養導向命題編排。',
    ahaInsight: `💡 掌握「${chapterName}」的核心本質：從基本定義與幾何圖像切入，掌握代數與幾何的對偶性，化繁為簡！`,
    coreConcepts: [
      {
        title: '核心定義與幾何/代數意涵',
        description: '回歸第一原理，理解公式由來的推導步驟與圖形直觀，擺脫死背代入的被動學習方式。'
      },
      {
        title: '題型轉化與設式策略',
        description: '由已知條件迅速轉化為幾何圖形或方程式，善用輔助線與對稱性降低運算量。'
      }
    ],
    pitfalls: [
      '留意題目設定的定義域與正負條件限制（如分母不為零、真數大於零、根號內非負）。',
      '求出答案後，務必代回原式檢驗是否有增根或不符合題目幾何意義的情形。'
    ]
  };
}
