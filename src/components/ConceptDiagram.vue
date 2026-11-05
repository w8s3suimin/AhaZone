<script setup lang="ts">
import { computed, ref } from 'vue';
import OpticsSimulator from './OpticsSimulator.vue';
import FunctionGraph, { PlotFunction, PlotPoint, PlotLine } from './FunctionGraph.vue';
import { renderRichMathText } from '../utils/mathRenderer';

const props = defineProps<{
  type: string;
}>();

// 函數圖形平移伸縮與對稱動態操作狀態（累加型實驗室）
const transFamily = ref<'exp' | 'log'>('exp');
const transShiftX = ref(0);
const transShiftY = ref(0);
const transScaleIndex = ref(3); // 預設索引 3 為 1 倍
const scaleFactors = [0.25, 1 / 3, 0.5, 1, 2, 3, 4, 5, 6];
const scaleLabels = ['1/4', '1/3', '1/2', '1', '2', '3', '4', '5', '6'];

const transReflectX = ref(false); // 上下翻轉 (y -> -y)
const transReflectY = ref(false); // 左右翻轉 (x -> -x)
const transShowInverse = ref(false); // 反函數對稱 (y = x)

function shiftLeft() {
  if (transShiftX.value > -5) transShiftX.value--;
}
function shiftRight() {
  if (transShiftX.value < 5) transShiftX.value++;
}
function shiftUp() {
  if (transShiftY.value < 5) transShiftY.value++;
}
function shiftDown() {
  if (transShiftY.value > -5) transShiftY.value--;
}
function scaleDown() {
  if (transScaleIndex.value > 0) transScaleIndex.value--;
}
function scaleUp() {
  if (transScaleIndex.value < scaleFactors.length - 1) transScaleIndex.value++;
}
function toggleReflectX() {
  transReflectX.value = !transReflectX.value;
}
function toggleReflectY() {
  transReflectY.value = !transReflectY.value;
}
function toggleInverse() {
  transShowInverse.value = !transShowInverse.value;
}
function resetTrans() {
  transShiftX.value = 0;
  transShiftY.value = 0;
  transScaleIndex.value = 3;
  transReflectX.value = false;
  transReflectY.value = false;
  transShowInverse.value = false;
}

const currentTransConfig = computed(() => {
  const isExp = transFamily.value === 'exp';
  const h = transShiftX.value;
  const k = transShiftY.value;
  const scale = scaleFactors[transScaleIndex.value];
  const scaleLabel = scaleLabels[transScaleIndex.value];
  const refX = transReflectX.value;
  const refY = transReflectY.value;
  const showInv = transShowInverse.value;

  const sy = scale * (refX ? -1 : 1);
  const sxSign = refY ? -1 : 1;

  // Viewport bounds
  const xMin = Math.min(-5.5, h - 4.5);
  const xMax = Math.max(5.5, h + 4.5);
  const yMin = Math.min(-4.5, k - 4.5);
  const yMax = Math.max(6.5, k + 5.5);

  let transformedFn: (x: number) => number;
  let baseFn: (x: number) => number;
  let basePoints: PlotPoint[] = [];
  let transPoints: PlotPoint[] = [];
  let guideLines: PlotLine[] = [];
  let transformedLabel = '';
  let anchorDesc = '';
  let asymptoteText = '';
  let asymptoteLine: PlotLine;

  if (isExp) {
    baseFn = (x: number) => Math.pow(2, x);
    transformedFn = (x: number) => {
      const u = (x - h) * sxSign;
      if (u > 10) return NaN;
      if (u < -10) return k;
      return sy * Math.pow(2, u) + k;
    };

    // Label formatting
    let prefix = '';
    if (scaleLabel === '1') {
      prefix = refX ? '-' : '';
    } else {
      const frac = scaleLabel.includes('/') ? `\\frac{1}{${scaleLabel.split('/')[1]}}` : scaleLabel;
      prefix = (refX ? '-' : '') + frac + ' \\cdot ';
    }

    let expTerm = '';
    if (refY) {
      if (h === 0) expTerm = '2^{-x}';
      else if (h > 0) expTerm = `2^{-(x - ${h})}`;
      else expTerm = `2^{-(x + ${-h})}`;
    } else {
      if (h === 0) expTerm = '2^x';
      else if (h > 0) expTerm = `2^{x - ${h}}`;
      else expTerm = `2^{x + ${-h}}`;
    }

    let kTerm = '';
    if (k > 0) kTerm = ` + ${k}`;
    else if (k < 0) kTerm = ` - ${-k}`;

    transformedLabel = `y = ${prefix}${expTerm}${kTerm}`;

    const targetY = Number((sy + k).toFixed(2));
    basePoints = [
      { x: 0, y: 1, color: '#94a3b8', radius: 3.5, label: '(0, 1)', labelPos: 'left' }
    ];
    transPoints = [
      { x: h, y: targetY, color: '#38bdf8', radius: 5, label: `(${h}, ${targetY}) 基準點`, labelPos: targetY >= 1 ? 'top-left' : 'bottom-left' }
    ];
    guideLines = [
      { x1: 0, y1: 1, x2: h, y2: targetY, color: '#38bdf8', strokeWidth: 1.2, dashArray: '2 2' }
    ];

    asymptoteLine = {
      x1: xMin, y1: k, x2: xMax, y2: k,
      color: '#f59e0b', strokeWidth: 1.2, dashArray: '3 3',
      label: `y = ${k}`
    };
    asymptoteText = `水平漸近線 $y = ${k}$`;
    anchorDesc = `基準點移至 $(${h}, ${targetY})$`;
  } else {
    // Logarithm family
    baseFn = (x: number) => x > 0.03 ? Math.log2(x) : NaN;
    transformedFn = (x: number) => {
      const u = (x - h) * sxSign;
      if (u <= 0.03) return NaN;
      return sy * Math.log2(u) + k;
    };

    let prefix = '';
    if (scaleLabel === '1') {
      prefix = refX ? '-' : '';
    } else {
      const frac = scaleLabel.includes('/') ? `\\frac{1}{${scaleLabel.split('/')[1]}}` : scaleLabel;
      prefix = (refX ? '-' : '') + frac;
    }

    let insideLog = '';
    if (refY) {
      if (h === 0) insideLog = '(-x)';
      else if (h > 0) insideLog = `(-(x - ${h}))`;
      else insideLog = `(-(x + ${-h}))`;
    } else {
      if (h === 0) insideLog = 'x';
      else if (h > 0) insideLog = `(x - ${h})`;
      else insideLog = `(x + ${-h})`;
    }

    let kTerm = '';
    if (k > 0) kTerm = ` + ${k}`;
    else if (k < 0) kTerm = ` - ${-k}`;

    transformedLabel = `y = ${prefix}\\log_2${insideLog.startsWith('(') ? insideLog : ` ${insideLog}`}${kTerm}`;

    const targetX = h + sxSign;
    basePoints = [
      { x: 1, y: 0, color: '#94a3b8', radius: 3.5, label: '(1, 0)', labelPos: 'bottom' }
    ];
    transPoints = [
      { x: targetX, y: k, color: '#34d399', radius: 5, label: `(${targetX}, ${k}) 基準點`, labelPos: k >= 0 ? 'top-right' : 'bottom-right' }
    ];
    guideLines = [
      { x1: 1, y1: 0, x2: targetX, y2: k, color: '#34d399', strokeWidth: 1.2, dashArray: '2 2' }
    ];

    asymptoteLine = {
      x1: h, y1: yMin, x2: h, y2: yMax,
      color: '#f59e0b', strokeWidth: 1.2, dashArray: '3 3',
      label: `x = ${h}`
    };
    asymptoteText = `垂直漸近線 $x = ${h}$`;
    anchorDesc = `基準點移至 $(${targetX}, ${k})$`;
  }

  // Compose active operations summary
  const ops: string[] = [];
  if (h !== 0) ops.push(`水平${h > 0 ? `向右平移 ${h}` : `向左平移 ${-h}`} 單位`);
  if (k !== 0) ops.push(`垂直${k > 0 ? `向上平移 ${k}` : `向下平移 ${-k}`} 單位`);
  if (scaleLabel !== '1') ops.push(`縱向放大 ${scaleLabel} 倍`);
  if (refX) ops.push('上下翻轉（對稱於 $x$ 軸）');
  if (refY) ops.push('左右翻轉（對稱於 $y$ 軸）');
  if (showInv) ops.push('反函數對稱（對稱於直線 $y = x$）');
  if (ops.length === 0) ops.push('基準狀態（無額外平移伸縮）');

  const desc = `**目前函數**：$${transformedLabel}$。<br/>` +
    `**動作累計**：${ops.join('，')}。<br/>` +
    `**特徵錨點**：${anchorDesc}，${asymptoteText}。`;

  const funcs: PlotFunction[] = [
    {
      fn: baseFn,
      color: '#64748b',
      strokeWidth: 1.5,
      dashArray: '3 3',
      label: isExp ? 'y = 2^x' : 'y = \\log_2 x',
      description: '原基準'
    },
    {
      fn: transformedFn,
      color: isExp ? '#38bdf8' : '#34d399',
      strokeWidth: 2.6,
      label: transformedLabel,
      description: '變換後'
    }
  ];

  if (showInv) {
    funcs.push({
      fn: (x: number) => x,
      color: '#f59e0b',
      strokeWidth: 1.4,
      dashArray: '4 4',
      label: 'y = x',
      description: '對稱軸'
    });
    if (isExp) {
      funcs.push({
        fn: (x: number) => x > 0.03 ? Math.log2(x) : NaN,
        color: '#34d399',
        strokeWidth: 2,
        dashArray: '4 2',
        label: 'y = \\log_2 x',
        description: '反函數'
      });
      basePoints.push({ x: 1, y: 0, color: '#34d399', radius: 3.5, label: '(1, 0)' });
    } else {
      funcs.push({
        fn: (x: number) => Math.pow(2, x),
        color: '#38bdf8',
        strokeWidth: 2,
        dashArray: '4 2',
        label: 'y = 2^x',
        description: '反函數'
      });
      basePoints.push({ x: 0, y: 1, color: '#38bdf8', radius: 3.5, label: '(0, 1)' });
    }
  }

  return {
    xRange: [xMin, xMax] as [number, number],
    yRange: [yMin, yMax] as [number, number],
    functions: funcs,
    points: [...basePoints, ...transPoints],
    lines: [asymptoteLine, ...guideLines],
    description: desc,
    formula: transformedLabel
  };
});
</script>

