<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-vue-next';
import { renderRichMathText, renderFunctionMathLabel } from '../utils/mathRenderer';
import katex from 'katex';

// KaTeX 點標籤的 foreignObject 尺寸
const TEX_LABEL_W = 280;
const TEX_LABEL_H = 56;

function renderPointTex(tex: string): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode: false });
  } catch {
    return tex;
  }
}

export interface PlotFunction {
  id?: string;
  fn?: (x: number) => number;
  parametric?: (t: number) => [number, number];
  domain?: [number, number];
  samples?: number;
  color: string;
  strokeWidth?: number;
  dashArray?: string;
  label?: string;
  description?: string;
  showInLegend?: boolean;
  labelX?: number;
  labelY?: number;
  labelPos?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left';
}

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  radius?: number;
  labelPos?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  latex?: string; // 以 KaTeX 渲染的數學標籤（優先於 label）
  hideMarker?: boolean; // 僅顯示標籤、不畫點（用於圖上數學註記）
  pulse?: boolean;
  showPill?: boolean;
}

export interface PlotLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
  strokeWidth?: number;
  dashArray?: string;
  label?: string;
  labelX?: number;
  labelY?: number;
}

export interface PlotBadge {
  x: number;
  y: number;
  text: string;
  color?: string;
  bgColor?: string;
}

const props = withDefaults(defineProps<{
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  xStep?: number;
  yStep?: number;
  squareGrid?: boolean;
  padding?: { top: number; right: number; bottom: number; left: number };
  showGrid?: boolean;
  showAxes?: boolean;
  showAxisArrows?: boolean;
  showControls?: boolean;
  zoomable?: boolean;
  pannable?: boolean;
  gridColor?: string;
  axisColor?: string;
  functions?: PlotFunction[];
  points?: PlotPoint[];
  lines?: PlotLine[];
  badges?: PlotBadge[];
  title?: string;
  titleColor?: string;
  clipId?: string;
}>(), {
  width: 460,
  height: 250,
  xRange: () => [-4, 4],
  yRange: () => [-2, 6],
  xStep: 1,
  yStep: 1,
  squareGrid: true,
  padding: () => ({ top: 18, right: 24, bottom: 22, left: 24 }),
  showGrid: true,
  showAxes: true,
  showAxisArrows: true,
  showControls: true,
  zoomable: true,
  pannable: true,
  gridColor: '#1e293b',
  axisColor: '#64748b',
  functions: () => [],
  points: () => [],
  lines: () => [],
  badges: () => [],
  titleColor: '#38bdf8',
  clipId: () => `clip-${Math.random().toString(36).slice(2, 9)}`
});

// Functions to show in the Legend (圖例)
const legendFunctions = computed(() => {
  return props.functions.filter(f => f.label && f.showInLegend !== false);
});

const plotWidth = computed(() => props.width - props.padding.left - props.padding.right);
const plotHeight = computed(() => props.height - props.padding.top - props.padding.bottom);

// 1:1 Aspect Ratio (Square Grid) Range Computation
function computeInitialRanges(): { xRange: [number, number]; yRange: [number, number] } {
  const [xMin, xMax] = props.xRange;
  const [yMin, yMax] = props.yRange;
  const xSpan = Math.max(0.1, xMax - xMin);
  const ySpan = Math.max(0.1, yMax - yMin);
  const xCenter = (xMin + xMax) / 2;
  const yCenter = (yMin + yMax) / 2;

  if (!props.squareGrid) {
    return { xRange: [xMin, xMax], yRange: [yMin, yMax] };
  }

  // To guarantee 1 unit on X = 1 unit on Y in pixels (1:1 aspect ratio),
  // unit = pixelsPerUnit. Using min(unitX, unitY) ensures both requested ranges are fully visible!
  const unitX = plotWidth.value / xSpan;
  const unitY = plotHeight.value / ySpan;
  const unit = Math.min(unitX, unitY);
  const newXSpan = plotWidth.value / unit;
  const newYSpan = plotHeight.value / unit;

  return {
    xRange: [xCenter - newXSpan / 2, xCenter + newXSpan / 2],
    yRange: [yCenter - newYSpan / 2, yCenter + newYSpan / 2]
  };
}

// Interactive Pan & Zoom State
const currentXRange = ref<[number, number]>([...props.xRange]);
const currentYRange = ref<[number, number]>([...props.yRange]);

