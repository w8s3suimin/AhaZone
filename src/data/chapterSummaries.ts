export interface ChapterSummary {
  chapter: string;
  mathTrack?: 'mathA' | 'mathB' | 'common' | 'none'; // 數A / 數B / 數A+B共同 / 非高中數學
  scopeNotice?: string; // 數A/數B 課綱範圍差異說明
  ahaInsight: string; // 核心頓悟點撥
  coreConcepts: {
    title: string;
    description: string;
    formula?: string;
  }[];
  pitfalls: string[]; // 常見陷阱
}

export const CHAPTER_SUMMARIES: Record<string, ChapterSummary> = {
  // --- 圓錐截面與二次曲線 ---
  '圓錐截面與二次曲線': {
    chapter: '圓錐截面與二次曲線 (拋物線、橢圓、雙曲線)',
    mathTrack: 'mathA',
    scopeNotice: '【數A專屬核心單元】數A深入討論拋物線、橢圓、雙曲線之標準式、焦點、準線、漸近線代數解析方程；數B僅於空間單元直觀介紹截面幾何特性與日晷光影。',
    ahaInsight: '二次曲線不是三種獨立的圖形，而是同一個雙圓錐在不同截面角度下展開的連續過渡！由正圓 (θ=90°) ➜ 傾斜成橢圓 ➜ 平行母線臨界 (θ=45°) 斷開成拋物線 ➜ 縱切雙錐 (θ<45°) 展開成雙曲線。',
    coreConcepts: [
      {
        title: '拋物線光學與幾何定義',
        description: '動點到焦點距離等於到準線距離 (PF = d(P, L))。標準式 (y-k)² = 4c(x-h)，焦距為 |c|，正焦弦長為 4|c|。',
        formula: 'PF = d(P, L), \\quad (y-k)^2 = 4c(x-h)'
      },
      {
        title: '橢圓的兩焦點距離和為定值',
        description: '動點到兩焦點距離之和等於長軸長 2a (PF₁ + PF₂ = 2a > 2c)。關係式為 a² = b² + c²。',
        formula: 'PF_1 + PF_2 = 2a, \\quad a^2 = b^2 + c^2'
      },
      {
        title: '雙曲線的兩焦點距離差為定值',
        description: '動點到兩焦點距離之差等於貫軸長 2a (|PF₁ - PF₂| = 2a < 2c)。關係式為 c² = a² + b²。漸近線為過中心之直線。',
        formula: '|PF_1 - PF_2| = 2a, \\quad c^2 = a^2 + b^2, \\quad \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 0'
      }
    ],
    pitfalls: [
      '混淆橢圓 (a² = b² + c²) 與雙曲線 (c² = a² + b²) 的 a, b, c 大小關係。雙曲線中 c 才是最大值！',
      '開口方向判斷：由正負號決定，雙曲線正項決定貫軸方向；橢圓分母較大者決定長軸方向。'
    ]
  },

  '雙圓錐截面立體幾何與漸近線對偶': {
    chapter: '雙圓錐截面立體幾何與漸近線對偶',
    mathTrack: 'mathA',
    scopeNotice: '【數A進階探究】結合立體幾何、Dandelin 雙球定理與漸近線投影對偶，深入剖析解析幾何與空間立體之橋樑。',
    ahaInsight: '雙曲線的兩條漸近線，本質就是通過錐體頂點且平行於截面的「基準母線」！截面法向平移後，曲線在無窮遠處將嚴密貼合這兩條母線。',
    coreConcepts: [
      {
        title: '截面傾角 θ 與母線半頂角 α 之臨界判定',
        description: '設圓錐半頂角為 α (標準為 45°)。當 θ > α 時截面僅穿單葉封閉為橢圓；θ = α 平行母線為拋物線臨界；θ < α 穿透雙葉開口為雙曲線。',
        formula: '\\theta > \\alpha \\implies \\text{橢圓}, \\quad \\theta = \\alpha \\implies \\text{拋物線}, \\quad \\theta < \\alpha \\implies \\text{雙曲線}'
      },
      {
        title: '漸近線真實對偶',
        description: '過頂點之基準面 π₀ 與錐體交出兩條母線，平移截面 π_d 上產生的雙曲線在空間投影下與該兩母線漸近吻合。'
      }
    ],
    pitfalls: [
      '誤以為拋物線有漸近線：拋物線夾角壓縮為 0°（平行母線），無漸近線。',
      '忽略平移距離 d 對頂點與中心的剛體位移影響。'
    ]
  },

  '差角公式與倍半角公式': {
    chapter: '差角公式與倍半角公式',
    mathTrack: 'mathA',
    scopeNotice: '【數A專屬單元】108 課綱中，差角公式、和角公式、二倍角、半角公式僅列於數A範圍；數B完全不考差角與倍半角公式。',
    ahaInsight: '所有差角和角公式都可以由「單位圓上兩向量內積」一秒導出！設向量 u=(cosα, sinα), v=(cosβ, sinβ)，其內積即為 u·v = cos(α-β) = cosα cosβ + sinα sinβ。其餘公式皆由正負替換與互餘變形而得。',
    coreConcepts: [
      {
        title: '正餘弦差角與和角公式',
        description: 'cos(α ± β) = cosα cosβ ∓ sinα sinβ；sin(α ± β) = sinα cosβ ± cosα sinβ。口訣：「餘弦同性相吸符號變、正弦異性相吸符號同」。',
        formula: '\\cos(\\alpha \\mp \\beta) = \\cos\\alpha \\cos\\beta \\pm \\sin\\alpha \\sin\\beta'
      },
      {
        title: '二倍角與半角公式',
        description: 'sin2θ = 2sinθ cosθ；cos2θ = cos²θ - sin²θ = 2cos²θ - 1 = 1 - 2sin²θ。半角公式本質就是降次公式。',
        formula: '\\cos 2\\theta = 2\\cos^2\\theta - 1 = 1 - 2\\sin^2\\theta'
      }
    ],
    pitfalls: [
      '正切和差角公式分母的正負號與分子相反：tan(α+β) = (tanα + tanβ) / (1 - tanα tanβ)。',
      '半角公式開根號時，正負號由「半角所在的象限」決定，非原角度。'
    ]
  },

  '三角函數圖形與正餘弦疊合': {
    chapter: '三角函數圖形與正餘弦疊合',
    mathTrack: 'common',
    scopeNotice: '【數A+B 共同核心】數A與數B皆涵蓋正餘弦函數週期、振幅、相位平移與疊合模型。數A題目常搭配差角公式延伸，數B著重週期性自然現象與波動模型。',
    ahaInsight: 'a sinθ + b cosθ 本質是「向量內積」：(a, b) · (sinθ, cosθ) = √(a²+b²) sin(θ + φ)。把兩個相同頻率的正弦餘弦波疊加，得到的依然是一個完美正弦波，振幅為 √(a²+b²)。',
    coreConcepts: [
      {
        title: '正餘弦疊合公式',
        description: 'a sin x + b cos x = √(a² + b²) sin(x + φ)，其中 cosφ = a/√(a²+b²)，sinφ = b/√(a²+b²)。最大值為 √(a²+b²)，最小值為 -√(a²+b²)。',
        formula: 'a\\sin x + b\\cos x = \\sqrt{a^2+b^2} \\sin(x + \\phi)'
      },
      {
        title: '週期與振幅變換',
        description: 'y = A sin(Bx + C) + D，振幅為 |A|，週期為 2π / |B|，垂直平移量為 D。'
      }
    ],
    pitfalls: [
      '正餘弦疊合的前提是「兩者頻率/變數角必須相同（皆為 x）」。若為 sin 2x 與 cos x 則不可直接疊合！',
      '輔助角 φ 所在的象限由點 (a, b) 所在象限決定，勿套錯 tanφ 正負號。'
    ]
  },

  '平面向量的運算與內積': {
    chapter: '平面向量的運算與內積',
    mathTrack: 'common',
    scopeNotice: '【數A+B 共同核心】數A與數B均需熟練向量加減、係數積、分點公式與內積定義。數A加深幾何正射影與柯西不等式證明。',
    ahaInsight: '向量內積 u · v = |u||v|cosθ 不是普通的乘法，它代表「向量 u 在向量 v 方向上的投影長度，再乘上 v 自身的長度」。因此內積為 0 的瞬間，就是兩向量幾何垂直的頓悟時刻！',
    coreConcepts: [
      {
        title: '內積坐標計算與幾何定義',
        description: 'u = (x₁, y₁), v = (x₂, y₂) ➜ u · v = x₁x₂ + y₁y₂ = |u||v|cosθ。垂直充要條件為 u · v = 0。',
        formula: '\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 = |\\vec{u}||\\vec{v}| \\cos\\theta'
      },
      {
        title: '分點公式',
        description: '若 P 在線段 AB 上且 AP:PB = m:n，則 OP = (n/(m+n)) OA + (m/(m+n)) OB。係數和必為 1。'
      }
    ],
    pitfalls: [
      '向量沒有「除法」，也不存在純量與向量的混淆相加。',
      '兩向量內積為純量（實數），而非向量。'
    ]
  },

  '向量柯西不等式與正射影': {
    chapter: '向量柯西不等式與正射影',
    mathTrack: 'mathA',
    scopeNotice: '【數A專屬單元】向量柯西不等式 (a₁²+a₂²)(b₁²+b₂²) ≥ (a₁b₁+a₂b₂)² 與正射影公式僅於數A列入評量重點；數B不作代數柯西要求。',
    ahaInsight: '柯西不等式其實就是 |u|² |v|² ≥ (u·v)²！因為 cos²θ ≤ 1，所以內積平方絕不可能超過長度平方的乘積。等號成立時就是 cos²θ=1，即兩向量平行成比例的時刻！',
    coreConcepts: [
      {
        title: '二維柯西不等式',
        description: '(a₁² + a₂²)(b₁² + b₂²) ≥ (a₁b₁ + a₂b₂)²。等號成立條件為 a₁/b₁ = a₂/b₂。',
        formula: '(a_1^2 + a_2^2)(b_1^2 + b_2^2) \\ge (a_1 b_1 + a_2 b_2)^2'
      },
      {
        title: '向量正射影公式',
        description: '向量 u 在向量 v 上的正射影為向量 ((u·v)/|v|²) v，其長度（投影長）為 |u·v|/|v|。',
        formula: '\\text{Proj}_{\\vec{v}} \\vec{u} = \\left(\\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{v}|^2}\\right) \\vec{v}'
      }
    ],
    pitfalls: [
      '求極值時若出現負號，配對須小心確保內積方向同向，等號成立驗證不能省略。',
      '正射影是「向量」，正射影長是「純量數值」，兩者切勿混為一談。'
    ]
  },

  '矩陣運算與二階轉移矩陣': {
    chapter: '矩陣運算與二階轉移矩陣',
    mathTrack: 'common',
    scopeNotice: '【數A+B 共同核心】矩陣加減、純量乘法、矩陣乘法與轉移矩陣（行和為1、機率非負）為高二數A與數B必考共同單元。數A會進一步探討二階反矩陣與旋轉變換。',
    ahaInsight: '轉移矩陣的穩定狀態本質是「動態平衡」：當系統達到穩定分布 X 時，再經過一次轉移依然不變，即 PX = X。利用聯立方程即可秒解長期極限機率！',
    coreConcepts: [
      {
        title: '轉移矩陣兩大黃金準則',
        description: '1. 矩陣中每個元皆滿足 0 ≤ p_ij ≤ 1；2. 每一「行（直行）」的元素總和必定恰好等於 1。',
        formula: '\\sum_i p_{ij} = 1, \\quad P X_0 = X_1, \\quad P X_k = X_k'
      },
      {
        title: '長期穩定狀態計算',
        description: '若 X = [x, y]ᵀ 且 x+y=1，解 PX = X 聯立方程，即可求得長期穩定分布機率。'
      }
    ],
    pitfalls: [
      '矩陣乘法不具備交換律！AB ≠ BA，因此消去律不成立，(A+B)² ≠ A² + 2AB + B²。',
      '轉移矩陣的行和為 1（直的加起來是 1），若列行顛倒會導致轉移方程錯誤。'
    ]
  },

  '實數與絕對值不等式': {
    chapter: '實數與絕對值不等式',
    mathTrack: 'common',
    scopeNotice: '【高一必修共同】高一上第一次段考核心題型。全體高中生必備基礎運算與幾何數線概念。',
    ahaInsight: '絕對值 |x - c| 的幾何意義就是「數線上點 x 到定點 c 的距離」！解 |x - c| < d 時，直接想像以 c 為中心，左右各展開距離 d 的對稱區間 (c-d, c+d)，完全不需要分正負討論！',
    coreConcepts: [
      {
        title: '絕對值幾何距離法',
        description: '|x - a| < d ➜ a - d < x < a + d；|x - a| > d ➜ x > a + d 或 x < a - d。',
        formula: '|x - c| < r \\iff c - r < x < c + r'
      },
      {
        title: '算術幾何平均不等式 (算幾不等式)',
        description: '設 a, b > 0，則 (a + b)/2 ≥ √(ab)。當且僅當 a = b 時等號成立。常搭配乘積為定值求和的最小值。',
        formula: '\\frac{a+b}{2} \\ge \\sqrt{ab}'
      }
    ],
    pitfalls: [
      '使用算幾不等式時，必須嚴格檢查項數是否「皆為正數 (a>0, b>0)」，且等號成立條件 a=b 是否能發生。',
      '雙重絕對值不等式建議使用「分段討論法」或「函數折線圖幾何法」繪製尋找折點。'
    ]
  },

  '直線運動 (v-t 圖、等加速度公式解析)': {
    chapter: '直線運動 (v-t 圖、等加速度公式解析)',
    mathTrack: 'none',
    scopeNotice: '【高中物理核心必修】高一基礎物理與高二選修物理 I 的奠基石。學測與分科測驗必出題型。',
    ahaInsight: '遇到多階段變速、追趕或煞車問題，不要盲目代入三個等加速度公式！「畫出 v-t 圖」：斜率就是加速度 a，圖形與時間軸包圍的「梯形/三角形面積」就是位移 Δx。幾何面積秒殺代數聯立！',
    coreConcepts: [
      {
        title: 'v-t 圖兩大幾何意義',
        description: '1. 切線斜率代表瞬時加速度 (a = dv/dt)；2. 曲線下面積代表物體位移 (Δx = ∫ v dt)。',
        formula: 'a = \\frac{\\Delta v}{\\Delta t}, \\quad \\Delta x = \\text{Area under } v(t)'
      },
      {
        title: '等加速度運動三公式',
        description: 'v = v₀ + at；Δx = v₀t + (1/2)at²；v² = v₀² + 2aΔx；平均速度 v_avg = (v₀ + v)/2。',
        formula: 'v^2 = v_0^2 + 2a\\Delta x, \\quad \\Delta x = \\frac{v_0 + v}{2} t'
      }
    ],
    pitfalls: [
      '忘記速度與加速度是「向量」！正負號代表運動方向與受力方向。減速時加速度與速度方向相反。',
      '自由落體與鉛直上拋中，最高點速度 v=0，但加速度依然是向下 g (9.8 m/s²)，絕非 0！'
    ]
  },

  '乘法公式與多項式運算': {
    chapter: '乘法公式與多項式運算',
    mathTrack: 'none',
    scopeNotice: '【國中八年級數學】國中代數最重要的分水嶺，銜接因式分解、一元二次方程式與高中多項式除法。',
    ahaInsight: '(a + b)² = a² + 2ab + b² 不是生硬的字母記憶，它代表一個邊長 (a+b) 的大正方形，內部由面積分別為 a²、b² 的兩個正方形，加上兩個面積為 ab 的長方形無縫拼成！',
    coreConcepts: [
      {
        title: '三大核心乘法公式',
        description: '和平方：(a+b)² = a² + 2ab + b²；差平方：(a-b)² = a² - 2ab + b²；平方差：(a+b)(a-b) = a² - b²。',
        formula: '(a+b)^2 = a^2 + 2ab + b^2, \\quad (a+b)(a-b) = a^2 - b^2'
      },
      {
        title: '多項式分離係數法與除法',
        description: '直式除法必須由高次冪排至常數項，遇缺項務必「補 0」，以確保位置對齊。'
      }
    ],
    pitfalls: [
      '最常見錯誤：把 (a + b)² 誤寫成 a² + b²，漏掉關鍵的中間項 +2ab！',
      '多項式直式除法減法時，負負得正漏變號。'
    ]
  }
};
