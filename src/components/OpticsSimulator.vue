<script setup lang="ts">
import { ref, computed } from 'vue';
import { Eye, HelpCircle, MousePointer2 } from 'lucide-vue-next';

// 4 種光學儀器模式
type OpticalDevice = 'convex-lens' | 'concave-lens' | 'convex-mirror' | 'concave-mirror';

const currentDevice = ref<OpticalDevice>('convex-lens');

// 幾何光學畫布參數 (SVG 640 x 260)
const SVG_WIDTH = 640;
const SVG_HEIGHT = 260;
const Y_AXIS = 130;
const X_CENTER = 320; // 鏡心或面鏡頂點
const F_PX = 80;      // 焦距 1F = 80px, 2F = 160px
const HO = 48;        // 物體高度 48px

// 畫布邊界限制 (射線裁剪邊界)
const X_MIN = 15;
const X_MAX = 625;
const Y_MIN = 12;
const Y_MAX = 248;

// 物距 do (像素)，預設為 2.5F = 200px (物在 2F 外)
const doVal = ref<number>(200);

// 是否正在拖曳物體
const isDragging = ref(false);
const svgRef = ref<SVGSVGElement | null>(null);

// 切換儀器
const setDevice = (device: OpticalDevice) => {
  currentDevice.value = device;
};

// 預設物距快速設定 (對應解答卷 5 大分區)
const setPreset = (type: '2F_out' | '2F' | 'F_2F' | 'F' | 'F_in') => {
  switch (type) {
    case '2F_out':
      doVal.value = 200; // 2.5F
      break;
    case '2F':
      doVal.value = 160; // 2.0F
      break;
    case 'F_2F':
      doVal.value = 120; // 1.5F
      break;
    case 'F':
      doVal.value = 80;  // 1.0F
      break;
    case 'F_in':
      doVal.value = 48;  // 0.6F
      break;
  }
};

// 拖曳物體處理 (Pointer Events)
const startDrag = (event: PointerEvent) => {
  isDragging.value = true;
  (event.currentTarget as HTMLElement)?.setPointerCapture?.(event.pointerId);
  updatePosFromPointer(event);
};

const onDrag = (event: PointerEvent) => {
  if (!isDragging.value) return;
  updatePosFromPointer(event);
};

const stopDrag = (event: PointerEvent) => {
  isDragging.value = false;
  (event.currentTarget as HTMLElement)?.releasePointerCapture?.(event.pointerId);
};

const updatePosFromPointer = (event: PointerEvent) => {
  if (!svgRef.value) return;
  const rect = svgRef.value.getBoundingClientRect();
  const scaleX = SVG_WIDTH / rect.width;
  const pointerX = (event.clientX - rect.left) * scaleX;
  
  // 物體在鏡前 (左側)，物距 do = X_CENTER - pointerX
  let newDo = X_CENTER - pointerX;
  // 限制範圍 25px ~ 285px
  newDo = Math.max(25, Math.min(285, Math.round(newDo)));

  // 焦點 F (80px) 與 2倍焦距 2F (160px) 磁吸功能 (感應範圍 ±6px)
  const SNAP_THRESHOLD = 6;
  if (Math.abs(newDo - F_PX) <= SNAP_THRESHOLD) {
    newDo = F_PX; // 磁吸至 1.00 F
  } else if (Math.abs(newDo - 2 * F_PX) <= SNAP_THRESHOLD) {
    newDo = 2 * F_PX; // 磁吸至 2.00 F
  }

  doVal.value = newDo;
};

// 磁吸狀態與標籤計算
const isSnapped = computed(() => {
  return doVal.value === F_PX || doVal.value === 2 * F_PX;
});

const snapLabel = computed(() => {
  if (doVal.value === F_PX) {
    return '物距 do = 1.00 F (焦點)';
  } else if (doVal.value === 2 * F_PX) {
    return '物距 do = 2.00 F (2F)';
  }
  return `物距 do = ${(doVal.value / F_PX).toFixed(2)} F`;
});

// 將射線端點裁剪於畫布範圍內
function clipRayToCanvas(x1: number, y1: number, dx: number, dy: number) {
  let tMin = Infinity;
  if (dx > 0) {
    const t = (X_MAX - x1) / dx;
    if (t > 0 && t < tMin) tMin = t;
  } else if (dx < 0) {
    const t = (X_MIN - x1) / dx;
    if (t > 0 && t < tMin) tMin = t;
  }
  if (dy > 0) {
    const t = (Y_MAX - y1) / dy;
    if (t > 0 && t < tMin) tMin = t;
  } else if (dy < 0) {
    const t = (Y_MIN - y1) / dy;
    if (t > 0 && t < tMin) tMin = t;
  }
  if (!isFinite(tMin) || tMin <= 0) tMin = 1;
  return {
    x2: Number((x1 + dx * tMin).toFixed(1)),
    y2: Number((y1 + dy * tMin).toFixed(1))
  };
}

