<script setup lang="ts">
import { computed, ref } from 'vue';
import OpticsSimulator from './OpticsSimulator.vue';
import FunctionGraph, { PlotFunction, PlotPoint, PlotLine } from './FunctionGraph.vue';
import { renderRichMathText } from '../utils/mathRenderer';

const props = defineProps<{
  type: string;
}>();

// 函數圖形平移伸縮與對稱動態操作狀態（向量平移 (h,k) 整合 ＆ 順序感知步驟鏈）
const initialFamily = ref<'exp' | 'log'>('exp');

export interface StepRecord {
  id: number;
  type: 'shift' | 'scaleX' | 'scaleY' | 'reflectX' | 'reflectY' | 'inverse';
  h?: number;
  k?: number;
  val?: number; // scale index
  label: string;
}

const stepHistory = ref<StepRecord[]>([]);
let nextStepId = 1;

// 進行中的步進小計狀態（切換動作時自動結算提交至履歷並歸零）
const activeActionType = ref<'shift' | 'scaleX' | 'scaleY' | null>(null);
const activeShiftH = ref(0);
const activeShiftK = ref(0);

const scaleValues = [0.25, 1 / 3, 0.5, 1, 2, 3, 4, 5, 6];
const scaleLabels = ['1/4', '1/3', '1/2', '1', '2', '3', '4', '5', '6'];
const activeScaleXIdx = ref(3); // 3 代表 1 倍
const activeScaleYIdx = ref(3); // 3 代表 1 倍

// 結算提交目前進行中的動作
function commitActiveAction() {
  if (!activeActionType.value) return;

  if (activeActionType.value === 'shift' && (activeShiftH.value !== 0 || activeShiftK.value !== 0)) {
    const h = activeShiftH.value;
    const k = activeShiftK.value;
    const hText = h > 0 ? `+${h}` : `${h}`;
    const kText = k > 0 ? `+${k}` : `${k}`;
    stepHistory.value.push({
      id: nextStepId++,
      type: 'shift',
      h,
      k,
      label: `平移 (${hText}, ${kText})`
    });
  } else if (activeActionType.value === 'scaleX' && activeScaleXIdx.value !== 3) {
    const sIdx = activeScaleXIdx.value;
    stepHistory.value.push({
      id: nextStepId++,
      type: 'scaleX',
      val: sIdx,
      label: `X 伸縮 ${scaleLabels[sIdx]} 倍`
    });
  } else if (activeActionType.value === 'scaleY' && activeScaleYIdx.value !== 3) {
    const sIdx = activeScaleYIdx.value;
    stepHistory.value.push({
      id: nextStepId++,
      type: 'scaleY',
      val: sIdx,
      label: `Y 伸縮 ${scaleLabels[sIdx]} 倍`
    });
  }

  // 小計歸零
  activeShiftH.value = 0;
  activeShiftK.value = 0;
  activeScaleXIdx.value = 3;
  activeScaleYIdx.value = 3;
  activeActionType.value = null;
}

// X 平移與 Y 平移合併為同一組平移 (h, k) 同時累計
function handleShiftX(delta: number) {
  if (activeActionType.value !== 'shift') {
    commitActiveAction();
    activeActionType.value = 'shift';
    activeShiftH.value = 0;
    activeShiftK.value = 0;
  }
  activeShiftH.value += delta;
  if (activeShiftH.value === 0 && activeShiftK.value === 0) {
    activeActionType.value = null;
  }
}

function handleShiftY(delta: number) {
  if (activeActionType.value !== 'shift') {
    commitActiveAction();
    activeActionType.value = 'shift';
    activeShiftH.value = 0;
    activeShiftK.value = 0;
  }
  activeShiftK.value += delta;
  if (activeShiftH.value === 0 && activeShiftK.value === 0) {
    activeActionType.value = null;
  }
}

// 伸縮步進調整
function handleScaleX(direction: 'up' | 'down') {
  if (activeActionType.value !== 'scaleX') {
    commitActiveAction();
    activeActionType.value = 'scaleX';
    activeScaleXIdx.value = 3;
  }
  if (direction === 'up' && activeScaleXIdx.value < scaleValues.length - 1) {
    activeScaleXIdx.value++;
  } else if (direction === 'down' && activeScaleXIdx.value > 0) {
    activeScaleXIdx.value--;
  }
  if (activeScaleXIdx.value === 3) {
    activeActionType.value = null;
  }
}

function handleScaleY(direction: 'up' | 'down') {
  if (activeActionType.value !== 'scaleY') {
    commitActiveAction();
    activeActionType.value = 'scaleY';
    activeScaleYIdx.value = 3;
  }
  if (direction === 'up' && activeScaleYIdx.value < scaleValues.length - 1) {
    activeScaleYIdx.value++;
  } else if (direction === 'down' && activeScaleYIdx.value > 0) {
    activeScaleYIdx.value--;
  }
  if (activeScaleYIdx.value === 3) {
    activeActionType.value = null;
  }
}

// 連續相同翻轉直接取消翻轉（不用累計步驟）
function applyReflectX() {
  commitActiveAction();
  const lastStep = stepHistory.value[stepHistory.value.length - 1];
  if (lastStep && lastStep.type === 'reflectX') {
    stepHistory.value.pop(); // 相同的連續翻轉等同於取消翻轉
    return;
  }
  stepHistory.value.push({
    id: nextStepId++,
    type: 'reflectX',
    label: '上下翻轉（對稱 x 軸）'
  });
}

function applyReflectY() {
  commitActiveAction();
  const lastStep = stepHistory.value[stepHistory.value.length - 1];
  if (lastStep && lastStep.type === 'reflectY') {
    stepHistory.value.pop(); // 相同的連續翻轉等同於取消翻轉
    return;
  }
  stepHistory.value.push({
    id: nextStepId++,
    type: 'reflectY',
    label: '左右翻轉（對稱 y 軸）'
  });
}

