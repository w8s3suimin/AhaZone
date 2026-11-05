<script setup lang="ts">
import { computed } from 'vue';

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
  labelX?: number; // x value where label is pinned
  labelY?: number; // optional custom y
  labelPos?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left';
}

export interface PlotPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
  radius?: number;
  labelPos?: 'top' | 'bottom' | 'left' | 'right' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  pulse?: boolean;
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
  padding?: { top: number; right: number; bottom: number; left: number };
  showGrid?: boolean;
  showAxes?: boolean;
  showAxisArrows?: boolean;
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
  width: 420,
  height: 220,
  xRange: () => [-4, 4],
  yRange: () => [-2, 6],
  xStep: 1,
  yStep: 1,
  padding: () => ({ top: 24, right: 26, bottom: 24, left: 26 }),
  showGrid: true,
  showAxes: true,
  showAxisArrows: true,
  gridColor: '#1e293b',
  axisColor: '#64748b',
  functions: () => [],
  points: () => [],
  lines: () => [],
  badges: () => [],
  titleColor: '#38bdf8',
  clipId: () => `clip-${Math.random().toString(36).slice(2, 9)}`
});

const plotWidth = computed(() => props.width - props.padding.left - props.padding.right);
const plotHeight = computed(() => props.height - props.padding.top - props.padding.bottom);

// Coordinate transform functions
function toScreenX(x: number): number {
  const [xMin, xMax] = props.xRange;
  return props.padding.left + ((x - xMin) / (xMax - xMin)) * plotWidth.value;
}

function toScreenY(y: number): number {
  const [yMin, yMax] = props.yRange;
  return props.padding.top + ((yMax - y) / (yMax - yMin)) * plotHeight.value;
}

// Compute grid lines
const verticalGridLines = computed(() => {
  if (!props.showGrid) return [];
  const [xMin, xMax] = props.xRange;
  const lines: { x: number; isZero: boolean }[] = [];
  const start = Math.ceil(xMin / props.xStep) * props.xStep;
  for (let x = start; x <= xMax; x += props.xStep) {
    lines.push({ x: toScreenX(x), isZero: Math.abs(x) < 1e-6 });
  }
  return lines;
});

const horizontalGridLines = computed(() => {
  if (!props.showGrid) return [];
  const [yMin, yMax] = props.yRange;
  const lines: { y: number; isZero: boolean }[] = [];
  const start = Math.ceil(yMin / props.yStep) * props.yStep;
  for (let y = start; y <= yMax; y += props.yStep) {
    lines.push({ y: toScreenY(y), isZero: Math.abs(y) < 1e-6 });
  }
  return lines;
});

// Axes positions
const xAxisY = computed(() => {
  const [yMin, yMax] = props.yRange;
  if (0 >= yMin && 0 <= yMax) return toScreenY(0);
  return toScreenY(yMin);
});

const yAxisX = computed(() => {
  const [xMin, xMax] = props.xRange;
  if (0 >= xMin && 0 <= xMax) return toScreenX(0);
  return toScreenX(xMin);
});

// Function path generator (smooth mathematical evaluation)
function generatePath(fnObj: PlotFunction): string {
  const [xMin, xMax] = props.xRange;
  const [yMin, yMax] = props.yRange;
  const domain = fnObj.domain || [xMin, xMax];
  const samples = fnObj.samples || 180;
  const step = (domain[1] - domain[0]) / samples;

  let d = '';
  let inSegment = false;

  const yRangeSpan = yMax - yMin;
  const yClipMin = yMin - yRangeSpan * 0.4;
  const yClipMax = yMax + yRangeSpan * 0.4;

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
      return { dx: 0, dy: -8, anchor: 'middle' };
    case 'bottom':
      return { dx: 0, dy: 15, anchor: 'middle' };
    case 'left':
      return { dx: -8, dy: 4, anchor: 'end' };
    case 'right':
      return { dx: 8, dy: 4, anchor: 'start' };
    case 'top-left':
      return { dx: -7, dy: -7, anchor: 'end' };
    case 'bottom-left':
      return { dx: -7, dy: 14, anchor: 'end' };
    case 'bottom-right':
      return { dx: 7, dy: 14, anchor: 'start' };
    case 'top-right':
    default:
      return { dx: 7, dy: -7, anchor: 'start' };
  }
}
</script>

<template>
  <svg 
    :viewBox="`0 0 ${width} ${height}`" 
    class="w-full h-auto drop-shadow-md select-none"
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

    <!-- Outer Card Background -->
    <rect :width="width" :height="height" rx="14" fill="#090d16" stroke="#1e293b" />

    <!-- Optional Title Header -->
    <text 
      v-if="title" 
      :x="padding.left + 4" 
      :y="padding.top - 8" 
      :fill="titleColor" 
      font-size="12" 
      font-weight="bold" 
      font-family="'KaTeX_Math', 'KaTeX_Main', sans-serif"
    >
      {{ title }}
    </text>

    <!-- Background Coordinate Grid -->
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
        :x2="yAxisX" 
        :y2="padding.top - 10"
        :marker-end="showAxisArrows ? 'url(#arrow-axis-generic)' : undefined"
      />

      <!-- Axis Labels -->
      <text 
        :x="width - padding.right + 16" 
        :y="xAxisY + 4" 
        :fill="axisColor" 
        font-size="11" 
        font-family="'KaTeX_Math', 'Times New Roman', serif" 
        font-style="italic"
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

    <!-- Marked Points with Exact Coordinates -->
    <g v-if="points && points.length > 0">
      <g 
        v-for="(pt, pIdx) in points" 
        :key="`pt-${pIdx}`"
      >
        <!-- Highlight glow/ring -->
        <circle 
          :cx="toScreenX(pt.x)" 
          :cy="toScreenY(pt.y)" 
          :r="(pt.radius || 4) + 1" 
          :fill="pt.color || '#38bdf8'" 
          stroke="#ffffff" 
          stroke-width="1.3" 
        />
        <!-- Point Text Label -->
        <text 
          v-if="pt.label"
          :x="toScreenX(pt.x) + getPointLabelOffset(pt.labelPos).dx" 
          :y="toScreenY(pt.y) + getPointLabelOffset(pt.labelPos).dy" 
          :fill="pt.color || '#cbd5e1'" 
          font-size="10.5" 
          font-family="'KaTeX_Main', 'Cambria Math', 'Times New Roman', serif"
          :text-anchor="getPointLabelOffset(pt.labelPos).anchor"
        >
          {{ pt.label }}
        </text>
      </g>
    </g>

    <!-- Badges / Annotations -->
    <g v-if="badges && badges.length > 0">
      <g v-for="(b, bIdx) in badges" :key="`badge-${bIdx}`" :transform="`translate(${toScreenX(b.x)}, ${toScreenY(b.y)})`">
        <rect 
          x="-50" 
          y="-12" 
          width="100" 
          height="24" 
          rx="6" 
          :fill="b.bgColor || '#0369a1'" 
          fill-opacity="0.85" 
          :stroke="b.color || '#38bdf8'" 
          stroke-width="1" 
        />
        <text 
          x="0" 
          y="4" 
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

    <!-- Default Slot for any custom overlays (arrows, brackets, callouts) -->
    <slot 
      :toScreenX="toScreenX" 
      :toScreenY="toScreenY" 
      :plotWidth="plotWidth" 
      :plotHeight="plotHeight" 
    />
  </svg>
</template>