// 光學成像運算核心 (高斯造鏡/薄透鏡面鏡方程)
const opticsState = computed(() => {
  const d = doVal.value;
  const xo = X_CENTER - d;
  const yoTip = Y_AXIS - HO; // 物體箭頭尖端 Y 座標

  let di = 0;
  let hi = 0;
  let m = 0;
  let isReal = true;
  let isFormed = true;
  let posText = '';
  let propText = '';
  let zoneTag = '';

  // 判斷目前物體分區
  if (d > 2 * F_PX + 1.5) {
    zoneTag = '物距 do > 2F';
  } else if (Math.abs(d - 2 * F_PX) <= 1.5) {
    zoneTag = '物距 do = 2F';
  } else if (d > F_PX + 1.5) {
    zoneTag = '物距 F < do < 2F';
  } else if (Math.abs(d - F_PX) <= 1.5) {
    zoneTag = '物距 do = F';
  } else {
    zoneTag = '物距 do < F';
  }

  const device = currentDevice.value;

  if (device === 'convex-lens') {
    // 凸透鏡 (會聚透鏡，f = +80)
    if (Math.abs(d - F_PX) <= 1.5) {
      isFormed = false;
      posText = '不成立像（無窮遠處）';
      propText = '不成像（折射光線互相平行）';
    } else {
      di = (F_PX * d) / (d - F_PX);
      m = -di / d;
      hi = m * HO;
      isReal = di > 0;

      if (d > 2 * F_PX + 1.5) {
        posText = 'F 與 2F 之間（鏡後）';
        propText = '倒立、縮小、實像';
      } else if (Math.abs(d - 2 * F_PX) <= 1.5) {
        posText = '2F 上（鏡後）';
        propText = '倒立、等大、實像';
      } else if (d > F_PX) {
        posText = '2F 外（鏡後）';
        propText = '倒立、放大、實像';
      } else {
        posText = '物體後方（鏡前/同側）';
        propText = '正立、放大、虛像';
      }
    }
  } else if (device === 'concave-lens') {
    // 凹透鏡 (發散透鏡，f = -80)
    di = -(F_PX * d) / (d + F_PX);
    m = -di / d;
    hi = m * HO;
    isReal = false;
    posText = '同側焦點內（鏡前 F 內）';
    propText = '正立、縮小、虛像';
  } else if (device === 'concave-mirror') {
    // 凹面鏡 (會聚面鏡，f = +80)
    if (Math.abs(d - F_PX) <= 1.5) {
      isFormed = false;
      posText = '不成立像（無窮遠處）';
      propText = '不成像（反射光線互相平行）';
    } else {
      di = (F_PX * d) / (d - F_PX);
      m = -di / d;
      hi = m * HO;
      isReal = di > 0;

      if (d > 2 * F_PX + 1.5) {
        posText = 'F 與 2F 之間（鏡前）';
        propText = '倒立、縮小、實像';
      } else if (Math.abs(d - 2 * F_PX) <= 1.5) {
        posText = '2F 上（鏡前）';
        propText = '倒立、等大、實像';
      } else if (d > F_PX) {
        posText = '2F 外（鏡前）';
        propText = '倒立、放大、實像';
      } else {
        posText = '鏡後';
        propText = '正立、放大、虛像';
      }
    }
  } else if (device === 'convex-mirror') {
    // 凸面鏡 (發散面鏡，f = -80)
    di = -(F_PX * d) / (d + F_PX);
    m = -di / d;
    hi = m * HO;
    isReal = false;
    posText = '焦點內（鏡後 F 內）';
    propText = '正立、縮小、虛像';
  }

  // 計算像的座標位置 (SVG 畫布)
  let xi = 0;
  let yiTip = Y_AXIS; // 像箭頭尖端 Y 座標
  let isImageVisible = false;

  if (isFormed) {
    if (device === 'convex-lens') {
      xi = isReal ? X_CENTER + di : X_CENTER - Math.abs(di);
      yiTip = Y_AXIS - hi;
    } else if (device === 'concave-lens') {
      xi = X_CENTER - Math.abs(di);
      yiTip = Y_AXIS - hi;
    } else if (device === 'concave-mirror') {
      xi = isReal ? X_CENTER - di : X_CENTER + Math.abs(di);
      yiTip = Y_AXIS - hi;
    } else if (device === 'convex-mirror') {
      xi = X_CENTER + Math.abs(di);
      yiTip = Y_AXIS - hi;
    }

    // 判斷像是否落在畫布可視區內
    isImageVisible = xi >= X_MIN - 10 && xi <= X_MAX + 10 && Math.abs(hi) < 160;
  }

  return {
    xo,
    yoTip,
    di,
    hi,
    m,
    isReal,
    isFormed,
    posText,
    propText,
    zoneTag,
    xi,
    yiTip,
    isImageVisible
  };
});