function applyInverse() {
  commitActiveAction();
  const lastStep = stepHistory.value[stepHistory.value.length - 1];
  if (lastStep && lastStep.type === 'inverse') {
    stepHistory.value.pop(); // 相同的連續反函數等同於取消反函數
    return;
  }
  stepHistory.value.push({
    id: nextStepId++,
    type: 'inverse',
    label: '反函數對稱（對稱 y = x）'
  });
}

function undoLastStep() {
  if (activeActionType.value) {
    activeShiftH.value = 0;
    activeShiftK.value = 0;
    activeScaleXIdx.value = 3;
    activeScaleYIdx.value = 3;
    activeActionType.value = null;
  } else if (stepHistory.value.length > 0) {
    stepHistory.value.pop();
  }
}

function resetAll() {
  stepHistory.value = [];
  activeActionType.value = null;
  activeShiftH.value = 0;
  activeShiftK.value = 0;
  activeScaleXIdx.value = 3;
  activeScaleYIdx.value = 3;
}

function setInitialFamily(fam: 'exp' | 'log') {
  initialFamily.value = fam;
  resetAll();
}

function toggleInitialFamily() {
  setInitialFamily(initialFamily.value === 'exp' ? 'log' : 'exp');
}

function getActiveStepLabel(): string {
  if (activeActionType.value === 'shift') {
    const h = activeShiftH.value;
    const k = activeShiftK.value;
    return `平移 (${h > 0 ? `+${h}` : h}, ${k > 0 ? `+${k}` : k})`;
  }
  if (activeActionType.value === 'scaleX') {
    return `X 伸縮 ${scaleLabels[activeScaleXIdx.value]} 倍`;
  }
  if (activeActionType.value === 'scaleY') {
    return `Y 伸縮 ${scaleLabels[activeScaleYIdx.value]} 倍`;
  }
  return '';
}

interface TransformParams {
  fam: 'exp' | 'log';
  A: number;
  B: number;
  C: number;
  D: number;
  px: number;
  py: number;
  asymIsHoriz: boolean;
  asymVal: number;
}

function computeTransformParams(stepsList: StepRecord[], initFam: 'exp' | 'log'): TransformParams {
  let fam: 'exp' | 'log' = initFam;
  let A = 1;
  let B = 0;
  let C = 1;
  let D = 0;
  let px = fam === 'exp' ? 0 : 1;
  let py = fam === 'exp' ? 1 : 0;
  let asymIsHoriz = fam === 'exp';
  let asymVal = 0;

  for (const st of stepsList) {
    switch (st.type) {
      case 'shift': {
        const h = st.h || 0;
        const k = st.k || 0;
        B = B - A * h;
        D = D + k;
        px += h;
        py += k;
        if (asymIsHoriz) asymVal += k;
        else asymVal += h;
        break;
      }
      case 'scaleX': {
        const s = scaleValues[st.val ?? 3];
        A = A / s;
        px *= s;
        if (!asymIsHoriz) asymVal *= s;
        break;
      }
      case 'scaleY': {
        const s = scaleValues[st.val ?? 3];
        C *= s;
        D *= s;
        py *= s;
        if (asymIsHoriz) asymVal *= s;
        break;
      }
      case 'reflectX': {
        C = -C;
        D = -D;
        py = -py;
        if (asymIsHoriz) asymVal = -asymVal;
        break;
      }
      case 'reflectY': {
        A = -A;
        px = -px;
        if (!asymIsHoriz) asymVal = -asymVal;
        break;
      }
      case 'inverse': {
        const oldA = A;
        const oldB = B;
        const oldC = C;
        const oldD = D;
        A = 1 / oldC;
        B = -oldD / oldC;
        C = 1 / oldA;
        D = -oldB / oldA;
        fam = fam === 'exp' ? 'log' : 'exp';
        const tmpP = px;
        px = py;
        py = tmpP;
        asymIsHoriz = !asymIsHoriz;
        break;
      }
    }
  }
  return { fam, A, B, C, D, px, py, asymIsHoriz, asymVal };
}

function formatStateFormula(state: { fam: 'exp' | 'log', A: number, B: number, C: number, D: number }) {
  const { fam, A, B, C, D } = state;
  let uStr = '';
  const absA = Math.abs(A);
  const signA = A < 0 ? '-' : '';
  const isOne = Math.abs(absA - 1) < 0.001;
  const isHalf = Math.abs(absA - 0.5) < 0.001;
  const isThird = Math.abs(absA - 1 / 3) < 0.001;
  const isQuarter = Math.abs(absA - 0.25) < 0.001;

  if (isOne) {
    if (Math.abs(B) < 0.001) {
      uStr = signA === '-' ? '-x' : 'x';
    } else {
      const bSign = B > 0 ? '+' : '-';
      const absB = Math.abs(B);
      const bStr = Number.isInteger(absB) ? `${absB}` : absB.toFixed(1);
      uStr = signA === '-' ? `-(x ${B > 0 ? '-' : '+'} ${bStr})` : `x ${bSign} ${bStr}`;
    }
  } else if (isHalf || isThird || isQuarter) {
    const denom = isHalf ? 2 : isThird ? 3 : 4;
    const bTimesDenom = Math.round(B * denom * 10) / 10;
    if (Math.abs(bTimesDenom) < 0.001) {
      uStr = `${signA}\\frac{x}{${denom}}`;
    } else {
      const bSign = bTimesDenom > 0 ? '+' : '-';
      const absVal = Math.abs(bTimesDenom);
      uStr = `${signA}\\frac{x ${bSign} ${absVal}}{${denom}}`;
    }
  } else {
    const aStr = Number.isInteger(absA) ? `${absA}` : absA.toFixed(2);
    if (Math.abs(B) < 0.001) {
      uStr = `${signA}${aStr}x`;
    } else {
      const bSign = B > 0 ? '+' : '-';
      const bStr = Number.isInteger(Math.abs(B)) ? `${Math.abs(B)}` : Math.abs(B).toFixed(2);
      uStr = `${signA}${aStr}x ${bSign} ${bStr}`;
    }
  }

  let prefixC = '';
  const absC = Math.abs(C);
  const signC = C < 0 ? '-' : '';
  const cIsOne = Math.abs(absC - 1) < 0.001;
  const cIsHalf = Math.abs(absC - 0.5) < 0.001;
  const cIsThird = Math.abs(absC - 1 / 3) < 0.001;
  const cIsQuarter = Math.abs(absC - 0.25) < 0.001;

  if (cIsOne) {
    prefixC = signC === '-' ? '-' : '';
  } else if (cIsHalf || cIsThird || cIsQuarter) {
    const denom = cIsHalf ? 2 : cIsThird ? 3 : 4;
    prefixC = `${signC}\\frac{1}{${denom}} ` + (fam === 'exp' ? '\\cdot ' : '');
  } else {
    const cStr = Number.isInteger(absC) ? `${absC}` : absC.toFixed(2);
    prefixC = `${signC}${cStr} ` + (fam === 'exp' ? '\\cdot ' : '');
  }

  let suffixD = '';
  if (Math.abs(D) > 0.001) {
    const dSign = D > 0 ? '+' : '-';
    const dStr = Number.isInteger(Math.abs(D)) ? `${Math.abs(D)}` : Math.abs(D).toFixed(2);
    suffixD = ` ${dSign} ${dStr}`;
  }

  let formulaLatex = '';
  if (fam === 'exp') {
    formulaLatex = `y = ${prefixC}2^{${uStr}}${suffixD}`;
  } else {
    formulaLatex = `y = ${prefixC}\\log_2(${uStr})${suffixD}`;
  }

  return { formulaLatex, uStr, prefixC, suffixD };
}