function resetView() {
  const { xRange, yRange } = computeInitialRanges();
  currentXRange.value = [...xRange];
  currentYRange.value = [...yRange];
}

watch([() => props.xRange, () => props.yRange, () => props.width, () => props.height, () => props.squareGrid], () => {
  resetView();
}, { deep: true, immediate: true });

// Coordinate transform functions
function toScreenX(x: number): number {
  const [xMin, xMax] = currentXRange.value;
  return props.padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth.value;
}

function toScreenY(y: number): number {
  const [yMin, yMax] = currentYRange.value;
  return props.padding.top + ((yMax - y) / (yMax - yMin)) * plotHeight.value;
}

// Compute dynamic grid lines (Strictly square when squareGrid is true)
const verticalGridLines = computed(() => {
  if (!props.showGrid) return [];
  const [xMin, xMax] = currentXRange.value;
  const span = xMax - xMin;
  let step = props.xStep;
  if (span > 20) step = props.xStep * 2;
  if (span < 4) step = props.xStep * 0.5;

  const lines: { x: number; isZero: boolean }[] = [];
  const start = Math.ceil(xMin / step) * step;
  for (let x = start; x <= xMax; x += step) {
    lines.push({ x: toScreenX(x), isZero: Math.abs(x) < 1e-5 });
  }
  return lines;
});

const horizontalGridLines = computed(() => {
  if (!props.showGrid) return [];
  const [yMin, yMax] = currentYRange.value;
  const span = yMax - yMin;
  let step = props.yStep;
  if (props.squareGrid) {
    const xSpan = currentXRange.value[1] - currentXRange.value[0];
    if (xSpan > 20) step = props.yStep * 2;
    if (xSpan < 4) step = props.yStep * 0.5;
  } else {
    if (span > 20) step = props.yStep * 2;
    if (span < 4) step = props.yStep * 0.5;
  }

  const lines: { y: number; isZero: boolean }[] = [];
  const start = Math.ceil(yMin / step) * step;
  for (let y = start; y <= yMax; y += step) {
    lines.push({ y: toScreenY(y), isZero: Math.abs(y) < 1e-5 });
  }
  return lines;
});

// Axes positions
const xAxisY = computed(() => {
  const [yMin, yMax] = currentYRange.value;
  if (0 >= yMin && 0 <= yMax) return toScreenY(0);
  if (0 < yMin) return toScreenY(yMin);
  return toScreenY(yMax);
});

const yAxisX = computed(() => {
  const [xMin, xMax] = currentXRange.value;
  if (0 >= xMin && 0 <= xMax) return toScreenX(0);
  if (0 < xMin) return toScreenX(xMin);
  return toScreenX(xMax);
});

// Function path generator (smooth mathematical evaluation)
function generatePath(fnObj: PlotFunction): string {
  const [xMin, xMax] = currentXRange.value;
  const [yMin, yMax] = currentYRange.value;
  const domain = fnObj.domain || [xMin, xMax];
  const samples = fnObj.samples || 240;
  const step = (domain[1] - domain[0]) / samples;

  let d = '';
  let inSegment = false;

  const yRangeSpan = yMax - yMin;
  const yClipMin = yMin - yRangeSpan * 0.5;
  const yClipMax = yMax + yRangeSpan * 0.5;

  for (let i = 0; i <= samples; i++) {
    const t = domain[0] + i * step;
    let x: number, y: number;

    if (fnObj.parametric) {
      const pt = fnObj.parametric(t);
      x = pt[0];
      y = pt[1];
    } else if (fnObj.fn) {
      x = t;
      y = fnObj.fn(x);
    } else {
      continue;
    }

    if (isNaN(y) || isNaN(x) || !isFinite(y) || !isFinite(x) || y < yClipMin || y > yClipMax) {
      inSegment = false;
      continue;
    }

    const sx = toScreenX(x).toFixed(1);
    const sy = toScreenY(y).toFixed(1);

    if (!inSegment) {
      d += `M ${sx},${sy} `;
      inSegment = true;
    } else {
      d += `L ${sx},${sy} `;
    }
  }

  return d.trim();
}