// 光路計算 (嚴格自物體箭頭尖端出發，且精確交會於像箭頭尖端)
const rays = computed(() => {
  const d = doVal.value;
  const { xo, yoTip, xi, yiTip, isFormed, isReal } = opticsState.value;
  const dev = currentDevice.value;

  // 1. 平行主軸光線 (Ray 1: 起點嚴格位於物體箭頭尖端 (xo, yoTip))
  const r1Incident = { x1: xo, y1: yoTip, x2: X_CENTER, y2: yoTip };
  
  // 2. 光心/頂點光線 (Ray 2: 起點嚴格位於物體箭頭尖端 (xo, yoTip)，過光心/頂點 (X_CENTER, Y_AXIS))
  const r2Incident = { x1: xo, y1: yoTip, x2: X_CENTER, y2: Y_AXIS };

  let r1Solid = { x1: 0, y1: 0, x2: 0, y2: 0 };
  let r1Dashed = { x1: 0, y1: 0, x2: 0, y2: 0, show: false };
  let r2Solid = { x1: 0, y1: 0, x2: 0, y2: 0 };
  let r2Dashed = { x1: 0, y1: 0, x2: 0, y2: 0, show: false };

  if (dev === 'convex-lens') {
    // 凸透鏡：折射光線通過右焦點 F2 (X_CENTER + F_PX, Y_AXIS)
    const r1Clipped = clipRayToCanvas(X_CENTER, yoTip, F_PX, HO);
    r1Solid = { x1: X_CENTER, y1: yoTip, x2: r1Clipped.x2, y2: r1Clipped.y2 };

    // 光心光線：直通穿過鏡心 (X_CENTER, Y_AXIS)
    const r2Clipped = clipRayToCanvas(X_CENTER, Y_AXIS, d, HO);
    r2Solid = { x1: X_CENTER, y1: Y_AXIS, x2: r2Clipped.x2, y2: r2Clipped.y2 };

    if (!isReal && isFormed) {
      // 虛像 (do < F)：折射光線反向虛線延長至鏡前虛像尖端 (xi, yiTip)
      r1Dashed = { x1: X_CENTER, y1: yoTip, x2: xi, y2: yiTip, show: true };
      r2Dashed = { x1: X_CENTER, y1: Y_AXIS, x2: xi, y2: yiTip, show: true };
    }
  } else if (dev === 'concave-lens') {
    // 凹透鏡：平行光折射後發散，其反向延長線通過鏡前左焦點 F1
    const r1Clipped = clipRayToCanvas(X_CENTER, yoTip, F_PX, -HO);
    r1Solid = { x1: X_CENTER, y1: yoTip, x2: r1Clipped.x2, y2: r1Clipped.y2 };

    // 鏡前虛線反向延長至左焦點 F1 (精確穿過虛像尖端 (xi, yiTip))
    r1Dashed = { x1: X_CENTER, y1: yoTip, x2: X_CENTER - F_PX, y2: Y_AXIS, show: true };

    // 光心光線：直通穿過鏡心至鏡後
    const r2Clipped = clipRayToCanvas(X_CENTER, Y_AXIS, d, HO);
    r2Solid = { x1: X_CENTER, y1: Y_AXIS, x2: r2Clipped.x2, y2: r2Clipped.y2 };
  } else if (dev === 'concave-mirror') {
    // 凹面鏡：平行光反射通過鏡前焦點 F1
    const r1Clipped = clipRayToCanvas(X_CENTER, yoTip, -F_PX, HO);
    r1Solid = { x1: X_CENTER, y1: yoTip, x2: r1Clipped.x2, y2: r1Clipped.y2 };

    // 頂點反射光線：依反射定律向左下反射
    const r2Clipped = clipRayToCanvas(X_CENTER, Y_AXIS, -d, HO);
    r2Solid = { x1: X_CENTER, y1: Y_AXIS, x2: r2Clipped.x2, y2: r2Clipped.y2 };

    if (!isReal && isFormed) {
      // 虛像 (do < F)：反射光線在鏡前發散，反向虛線延長至鏡後虛像尖端 (xi, yiTip)
      r1Dashed = { x1: X_CENTER, y1: yoTip, x2: xi, y2: yiTip, show: true };
      r2Dashed = { x1: X_CENTER, y1: Y_AXIS, x2: xi, y2: yiTip, show: true };
    }
  } else if (dev === 'convex-mirror') {
    // 凸面鏡：平行光反射向上發散，反向延長線通過鏡後焦點 F2
    const r1Clipped = clipRayToCanvas(X_CENTER, yoTip, -F_PX, -HO);
    r1Solid = { x1: X_CENTER, y1: yoTip, x2: r1Clipped.x2, y2: r1Clipped.y2 };
    r1Dashed = { x1: X_CENTER, y1: yoTip, x2: X_CENTER + F_PX, y2: Y_AXIS, show: true };

    // 頂點反射光線：在鏡前對稱向下反射，反向延長線穿過虛像尖端 (xi, yiTip)
    const r2Clipped = clipRayToCanvas(X_CENTER, Y_AXIS, -d, HO);
    r2Solid = { x1: X_CENTER, y1: Y_AXIS, x2: r2Clipped.x2, y2: r2Clipped.y2 };
    r2Dashed = { x1: X_CENTER, y1: Y_AXIS, x2: xi, y2: yiTip, show: true };
  }

  return { r1Incident, r2Incident, r1Solid, r1Dashed, r2Solid, r2Dashed };
});

// 解答卷對照表展開收合開關
const showFullTable = ref(false);
</script>