function computeActionFormulaLatex(steps: StepRecord[], initFam: 'exp' | 'log'): string {
  if (steps.length === 0) {
    return initFam === 'exp' ? 'y = 2^x' : 'y = \\log_2 x';
  }
  const lastStep = steps[steps.length - 1];
  const prevSteps = steps.slice(0, steps.length - 1);
  const prevState = computeTransformParams(prevSteps, initFam);
  const prevFmt = formatStateFormula(prevState);

  if (lastStep.type === 'shift') {
    const h = lastStep.h || 0;
    const k = lastStep.k || 0;
    let uAction = prevFmt.uStr;

    if (h !== 0) {
      const hPart = h > 0 ? `\\boldsymbol{-${h}}` : `\\boldsymbol{+${Math.abs(h)}}`;
      const absA = Math.abs(prevState.A);
      const signA = prevState.A < 0 ? '-' : '';

      if (Math.abs(absA - 1) < 0.001) {
        if (Math.abs(prevState.B) < 0.001) {
          uAction = signA === '-' ? `-(x ${hPart})` : `(x ${hPart})`;
        } else {
          const bSign = prevState.B > 0 ? '+' : '-';
          const absB = Math.abs(prevState.B);
          const bStr = Number.isInteger(absB) ? `${absB}` : absB.toFixed(1);
          uAction = signA === '-' ? `-(x ${hPart}) ${bSign} ${bStr}` : `(x ${hPart}) ${bSign} ${bStr}`;
        }
      } else {
        let aStr = '';
        if (Math.abs(absA - 0.5) < 0.001) aStr = '\\frac{1}{2}';
        else if (Math.abs(absA - 1 / 3) < 0.001) aStr = '\\frac{1}{3}';
        else if (Math.abs(absA - 0.25) < 0.001) aStr = '\\frac{1}{4}';
        else aStr = Number.isInteger(absA) ? `${absA}` : absA.toFixed(1);

        let baseA = '';
        if (aStr.startsWith('\\frac')) {
          const denom = Math.abs(absA - 0.5) < 0.001 ? 2 : Math.abs(absA - 1 / 3) < 0.001 ? 3 : 4;
          baseA = `${signA}\\frac{x ${hPart}}{${denom}}`;
        } else {
          baseA = `${signA}${aStr}(x ${hPart})`;
        }

        if (Math.abs(prevState.B) < 0.001) {
          uAction = baseA;
        } else {
          const bSign = prevState.B > 0 ? '+' : '-';
          const absB = Math.abs(prevState.B);
          const bStr = Number.isInteger(absB) ? `${absB}` : absB.toFixed(1);
          uAction = `${baseA} ${bSign} ${bStr}`;
        }
      }
    }

    let suffixDAction = prevFmt.suffixD;
    if (k !== 0) {
      const kPart = k > 0 ? `\\boldsymbol{+${k}}` : `\\boldsymbol{-${Math.abs(k)}}`;
      suffixDAction = `${prevFmt.suffixD} ${kPart}`.trimStart();
      suffixDAction = ` ${suffixDAction}`;
    }

    if (prevState.fam === 'exp') {
      return `y = ${prevFmt.prefixC}2^{${uAction}}${suffixDAction}`;
    } else {
      return `y = ${prevFmt.prefixC}\\log_2(${uAction})${suffixDAction}`;
    }
  }

  if (lastStep.type === 'scaleX') {
    const s = scaleValues[lastStep.val ?? 3];
    let xSub = '';
    if (s === 2) xSub = '\\boldsymbol{\\frac{x}{2}}';
    else if (s === 3) xSub = '\\boldsymbol{\\frac{x}{3}}';
    else if (s === 4) xSub = '\\boldsymbol{\\frac{x}{4}}';
    else if (s === 0.5) xSub = '\\boldsymbol{2x}';
    else if (Math.abs(s - 1 / 3) < 0.001) xSub = '\\boldsymbol{3x}';
    else if (s === 0.25) xSub = '\\boldsymbol{4x}';
    else xSub = 'x';

    let uAction = '';
    if (Math.abs(prevState.A - 1) < 0.001 && Math.abs(prevState.B) < 0.001) {
      uAction = xSub;
    } else {
      const absA = Math.abs(prevState.A);
      const signA = prevState.A < 0 ? '-' : '';
      const aStr = Number.isInteger(absA) ? `${absA}` : absA.toFixed(1);
      const aPart = Math.abs(absA - 1) < 0.001 ? signA : `${signA}${aStr}`;
      const bPart = Math.abs(prevState.B) > 0.001 ? ` ${prevState.B > 0 ? '+' : '-'} ${Math.abs(prevState.B)}` : '';
      uAction = `${aPart}\\left(${xSub}\\right)${bPart}`;
    }

    if (prevState.fam === 'exp') {
      return `y = ${prevFmt.prefixC}2^{${uAction}}${prevFmt.suffixD}`;
    } else {
      return `y = ${prevFmt.prefixC}\\log_2(${uAction})${prevFmt.suffixD}`;
    }
  }

  if (lastStep.type === 'scaleY') {
    const s = scaleValues[lastStep.val ?? 3];
    let sBold = '';
    if (s === 2) sBold = '\\boldsymbol{2}';
    else if (s === 3) sBold = '\\boldsymbol{3}';
    else if (s === 4) sBold = '\\boldsymbol{4}';
    else if (s === 0.5) sBold = '\\boldsymbol{\\frac{1}{2}}';
    else if (Math.abs(s - 1 / 3) < 0.001) sBold = '\\boldsymbol{\\frac{1}{3}}';
    else if (s === 0.25) sBold = '\\boldsymbol{\\frac{1}{4}}';
    else sBold = `\\boldsymbol{${s}}`;

    const prevRHS = prevFmt.formulaLatex.replace(/^y\s*=\s*/, '');
    if (Math.abs(prevState.D) > 0.001 || Math.abs(Math.abs(prevState.C) - 1) > 0.001) {
      return `y = ${sBold} \\cdot \\left( ${prevRHS} \\right)`;
    } else {
      const mainTerm = prevState.fam === 'exp' ? `2^{${prevFmt.uStr}}` : `\\log_2(${prevFmt.uStr})`;
      return `y = ${sBold} \\cdot ${mainTerm}`;
    }
  }

  if (lastStep.type === 'reflectX') {
    const prevRHS = prevFmt.formulaLatex.replace(/^y\s*=\s*/, '');
    if (Math.abs(prevState.D) > 0.001) {
      return `y = \\boldsymbol{-}\\left( ${prevRHS} \\right)`;
    } else {
      return `y = \\boldsymbol{-}${prevRHS.startsWith('-') ? `(${prevRHS})` : prevRHS}`;
    }
  }

  if (lastStep.type === 'reflectY') {
    let uAction = '';
    if (Math.abs(prevState.A - 1) < 0.001 && Math.abs(prevState.B) < 0.001) {
      uAction = '\\boldsymbol{-x}';
    } else {
      const bPart = Math.abs(prevState.B) > 0.001 ? ` ${prevState.B > 0 ? '+' : '-'} ${Math.abs(prevState.B)}` : '';
      const aStr = Number.isInteger(Math.abs(prevState.A)) ? `${Math.abs(prevState.A)}` : Math.abs(prevState.A).toFixed(1);
      const signA = prevState.A < 0 ? '-' : '';
      uAction = `${signA}${aStr}(\\boldsymbol{-x})${bPart}`;
    }
    const mainTerm = prevState.fam === 'exp' ? `2^{${uAction}}` : `\\log_2(${uAction})`;
    return `y = ${prevFmt.prefixC}${mainTerm}${prevFmt.suffixD}`;
  }

  if (lastStep.type === 'inverse') {
    const currState = computeTransformParams(steps, initFam);
    const currFmt = formatStateFormula(currState);
    return `x \\leftrightarrow y \\implies y = ${currFmt.formulaLatex.replace(/^y\s*=\s*/, '')}`;
  }

  return formatStateFormula(computeTransformParams(steps, initFam)).formulaLatex;
}