function getPointLabelOffset(pos?: string): { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' } {
  switch (pos) {
    case 'top':
      return { dx: 0, dy: -9, anchor: 'middle' };
    case 'bottom':
      return { dx: 0, dy: 16, anchor: 'middle' };
    case 'left':
      return { dx: -9, dy: 4, anchor: 'end' };
    case 'right':
      return { dx: 9, dy: 4, anchor: 'start' };
    case 'top-left':
      return { dx: -8, dy: -8, anchor: 'end' };
    case 'bottom-left':
      return { dx: -8, dy: 15, anchor: 'end' };
    case 'bottom-right':
      return { dx: 8, dy: 15, anchor: 'start' };
    case 'top-right':
    default:
      return { dx: 8, dy: -8, anchor: 'start' };
  }
}

// KaTeX 標籤框的水平定位：依錨點（start / middle / end）對齊
function getTexLabelBoxX(pt: PlotPoint): number {
  const off = getPointLabelOffset(pt.labelPos);
  const ax = toScreenX(pt.x) + off.dx;
  if (off.anchor === 'end') return ax - TEX_LABEL_W;
  if (off.anchor === 'middle') return ax - TEX_LABEL_W / 2;
  return ax;
}

function getTexLabelJustify(pt: PlotPoint): string {
  const anchor = getPointLabelOffset(pt.labelPos).anchor;
  if (anchor === 'end') return 'flex-end';
  if (anchor === 'middle') return 'center';
  return 'flex-start';
}

// ==========================================
// Pan & Zoom Interactions (Aspect-Ratio Preserving)
// ==========================================
const svgRef = ref<SVGSVGElement | null>(null);
const isDragging = ref(false);
const dragStart = ref({
  x: 0,
  y: 0,
  xRange: [0, 0] as [number, number],
  yRange: [0, 0] as [number, number]
});

function onMouseDown(e: MouseEvent) {
  if (!props.pannable) return;
  if ((e.target as HTMLElement)?.closest?.('.graph-controls')) return;
  
  isDragging.value = true;
  dragStart.value = {
    x: e.clientX,
    y: e.clientY,
    xRange: [...currentXRange.value],
    yRange: [...currentYRange.value]
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const dxPix = e.clientX - dragStart.value.x;
  const dyPix = e.clientY - dragStart.value.y;

  const [xMin0, xMax0] = dragStart.value.xRange;
  const [yMin0, yMax0] = dragStart.value.yRange;

  const xSpan = xMax0 - xMin0;
  const ySpan = yMax0 - yMin0;

  const dxMath = -(dxPix / plotWidth.value) * xSpan;
  const dyMath = +(dyPix / plotHeight.value) * ySpan;

  currentXRange.value = [xMin0 + dxMath, xMax0 + dxMath];
  currentYRange.value = [yMin0 + dyMath, yMax0 + dyMath];
}

function onMouseUp() {
  isDragging.value = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
}

function zoom(factor: number, centerX?: number, centerY?: number) {
  const [xMin, xMax] = currentXRange.value;
  const [yMin, yMax] = currentYRange.value;

  const cx = centerX !== undefined ? centerX : (xMin + xMax) / 2;
  const cy = centerY !== undefined ? centerY : (yMin + yMax) / 2;

  const newXSpan = (xMax - xMin) * factor;
  const newYSpan = (yMax - yMin) * factor;

  // Zoom bounds protection
  if (newXSpan < 0.3 || newXSpan > 80) return;

  const rx = (cx - xMin) / (xMax - xMin);
  const ry = (cy - yMin) / (yMax - yMin);

  currentXRange.value = [cx - rx * newXSpan, cx + (1 - rx) * newXSpan];
  currentYRange.value = [cy - ry * newYSpan, cy + (1 - ry) * newYSpan];
}

function onWheel(e: WheelEvent) {
  if (!props.zoomable) return;
  e.preventDefault();

  const factor = e.deltaY < 0 ? 0.88 : 1.14;

  if (svgRef.value) {
    const rect = svgRef.value.getBoundingClientRect();
    const mousePxX = (e.clientX - rect.left) * (props.width / rect.width);
    const mousePxY = (e.clientY - rect.top) * (props.height / rect.height);

    const [xMin, xMax] = currentXRange.value;
    const [yMin, yMax] = currentYRange.value;
    const mathX = xMin + ((mousePxX - props.padding.left) / plotWidth.value) * (xMax - xMin);
    const mathY = yMax - ((mousePxY - props.padding.top) / plotHeight.value) * (yMax - yMin);

    zoom(factor, mathX, mathY);
  } else {
    zoom(factor);
  }
}

// Touch support for mobile
let touchStartDist = 0;
let touchStartRanges = { xRange: [0, 0] as [number, number], yRange: [0, 0] as [number, number] };

function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 1 && props.pannable) {
    isDragging.value = true;
    dragStart.value = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      xRange: [...currentXRange.value],
      yRange: [...currentYRange.value]
    };
  } else if (e.touches.length === 2 && props.zoomable) {
    isDragging.value = false;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    touchStartDist = Math.hypot(dx, dy);
    touchStartRanges = {
      xRange: [...currentXRange.value],
      yRange: [...currentYRange.value]
    };
  }
}