<template>
  <div class="w-full bg-slate-900/95 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-2xl flex flex-col gap-4 text-slate-100 select-none">
    
    <!-- 頂部控制列：物距速選按鈕與操作提示 (儀器切換按鈕已依需求移入畫布右上角) -->
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
      <!-- 5 大物距速選按鈕 -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs font-semibold text-white mr-0.5">物距速選：</span>
        <button 
          @click="setPreset('2F_out')"
          class="px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium"
          :class="opticsState.zoneTag === '物距 do > 2F' ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'"
        >
          1. do &gt; 2F
        </button>
        <button 
          @click="setPreset('2F')"
          class="px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium"
          :class="opticsState.zoneTag === '物距 do = 2F' ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'"
        >
          2. do = 2F
        </button>
        <button 
          @click="setPreset('F_2F')"
          class="px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium"
          :class="opticsState.zoneTag === '物距 F < do < 2F' ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'"
        >
          3. F &lt; do &lt; 2F
        </button>
        <button 
          @click="setPreset('F')"
          class="px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium"
          :class="opticsState.zoneTag === '物距 do = F' ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'"
        >
          4. do = F
        </button>
        <button 
          @click="setPreset('F_in')"
          class="px-3 py-1.5 rounded-lg border text-xs transition-colors font-medium"
          :class="opticsState.zoneTag === '物距 do < F' ? 'bg-sky-500/20 border-sky-400 text-sky-300' : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'"
        >
          5. do &lt; F
        </button>
      </div>

      <!-- 操作提示與光路註解 -->
      <div class="flex flex-wrap items-center gap-3 text-xs">
        <span class="inline-flex items-center gap-1.5 text-amber-400 font-medium bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-800/50">
          <MousePointer2 class="w-3.5 h-3.5 animate-bounce" />
          可直接在圖中左右拖曳橘色實物
        </span>

        <!-- 光路圖例註解 (光線① 與 光線②) -->
        <div class="flex items-center gap-2.5 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm">
            <span class="w-3 h-0.5 bg-sky-400 inline-block rounded"></span>
            <span class="font-medium">光線① 平行主軸</span>
          </span>
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 shadow-sm">
            <span class="w-3 h-0.5 bg-emerald-400 inline-block rounded"></span>
            <span class="font-medium">光線② 過鏡心/頂點</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 動態 SVG 畫布區域 (切換按鈕整合於畫布右上角) -->
    <div 
      class="relative w-full overflow-hidden rounded-xl bg-[#070b14] border border-slate-800 shadow-inner group"
      :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
    >
      <!-- 儀器切換按鈕：浮動於圖紙右上角處 (有格線區塊的右上角) -->
      <div class="absolute top-3 right-3 z-20 flex items-center p-1 rounded-xl bg-slate-950/90 backdrop-blur border border-slate-700/80 shadow-xl text-xs">
        <button
          @click="setDevice('convex-lens')"
          class="px-3 py-1.5 rounded-lg transition-all font-medium"
          :class="currentDevice === 'convex-lens' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:text-white'"
        >
          凸透鏡
        </button>
        <button
          @click="setDevice('concave-lens')"
          class="px-3 py-1.5 rounded-lg transition-all font-medium"
          :class="currentDevice === 'concave-lens' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:text-white'"
        >
          凹透鏡
        </button>
        <button
          @click="setDevice('convex-mirror')"
          class="px-3 py-1.5 rounded-lg transition-all font-medium"
          :class="currentDevice === 'convex-mirror' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'"
        >
          凸面鏡
        </button>
        <button
          @click="setDevice('concave-mirror')"
          class="px-3 py-1.5 rounded-lg transition-all font-medium"
          :class="currentDevice === 'concave-mirror' ? 'bg-amber-500 text-white shadow' : 'text-slate-300 hover:text-white'"
        >
          凹面鏡
        </button>
      </div>

      <svg
        ref="svgRef"
        :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`"
        class="w-full h-auto touch-none select-none block"
        @pointerdown="startDrag"
        @pointermove="onDrag"
        @pointerup="stopDrag"
        @pointercancel="stopDrag"
      >
        <!-- 背景細網格與 Pattern -->
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" stroke-width="0.5" stroke-opacity="0.4" />
          </pattern>

          <!-- 面鏡背面陰影斜線 -->
          <pattern id="hatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#475569" stroke-width="1.2" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- 主光軸 (Principal Axis) -->
        <line :x1="X_MIN" :y1="Y_AXIS" :x2="X_MAX" :y2="Y_AXIS" stroke="#475569" stroke-width="1.5" />
        <text :x="X_MAX - 38" :y="Y_AXIS + 17" fill="#64748b" font-size="12" font-family="sans-serif">主光軸</text>

        <!-- 焦點與 2 倍焦距標記 -->
        <g stroke="#64748b" stroke-width="1.5">
          <line :x1="X_CENTER - 2 * F_PX" :y1="Y_AXIS - 5" :x2="X_CENTER - 2 * F_PX" :y2="Y_AXIS + 5" />
          <line :x1="X_CENTER - F_PX" :y1="Y_AXIS - 5" :x2="X_CENTER - F_PX" :y2="Y_AXIS + 5" />
          <line :x1="X_CENTER + F_PX" :y1="Y_AXIS - 5" :x2="X_CENTER + F_PX" :y2="Y_AXIS + 5" />
          <line :x1="X_CENTER + 2 * F_PX" :y1="Y_AXIS - 5" :x2="X_CENTER + 2 * F_PX" :y2="Y_AXIS + 5" />
        </g>
        <circle :cx="X_CENTER - 2 * F_PX" :cy="Y_AXIS" :r="doVal === 2 * F_PX ? 4.5 : 2.5" :fill="doVal === 2 * F_PX ? '#38bdf8' : '#94a3b8'" />
        <circle :cx="X_CENTER - F_PX" :cy="Y_AXIS" :r="doVal === F_PX ? 4.5 : 2.5" :fill="doVal === F_PX ? '#38bdf8' : '#94a3b8'" />
        <circle :cx="X_CENTER + F_PX" :cy="Y_AXIS" r="2.5" fill="#94a3b8" />
        <circle :cx="X_CENTER + 2 * F_PX" :cy="Y_AXIS" r="2.5" fill="#94a3b8" />

        <!-- 刻度標籤文字 (稍微放大更易辨認) -->
        <text :x="X_CENTER - 2 * F_PX - 8" :y="Y_AXIS + 18" fill="#cbd5e1" font-size="12" font-weight="bold">2F</text>
        <text :x="X_CENTER - F_PX - 4" :y="Y_AXIS + 18" fill="#cbd5e1" font-size="12" font-weight="bold">F</text>
        <text :x="X_CENTER + F_PX - 4" :y="Y_AXIS + 18" fill="#cbd5e1" font-size="12" font-weight="bold">F</text>
        <text :x="X_CENTER + 2 * F_PX - 8" :y="Y_AXIS + 18" fill="#cbd5e1" font-size="12" font-weight="bold">2F</text>
        <text :x="X_CENTER - 5" :y="Y_AXIS + 18" fill="#38bdf8" font-size="12" font-weight="bold">
          {{ currentDevice.includes('lens') ? 'O' : 'V' }}
        </text>

        <!-- 光學元件繪製 (透鏡 / 面鏡) -->
        <!-- 1. 凸透鏡 -->
        <g v-if="currentDevice === 'convex-lens'">
          <path
            :d="`M ${X_CENTER} ${Y_AXIS - 95} Q ${X_CENTER + 18} ${Y_AXIS} ${X_CENTER} ${Y_AXIS + 95} Q ${X_CENTER - 18} ${Y_AXIS} ${X_CENTER} ${Y_AXIS - 95} Z`"
            fill="#38bdf8"
            fill-opacity="0.18"
            stroke="#38bdf8"
            stroke-width="2"
          />
          <line :x1="X_CENTER" :y1="Y_AXIS - 105" :x2="X_CENTER" :y2="Y_AXIS + 105" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
        </g>

        <!-- 2. 凹透鏡 -->
        <g v-else-if="currentDevice === 'concave-lens'">
          <path
            :d="`M ${X_CENTER - 12} ${Y_AXIS - 95} L ${X_CENTER + 12} ${Y_AXIS - 95} Q ${X_CENTER + 3} ${Y_AXIS} ${X_CENTER + 12} ${Y_AXIS + 95} L ${X_CENTER - 12} ${Y_AXIS + 95} Q ${X_CENTER - 3} ${Y_AXIS} ${X_CENTER - 12} ${Y_AXIS - 95} Z`"
            fill="#38bdf8"
            fill-opacity="0.18"
            stroke="#38bdf8"
            stroke-width="2"
          />
          <line :x1="X_CENTER" :y1="Y_AXIS - 105" :x2="X_CENTER" :y2="Y_AXIS + 105" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3,3" opacity="0.6" />
        </g>

        <!-- 3. 凹面鏡 (反射面朝左，弧向右凹入) -->
        <g v-else-if="currentDevice === 'concave-mirror'">
          <path
            :d="`M ${X_CENTER - 14} ${Y_AXIS - 95} Q ${X_CENTER + 10} ${Y_AXIS} ${X_CENTER - 14} ${Y_AXIS + 95}`"
            fill="none"
            stroke="#38bdf8"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            :d="`M ${X_CENTER - 14} ${Y_AXIS - 95} Q ${X_CENTER + 10} ${Y_AXIS} ${X_CENTER - 14} ${Y_AXIS + 95} L ${X_CENTER + 2} ${Y_AXIS + 95} Q ${X_CENTER + 26} ${Y_AXIS} ${X_CENTER + 2} ${Y_AXIS - 95} Z`"
            fill="url(#hatch)"
            opacity="0.75"
          />
          <line :x1="X_CENTER" :y1="Y_AXIS - 105" :x2="X_CENTER" :y2="Y_AXIS + 105" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />
        </g>

        <!-- 4. 凸面鏡 (反射面朝左，弧向左凸出) -->
        <g v-else-if="currentDevice === 'convex-mirror'">
          <path
            :d="`M ${X_CENTER + 14} ${Y_AXIS - 95} Q ${X_CENTER - 10} ${Y_AXIS} ${X_CENTER + 14} ${Y_AXIS + 95}`"
            fill="none"
            stroke="#38bdf8"
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            :d="`M ${X_CENTER + 14} ${Y_AXIS - 95} Q ${X_CENTER - 10} ${Y_AXIS} ${X_CENTER + 14} ${Y_AXIS + 95} L ${X_CENTER + 28} ${Y_AXIS + 95} Q ${X_CENTER + 4} ${Y_AXIS} ${X_CENTER + 28} ${Y_AXIS - 95} Z`"
            fill="url(#hatch)"
            opacity="0.75"
          />
          <line :x1="X_CENTER" :y1="Y_AXIS - 105" :x2="X_CENTER" :y2="Y_AXIS + 105" stroke="#64748b" stroke-width="1" stroke-dasharray="3,3" opacity="0.4" />
        </g>

        <!-- ======================= 光路繪製 (起點為物體尖端，交點為像尖端) ======================= -->
        <!-- 光線① 平行入射線 (藍色) -->
        <line
          :x1="rays.r1Incident.x1"
          :y1="rays.r1Incident.y1"
          :x2="rays.r1Incident.x2"
          :y2="rays.r1Incident.y2"
          stroke="#38bdf8"
          stroke-width="1.8"
        />
        <!-- 光線① 前進箭頭標記 -->
        <polygon
          :points="`${(rays.r1Incident.x1 + rays.r1Incident.x2)/2 - 3},${rays.r1Incident.y1 - 4} ${(rays.r1Incident.x1 + rays.r1Incident.x2)/2 + 5},${rays.r1Incident.y1} ${(rays.r1Incident.x1 + rays.r1Incident.x2)/2 - 3},${rays.r1Incident.y1 + 4}`"
          fill="#38bdf8"
        />

        <!-- 光線① 折射/反射實光線 -->
        <line
          :x1="rays.r1Solid.x1"
          :y1="rays.r1Solid.y1"
          :x2="rays.r1Solid.x2"
          :y2="rays.r1Solid.y2"
          stroke="#38bdf8"
          stroke-width="1.8"
        />

        <!-- 光線① 虛線反向延長線 -->
        <line
          v-if="rays.r1Dashed.show"
          :x1="rays.r1Dashed.x1"
          :y1="rays.r1Dashed.y1"
          :x2="rays.r1Dashed.x2"
          :y2="rays.r1Dashed.y2"
          stroke="#38bdf8"
          stroke-width="1.4"
          stroke-dasharray="4,4"
          opacity="0.85"
        />

        <!-- 光線② 入射光心/頂點線 (綠色) -->
        <line
          :x1="rays.r2Incident.x1"
          :y1="rays.r2Incident.y1"
          :x2="rays.r2Incident.x2"
          :y2="rays.r2Incident.y2"
          stroke="#34d399"
          stroke-width="1.8"
        />
        <!-- 光線② 折射/反射實光線 (過光心直行或頂點反射) -->
        <line
          :x1="rays.r2Solid.x1"
          :y1="rays.r2Solid.y1"
          :x2="rays.r2Solid.x2"
          :y2="rays.r2Solid.y2"
          stroke="#34d399"
          stroke-width="1.8"
        />
        <!-- 光線② 虛線反向延長線 -->
        <line
          v-if="rays.r2Dashed.show"
          :x1="rays.r2Dashed.x1"
          :y1="rays.r2Dashed.y1"
          :x2="rays.r2Dashed.x2"
          :y2="rays.r2Dashed.y2"
          stroke="#34d399"
          stroke-width="1.4"
          stroke-dasharray="4,4"
          opacity="0.85"
        />

        <!-- ======================= 實物 (Object) ======================= -->
        <!-- 光源自箭頭尖端 (xo, yoTip) 發出，箭頭尖頂正好落在該點 -->
        <g>
          <!-- 實物箭頭桿身 -->
          <line
            :x1="opticsState.xo"
            :y1="Y_AXIS"
            :x2="opticsState.xo"
            :y2="opticsState.yoTip + 7"
            stroke="#f59e0b"
            stroke-width="3.5"
            stroke-linecap="round"
          />
          <!-- 實物箭頭尖端：尖頂 (第一個點) 嚴格位於 (xo, yoTip) -->
          <polygon
            :points="`${opticsState.xo},${opticsState.yoTip} ${opticsState.xo - 5},${opticsState.yoTip + 8} ${opticsState.xo + 5},${opticsState.yoTip + 8}`"
            fill="#f59e0b"
          />
          <!-- 物體文字標示 (放大字體) -->
          <text
            :x="opticsState.xo"
            :y="opticsState.yoTip - 10"
            text-anchor="middle"
            fill="#fbbf24"
            font-size="13"
            font-weight="bold"
            font-family="sans-serif"
          >
            實物
          </text>
        </g>

        <!-- ======================= 像 (Image) ======================= -->
        <!-- 1. 不成像情況 (do = F) -->
        <g v-if="!opticsState.isFormed">
          <rect
            :x="X_CENTER + 40"
            :y="Y_AXIS - 30"
            width="180"
            height="60"
            rx="8"
            fill="#0f172a"
            fill-opacity="0.85"
            stroke="#e2e8f0"
            stroke-width="1"
            stroke-dasharray="3,3"
          />
          <text :x="X_CENTER + 52" :y="Y_AXIS - 6" fill="#f87171" font-size="13" font-weight="bold">
            光線平行，無交點
          </text>
          <text :x="X_CENTER + 52" :y="Y_AXIS + 16" fill="#94a3b8" font-size="12">
            不成立像（像在無窮遠）
          </text>
        </g>

        <!-- 2. 有成立像 (實像或虛像) -->
        <g v-else-if="opticsState.isImageVisible">
          <!-- 實像 (紅色實線箭頭，倒立指向下方，尖頂嚴格落在 (xi, yiTip)) -->
          <template v-if="opticsState.isReal">
            <line
              :x1="opticsState.xi"
              :y1="Y_AXIS"
              :x2="opticsState.xi"
              :y2="opticsState.yiTip - 7"
              stroke="#f43f5e"
              stroke-width="3"
              stroke-linecap="round"
            />
            <!-- 實像箭頭：尖頂朝下，嚴格落在 (xi, yiTip) -->
            <polygon
              :points="`${opticsState.xi},${opticsState.yiTip} ${opticsState.xi - 5},${opticsState.yiTip - 8} ${opticsState.xi + 5},${opticsState.yiTip - 8}`"
              fill="#f43f5e"
            />
            <text
              :x="opticsState.xi"
              :y="opticsState.yiTip + 18"
              text-anchor="middle"
              fill="#f43f5e"
              font-size="13"
              font-weight="bold"
            >
              實像
            </text>
          </template>

          <!-- 虛像 (紫色虛線箭頭，正立指向上方，尖頂嚴格落在 (xi, yiTip)) -->
          <template v-else>
            <line
              :x1="opticsState.xi"
              :y1="Y_AXIS"
              :x2="opticsState.xi"
              :y2="opticsState.yiTip + 7"
              stroke="#c084fc"
              stroke-width="2.8"
              stroke-dasharray="4,3"
              stroke-linecap="round"
            />
            <!-- 虛像箭頭：尖頂朝上，嚴格落在 (xi, yiTip) -->
            <polygon
              :points="`${opticsState.xi},${opticsState.yiTip} ${opticsState.xi - 5},${opticsState.yiTip + 8} ${opticsState.xi + 5},${opticsState.yiTip + 8}`"
              fill="#c084fc"
            />
            <text
              :x="opticsState.xi"
              :y="opticsState.yiTip - 10"
              text-anchor="middle"
              fill="#c084fc"
              font-size="13"
              font-weight="bold"
            >
              虛像
            </text>
          </template>
        </g>

        <!-- ======================= 實際物距標註於圖面右下角 (放大字體，支援磁吸回饋) ======================= -->
        <g>
          <rect
            :x="SVG_WIDTH - (isSnapped ? 186 : 156)"
            :y="SVG_HEIGHT - 35"
            :width="isSnapped ? 174 : 144"
            height="26"
            rx="6"
            fill="#090e1a"
            fill-opacity="0.94"
            :stroke="isSnapped ? '#38bdf8' : '#334155'"
            stroke-width="1.2"
          />
          <text
            :x="SVG_WIDTH - (isSnapped ? 99 : 84)"
            :y="SVG_HEIGHT - 18"
            text-anchor="middle"
            :fill="isSnapped ? '#38bdf8' : '#fbbf24'"
            font-size="13"
            font-weight="bold"
            font-family="monospace"
          >
            {{ snapLabel }}
          </text>
        </g>
      </svg>
    </div>

    <!-- 即時解題回饋看板：單一卡片，成像位置與成像特性左右並排 -->
    <div class="p-4 sm:p-5 rounded-xl bg-slate-950/90 border border-slate-800 shadow-md">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 divide-y md:divide-y-0 md:divide-x divide-slate-800">
        
        <!-- 左半部：成像位置 -->
        <div class="flex flex-col gap-2 md:pr-5">
          <div class="flex items-center justify-between">
            <!-- 標題用純白字 -->
            <span class="font-bold text-white text-sm tracking-wide">
              1. 成像位置
            </span>
            <span class="text-xs text-slate-300 font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {{ opticsState.zoneTag }}
            </span>
          </div>
          <!-- 成像位置結論：使用藍色作為醒目提示 -->
          <div class="text-lg sm:text-xl font-bold text-sky-400 tracking-wide">
            {{ opticsState.posText }}
          </div>
          <!-- 像距細節：文字放大至 13-14px -->
          <div class="text-sm text-slate-300">
            <span v-if="opticsState.isFormed">
              像距 di ≈ <span class="text-white font-mono font-bold">{{ Math.abs(opticsState.di / F_PX).toFixed(2) }} F</span>
              <span class="text-slate-400 ml-1">（{{ opticsState.di > 0 ? (currentDevice.includes('lens') ? '鏡後' : '鏡前') : (currentDevice.includes('lens') ? '同側鏡前' : '鏡後') }}）</span>
            </span>
            <span v-else class="text-rose-400 font-medium">
              折射/反射光線平行，在無窮遠處不相交
            </span>
          </div>
        </div>

        <!-- 右半部：成像特性 -->
        <div class="flex flex-col gap-2 pt-4 md:pt-0 md:pl-5">
          <div class="flex items-center justify-between">
            <!-- 標題用純白字 -->
            <span class="font-bold text-white text-sm tracking-wide">
              2. 成像特性
            </span>
            <span 
              class="text-xs px-2.5 py-0.5 rounded font-semibold border" 
              :class="opticsState.isReal ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : (!opticsState.isFormed ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-purple-500/15 text-purple-300 border-purple-500/30')"
            >
              {{ !opticsState.isFormed ? '不成像' : (opticsState.isReal ? '實像' : '虛像') }}
            </span>
          </div>
          <!-- 成像特性結論：實像玫瑰紅、虛像紫色、不成像灰白 -->
          <div 
            class="text-lg sm:text-xl font-bold tracking-wide" 
            :class="opticsState.isFormed ? (opticsState.isReal ? 'text-rose-400' : 'text-purple-300') : 'text-slate-300'"
          >
            {{ opticsState.propText }}
          </div>
          <!-- 放大率細節：文字放大至 13-14px -->
          <div class="text-sm text-slate-300">
            <span v-if="opticsState.isFormed">
              放大率 |m| ≈ <span class="text-white font-mono font-bold">{{ Math.abs(opticsState.m).toFixed(2) }}×</span>
              <span class="text-slate-400 ml-1">（{{ Math.abs(opticsState.m) > 1.05 ? '放大' : (Math.abs(opticsState.m) < 0.95 ? '縮小' : '等大') }}）</span>
            </span>
            <span v-else class="text-slate-400">
              無法測量放大率
            </span>
          </div>
        </div>

      </div>
    </div>

    <!-- 解答卷對照表收合摺疊區 (點擊可展開檢視 20 種全部情境) -->
    <div class="border-t border-slate-800 pt-2">
      <button
        @click="showFullTable = !showFullTable"
        class="w-full py-2 px-3 rounded-lg bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors flex items-center justify-between"
      >
        <span class="flex items-center gap-1.5 font-medium">
          <HelpCircle class="w-4 h-4 text-slate-400" />
          <span>查看完整面鏡與透鏡成像結論</span>
        </span>
        <span class="text-sky-400 font-semibold">{{ showFullTable ? '收合 ▲' : '展開 ▼' }}</span>
      </button>

      <div v-if="showFullTable" class="mt-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-4 overflow-x-auto">
        <!-- 透鏡篇表 -->
        <div>
          <div class="font-bold text-sky-400 mb-1.5 text-sm">【透鏡篇】凸透鏡 vs 凹透鏡</div>
          <table class="w-full text-left border-collapse border border-slate-800 text-slate-300">
            <thead>
              <tr class="bg-slate-900 text-slate-300 border-b border-slate-800">
                <th class="p-2 border border-slate-800">物距條件</th>
                <th class="p-2 border border-slate-800">凸透鏡 成像位置</th>
                <th class="p-2 border border-slate-800">凸透鏡 成像特性</th>
                <th class="p-2 border border-slate-800">凹透鏡 成像位置與特性</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do &gt; 2F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">F 與 2F 之間（鏡後）</td>
                <td class="p-2 border border-slate-800 text-rose-300">倒立、縮小、實像</td>
                <td class="p-2 border border-slate-800 text-purple-300" rowspan="5">
                  恆在「同側焦點內（鏡前 F 內）」<br>成「正立、縮小、虛像」
                </td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do = 2F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">2F 上（鏡後）</td>
                <td class="p-2 border border-slate-800 text-rose-300">倒立、等大、實像</td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">F &lt; do &lt; 2F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">2F 外（鏡後）</td>
                <td class="p-2 border border-slate-800 text-rose-300">倒立、放大、實像</td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do = F</td>
                <td class="p-2 border border-slate-800 text-slate-200">不成立像（無窮遠處）</td>
                <td class="p-2 border border-slate-800 text-slate-400">不成像（折射光線互相平行）</td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do &lt; F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">物體後方（鏡前/同側）</td>
                <td class="p-2 border border-slate-800 text-purple-300">正立、放大、虛像</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 面鏡篇表 -->
        <div>
          <div class="font-bold text-amber-400 mb-1.5 text-sm">【面鏡篇】凹面鏡 vs 凸面鏡</div>
          <table class="w-full text-left border-collapse border border-slate-800 text-slate-300">
            <thead>
              <tr class="bg-slate-900 text-slate-300 border-b border-slate-800">
                <th class="p-2 border border-slate-800">物距條件</th>
                <th class="p-2 border border-slate-800">凹面鏡 成像位置</th>
                <th class="p-2 border border-slate-800">凹面鏡 成像特性</th>
                <th class="p-2 border border-slate-800">凸面鏡 成像位置與特性</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do &gt; 2F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">F 與 2F 之間（鏡前）</td>
                <td class="p-2 border border-slate-800 text-rose-300">倒立、縮小、實像</td>
                <td class="p-2 border border-slate-800 text-purple-300" rowspan="5">
                  恆在「焦點內（鏡後 F 內）」<br>成「正立、縮小、虛像」
                </td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do = 2F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">2F 上（鏡前）</td>
                <td class="p-2 border border-slate-800 text-rose-300">倒立、等大、實像</td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">F &lt; do &lt; 2F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">2F 外（鏡前）</td>
                <td class="p-2 border border-slate-800 text-rose-300">倒立、放大、實像</td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do = F</td>
                <td class="p-2 border border-slate-800 text-slate-200">不成立像（無窮遠處）</td>
                <td class="p-2 border border-slate-800 text-slate-400">不成像（反射光線互相平行）</td>
              </tr>
              <tr>
                <td class="p-2 border border-slate-800 font-mono font-semibold">do &lt; F</td>
                <td class="p-2 border border-slate-800 text-white font-medium">鏡後</td>
                <td class="p-2 border border-slate-800 text-purple-300">正立、放大、虛像</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>
</template>