// 計算累積狀態與方程式
const currentTransConfig = computed(() => {
  const steps: StepRecord[] = [...stepHistory.value];
  if (activeActionType.value === 'shift' && (activeShiftH.value !== 0 || activeShiftK.value !== 0)) {
    steps.push({ id: 0, type: 'shift', h: activeShiftH.value, k: activeShiftK.value, label: '' });
  } else if (activeActionType.value === 'scaleX' && activeScaleXIdx.value !== 3) {
    steps.push({ id: 0, type: 'scaleX', val: activeScaleXIdx.value, label: '' });
  } else if (activeActionType.value === 'scaleY' && activeScaleYIdx.value !== 3) {
    steps.push({ id: 0, type: 'scaleY', val: activeScaleYIdx.value, label: '' });
  }

  const transState = computeTransformParams(steps, initialFamily.value);
  const formatted = formatStateFormula(transState);
  const actionFormulaLatex = computeActionFormulaLatex(steps, initialFamily.value);

  const { fam, A, B, C, D, px, py, asymIsHoriz, asymVal } = transState;
  const formulaLatex = formatted.formulaLatex;

  const transformedFn = (x: number) => {
    const u = A * x + B;
    if (fam === 'exp') {
      if (u > 14) return NaN;
      if (u < -14) return D;
      return C * Math.pow(2, u) + D;
    } else {
      if (u <= 0.02) return NaN;
      return C * Math.log2(u) + D;
    }
  };

  const baseFn = (x: number) => {
    if (initialFamily.value === 'exp') {
      return Math.pow(2, x);
    } else {
      return x > 0.03 ? Math.log2(x) : NaN;
    }
  };

  const pxClamped = Math.max(-10, Math.min(10, px));
  const pyClamped = Math.max(-10, Math.min(10, py));
  const xMin = Math.min(-6, pxClamped - 4.5);
  const xMax = Math.max(6.5, pxClamped + 4.5);
  const yMin = Math.min(-5, pyClamped - 4.5);
  const yMax = Math.max(7.5, pyClamped + 5.5);

  const basePoint: PlotPoint = {
    x: initialFamily.value === 'exp' ? 0 : 1,
    y: initialFamily.value === 'exp' ? 1 : 0,
    color: '#64748b',
    radius: 3.5,
    label: initialFamily.value === 'exp' ? '(0, 1)' : '(1, 0)',
    labelPos: initialFamily.value === 'exp' ? 'left' : 'bottom'
  };

  const pxR = Number(px.toFixed(2));
  const pyR = Number(py.toFixed(2));
  const transPoint: PlotPoint = {
    x: pxR,
    y: pyR,
    color: '#38bdf8',
    radius: 5,
    label: `(${pxR}, ${pyR}) 基準點`,
    labelPos: pyR >= 0 ? 'top-left' : 'bottom-left'
  };

  const asymptoteValR = Number(asymVal.toFixed(2));
  let asymptoteLine: PlotLine;
  let asymText = '';
  if (asymIsHoriz) {
    asymptoteLine = {
      x1: xMin, y1: asymptoteValR, x2: xMax, y2: asymptoteValR,
      color: '#f59e0b', strokeWidth: 1.2, dashArray: '3 3',
      label: `y = ${asymptoteValR}`
    };
    asymText = `水平漸近線 $y = ${asymptoteValR}$`;
  } else {
    asymptoteLine = {
      x1: asymptoteValR, y1: yMin, x2: asymptoteValR, y2: yMax,
      color: '#f59e0b', strokeWidth: 1.2, dashArray: '3 3',
      label: `x = ${asymptoteValR}`
    };
    asymText = `垂直漸近線 $x = ${asymptoteValR}$`;
  }

  const guideLine: PlotLine = {
    x1: basePoint.x, y1: basePoint.y, x2: pxR, y2: pyR,
    color: '#38bdf8', strokeWidth: 1.2, dashArray: '2 2'
  };

  const funcs: PlotFunction[] = [
    {
      fn: baseFn,
      color: '#64748b',
      strokeWidth: 1.5,
      dashArray: '3 3',
      label: initialFamily.value === 'exp' ? 'y = 2^x' : 'y = \\log_2 x',
      description: '原基準'
    },
    {
      fn: transformedFn,
      color: '#38bdf8',
      strokeWidth: 2.6,
      label: formulaLatex,
      description: '變換後'
    }
  ];

  const desc = `**方程式結論**：$${formulaLatex}$。<br/>` +
    `**幾何特徵**：基準錨點移至 $(${pxR}, ${pyR})$，${asymText}。`;

  return {
    xRange: [xMin, xMax] as [number, number],
    yRange: [yMin, yMax] as [number, number],
    functions: funcs,
    points: [basePoint, transPoint],
    lines: [asymptoteLine, guideLine],
    description: desc,
    formula: formulaLatex,
    actionFormula: actionFormulaLatex,
    pointText: `${pxR}, ${pyR}`,
    asymText: asymText
  };
});