function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 1 && isDragging.value && props.pannable) {
    e.preventDefault();
    const dxPix = e.touches[0].clientX - dragStart.value.x;
    const dyPix = e.touches[0].clientY - dragStart.value.y;

    const [xMin0, xMax0] = dragStart.value.xRange;
    const [yMin0, yMax0] = dragStart.value.yRange;

    const xSpan = xMax0 - xMin0;
    const ySpan = yMax0 - yMin0;

    const dxMath = -(dxPix / plotWidth.value) * xSpan;
    const dyMath = +(dyPix / plotHeight.value) * ySpan;

    currentXRange.value = [xMin0 + dxMath, xMax0 + dxMath];
    currentYRange.value = [yMin0 + dyMath, yMax0 + dyMath];
  } else if (e.touches.length === 2 && props.zoomable && touchStartDist > 0) {
    e.preventDefault();
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const factor = touchStartDist / dist;

    const [xMin0, xMax0] = touchStartRanges.xRange;
    const [yMin0, yMax0] = touchStartRanges.yRange;
    const cx = (xMin0 + xMax0) / 2;
    const cy = (yMin0 + yMax0) / 2;

    const newXSpan = (xMax0 - xMin0) * factor;
    const newYSpan = (yMax0 - yMin0) * factor;
    if (newXSpan >= 0.3 && newXSpan <= 80) {
      currentXRange.value = [cx - newXSpan / 2, cx + newXSpan / 2];
      currentYRange.value = [cy - newYSpan / 2, cy + newYSpan / 2];
    }
  }
}

function onTouchEnd() {
  isDragging.value = false;
  touchStartDist = 0;
}
</script>