<template>
  <div class="w-full select-none flex flex-col items-center">
    
    <!-- ========================================================================= -->
    <!-- 1. 等速圓周運動與向心加速度 (circular-motion) -->
    <!-- ========================================================================= -->
    <svg 
      v-if="type === 'circular-motion'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <!-- Gradients & Arrow Markers -->
        <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#818cf8" stop-opacity="0.05"/>
        </linearGradient>
        <marker id="arrow-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
        <marker id="arrow-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
      </defs>

      <!-- Background Grid Subtlety -->
      <rect width="380" height="200" rx="16" fill="#090d16" />
      <circle cx="180" cy="100" r="65" fill="url(#orbitGrad)" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4 4" />
      
      <!-- Radius line -->
      <line x1="180" y1="100" x2="236" y2="67" stroke="#475569" stroke-width="1.2" stroke-dasharray="2 2" />
      <text x="202" y="90" fill="#94a3b8" font-size="11" font-family="sans-serif">半徑 R</text>

      <!-- Center point -->
      <circle cx="180" cy="100" r="3.5" fill="#64748b" />
      <text x="168" y="104" fill="#64748b" font-size="10" font-family="sans-serif">O</text>

      <!-- Moving object on orbit at angle -30 deg -->
      <!-- Position: (180 + 65*cos(-30°), 100 + 65*sin(-30°)) = (180 + 56.3, 100 - 32.5) = (236.3, 67.5) -->
      <!-- Velocity v vector (tangent: direction (-sin(-30°), cos(-30°)) = (0.5, 0.866) ... wait, counterclockwise tangent at (cos θ, sin θ) is (-sin θ, cos θ) -->
      <!-- θ = -30°, so tangent = (sin 30°, cos 30°) = (0.5, 0.866) pointing down-right or up-left (-0.5, -0.866) -->
      <!-- Tangent vector arrow: from (236, 67.5) to (211, 24) -->
      <line x1="236" y1="67.5" x2="216" y2="33" stroke="#34d399" stroke-width="2.5" marker-end="url(#arrow-v)" />
      <text x="222" y="32" fill="#34d399" font-weight="bold" font-size="12" font-family="sans-serif">切線速度 v</text>

      <!-- Centripetal acceleration a_c vector (towards center (180, 100)) -->
      <line x1="236" y1="67.5" x2="198" y2="89.5" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-a)" />
      <text x="204" y="70" fill="#38bdf8" font-weight="bold" font-size="12" font-family="sans-serif">向心加速度 a_c</text>

      <!-- Right angle mark between v and a_c -->
      <path d="M 230 57 L 223 61 L 229 71" fill="none" stroke="#f59e0b" stroke-width="1.2" />

      <!-- Object node -->
      <circle cx="236" cy="67.5" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />

      <!-- Explanation Badges -->
      <g transform="translate(14, 155)">
        <rect width="352" height="32" rx="8" fill="#0f172a" stroke="#1e293b" />
        <circle cx="16" cy="16" r="3" fill="#38bdf8" />
        <text x="28" y="20" fill="#94a3b8" font-size="11" font-family="sans-serif">
          核心幾何特徵：<tspan fill="#34d399" font-weight="bold">v ⊥ a_c</tspan>（速度恆垂直於向心加速度）⟹ 向心力不做功，僅改變方向
        </text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 2. 平面斜向拋射運動 (projectile-motion) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'projectile-motion'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
        </linearGradient>
        <marker id="arrow-proj" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-comp" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#94a3b8" />
        </marker>
      </defs>

      <rect width="380" height="200" rx="16" fill="#090d16" />
      
      <!-- Ground line -->
      <line x1="30" y1="145" x2="350" y2="145" stroke="#334155" stroke-width="2" />

      <!-- Trajectory curve: from (50, 145) to (330, 145), peak at (190, 45) -->
      <!-- Quadratic bezier: start 50,145; control 190,-55; end 330,145 -->
      <path d="M 50 145 Q 190 -5 330 145" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <path d="M 50 145 Q 190 -5 330 145 L 330 145 L 50 145 Z" fill="url(#trajGrad)" />

      <!-- Initial Velocity Vector Decomposition -->
      <line x1="50" y1="145" x2="100" y2="90" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-proj)" />
      <text x="105" y="90" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">v₀</text>

      <line x1="50" y1="145" x2="100" y2="145" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#arrow-comp)" />
      <text x="65" y="160" fill="#94a3b8" font-size="10" font-family="sans-serif">v₀ cosθ</text>

      <line x1="50" y1="145" x2="50" y2="95" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#arrow-comp)" />
      <text x="15" y="115" fill="#94a3b8" font-size="10" font-family="sans-serif">v₀ sinθ</text>

      <!-- Launch angle theta arc -->
      <path d="M 75 145 A 25 25 0 0 0 68 127" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <text x="74" y="136" fill="#f59e0b" font-size="10" font-family="sans-serif">θ</text>

      <!-- Highest Point H -->
      <circle cx="190" cy="50" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      <line x1="190" y1="50" x2="230" y2="50" stroke="#34d399" stroke-width="2" marker-end="url(#arrow-comp)" />
      <text x="235" y="54" fill="#34d399" font-size="10" font-family="sans-serif">v_x = v₀ cosθ (v_y = 0)</text>

      <!-- Height H indicator -->
      <line x1="190" y1="50" x2="190" y2="145" stroke="#64748b" stroke-width="1" stroke-dasharray="2 2" />
      <text x="195" y="105" fill="#38bdf8" font-weight="bold" font-size="11" font-family="sans-serif">射高 H</text>

      <!-- Range R indicator -->
      <line x1="50" y1="172" x2="330" y2="172" stroke="#64748b" stroke-width="1.2" />
      <circle cx="50" cy="172" r="2" fill="#64748b" />
      <circle cx="330" cy="172" r="2" fill="#64748b" />
      <text x="160" y="188" fill="#e2e8f0" font-weight="bold" font-size="11" font-family="sans-serif">水平射程 R (θ=45° 時最大)</text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 3. 直線運動 v-t 圖幾何本質 (vt-graph) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'vt-graph'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <linearGradient id="trapezoidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#34d399" stop-opacity="0.05"/>
        </linearGradient>
      </defs>

      <rect width="380" height="200" rx="16" fill="#090d16" />
      
      <!-- Coordinate axes -->
      <line x1="50" y1="150" x2="340" y2="150" stroke="#475569" stroke-width="1.5" />
      <text x="345" y="154" fill="#94a3b8" font-size="11" font-family="sans-serif">時間 t</text>
      
      <line x1="60" y1="160" x2="60" y2="30" stroke="#475569" stroke-width="1.5" />
      <text x="50" y="24" fill="#94a3b8" font-size="11" font-family="sans-serif">速度 v</text>

      <!-- Trapezoid area: from t=0 (60, 110) [v₀] to t=T (260, 50) [v] -->
      <polygon points="60,110 260,50 260,150 60,150" fill="url(#trapezoidGrad)" stroke="#34d399" stroke-width="1" stroke-dasharray="3 3" />

      <!-- The linear velocity function line -->
      <line x1="60" y1="110" x2="260" y2="50" stroke="#38bdf8" stroke-width="3" />
      <circle cx="60" cy="110" r="4" fill="#38bdf8" />
      <circle cx="260" cy="50" r="4" fill="#38bdf8" />

      <!-- Labels on axes -->
      <text x="36" y="114" fill="#e2e8f0" font-size="11" font-family="sans-serif">v₀</text>
      <line x1="56" y1="110" x2="64" y2="110" stroke="#94a3b8" stroke-width="1.5" />

      <text x="42" y="54" fill="#e2e8f0" font-size="11" font-family="sans-serif">v</text>
      <line x1="56" y1="50" x2="64" y2="50" stroke="#94a3b8" stroke-width="1.5" />
      <line x1="60" y1="50" x2="260" y2="50" stroke="#334155" stroke-dasharray="2 2" stroke-width="1" />

      <text x="256" y="166" fill="#e2e8f0" font-size="11" font-family="sans-serif">t</text>
      <line x1="260" y1="146" x2="260" y2="154" stroke="#94a3b8" stroke-width="1.5" />

      <!-- Annotations -->
      <g transform="translate(130, 95)">
        <text x="0" y="0" fill="#34d399" font-weight="bold" font-size="12" font-family="sans-serif">夾面積 = 位移 Δx</text>
        <text x="0" y="16" fill="#94a3b8" font-size="10" font-family="sans-serif">梯形公式：((v₀ + v)/2) × t</text>
      </g>

      <g transform="translate(140, 38)">
        <text x="0" y="0" fill="#38bdf8" font-weight="bold" font-size="12" font-family="sans-serif">斜率 = 加速度 a</text>
        <text x="0" y="14" fill="#94a3b8" font-size="10" font-family="sans-serif">Δv / Δt</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 4. 單位圓與三角函數坐標定義 (unit-circle) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'unit-circle'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="200" rx="16" fill="#090d16" />
      
      <!-- Coordinate axes -->
      <line x1="30" y1="100" x2="270" y2="100" stroke="#334155" stroke-width="1.5" />
      <text x="275" y="104" fill="#94a3b8" font-size="11" font-family="sans-serif">x</text>

      <line x1="150" y1="180" x2="150" y2="20" stroke="#334155" stroke-width="1.5" />
      <text x="146" y="14" fill="#94a3b8" font-size="11" font-family="sans-serif">y</text>

      <!-- Unit circle r = 60 -->
      <circle cx="150" cy="100" r="60" fill="none" stroke="#475569" stroke-width="1.5" />

      <!-- Point P at θ = 50°: x = 150 + 60*cos(50°) = 150 + 38.6 = 188.6; y = 100 - 60*sin(50°) = 100 - 46 = 54 -->
      <!-- Triangle legs -->
      <!-- Horizontal cos leg -->
      <line x1="150" y1="100" x2="188.6" y2="100" stroke="#38bdf8" stroke-width="2.5" />
      <text x="156" y="115" fill="#38bdf8" font-weight="bold" font-size="11" font-family="sans-serif">x = cosθ</text>

      <!-- Vertical sin leg -->
      <line x1="188.6" y1="100" x2="188.6" y2="54" stroke="#34d399" stroke-width="2.5" stroke-dasharray="2 2" />
      <text x="194" y="80" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">y = sinθ</text>

      <!-- Hypotenuse r = 1 -->
      <line x1="150" y1="100" x2="188.6" y2="54" stroke="#f59e0b" stroke-width="2" />
      <circle cx="188.6" cy="54" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />
      <text x="196" y="50" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">P(cosθ, sinθ)</text>

      <!-- Angle arc θ -->
      <path d="M 170 100 A 20 20 0 0 0 163 85" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <text x="168" y="93" fill="#f59e0b" font-size="10" font-family="sans-serif">θ</text>

      <!-- Quadrant Memory Legend on the right -->
      <g transform="translate(290, 30)">
        <rect width="76" height="140" rx="8" fill="#0f172a" stroke="#1e293b" />
        <text x="10" y="20" fill="#e2e8f0" font-size="11" font-weight="bold" font-family="sans-serif">象限正負</text>
        <text x="10" y="44" fill="#34d399" font-size="10" font-family="sans-serif">Ⅰ: 全為正</text>
        <text x="10" y="68" fill="#38bdf8" font-size="10" font-family="sans-serif">Ⅱ: sin 正</text>
        <text x="10" y="92" fill="#f59e0b" font-size="10" font-family="sans-serif">Ⅲ: tan 正</text>
        <text x="10" y="116" fill="#818cf8" font-size="10" font-family="sans-serif">Ⅳ: cos 正</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 5. 平面向量正射影 (vector-projection) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'vector-projection'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <marker id="arrow-vec" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-proj-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>

      <rect width="380" height="180" rx="16" fill="#090d16" />
      
      <!-- Vector v along line -->
      <line x1="50" y1="120" x2="320" y2="120" stroke="#475569" stroke-width="1.5" />
      <line x1="50" y1="120" x2="290" y2="120" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arrow-vec)" />
      <text x="296" y="124" fill="#94a3b8" font-weight="bold" font-size="12" font-family="sans-serif">向量 v</text>

      <!-- Vector u at angle -->
      <line x1="50" y1="120" x2="200" y2="45" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-vec)" />
      <text x="140" y="65" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">向量 u</text>

      <!-- Perpendicular dropping line -->
      <line x1="200" y1="45" x2="200" y2="120" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3 3" />
      <path d="M 190 120 L 190 110 L 200 110" fill="none" stroke="#f43f5e" stroke-width="1.2" />

      <!-- Projection vector on v -->
      <line x1="50" y1="120" x2="200" y2="120" stroke="#34d399" stroke-width="3.5" marker-end="url(#arrow-proj-v)" />
      
      <!-- Projection vector annotation -->
      <g transform="translate(60, 145)">
        <text x="0" y="0" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">
          正射影向量 proj_v u = [ (u · v) / |v|² ] v
        </text>
        <text x="0" y="16" fill="#94a3b8" font-size="10" font-family="sans-serif">
          投影長度 = |u · v| / |v|（u 在 v 方向的光影投影）
        </text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 6. 雙圓錐截面幾何分析 (conic-sections) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'conic-sections'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="200" rx="16" fill="#090d16" />

      <!-- Double Cone Profile Silhouette -->
      <!-- Vertex at (140, 100) -->
      <!-- Upper cone: from (80, 25) to (200, 25) to (140, 100) -->
      <polygon points="80,25 200,25 140,100" fill="#1e293b" fill-opacity="0.4" stroke="#475569" stroke-width="1.5" />
      <ellipse cx="140" cy="25" rx="60" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />

      <!-- Lower cone: from (80, 175) to (200, 175) to (140, 100) -->
      <polygon points="80,175 200,175 140,100" fill="#1e293b" fill-opacity="0.4" stroke="#475569" stroke-width="1.5" />
      <ellipse cx="140" cy="175" rx="60" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />

      <!-- Vertex O -->
      <circle cx="140" cy="100" r="3" fill="#38bdf8" />
      <text x="146" y="103" fill="#94a3b8" font-size="10" font-family="sans-serif">頂點</text>

      <!-- Cutting Plane Lines -->
      <!-- 1. Circle: Horizontal line -->
      <line x1="75" y1="50" x2="205" y2="50" stroke="#38bdf8" stroke-width="2" />
      
      <!-- 2. Ellipse: Slight tilt -->
      <line x1="70" y1="80" x2="200" y2="40" stroke="#34d399" stroke-width="2" />

      <!-- 3. Parabola: Parallel to generator -->
      <line x1="100" y1="165" x2="205" y2="35" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3" />

      <!-- 4. Hyperbola: Vertical cut through both cones -->
      <line x1="175" y1="15" x2="175" y2="185" stroke="#f43f5e" stroke-width="2" />

      <!-- Classification Legend on the right -->
      <g transform="translate(225, 20)">
        <rect width="140" height="160" rx="10" fill="#0f172a" stroke="#1e293b" />
        <text x="12" y="24" fill="#e2e8f0" font-size="11" font-weight="bold" font-family="sans-serif">截角 θ 與母線半角 α</text>
        
        <circle cx="18" cy="46" r="4" fill="#38bdf8" />
        <text x="28" y="50" fill="#38bdf8" font-size="11" font-family="sans-serif">正圓 (θ = 90° 水平)</text>

        <circle cx="18" cy="74" r="4" fill="#34d399" />
        <text x="28" y="78" fill="#34d399" font-size="11" font-family="sans-serif">橢圓 (θ > α 封閉單葉)</text>

        <circle cx="18" cy="102" r="4" fill="#f59e0b" />
        <text x="28" y="106" fill="#f59e0b" font-size="11" font-family="sans-serif">拋物線 (θ = α 平行母線)</text>

        <circle cx="18" cy="130" r="4" fill="#f43f5e" />
        <text x="28" y="134" fill="#f43f5e" font-size="11" font-family="sans-serif">雙曲線 (θ < α 同割雙葉)</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 7. 幾何光學透鏡與面鏡動態成像實驗室 (lens-optics) -->
    <!-- ========================================================================= -->
    <OpticsSimulator v-else-if="type === 'lens-optics'" />

    <!-- ========================================================================= -->
    <!-- 8. 楊氏雙狹縫干涉 (double-slit) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'double-slit'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Slits barrier at x=70 -->
      <line x1="70" y1="20" x2="70" y2="70" stroke="#64748b" stroke-width="4" />
      <line x1="70" y1="85" x2="70" y2="105" stroke="#64748b" stroke-width="4" />
      <line x1="70" y1="120" x2="70" y2="170" stroke="#64748b" stroke-width="4" />
      <text x="40" y="76" fill="#38bdf8" font-size="10" font-family="sans-serif">S₁</text>
      <text x="40" y="124" fill="#38bdf8" font-size="10" font-family="sans-serif">S₂</text>
      <text x="76" y="99" fill="#94a3b8" font-size="9" font-family="sans-serif">間距 d</text>

      <!-- Screen at x=310 -->
      <line x1="310" y1="20" x2="310" y2="170" stroke="#475569" stroke-width="2" />
      <text x="316" y="32" fill="#94a3b8" font-size="10" font-family="sans-serif">光屏</text>

      <!-- Ray 1 from S1 to P(310, 50) -->
      <line x1="70" y1="77" x2="310" y2="50" stroke="#38bdf8" stroke-width="1.5" />
      <!-- Ray 2 from S2 to P(310, 50) -->
      <line x1="70" y1="113" x2="310" y2="50" stroke="#38bdf8" stroke-width="1.5" />
      
      <!-- Fringes pattern on screen -->
      <rect x="306" y="44" width="8" height="12" fill="#38bdf8" rx="2" />
      <text x="320" y="54" fill="#38bdf8" font-size="10" font-family="sans-serif">亮帶 (m=1)</text>

      <rect x="306" y="90" width="8" height="14" fill="#38bdf8" rx="2" />
      <text x="320" y="100" fill="#38bdf8" font-size="10" font-family="sans-serif">中央亮帶 (m=0)</text>

      <!-- Distance L indicator -->
      <line x1="70" y1="155" x2="310" y2="155" stroke="#475569" stroke-dasharray="2 2" stroke-width="1" />
      <text x="170" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">雙狹縫至光屏距離 L ⟹ 條紋間距 Δy = (L/d)λ</text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 9. 波耳氫原子能階躍遷光譜 (bohr-atom) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'bohr-atom'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <marker id="arrow-trans" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect width="380" height="200" rx="16" fill="#090d16" />

      <!-- Energy level rungs: En = -13.6 / n^2 -->
      <!-- n=1: E1 = -13.6 (y=165) -->
      <line x1="50" y1="165" x2="330" y2="165" stroke="#38bdf8" stroke-width="2.5" />
      <text x="14" y="169" fill="#38bdf8" font-weight="bold" font-size="11" font-family="sans-serif">n = 1</text>
      <text x="336" y="169" fill="#64748b" font-size="10" font-family="sans-serif">-13.6 eV</text>

      <!-- n=2: E2 = -3.4 (y=115) -->
      <line x1="50" y1="115" x2="330" y2="115" stroke="#34d399" stroke-width="2" />
      <text x="14" y="119" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">n = 2</text>
      <text x="336" y="119" fill="#64748b" font-size="10" font-family="sans-serif">-3.4 eV</text>

      <!-- n=3: E3 = -1.51 (y=80) -->
      <line x1="50" y1="80" x2="330" y2="80" stroke="#f59e0b" stroke-width="1.5" />
      <text x="14" y="84" fill="#f59e0b" font-size="10" font-family="sans-serif">n = 3</text>
      <text x="336" y="84" fill="#64748b" font-size="10" font-family="sans-serif">-1.5 eV</text>

      <!-- n=4: E4 = -0.85 (y=55) -->
      <line x1="50" y1="55" x2="330" y2="55" stroke="#94a3b8" stroke-width="1.2" />
      <text x="14" y="59" fill="#94a3b8" font-size="10" font-family="sans-serif">n = 4</text>
      <text x="336" y="59" fill="#64748b" font-size="10" font-family="sans-serif">-0.85 eV</text>

      <!-- n=infinity: E=0 (y=30) -->
      <line x1="50" y1="30" x2="330" y2="30" stroke="#475569" stroke-width="1" stroke-dasharray="3 3" />
      <text x="14" y="34" fill="#64748b" font-size="10" font-family="sans-serif">n=∞</text>
      <text x="336" y="34" fill="#64748b" font-size="10" font-family="sans-serif">0 eV</text>

      <!-- Transition series -->
      <!-- Lyman Series to n=1 (Ultraviolet) -->
      <line x1="90" y1="115" x2="90" y2="165" stroke="#818cf8" stroke-width="2" marker-end="url(#arrow-trans)" />
      <line x1="110" y1="80" x2="110" y2="165" stroke="#818cf8" stroke-width="2" marker-end="url(#arrow-trans)" />
      <text x="75" y="145" fill="#818cf8" font-size="10" font-weight="bold" font-family="sans-serif">萊曼系 (紫外光)</text>

      <!-- Balmer Series to n=2 (Visible) -->
      <line x1="190" y1="80" x2="190" y2="115" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow-trans)" />
      <line x1="210" y1="55" x2="210" y2="115" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-trans)" />
      <text x="175" y="100" fill="#f43f5e" font-size="10" font-weight="bold" font-family="sans-serif">巴耳末系 (可見光)</text>

      <!-- Paschen Series to n=3 (Infrared) -->
      <line x1="280" y1="55" x2="280" y2="80" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-trans)" />
      <text x="250" y="70" fill="#f59e0b" font-size="10" font-weight="bold" font-family="sans-serif">帕申系 (紅外光)</text>

      <text x="100" y="190" fill="#94a3b8" font-size="10" font-family="sans-serif">
        光子能量 hf = |E₂ - E₁| ⟹ 躍遷至基態釋放最高能量紫外光
      </text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 10. 電磁感應與冷次定律 (lenz-law) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'lenz-law'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <marker id="arrow-flux" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-cur" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Bar Magnet approaching from left -->
      <!-- S Pole -->
      <rect x="50" y="75" width="40" height="30" rx="3" fill="#3b82f6" />
      <text x="65" y="95" fill="#ffffff" font-weight="bold" font-size="14" font-family="sans-serif">S</text>
      <!-- N Pole -->
      <rect x="90" y="75" width="40" height="30" rx="3" fill="#ef4444" />
      <text x="105" y="95" fill="#ffffff" font-weight="bold" font-size="14" font-family="sans-serif">N</text>

      <!-- Velocity vector of magnet moving right -->
      <line x1="135" y1="90" x2="165" y2="90" stroke="#ffffff" stroke-width="2" marker-end="url(#arrow-flux)" />
      <text x="142" y="80" fill="#ffffff" font-size="10" font-family="sans-serif">靠近 v</text>

      <!-- Wire loop coil on right -->
      <ellipse cx="260" cy="90" rx="25" ry="55" fill="none" stroke="#f59e0b" stroke-width="3" />
      
      <!-- Induced N pole on loop face opposing the approaching N pole -->
      <text x="215" y="95" fill="#ef4444" font-weight="bold" font-size="14" font-family="sans-serif">N 極</text>
      
      <!-- Opposing magnetic field vector from coil pointing left -->
      <line x1="250" y1="90" x2="190" y2="90" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3" marker-end="url(#arrow-flux)" />
      <text x="195" y="115" fill="#38bdf8" font-size="10" font-family="sans-serif">感應磁場 B_ind</text>

      <!-- Induced current direction arrows on loop -->
      <path d="M 270 45 A 25 55 0 0 1 270 135" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-cur)" />
      <text x="290" y="95" fill="#f59e0b" font-weight="bold" font-size="11" font-family="sans-serif">感應電流 I</text>

      <text x="45" y="155" fill="#94a3b8" font-size="11" font-family="sans-serif">
        冷次定律核心口訣：<tspan fill="#34d399" font-weight="bold">「來拒去留」</tspan>——磁鐵 N 極靠近時，線圈左側產生 N 極抗拒排斥！
      </text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 11. 簡諧運動 SHM 圓周投影 (shm-projection) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'shm-projection'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Left Reference Circle -->
      <circle cx="90" cy="90" r="50" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="3 3" />
      <circle cx="90" cy="90" r="2.5" fill="#64748b" />

      <!-- Particle P on circle at angle θ -->
      <circle cx="125" cy="55" r="4.5" fill="#f59e0b" />
      <line x1="90" y1="90" x2="125" y2="55" stroke="#f59e0b" stroke-width="1.5" />
      <text x="132" y="52" fill="#f59e0b" font-size="10" font-family="sans-serif">P(ωt)</text>
      <text x="100" y="80" fill="#94a3b8" font-size="10" font-family="sans-serif">振幅 A</text>

      <!-- Projection line from circle to horizontal oscillator -->
      <line x1="125" y1="55" x2="125" y2="150" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2 2" />

      <!-- Horizontal oscillating track below -->
      <line x1="40" y1="150" x2="340" y2="150" stroke="#475569" stroke-width="2" />
      
      <!-- Center equilibrium mark (90, 150) -->
      <line x1="90" y1="144" x2="90" y2="156" stroke="#94a3b8" stroke-width="1.5" />
      <text x="82" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">x = 0</text>

      <!-- Amplitude marks -A and +A -->
      <line x1="40" y1="144" x2="40" y2="156" stroke="#94a3b8" stroke-width="1.5" />
      <text x="32" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">-A</text>

      <line x1="140" y1="144" x2="140" y2="156" stroke="#94a3b8" stroke-width="1.5" />
      <text x="134" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">+A</text>

      <!-- Projecting mass on track -->
      <circle cx="125" cy="150" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      <text x="110" y="138" fill="#38bdf8" font-size="10" font-family="sans-serif">x = A cos(ωt)</text>

      <!-- Explanation on the right -->
      <g transform="translate(195, 30)">
        <rect width="165" height="95" rx="8" fill="#0f172a" stroke="#1e293b" />
        <text x="12" y="24" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">SHM 的投影本質</text>
        <text x="12" y="44" fill="#e2e8f0" font-size="10" font-family="sans-serif">• 等速圓周在直徑上的投影</text>
        <text x="12" y="64" fill="#e2e8f0" font-size="10" font-family="sans-serif">• 平衡點：速度最大，合力為0</text>
        <text x="12" y="84" fill="#e2e8f0" font-size="10" font-family="sans-serif">• 端點處：速度為0，恢復力最大</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 12. 動植物細胞構造對比 (cell-structure) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'cell-structure'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Left: Plant Cell (Hexagonal with cell wall) -->
      <polygon points="40,90 65,45 135,45 160,90 135,135 65,135" fill="#14532d" fill-opacity="0.25" stroke="#22c55e" stroke-width="3" />
      <polygon points="45,90 68,50 132,50 155,90 132,130 68,130" fill="none" stroke="#86efac" stroke-width="1" />
      <!-- Nucleus -->
      <circle cx="85" cy="80" r="12" fill="#818cf8" stroke="#ffffff" stroke-width="1" />
      <!-- Large Vacuole -->
      <ellipse cx="120" cy="90" rx="18" ry="24" fill="#38bdf8" fill-opacity="0.35" stroke="#38bdf8" stroke-width="1.2" />
      <text x="105" y="94" fill="#bae6fd" font-size="9" font-family="sans-serif">大液胞</text>
      <!-- Chloroplasts -->
      <ellipse cx="75" cy="115" rx="7" ry="4" fill="#16a34a" />
      <ellipse cx="120" cy="60" rx="7" ry="4" fill="#16a34a" />
      <text x="75" y="152" fill="#22c55e" font-weight="bold" font-size="12" font-family="sans-serif">植物細胞</text>

      <!-- Right: Animal Cell (Round & flexible) -->
      <ellipse cx="270" cy="90" rx="55" ry="45" fill="#1e293b" fill-opacity="0.4" stroke="#f59e0b" stroke-width="2" />
      <!-- Nucleus -->
      <circle cx="270" cy="90" r="14" fill="#818cf8" stroke="#ffffff" stroke-width="1" />
      <text x="260" y="94" fill="#ffffff" font-size="9" font-family="sans-serif">細胞核</text>
      <!-- Small vacuoles -->
      <circle cx="240" cy="70" r="4" fill="#38bdf8" fill-opacity="0.5" />
      <circle cx="295" cy="110" r="5" fill="#38bdf8" fill-opacity="0.5" />
      <text x="245" y="152" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">動物細胞</text>

      <!-- Distinctions Legend Banner -->
      <g transform="translate(30, 8)">
        <text x="0" y="14" fill="#94a3b8" font-size="10" font-family="sans-serif">
          植物專有構造：<tspan fill="#22c55e" font-weight="bold">細胞壁</tspan>、<tspan fill="#22c55e" font-weight="bold">葉綠體</tspan>、<tspan fill="#38bdf8" font-weight="bold">大型中央液胞</tspan>
        </text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 13. 指數函數與對數函數對稱性與凹凸性 (exp-log-symmetry) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'exp-log-symmetry'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="對稱與凹凸性"
        titleColor="#f59e0b"
        :width="460"
        :height="260"
        :xRange="[-3.5, 5.5]"
        :yRange="[-2.5, 5.5]"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.6, label: 'y = 2^x', description: '凹向上指數' },
          { fn: (x: number) => x > 0.03 ? Math.log2(x) : NaN, domain: [0.03, 5.5], color: '#34d399', strokeWidth: 2.6, label: 'y = \\log_2 x', description: '凹向下對數' },
          { fn: (x: number) => x, color: '#f59e0b', strokeWidth: 1.5, dashArray: '4 4', label: 'y = x', description: '對稱軸' }
        ]"
        :lines="[
          { x1: 0, y1: 1, x2: 1, y2: 0, color: '#64748b', strokeWidth: 1, dashArray: '2 2' },
          { x1: 1, y1: 2, x2: 2, y2: 1, color: '#64748b', strokeWidth: 1, dashArray: '2 2' },
          { x1: 2, y1: 4, x2: 4, y2: 2, color: '#64748b', strokeWidth: 1, dashArray: '2 2' },
          { x1: 0, y1: 1, x2: 2, y2: 4, color: '#f43f5e', strokeWidth: 1.6, dashArray: '3 3' },
          { x1: 1, y1: 2, x2: 1, y2: 2.5, color: '#f43f5e', strokeWidth: 1.5 }
        ]"
        :points="[
          { x: 0, y: 1, color: '#38bdf8', label: '(0, 1)', labelPos: 'left' },
          { x: 1, y: 2, color: '#38bdf8', label: '(1, 2)', labelPos: 'left' },
          { x: 2, y: 4, color: '#38bdf8', label: '(2, 4)', labelPos: 'right' },
          { x: 1, y: 0, color: '#34d399', label: '(1, 0)', labelPos: 'bottom' },
          { x: 2, y: 1, color: '#34d399', label: '(2, 1)', labelPos: 'bottom-right' },
          { x: 4, y: 2, color: '#34d399', label: '(4, 2)', labelPos: 'bottom-right' },
          { x: 1, y: 2.5, color: '#f43f5e', radius: 3.5, label: '弦中點(1, 2.5)', labelPos: 'top-left' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <!-- Jensen Comparison note -->
          <text 
            :x="toScreenX(1) - 8" 
            :y="toScreenY(2.25)" 
            fill="#fda4af" 
            font-size="9" 
            font-family="sans-serif"
            text-anchor="end"
            class="chart-halo"
          >
            弦中點 2.5 > 曲線點 2.0
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        幾何核心：<span class="text-amber-400 font-bold">對稱於 y = x</span>；指數恆過 <span class="text-sky-400 font-bold">(0, 1)</span> 漸近線為 x 軸；對數恆過 <span class="text-emerald-400 font-bold">(1, 0)</span> 漸近線為 y 軸
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- ========================================================================= -->
    <!-- 14. 函數圖形動態變換與對稱 (function-transformation) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'function-transformation'" 
      class="w-full max-w-xl flex flex-col items-center gap-3 select-none"
    >
      <!-- Action Control Console -->
      <div class="w-full flex flex-col gap-2.5 p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 shadow-inner">
        <!-- Row 1: Base family picker & Fast Reset -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-300 flex items-center gap-1.5 shrink-0">
              <span class="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>基準函數參照：</span>
            </span>
            <div class="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 gap-1">
              <button
                type="button"
                @click="transFamily = 'exp'"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center"
                :class="transFamily === 'exp' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
                v-html="renderRichMathText('指數函數 $y = 2^x$')"
              />
              <button
                type="button"
                @click="transFamily = 'log'"
                class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center"
                :class="transFamily === 'log' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
                v-html="renderRichMathText('對數函數 $y = \\log_2 x$')"
              />
            </div>
          </div>

          <!-- Reset Button (重置鈕快速還原) -->
          <button
            type="button"
            @click="resetTrans"
            class="px-3 py-1 rounded-lg text-xs font-bold transition-all bg-rose-950/70 text-rose-300 hover:bg-rose-900 border border-rose-800/80 cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
            title="快速還原至基準函數原圖"
          >
            <span>↺ 快速重置原圖</span>
          </button>
        </div>

        <!-- Row 2: Dynamic Action Buttons -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <!-- Column A: 平移累加動作 (Shift) -->
          <div class="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-0.5">
              <span>平移動作（可多次點擊累加）</span>
              <span class="text-sky-300 font-mono font-bold">(h, k) = ({{ transShiftX }}, {{ transShiftY }})</span>
            </div>
            <div class="grid grid-cols-4 gap-1">
              <button
                type="button"
                @click="shiftLeft"
                class="py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95 transition-all font-medium text-center cursor-pointer"
                title="向左平移 1 單位 (x -> x + 1)"
              >
                ← 左移 1
              </button>
              <button
                type="button"
                @click="shiftRight"
                class="py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95 transition-all font-medium text-center cursor-pointer"
                title="向右平移 1 單位 (x -> x - 1)"
              >
                右移 1 →
              </button>
              <button
                type="button"
                @click="shiftUp"
                class="py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95 transition-all font-medium text-center cursor-pointer"
                title="向上平移 1 單位 (y -> y - 1)"
              >
                上移 1 ↑
              </button>
              <button
                type="button"
                @click="shiftDown"
                class="py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95 transition-all font-medium text-center cursor-pointer"
                title="向下平移 1 單位 (y -> y + 1)"
              >
                下移 1 ↓
              </button>
            </div>
          </div>

          <!-- Column B: 伸縮倍率動作 (Scale) -->
          <div class="flex flex-col gap-1.5 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div class="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-0.5">
              <span>伸縮動作（放大 2~6 / 縮小 1/2~1/4）</span>
              <span class="text-purple-300 font-mono font-bold">縱向倍率: × {{ scaleLabels[transScaleIndex] }}</span>
            </div>
            <div class="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                @click="scaleDown"
                :disabled="transScaleIndex === 0"
                class="py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95 transition-all font-medium text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="縮小 (1/2, 1/3, 1/4...)"
              >
                － 原圖縮小 ({{ scaleLabels[Math.max(0, transScaleIndex - 1)] }})
              </button>
              <button
                type="button"
                @click="scaleUp"
                :disabled="transScaleIndex === scaleFactors.length - 1"
                class="py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-95 transition-all font-medium text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                title="放大 (2, 3, 4, 5, 6...)"
              >
                ＋ 原圖放大 ({{ scaleLabels[Math.min(scaleFactors.length - 1, transScaleIndex + 1)] }})
              </button>
            </div>
          </div>
        </div>

        <!-- Row 3: 翻轉與對稱開關 (Symmetry & Reflections) -->
        <div class="flex flex-wrap items-center gap-1.5 pt-0.5 justify-center">
          <button
            type="button"
            @click="toggleReflectX"
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer active:scale-95"
            :class="transReflectX ? 'bg-rose-950 text-rose-300 border-rose-500 shadow-sm' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'"
          >
            上下翻轉 (x 軸) {{ transReflectX ? '✓' : '' }}
          </button>
          <button
            type="button"
            @click="toggleReflectY"
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer active:scale-95"
            :class="transReflectY ? 'bg-indigo-950 text-indigo-300 border-indigo-500 shadow-sm' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'"
          >
            左右翻轉 (y 軸) {{ transReflectY ? '✓' : '' }}
          </button>
          <button
            type="button"
            @click="toggleInverse"
            class="px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer active:scale-95"
            :class="transShowInverse ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'"
          >
            反函數對稱 (y = x) {{ transShowInverse ? '✓' : '' }}
          </button>
        </div>
      </div>

      <!-- FunctionGraph: 名稱統一改為「函數圖形」，精簡無多餘標語 -->
      <FunctionGraph
        title="函數圖形"
        titleColor="#38bdf8"
        :width="460"
        :height="260"
        :xRange="currentTransConfig.xRange"
        :yRange="currentTransConfig.yRange"
        :functions="currentTransConfig.functions"
        :points="currentTransConfig.points"
        :lines="currentTransConfig.lines"
      />

      <!-- Dynamic description badge: 精簡動態描述變換公式與效果 -->
      <div 
        class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-200 text-left font-sans shadow-inner leading-relaxed"
        v-html="renderRichMathText(currentTransConfig.description)"
      />
    </div>
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'transcendental-roots-2x'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="超越方程式圖形判定"
        titleColor="#38bdf8"
        :width="460"
        :height="250"
        :xRange="[-4.2, 3.8]"
        :yRange="[-1.5, 7.5]"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.6, label: 'y_1 = 2^x', description: '指數曲線' },
          { fn: (x: number) => x + 3, color: '#f43f5e', strokeWidth: 2.4, label: 'y_2 = x + 3', description: '斜率 1 直線' }
        ]"
        :points="[
          { x: -3, y: 0, color: '#f43f5e', label: '(-3, 0)', labelPos: 'bottom' },
          { x: 0, y: 3, color: '#f43f5e', label: '(0, 3)', labelPos: 'left' },
          { x: 0, y: 1, color: '#38bdf8', label: '(0, 1)', labelPos: 'right' },
          { x: -2.857, y: 0.143, color: '#f59e0b', radius: 4.5, label: '交點A: x ∈ (-3, -2)', labelPos: 'top-left' },
          { x: 2.457, y: 5.457, color: '#f59e0b', radius: 4.5, label: '交點B: x ∈ (2, 3)', labelPos: 'bottom-right' }
        ]"
        :lines="[
          { x1: 0, y1: 1, x2: 0, y2: 3, color: '#f59e0b', strokeWidth: 1.2, dashArray: '2 2' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <!-- Height comparison note at x = 0 -->
          <text 
            :x="toScreenX(0) + 6" 
            :y="toScreenY(2)" 
            fill="#fbbf24" 
            font-size="9.5" 
            font-family="sans-serif"
            class="chart-halo"
          >
            x=0: 直線高於指數
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        幾何破題本質：<span class="text-amber-400 font-bold">方程式實根個數 ≡ 函數圖形交點個數（恰 2 個交點）</span>，遠方指數必反超直線！
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 15-B. 範例二圖形交點判定實根區間：2^x = x + 6 (transcendental-roots-x6) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'transcendental-roots-x6'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="由圖形判定實根區間"
        titleColor="#38bdf8"
        :width="460"
        :height="250"
        :xRange="[-7.5, 5]"
        :yRange="[-1.5, 18]"
        :yStep="3"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.6, label: 'y_1 = 2^x', description: '指數曲線' },
          { fn: (x: number) => x + 6, color: '#f43f5e', strokeWidth: 2.4, label: 'y_2 = x + 6', description: '斜率 1 直線' }
        ]"
        :points="[
          { x: -6, y: 0, color: '#f43f5e', label: '(-6, 0)', labelPos: 'bottom' },
          { x: 0, y: 6, color: '#f43f5e', label: '(0, 6)', labelPos: 'left' },
          { x: 0, y: 1, color: '#38bdf8', label: '(0, 1)', labelPos: 'right' },
          { x: -5.984, y: 0.016, color: '#f59e0b', radius: 4.5, label: '交點A: x ∈ (-6, -5)', labelPos: 'top-right' },
          { x: 3.256, y: 9.256, color: '#f59e0b', radius: 4.5, label: '交點B: x ∈ (3, 4)', labelPos: 'bottom-right' }
        ]"
        :lines="[
          { x1: 0, y1: 1, x2: 0, y2: 6, color: '#f59e0b', strokeWidth: 1.2, dashArray: '2 2' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <text 
            :x="toScreenX(0) + 6" 
            :y="toScreenY(3.5)" 
            fill="#fbbf24" 
            font-size="9.5" 
            font-family="sans-serif"
            class="chart-halo"
          >
            x=0: 直線高於指數
          </text>
        </template>
      </FunctionGraph>

      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        勘根核心：直線截距 <span class="text-rose-400 font-bold">(-6, 0)</span> 與 <span class="text-rose-400 font-bold">(0, 6)</span>；在 <span class="text-amber-400 font-bold">(-6, -5)</span> 與 <span class="text-amber-400 font-bold">(3, 4)</span> 指數與直線高低互換，恰有 2 相異實根！
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 15-C. 對數方程圖形判定：x - log_2|x| = 1 (log-absolute-roots) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'log-absolute-roots'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="對數方程圖形判定"
        titleColor="#38bdf8"
        :width="460"
        :height="260"
        :xRange="[-3.5, 4.5]"
        :yRange="[-3.2, 3.5]"
        :functions="[
          { fn: (x: number) => x - 1, color: '#f43f5e', strokeWidth: 2.4, label: 'y_1 = x - 1', description: '斜率 1 直線' },
          { fn: (x: number) => x > 0.04 ? Math.log2(x) : NaN, domain: [0.04, 4.5], color: '#38bdf8', strokeWidth: 2.6, label: 'y_2 = \\log_2 |x|', description: '對稱對數 (x>0)' },
          { fn: (x: number) => x < -0.04 ? Math.log2(-x) : NaN, domain: [-3.5, -0.04], color: '#38bdf8', strokeWidth: 2.6, showInLegend: false }
        ]"
        :points="[
          { x: 1, y: 0, color: '#f59e0b', radius: 4.5, label: '整數解 (1, 0)', labelPos: 'bottom-right' },
          { x: 2, y: 1, color: '#f59e0b', radius: 4.5, label: '整數解 (2, 1)', labelPos: 'top-left' },
          { x: -0.366, y: -1.366, color: '#f59e0b', radius: 4.5, label: '交點: x ∈ (-1, 0)', labelPos: 'left' },
          { x: 0, y: -1, color: '#f43f5e', radius: 3, label: '(0, -1)', labelPos: 'right' },
          { x: -1, y: 0, color: '#38bdf8', radius: 3, label: '(-1, 0)', labelPos: 'top' }
        ]"
        :lines="[
          { x1: 0, y1: -3.2, x2: 0, y2: 3.5, color: '#64748b', strokeWidth: 1, dashArray: '2 2' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <text 
            :x="toScreenX(1.5)" 
            :y="toScreenY(-2)" 
            fill="#38bdf8" 
            font-size="9" 
            font-family="sans-serif"
            text-anchor="middle"
            class="chart-halo"
          >
            漸近線 x = 0 (真數 |x| > 0)
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        幾何破題本質：偶函數左右雙臂與直線恰交於 <span class="text-amber-400 font-bold">3 個交點</span>；其中整數解為 <span class="text-emerald-400 font-bold">x = 1 或 2</span>，負向於 <span class="text-sky-400 font-bold">x ∈ (-1, 0)</span> 必有一根！
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 16. 觀念辨析題多圖形交點分析 (transcendental-multi-roots) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'transcendental-multi-roots'" 
      class="w-full max-w-xl flex flex-col items-center gap-2.5 select-none"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <!-- Subpanel 1: 2^x = -x -->
        <FunctionGraph
          title="(1) $2^x = -x$"
          titleColor="#38bdf8"
          :width="230"
          :height="185"
          :xRange="[-3.5, 2.5]"
          :yRange="[-1.5, 4.5]"
          :functions="[
            { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.4, label: 'y_1 = 2^x' },
            { fn: (x: number) => -x, color: '#f43f5e', strokeWidth: 2.2, label: 'y_2 = -x' }
          ]"
          :points="[
            { x: -0.641, y: 0.641, color: '#f59e0b', label: '交點A: x ∈ (-1, 0)', labelPos: 'top-left' }
          ]"
          :badges="[
            { x: -0.5, y: -0.8, text: '恰有 1 個相異實根', color: '#e0f2fe', bgColor: '#0369a1' }
          ]"
        />

        <!-- Subpanel 2: 2^x = x^2 -->
        <FunctionGraph
          title="(2) $2^x = x^2$"
          titleColor="#a78bfa"
          :width="230"
          :height="185"
          :xRange="[-2.2, 4.5]"
          :yRange="[-1.5, 18]"
          :yStep="3"
          :functions="[
            { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.4, label: 'y_1 = 2^x' },
            { fn: (x: number) => x * x, color: '#f59e0b', strokeWidth: 2.2, label: 'y_2 = x^2' }
          ]"
          :points="[
            { x: -0.767, y: 0.588, color: '#f43f5e', label: '交點A: x ∈ (-1, 0)', labelPos: 'top-left' },
            { x: 2, y: 4, color: '#f43f5e', label: '交點B(2, 4)', labelPos: 'bottom-right' },
            { x: 4, y: 16, color: '#f43f5e', label: '交點C(4, 16)', labelPos: 'top-left' }
          ]"
          :badges="[
            { x: 1.15, y: -0.8, text: '共有 3 個相異實根！', color: '#ede9fe', bgColor: '#6d28d9' }
          ]"
        />
      </div>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        直覺化移項本質：不用盲目運算，<span class="text-sky-400 font-bold">將方程式拆成能畫的兩圖形</span>，由交點位置與曲線走勢一目了然！
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 15-E. 反函數垂直割線幾何對稱性 (inverse-perpendicular-secant) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'inverse-perpendicular-secant'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="反函數垂直割線對稱性 (m = -1)"
        titleColor="#f43f5e"
        :width="460"
        :height="270"
        :xRange="[-1.5, 10.5]"
        :yRange="[-1.5, 9.8]"
        :xStep="2"
        :yStep="2"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), domain: [-1.5, 3.25], color: '#38bdf8', strokeWidth: 2.5, label: 'y = 2^x', description: '指數曲線' },
          { fn: (x: number) => x > 0.04 ? Math.log2(x) : NaN, domain: [0.04, 10.2], color: '#34d399', strokeWidth: 2.5, label: 'y = \\log_2 x', description: '對數曲線' },
          { fn: (x: number) => x, color: '#f59e0b', strokeWidth: 1.5, dashArray: '4 4', label: 'y = x', description: '反函數對稱軸' },
          { fn: (x: number) => -x + 11, domain: [1.5, 9.5], color: '#f43f5e', strokeWidth: 2, label: 'L: x + y = 11', description: '垂直割線 (m = -1)' }
        ]"
        :lines="[
          { x1: 5.75, y1: 5.75, x2: 5.5, y2: 6.0, color: '#f59e0b', strokeWidth: 1.4 },
          { x1: 5.5, y1: 6.0, x2: 5.25, y2: 5.75, color: '#f59e0b', strokeWidth: 1.4 },
          { x1: 0, y1: 1, x2: 1, y2: 0, color: '#64748b', strokeWidth: 1, dashArray: '2 2' }
        ]"
        :points="[
          { x: 3, y: 8, color: '#38bdf8', radius: 4.5, label: 'P(3, 8)', labelPos: 'top-left' },
          { x: 8, y: 3, color: '#34d399', radius: 4.5, label: 'Q(8, 3)', labelPos: 'bottom-right' },
          { x: 5.5, y: 5.5, color: '#f59e0b', radius: 4, label: '中點 M(5.5, 5.5)', labelPos: 'top-right' },
          { x: 0, y: 1, color: '#94a3b8', radius: 2.5, label: '(0, 1)', labelPos: 'left' },
          { x: 1, y: 0, color: '#94a3b8', radius: 2.5, label: '(1, 0)', labelPos: 'bottom' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <text 
            :x="toScreenX(5.5) - 10" 
            :y="toScreenY(6.6)" 
            fill="#fda4af" 
            font-size="9.5" 
            font-family="sans-serif"
            class="chart-halo font-bold"
          >
            L ⊥ (y = x)
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        幾何割線核心：<span class="text-rose-400 font-bold">L: x + y = k 斜率為 -1 垂直於對稱軸 y = x</span> $\implies$ P、Q 必互為對稱點，中點必在 y = x 上，斜率為 -1！
      </div>
    </div>

  </div>
</template>