const actionFormulaDisplay = computed(() => {
  return renderRichMathText(`$\\Large ${currentTransConfig.value.actionFormula}$`);
});

const currentFormulaDisplay = computed(() => {
  return renderRichMathText(`$\\Large ${currentTransConfig.value.formula}$`);
});

const currentFeatureDisplay = computed(() => {
  return renderRichMathText(`**幾何特徵**：基準錨點移至 $(${currentTransConfig.value.pointText})$，${currentTransConfig.value.asymText}。`);
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
      class="w-full max-w-5xl flex flex-col md:flex-row items-start justify-center gap-3 select-none"
    >
      <!-- Left Column: 控制面板 (桌面版呈現，手機版隱藏) -->
      <div class="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col gap-2 p-2.5 rounded-md bg-[#161b22] border border-[#30363d]">
        <!-- 基準函數切換 -->
        <div class="flex flex-col gap-1.5 pb-2 border-b border-[#30363d]">
          <div class="flex items-center justify-between text-xs sm:text-sm font-bold text-[#f0f6fc]">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-sm bg-amber-500"></span>
              <span>基準函數參照</span>
            </span>
          </div>
          <div class="grid grid-cols-2 gap-1.5 bg-[#0d1117] p-1 rounded-md border border-[#30363d]">
            <button
              type="button"
              @click="setInitialFamily('exp')"
              class="px-2 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center text-center"
              :class="initialFamily === 'exp' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
              v-html="renderRichMathText('指數 $y = 2^x$')"
            />
            <button
              type="button"
              @click="setInitialFamily('log')"
              class="px-2 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center text-center"
              :class="initialFamily === 'log' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
              v-html="renderRichMathText('對數 $y = \\log_2 x$')"
            />
          </div>
        </div>

        <!-- 4 組步進按鈕 -->
        <div class="flex flex-col gap-1.5">
          <!-- 1. X 平移 -->
          <div class="flex items-center justify-between p-1.5 px-2 rounded-md bg-[#0d1117] border border-[#30363d]">
            <button
              type="button"
              @click="handleShiftX(-1)"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="向左平移 1 單位"
            >
              －
            </button>
            <div class="flex items-center justify-between flex-1 px-2 min-w-0">
              <span class="text-xs sm:text-[13px] font-bold text-[#c9d1d9] whitespace-nowrap">X 平移</span>
              <span 
                class="text-[11px] sm:text-xs font-mono"
                :class="activeShiftH !== 0 ? 'text-amber-400 font-bold' : 'text-[#8b949e]'"
              >
                位移: {{ activeShiftH !== 0 ? (activeShiftH > 0 ? `+${activeShiftH}` : `${activeShiftH}`) : '0' }}
              </span>
            </div>
            <button
              type="button"
              @click="handleShiftX(1)"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="向右平移 1 單位"
            >
              ＋
            </button>
          </div>

          <!-- 2. Y 平移 -->
          <div class="flex items-center justify-between p-1.5 px-2 rounded-md bg-[#0d1117] border border-[#30363d]">
            <button
              type="button"
              @click="handleShiftY(-1)"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="向下平移 1 單位"
            >
              －
            </button>
            <div class="flex items-center justify-between flex-1 px-2 min-w-0">
              <span class="text-xs sm:text-[13px] font-bold text-[#c9d1d9] whitespace-nowrap">Y 平移</span>
              <span 
                class="text-[11px] sm:text-xs font-mono"
                :class="activeShiftK !== 0 ? 'text-amber-400 font-bold' : 'text-[#8b949e]'"
              >
                位移: {{ activeShiftK !== 0 ? (activeShiftK > 0 ? `+${activeShiftK}` : `${activeShiftK}`) : '0' }}
              </span>
            </div>
            <button
              type="button"
              @click="handleShiftY(1)"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="向上平移 1 單位"
            >
              ＋
            </button>
          </div>

          <!-- 平移向量指示標籤 -->
          <div 
            v-if="activeShiftH !== 0 || activeShiftK !== 0"
            class="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/40 flex items-center justify-between text-[11px] text-amber-300 font-mono"
          >
            <span>累計向量:</span>
            <span class="font-bold">平移 ({{ activeShiftH > 0 ? `+${activeShiftH}` : activeShiftH }}, {{ activeShiftK > 0 ? `+${activeShiftK}` : activeShiftK }})</span>
          </div>

          <!-- 3. X 伸縮 -->
          <div class="flex items-center justify-between p-1.5 px-2 rounded-md bg-[#0d1117] border border-[#30363d]">
            <button
              type="button"
              @click="handleScaleX('down')"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="水平壓縮"
            >
              －
            </button>
            <div class="flex items-center justify-between flex-1 px-2 min-w-0">
              <span class="text-xs sm:text-[13px] font-bold text-[#c9d1d9] whitespace-nowrap">X 伸縮</span>
              <span 
                class="text-[11px] sm:text-xs font-mono"
                :class="activeScaleXIdx !== 3 ? 'text-amber-400 font-bold' : 'text-[#8b949e]'"
              >
                倍率: × {{ scaleLabels[activeScaleXIdx] }}
              </span>
            </div>
            <button
              type="button"
              @click="handleScaleX('up')"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="水平伸長"
            >
              ＋
            </button>
          </div>

          <!-- 4. Y 伸縮 -->
          <div class="flex items-center justify-between p-1.5 px-2 rounded-md bg-[#0d1117] border border-[#30363d]">
            <button
              type="button"
              @click="handleScaleY('down')"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="垂直壓縮"
            >
              －
            </button>
            <div class="flex items-center justify-between flex-1 px-2 min-w-0">
              <span class="text-xs sm:text-[13px] font-bold text-[#c9d1d9] whitespace-nowrap">Y 伸縮</span>
              <span 
                class="text-[11px] sm:text-xs font-mono"
                :class="activeScaleYIdx !== 3 ? 'text-amber-400 font-bold' : 'text-[#8b949e]'"
              >
                倍率: × {{ scaleLabels[activeScaleYIdx] }}
              </span>
            </div>
            <button
              type="button"
              @click="handleScaleY('up')"
              class="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-md bg-[#161b22] hover:bg-[#21262d] text-amber-500 hover:text-amber-400 border border-[#30363d] font-bold text-sm sm:text-base cursor-pointer transition-colors shrink-0"
              title="垂直伸長"
            >
              ＋
            </button>
          </div>
        </div>

        <!-- 對稱動作 (上下排列，統一寬度) -->
        <div class="flex flex-col gap-1.5 pt-1.5 border-t border-[#30363d]">
          <button
            type="button"
            @click="applyReflectX"
            class="w-full py-1.5 px-2 rounded-md text-xs sm:text-sm font-semibold bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer text-center"
            title="對稱 x 軸翻轉"
          >
            上下翻轉 (x 軸)
          </button>
          <button
            type="button"
            @click="applyReflectY"
            class="w-full py-1.5 px-2 rounded-md text-xs sm:text-sm font-semibold bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] hover:border-amber-500 hover:text-amber-400 transition-colors cursor-pointer text-center"
            title="對稱 y 軸翻轉"
          >
            左右翻轉 (y 軸)
          </button>
          <button
            type="button"
            @click="applyInverse"
            class="w-full py-1.5 px-2 rounded-md text-xs sm:text-sm font-semibold bg-[#0d1117] border border-[#30363d] text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 transition-colors cursor-pointer text-center"
            title="對稱 y = x (反函數)"
          >
            反函數對稱 (對稱 y = x)
          </button>
        </div>

        <!-- 復原與重置 -->
        <div class="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#30363d]">
          <button
            type="button"
            @click="undoLastStep"
            :disabled="stepHistory.length === 0 && !activeActionType"
            class="py-1.5 rounded-md text-xs sm:text-sm bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-center"
          >
            復原
          </button>
          <button
            type="button"
            @click="resetAll"
            class="py-1.5 rounded-md text-xs sm:text-sm bg-[#0d1117] text-amber-400 hover:bg-amber-500/10 border border-amber-500/50 cursor-pointer transition-colors text-center font-bold"
          >
            重置
          </button>
        </div>
      </div>

      <!-- Right Column: 函數圖形、手機版按鈕列、動作歷程鏈與方程式說明 -->
      <div class="flex-1 min-w-0 flex flex-col items-center gap-2.5 w-full">
        <!-- 1. FunctionGraph 函數圖形 -->
        <FunctionGraph
          title="函數圖形"
          titleColor="#f59e0b"
          :width="480"
          :height="260"
          :xRange="currentTransConfig.xRange"
          :yRange="currentTransConfig.yRange"
          :functions="currentTransConfig.functions"
          :points="currentTransConfig.points"
          :lines="currentTransConfig.lines"
        />

        <!-- 2. 手機版專用控制面板 (置於圖形正下方，寬鬆舒適之卡片式配置) -->
        <div class="w-full flex flex-col gap-2 p-2.5 rounded-md bg-[#161b22] border border-[#30363d] md:hidden">
          <!-- Row 1: 基準切換 (寬版晶片鈕) + 復原與重置 -->
          <div class="flex items-center justify-between gap-2 w-full">
            <!-- 基準函數切換鈕 -->
            <button
              type="button"
              @click="toggleInitialFamily"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#0d1117] border border-amber-500/50 text-[#f0f6fc] active:bg-amber-500/20 text-xs font-semibold cursor-pointer transition-colors"
              title="單擊切換指數 / 對數"
            >
              <span class="text-[#8b949e] text-[11px]">基準:</span>
              <span class="text-amber-400 font-bold font-mono">{{ initialFamily === 'exp' ? 'y = 2ˣ' : 'y = log₂x' }}</span>
              <span class="text-[10px] text-amber-500 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/30">切換 ⇄</span>
            </button>

            <!-- 復原與重置 -->
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                @click="undoLastStep"
                :disabled="stepHistory.length === 0 && !activeActionType"
                class="px-2.5 py-1.5 rounded-md text-xs font-semibold bg-[#0d1117] text-[#8b949e] active:text-[#f0f6fc] border border-[#30363d] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                復原
              </button>
              <button
                type="button"
                @click="resetAll"
                class="px-2.5 py-1.5 rounded-md text-xs font-bold bg-[#0d1117] text-amber-400 active:bg-amber-500/10 border border-amber-500/50 cursor-pointer transition-colors"
              >
                重置
              </button>
            </div>
          </div>

          <!-- Row 2: 平移步進控制 (X 平移、Y 平移，雙欄等寬寬敞佈局) -->
          <div class="grid grid-cols-2 gap-2 w-full">
            <!-- X 平移 -->
            <div class="flex items-center justify-between rounded-md bg-[#0d1117] border border-[#30363d] p-0.5">
              <button
                type="button"
                @click="handleShiftX(-1)"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="向左平移"
              >
                －
              </button>
              <span class="text-xs font-bold text-[#c9d1d9] flex items-center gap-1">
                <span>X平移</span>
                <span v-if="activeShiftH !== 0" class="text-amber-400 font-mono">{{ activeShiftH > 0 ? `+${activeShiftH}` : activeShiftH }}</span>
              </span>
              <button
                type="button"
                @click="handleShiftX(1)"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="向右平移"
              >
                ＋
              </button>
            </div>

            <!-- Y 平移 -->
            <div class="flex items-center justify-between rounded-md bg-[#0d1117] border border-[#30363d] p-0.5">
              <button
                type="button"
                @click="handleShiftY(-1)"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="向下平移"
              >
                －
              </button>
              <span class="text-xs font-bold text-[#c9d1d9] flex items-center gap-1">
                <span>Y平移</span>
                <span v-if="activeShiftK !== 0" class="text-amber-400 font-mono">{{ activeShiftK > 0 ? `+${activeShiftK}` : activeShiftK }}</span>
              </span>
              <button
                type="button"
                @click="handleShiftY(1)"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="向上平移"
              >
                ＋
              </button>
            </div>
          </div>

          <!-- Row 3: 伸縮步進控制 (X 伸縮、Y 伸縮，雙欄等寬寬敞佈局) -->
          <div class="grid grid-cols-2 gap-2 w-full">
            <!-- X 伸縮 -->
            <div class="flex items-center justify-between rounded-md bg-[#0d1117] border border-[#30363d] p-0.5">
              <button
                type="button"
                @click="handleScaleX('down')"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="水平壓縮"
              >
                －
              </button>
              <span class="text-xs font-bold text-[#c9d1d9] flex items-center gap-1">
                <span>X伸縮</span>
                <span v-if="activeScaleXIdx !== 3" class="text-amber-400 font-mono">×{{ scaleLabels[activeScaleXIdx] }}</span>
              </span>
              <button
                type="button"
                @click="handleScaleX('up')"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="水平伸長"
              >
                ＋
              </button>
            </div>

            <!-- Y 伸縮 -->
            <div class="flex items-center justify-between rounded-md bg-[#0d1117] border border-[#30363d] p-0.5">
              <button
                type="button"
                @click="handleScaleY('down')"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="垂直壓縮"
              >
                －
              </button>
              <span class="text-xs font-bold text-[#c9d1d9] flex items-center gap-1">
                <span>Y伸縮</span>
                <span v-if="activeScaleYIdx !== 3" class="text-amber-400 font-mono">×{{ scaleLabels[activeScaleYIdx] }}</span>
              </span>
              <button
                type="button"
                @click="handleScaleY('up')"
                class="w-8 h-8 flex items-center justify-center rounded bg-[#161b22] hover:bg-[#21262d] active:bg-amber-500/20 text-amber-400 font-bold text-sm cursor-pointer transition-colors"
                title="垂直伸長"
              >
                ＋
              </button>
            </div>
          </div>

          <!-- Row 4: 對稱動作 (上下翻轉、左右翻轉、反函數，三欄平分) -->
          <div class="grid grid-cols-3 gap-2 w-full">
            <button
              type="button"
              @click="applyReflectX"
              class="py-2 px-1 rounded-md text-xs font-semibold bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] hover:border-amber-500 hover:text-amber-400 active:bg-amber-500/10 transition-colors text-center cursor-pointer"
              title="上下翻轉 (x 軸)"
            >
              上下翻轉
            </button>
            <button
              type="button"
              @click="applyReflectY"
              class="py-2 px-1 rounded-md text-xs font-semibold bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] hover:border-amber-500 hover:text-amber-400 active:bg-amber-500/10 transition-colors text-center cursor-pointer"
              title="左右翻轉 (y 軸)"
            >
              左右翻轉
            </button>
            <button
              type="button"
              @click="applyInverse"
              class="py-2 px-1 rounded-md text-xs font-semibold bg-[#0d1117] border border-[#30363d] text-amber-400 hover:border-amber-500 active:bg-amber-500/10 transition-colors text-center cursor-pointer font-bold"
              title="反函數對稱 (對稱 y = x)"
            >
              反函數
            </button>
          </div>
        </div>

        <!-- 3. 變換動作歷程 (改放到方程式上方，KaTeX排版基準式，刪除累計合併註解) -->
        <div class="w-full p-2 sm:p-2.5 rounded-md bg-[#161b22] border border-[#30363d] text-xs sm:text-sm">
          <div class="flex items-center justify-between pb-1 sm:pb-1.5 border-b border-[#30363d] mb-1.5">
            <div class="flex items-center gap-1.5 font-bold text-[#f0f6fc] text-xs sm:text-sm">
              <span class="w-2 h-2 rounded-sm bg-amber-500"></span>
              <span>變換動作歷程</span>
            </div>
            <span class="text-[11px] sm:text-xs font-mono text-[#8b949e]">
              已累計 {{ stepHistory.length + (activeActionType ? 1 : 0) }} 個步驟
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-1 sm:gap-1.5 text-xs">
            <!-- 基準起點 (使用 KaTeX 格式排版上標) -->
            <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-[11px] sm:text-xs flex items-center gap-1">
              <span>基準:</span>
              <span v-html="renderRichMathText(initialFamily === 'exp' ? '$y = 2^x$' : '$y = \\log_2 x$')"></span>
            </span>

            <!-- 歷史步驟清單 -->
            <template v-for="(st, idx) in stepHistory" :key="st.id">
              <span class="text-[#484f58] font-bold text-[10px] sm:text-xs">→</span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#0d1117] border border-[#30363d] text-[#f0f6fc] text-[11px] sm:text-xs">
                <span class="text-amber-500 font-bold">{{ idx + 1 }}.</span> {{ st.label }}
              </span>
            </template>

            <!-- 進行中動作提示 -->
            <template v-if="activeActionType">
              <span class="text-[#484f58] font-bold text-[10px] sm:text-xs">→</span>
              <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-amber-500/10 border border-amber-500/50 text-amber-300 text-[11px] sm:text-xs">
                <span class="text-amber-400 font-bold">{{ stepHistory.length + 1 }}.</span> {{ getActiveStepLabel() }} (調整中)
              </span>
            </template>
          </div>
        </div>

        <!-- 4. 方程式說明卡片：方程式動作 (未展開前呈現) 與 方程式結論 (展開化簡後) -->
        <div class="w-full px-3 py-2 sm:px-4 sm:py-3 rounded-md bg-[#161b22] border border-[#30363d] text-xs sm:text-sm text-[#c9d1d9] text-left leading-relaxed space-y-2">
          <!-- 方程式動作 (說明最後一步未展開前的呈現，動作粗體顯示) -->
          <div class="flex items-center gap-2 pb-1.5 border-b border-[#30363d] flex-wrap">
            <span class="font-bold text-sky-400 text-xs sm:text-sm shrink-0">方程式動作：</span>
            <span class="text-[#f0f6fc] font-bold text-sm sm:text-base" v-html="actionFormulaDisplay"></span>
          </div>

          <!-- 方程式結論 (展開化簡後的呈現) -->
          <div class="flex items-center gap-2 pb-1.5 border-b border-[#30363d] flex-wrap">
            <span class="font-bold text-amber-400 text-xs sm:text-sm shrink-0">方程式結論：</span>
            <span class="text-[#f0f6fc] font-bold text-sm sm:text-base" v-html="currentFormulaDisplay"></span>
          </div>

          <!-- 幾何特徵 -->
          <div class="text-xs text-[#8b949e]">
            <div v-html="currentFeatureDisplay"></div>
          </div>
        </div>
      </div>
    </div>
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
          { fn: (x: number) => -x + 11, domain: [1.5, 9.5], color: '#f43f5e', strokeWidth: 2, label: 'L: x + y = k', description: '垂直割線 (m = -1)' }
        ]"
        :lines="[
          { x1: 5.25, y1: 5.25, x2: 5.0, y2: 5.5, color: '#f59e0b', strokeWidth: 1.4 },
          { x1: 5.0, y1: 5.5, x2: 5.25, y2: 5.75, color: '#f59e0b', strokeWidth: 1.4 },
          { x1: 0, y1: 1, x2: 1, y2: 0, color: '#64748b', strokeWidth: 1, dashArray: '2 2' }
        ]"
        :points="[
          { x: 3, y: 8, color: '#38bdf8', radius: 4.5, latex: 'P(a,\\ b+2)', labelPos: 'top-left' },
          { x: 8, y: 3, color: '#34d399', radius: 4.5, latex: 'Q(3a-1,\\ b-3)', labelPos: 'bottom-right' },
          { x: 5.5, y: 5.5, color: '#f59e0b', radius: 4, latex: '\\text{中點 } M\\left(\\dfrac{P_x+Q_x}{2},\\ \\dfrac{P_y+Q_y}{2}\\right)', labelPos: 'right' },
          { x: 4.95, y: 5.3, color: '#fda4af', hideMarker: true, latex: 'L \\perp (y = x)', labelPos: 'left' },
          { x: 0, y: 1, color: '#94a3b8', radius: 2.5, latex: '(0,\\ 1)', labelPos: 'left' },
          { x: 1, y: 0, color: '#94a3b8', radius: 2.5, latex: '(1,\\ 0)', labelPos: 'bottom' }
        ]"
      />

      <!-- Bottom Insight Legend -->
      <div
        class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans"
        v-html="renderRichMathText('幾何割線核心：**$L: x + y = k$ 斜率為 $-1$，垂直於對稱軸 $y = x$** $\\implies$ $P$、$Q$ 互為對稱點：中點 $M$ 必在 $y = x$ 上，且直線 $PQ$ 斜率為 $-1$！')"
      ></div>
    </div>

  </div>
</template>
