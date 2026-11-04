import katex from 'katex';
import 'katex/dist/katex.min.css';

export interface FormattedFormula {
  label?: string;
  mathHtml: string;
  note?: string;
}

/**
 * 將常見數學/物理簡寫字串智慧轉換為標準 LaTeX
 */
export function formulaToLatex(raw: string): string {
  let s = raw.trim();

  // 0. 括號指數與下標替換：a^(-n) -> a^{-n}, a^-n -> a^{-n}, r^(n-1) -> r^{n-1}, a_(n+1) -> a_{n+1}
  s = s.replace(/\^\(([^()]+)\)/g, '^{$1}');
  s = s.replace(/\^-([a-zA-Z0-9]+)/g, '^{-$1}');
  s = s.replace(/_\(([^()]+)\)/g, '_{$1}');

  // 1. 上標符號替換
  s = s.replace(/²/g, '^2')
       .replace(/³/g, '^3')
       .replace(/⁴/g, '^4')
       .replace(/⁰/g, '^0')
       .replace(/ⁿ/g, '^n')
       .replace(/⁻¹⁵/g, '^{-15}')
       .replace(/⁻¹⁸/g, '^{-18}')
       .replace(/⁻³⁸/g, '^{-38}')
       .replace(/⁻³⁴/g, '^{-34}')
       .replace(/⁻¹/g, '^{-1}')
       .replace(/⁻²/g, '^{-2}')
       .replace(/⁻³/g, '^{-3}');

  // 2. 下標符號替換
  s = s.replace(/₀/g, '_0')
       .replace(/₁/g, '_1')
       .replace(/₂/g, '_2')
       .replace(/₃/g, '_3')
       .replace(/₄/g, '_4')
       .replace(/₅/g, '_5')
       .replace(/₆/g, '_6')
       .replace(/₇/g, '_7')
       .replace(/₈/g, '_8')
       .replace(/₉/g, '_9');

  // 3. 希臘字母轉義
  s = s.replace(/ω/g, '\\omega ')
       .replace(/π/g, '\\pi ')
       .replace(/θ/g, '\\theta ')
       .replace(/φ/g, '\\phi ')
       .replace(/α/g, '\\alpha ')
       .replace(/β/g, '\\beta ')
       .replace(/λ/g, '\\lambda ')
       .replace(/μ/g, '\\mu ')
       .replace(/ε/g, '\\varepsilon ')
       .replace(/σ/g, '\\sigma ')
       .replace(/τ/g, '\\tau ')
       .replace(/Δ/g, '\\Delta ')
       .replace(/Σ/g, '\\sum ');

  // 4. 運算與關係符號
  s = s.replace(/·/g, ' \\cdot ')
       .replace(/×/g, ' \\times ')
       .replace(/≥/g, ' \\ge ')
       .replace(/≤/g, ' \\le ')
       .replace(/≠/g, ' \\ne ')
       .replace(/≈/g, ' \\approx ')
       .replace(/±/g, ' \\pm ')
       .replace(/∓/g, ' \\mp ')
       .replace(/⟹/g, ' \\implies ')
       .replace(/⟺/g, ' \\iff ');

  // 5. 根號轉換：√(A) 或 √A
  s = s.replace(/√\(([^()]+)\)/g, '\\sqrt{$1}');
  s = s.replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}');

  // 若字串已顯式包含 \frac 或其他進階 LaTeX，跳過後續自動斜線除法換算
  const hasExplicitFrac = s.includes('\\frac');

  // 6. 分數轉換（垂直分數 \frac{分子}{分母}）
  if (!hasExplicitFrac) {
    // 處理括號包覆的除法，例如 (4\pi^2 / T^2) -> \frac{4\pi^2}{T^2}
    s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    s = s.replace(/\(([^()]+)\)\s*\/\s*([a-zA-Z0-9_^{}]+)/g, '\\frac{$1}{$2}');
    s = s.replace(/([a-zA-Z0-9_^{}]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');

    // 處理簡單單項分數，例如 v^2 / R 或 GMm / r 或 m / k 或 L / g 等（排除純單位）
    if (!s.includes('g/cm') && !s.includes('kg/m') && !s.includes('m/s')) {
      s = s.replace(/([a-zA-Z0-9_^{}]+)\s*\/\s*([a-zA-Z0-9_^{}]+)/g, '\\frac{$1}{$2}');
    }
  }

  // 7. 下標轉換：
  // 7a. 數字下標（純數字，如 H_2O -> H_{2}O, Fe_2O_3 -> Fe_{2}O_{3}, v_0 -> v_{0}, a_1 -> a_{1}）
  // 嚴格只匹配連續數字，絕不把接續的大寫化學元素符號 (如 H_2O 的 O) 納入下標
  s = s.replace(/([a-zA-Z])_(\d+)/g, '$1_{$2}');

  // 7b. 中文下標（如 R_串 -> R_{\text{串}}, P_入 -> P_{\text{入}}）
  s = s.replace(/([a-zA-Z])_([\u4e00-\u9fa5]+)/g, '$1_{\\text{$2}}');

  // 7c. 英文下標（如 a_c -> a_{c}, v_max -> v_{\text{max}}, F_net -> F_{\text{net}}）
  s = s.replace(/([a-zA-Z])_([a-zA-Z]+)/g, (match, p1, p2) => {
    if (match.startsWith('\\')) return match;
    if (p2.length > 1) {
      return `${p1}_{\\text{${p2}}}`;
    }
    return `${p1}_{${p2}}`;
  });

  // 8. 數學限制條件前置間隔（如 a^0 = 1 (a \ne 0) -> a^0 = 1 \quad (a \ne 0)）
  s = s.replace(/([^\s\\])\s+([(（](?:[a-zA-Z]|\\theta|\\pi|\\omega|[0-9])+\s*(?:\\ne|≠|=|\\le|≤|\\ge|≥|<|>|\\approx)[^()（）]*[)）])$/, (match, p1, p2) => {
    return `${p1} \\quad ${p2}`;
  });

  return s;
}

/**
 * 完整解析並渲染一條重點公式
 */
export function renderFormulaItem(raw: string): FormattedFormula {
  let text = raw.trim();
  let label: string | undefined = undefined;
  let note: string | undefined = undefined;

  // 1. 提取前置中文標籤（如「向心加速度：」或「向心力：」或「末速度公式：」）
  const colonMatch = text.match(/^([^：:]{1,18}[：:])\s*(.*)$/);
  if (colonMatch) {
    label = colonMatch[1];
    text = colonMatch[2].trim();
  }

  // 2. 提取後置括號備註（僅針對以中文為主的補充說明，例如「（與振幅 A 無關，具等時性）」或「（取無窮遠處 U=0）」）
  // 注意：純數學限制條件（如 (a ≠ 0)、(a \ne 0)、(r \ne 1)、(cos θ ≠ 0)）絕不能抽離為純文字備註，必須保留在公式內由 KaTeX 渲染
  const noteMatch = text.match(/^(.*?)(\s*[（(]([^()（）]{2,})[)）]\s*)$/);
  if (noteMatch) {
    const mainPart = noteMatch[1].trim();
    const innerNote = noteMatch[3].trim();
    const hasChinese = /[\u4e00-\u9fa5]/.test(innerNote);
    const isMathCondition = /(?:^|\s)(?:[a-zA-Z]|\\theta|\\pi|\\omega|det|[0-9])+\s*(?:\\ne|≠|=|\\le|≤|\\ge|≥|<|>|\\approx)\s*/.test(innerNote) 
      || /^[a-zA-Z0-9_\^\{\}\s\\ne=<>±+-\\*\/]+$/.test(innerNote);

    // 只有確實含有中文字，且不是 (a ≠ 0) 等純數學條件時，才視為說明備註抽離
    if (hasChinese && !isMathCondition && !mainPart.includes('/') && !mainPart.includes('\\frac')) {
      text = mainPart;
      note = noteMatch[2].trim();
    }
  }

  // 3. 轉為 LaTeX
  const latex = formulaToLatex(text);

  // 4. 以 KaTeX 進行渲染
  try {
    const mathHtml = katex.renderToString(`\\displaystyle ${latex}`, {
      throwOnError: false,
      displayMode: false
    });
    return { label, mathHtml, note };
  } catch {
    return { label, mathHtml: `<span>${text}</span>`, note };
  }
}