<template>
  <div class="relative w-full rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl overflow-hidden flex flex-col group select-none">
    
    <!-- Top Header Bar: Title, Function Legend (圖例), and Toolbar Controls -->
    <div 
      v-if="title || legendFunctions.length > 0 || showControls"
      class="px-3.5 py-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-sm"
    >
      <!-- Left: Title & Legend Items (圖例) -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-3">
        <!-- Optional Title -->
        <span 
          v-if="title" 
          class="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-1.5"
          :style="{ color: titleColor }"
        >
          <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: titleColor }"></span>
          <span v-html="renderRichMathText(title)"></span>
        </span>

        <!-- Function Legend (圖例) Badges -->
        <div 
          v-if="legendFunctions.length > 0"
          class="flex flex-wrap items-center gap-1.5"
        >
          <div 
            v-for="(fnItem, fIdx) in legendFunctions" 
            :key="fIdx"
            class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs text-slate-200 shadow-sm"
          >
            <!-- Colored line swatch indicating stroke color and style -->
            <svg width="16" height="8" class="shrink-0">
              <line 
                x1="0" 
                y1="4" 
                x2="16" 
                y2="4" 
                :stroke="fnItem.color" 
                :stroke-width="fnItem.strokeWidth ? Math.min(fnItem.strokeWidth, 2.5) : 2"
                :stroke-dasharray="fnItem.dashArray" 
              />
            </svg>
            <span class="font-bold text-slate-100 flex items-center" v-html="renderFunctionMathLabel(fnItem.label || '')"></span>
            <span v-if="fnItem.description" class="text-[10px] text-slate-400 font-normal">
              {{ fnItem.description }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Interactive View Controls -->
      <div 
        v-if="showControls"
        class="graph-controls flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-0.5 shadow-sm ml-auto"
      >
        <button 
          type="button"
          title="放大視圖"
          @click.stop="zoom(0.85)"
          class="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ZoomIn class="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          title="縮小視圖"
          @click.stop="zoom(1.18)"
          class="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <ZoomOut class="w-3.5 h-3.5" />
        </button>
        <button 
          type="button"
          title="重置視圖"
          @click.stop="resetView"
          class="w-6 h-6 flex items-center justify-center rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RotateCcw class="w-3 h-3" />
        </button>
      </div>
    </div>

    <!-- SVG Coordinate Plane -->
    <div class="relative w-full overflow-hidden">
      <svg 
        ref="svgRef"
        :viewBox="`0 0 ${width} ${height}`" 
        class="w-full h-auto drop-shadow-md transition-colors"
        :class="pannable ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''"
        @mousedown="onMouseDown"
        @wheel.prevent="onWheel"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <defs>
          <!-- Clip path for plotting area to cleanly cut off curves at borders -->
          <clipPath :id="clipId">
            <rect 
              :x="padding.left - 2" 
              :y="padding.top - 2" 
              :width="plotWidth + 4" 
              :height="plotHeight + 4" 
            />
          </clipPath>
          <marker id="arrow-axis-generic" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" :fill="axisColor" />
          </marker>
        </defs>

        <!-- Coordinate Area Background -->
        <rect :width="width" :height="height" fill="#090d16" />

        <!-- Background Coordinate Grid (Strictly 1:1 Square when squareGrid is true) -->
        <g v-if="showGrid" :stroke="gridColor" stroke-width="0.8" stroke-dasharray="2 2">
          <!-- Vertical Grid Lines -->
          <line 
            v-for="(gl, idx) in verticalGridLines" 
            :key="`vg-${idx}`"
            :x1="gl.x" 
            :y1="padding.top" 
            :x2="gl.x" 
            :y2="height - padding.bottom"
            :opacity="gl.isZero ? 0.2 : 0.6"
          />
          <!-- Horizontal Grid Lines -->
          <line 
            v-for="(gl, idx) in horizontalGridLines" 
            :key="`hg-${idx}`"
            :x1="padding.left" 
            :y1="gl.y" 
            :x2="width - padding.right" 
            :y2="gl.y"
            :opacity="gl.isZero ? 0.2 : 0.6"
          />
        </g>

        <!-- Main Coordinate Axes -->
        <g v-if="showAxes" :stroke="axisColor" stroke-width="1.3">
          <!-- X-axis -->
          <line 
            :x1="padding.left - 6" 
            :y1="xAxisY" 
            :x2="width - padding.right + 12" 
            :y2="xAxisY"
            :marker-end="showAxisArrows ? 'url(#arrow-axis-generic)' : undefined"
          />
          <!-- Y-axis -->
          <line 
            :x1="yAxisX" 
            :y1="height - padding.bottom + 6" 
            :y2="padding.top - 10"
            :x2="yAxisX"
            :marker-end="showAxisArrows ? 'url(#arrow-axis-generic)' : undefined"
          />

          <!-- Axis Labels (with dark halo outline to prevent overlapping) -->
          <text 
            :x="width - padding.right + 16" 
            :y="xAxisY + 4" 
            :fill="axisColor" 
            font-size="11" 
            font-family="'KaTeX_Math', 'Times New Roman', serif" 
            font-style="italic"
            class="chart-halo"
          >
            x
          </text>
          <text 
            :x="yAxisX - 4" 
            :y="padding.top - 12" 
            :fill="axisColor" 
            font-size="11" 
            font-family="'KaTeX_Math', 'Times New Roman', serif" 
            font-style="italic" 
            text-anchor="end"
            class="chart-halo"
          >
            y
          </text>
          <text 
            :x="yAxisX - 6" 
            :y="xAxisY + 12" 
            :fill="axisColor" 
            font-size="10" 
            font-family="'KaTeX_Main', serif" 
            text-anchor="end"
            class="chart-halo"
          >
            O
          </text>
        </g>

        <!-- Additional Lines (e.g. Asymptotes, Chords, Symmetry Line) -->
        <g v-if="lines && lines.length > 0">
          <line 
            v-for="(ln, lIdx) in lines" 
            :key="`line-${lIdx}`"
            :x1="toScreenX(ln.x1)" 
            :y1="toScreenY(ln.y1)" 
            :x2="toScreenX(ln.x2)" 
            :y2="toScreenY(ln.y2)" 
            :stroke="ln.color || '#94a3b8'" 
            :stroke-width="ln.strokeWidth || 1.5"
            :stroke-dasharray="ln.dashArray"
          />
        </g>

        <!-- Plotted Mathematical Functions (Clipped to Plot Window) -->
        <g :clip-path="`url(#${clipId})`">
          <path 
            v-for="(fnObj, fIdx) in functions" 
            :key="fnObj.id || `fn-${fIdx}`"
            :d="generatePath(fnObj)"
            fill="none" 
            :stroke="fnObj.color" 
            :stroke-width="fnObj.strokeWidth || 2.4"
            :stroke-dasharray="fnObj.dashArray"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>

        <!-- Marked Points with Exact Coordinates and Halo Background -->
        <g v-if="points && points.length > 0">
          <g 
            v-for="(pt, pIdx) in points" 
            :key="`pt-${pIdx}`"
          >
            <!-- Outer subtle glow -->
            <circle 
              v-if="!pt.hideMarker"
              :cx="toScreenX(pt.x)" 
              :cy="toScreenY(pt.y)" 
              :r="(pt.radius || 4) + 1.2" 
              :fill="pt.color || '#38bdf8'" 
              stroke="#ffffff" 
              stroke-width="1.4" 
            />
            <!-- KaTeX 數學標籤（以 foreignObject 嵌入，確保分數、下標等以 KaTeX 正確排版） -->
            <foreignObject
              v-if="pt.latex"
              :x="getTexLabelBoxX(pt)"
              :y="toScreenY(pt.y) + getPointLabelOffset(pt.labelPos).dy - 4 - TEX_LABEL_H / 2"
              :width="TEX_LABEL_W"
              :height="TEX_LABEL_H"
              class="pointer-events-none"
              style="overflow: visible"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="tex-point-label"
                :style="{ color: pt.color || '#cbd5e1', justifyContent: getTexLabelJustify(pt) }"
                v-html="renderPointTex(pt.latex)"
              ></div>
            </foreignObject>
            <!-- Point Text Label with Protective Text Halo -->
            <text 
              v-else-if="pt.label"
              :x="toScreenX(pt.x) + getPointLabelOffset(pt.labelPos).dx" 
              :y="toScreenY(pt.y) + getPointLabelOffset(pt.labelPos).dy" 
              :fill="pt.color || '#cbd5e1'" 
              font-size="11" 
              font-weight="bold"
              font-family="'KaTeX_Math', 'KaTeX_Main', sans-serif"
              :text-anchor="getPointLabelOffset(pt.labelPos).anchor"
              class="chart-halo"
            >
              {{ pt.label }}
            </text>
          </g>
        </g>

        <!-- Badges / Annotations -->
        <g v-if="badges && badges.length > 0">
          <g v-for="(b, bIdx) in badges" :key="`badge-${bIdx}`" :transform="`translate(${toScreenX(b.x)}, ${toScreenY(b.y)})`">
            <rect 
              x="-56" 
              y="-12" 
              width="112" 
              height="24" 
              rx="6" 
              :fill="b.bgColor || '#0369a1'" 
              fill-opacity="0.9" 
              :stroke="b.color || '#38bdf8'" 
              stroke-width="1" 
            />
            <text 
              x="0" 
              y="4.5" 
              :fill="b.color || '#ffffff'" 
              font-size="10.5" 
              font-weight="bold" 
              font-family="sans-serif" 
              text-anchor="middle"
            >
              {{ b.text }}
            </text>
          </g>
        </g>

        <!-- Default Slot for any custom overlays (e.g. arrows, brackets) -->
        <slot 
          :toScreenX="toScreenX" 
          :toScreenY="toScreenY" 
          :plotWidth="plotWidth" 
          :plotHeight="plotHeight" 
        />
      </svg>

      <!-- Small draggable hint badge on bottom left of card -->
      <div 
        v-if="pannable"
        class="absolute bottom-1.5 left-3 flex items-center gap-1 text-[10px] text-slate-500 opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none"
      >
        <Move class="w-3 h-3" />
        <span>拖曳平移 / 滾輪縮放</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Text-halo outline: ensures text is 100% legible even if crossing function curves */
.chart-halo {
  paint-order: stroke fill;
  stroke: #090d16;
  stroke-width: 4px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* KaTeX 點標籤：深色光暈避免與曲線重疊時難以辨識 */
.tex-point-label {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  text-shadow: 0 0 3px #090d16, 0 0 3px #090d16, 0 0 4px #090d16;
}
</style>
