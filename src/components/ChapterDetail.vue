<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  ArrowLeft, Share2, Check, Target, ChevronDown, ChevronUp, 
  Terminal, Activity, Compass, AlertTriangle, HelpCircle, FileText, ExternalLink
} from 'lucide-vue-next';
import { getChapterSummary, ChapterSummary, SopModule, ClassicExample } from '../data/chapterSummaries';
import { renderFormulaItem, renderRichMathText } from '../utils/mathRenderer';
import { ResourceItem } from '../types';
import ResourceCard from './ResourceCard.vue';
import ConceptDiagram from './ConceptDiagram.vue';

const props = defineProps<{
  chapterName: string;
  stage?: string;
  resources: ResourceItem[];
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'openLab', item: ResourceItem): void;
  (e: 'openPdf', item: ResourceItem, viewAnswer: boolean): void;
}>();

// 一鍵複製此章節的專屬分享網址
const isCopied = ref(false);
const copyShareLink = async () => {
  if (typeof window === 'undefined') return;
  try {
    await navigator.clipboard.writeText(window.location.href);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  } catch (err) {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2500);
  }
};

// Lookup summary or build subject-tailored genuine curriculum summary
const summary = computed<ChapterSummary>(() => {
  return getChapterSummary(props.chapterName, props.stage);
});

// Active track tab: 'all' | 'mathA' | 'mathB'
const activeTrackTab = ref<'all' | 'mathA' | 'mathB'>('all');

watch(() => props.chapterName, () => {
  activeTrackTab.value = 'all';
  openSopSteps.value = {};
});

// Check if current chapter has Math A / B differences
const hasTrackVariants = computed(() => {
  return summary.value.coreConcepts?.some(c => c.track === 'mathA' || c.track === 'mathB') ||
    summary.value.sopModules?.some(m => m.track === 'mathA' || m.track === 'mathB') ||
    !!(summary.value.trackVariants && (summary.value.trackVariants.mathA || summary.value.trackVariants.mathB));
});

// Dynamically displayed scope notice
const displayedScopeNotice = computed(() => {
  if (hasTrackVariants.value) {
    if (activeTrackTab.value === 'mathA') {
      return summary.value.trackVariants?.mathA?.scopeNotice || '【數A 完整內容】包含數A+B共同核心概念與數A專屬深化單元。';
    }
    if (activeTrackTab.value === 'mathB') {
      return summary.value.trackVariants?.mathB?.scopeNotice || '【數B 完整內容】包含數A+B共同核心概念與數B專屬幾何/生活應用單元。';
    }
  }
  return summary.value.scopeNotice;
});

// Dynamically displayed aha insight
const displayedAhaInsight = computed(() => {
  if (hasTrackVariants.value) {
    if (activeTrackTab.value === 'mathA') {
      return summary.value.trackVariants?.mathA?.ahaInsight || summary.value.ahaInsight;
    }
    if (activeTrackTab.value === 'mathB') {
      return summary.value.trackVariants?.mathB?.ahaInsight || summary.value.ahaInsight;
    }
  }
  return summary.value.ahaInsight;
});

// Dynamically displayed concepts
const displayedConcepts = computed(() => {
  const allConcepts = summary.value.coreConcepts || [];
  if (!hasTrackVariants.value || activeTrackTab.value === 'all') {
    return allConcepts;
  }
  if (activeTrackTab.value === 'mathA') {
    return allConcepts.filter(c => !c.track || c.track === 'common' || c.track === 'mathA');
  }
  if (activeTrackTab.value === 'mathB') {
    return allConcepts.filter(c => !c.track || c.track === 'common' || c.track === 'mathB');
  }
  return allConcepts;
});

// Dynamically displayed pitfalls
const displayedPitfalls = computed(() => {
  const allPitfalls = summary.value.pitfalls || [];
  if (!hasTrackVariants.value || activeTrackTab.value === 'all') {
    return allPitfalls;
  }
  if (activeTrackTab.value === 'mathA') {
    const commonP = summary.value.trackVariants?.common?.pitfalls || [];
    const aP = summary.value.trackVariants?.mathA?.pitfalls || [];
    if (commonP.length > 0 || aP.length > 0) {
      return [...commonP, ...aP];
    }
    return allPitfalls.filter(p => !p.includes('數B專屬'));
  }
  if (activeTrackTab.value === 'mathB') {
    const commonP = summary.value.trackVariants?.common?.pitfalls || [];
    const bP = summary.value.trackVariants?.mathB?.pitfalls || [];
    if (commonP.length > 0 || bP.length > 0) {
      return [...commonP, ...bP];
    }
    return allPitfalls.filter(p => !p.includes('數A專屬') && !p.includes('數A深化'));
  }
  return allPitfalls;
});

// Hint toggle state
const openHints = ref<Record<number, boolean>>({});
const toggleHint = (idx: number) => {
  openHints.value[idx] = !openHints.value[idx];
};

// SOP steps folding state
const openSopSteps = ref<Record<number, boolean>>({});
const toggleSopSteps = (idx: number) => {
  openSopSteps.value[idx] = !openSopSteps.value[idx];
};
const areAllSopStepsOpen = computed(() => {
  const list = displayedSopModules.value;
  if (!list || list.length === 0) return false;
  return list.every((_, idx) => !!openSopSteps.value[idx]);
});
const toggleAllSopSteps = () => {
  const target = !areAllSopStepsOpen.value;
  displayedSopModules.value.forEach((_, idx) => {
    openSopSteps.value[idx] = target;
  });
};

// Dynamically displayed classic examples
const displayedClassicExamples = computed<ClassicExample[]>(() => {
  if (hasTrackVariants.value && activeTrackTab.value === 'mathB' && summary.value.trackVariants?.mathB?.classicExamples) {
    return summary.value.trackVariants.mathB.classicExamples;
  }
  return summary.value.classicExamples || [];
});

// Dynamically displayed SOP modules
const displayedSopModules = computed<SopModule[]>(() => {
  const sop = (hasTrackVariants.value && activeTrackTab.value === 'mathB' && summary.value.trackVariants?.mathB?.sopModules)
    ? summary.value.trackVariants.mathB.sopModules
    : (summary.value.sopModules || []);
  const fromClassic: SopModule[] = displayedClassicExamples.value.map(ex => ({
    moduleName: ex.title,
    question: ex.question,
    diagramType: ex.diagramType,
    steps: (ex.solutionSteps || []).map(st => ({ label: st.step, text: st.content })),
    answer: ex.answer
  }));
  const merged = [...sop, ...fromClassic];

  if (!hasTrackVariants.value || activeTrackTab.value === 'all') {
    return merged;
  }
  if (activeTrackTab.value === 'mathA') {
    return merged.filter(m => !m.track || m.track === 'common' || m.track === 'mathA');
  }
  if (activeTrackTab.value === 'mathB') {
    return merged.filter(m => !m.track || m.track === 'common' || m.track === 'mathB');
  }
  return merged;
});

// Dynamically displayed quiz questions
const displayedQuizQuestions = computed(() => {
  if (hasTrackVariants.value && activeTrackTab.value === 'mathB' && summary.value.trackVariants?.mathB?.quizQuestions) {
    return summary.value.trackVariants.mathB.quizQuestions;
  }
  return summary.value.quizQuestions || [];
});

// Resources for this specific chapter
const chapterResources = computed(() => {
  const norm = props.chapterName.toLowerCase().replace(/\[.*?\]/g, '').trim();
  return props.resources.filter(r => {
    const rNorm = r.chapter.toLowerCase().replace(/\[.*?\]/g, '').trim();
    return norm.includes(rNorm) || rNorm.includes(norm);
  });
});

// =========================================================================
// 函數坐標互動區 (Coordinate Workspace) 數據與視圖管理
// =========================================================================
interface DiagramOption {
  id: string;
  label: string;
  type: string;
}

const availableDiagrams = computed<DiagramOption[]>(() => {
  const list: DiagramOption[] = [];
  (displayedConcepts.value || []).forEach((c, idx) => {
    if (c.diagramType && !list.some(d => d.type === c.diagramType)) {
      list.push({ id: `concept-${idx}`, label: c.title, type: c.diagramType });
    }
  });
  (displayedSopModules.value || []).forEach((m, idx) => {
    if (m.diagramType && !list.some(d => d.type === m.diagramType)) {
      list.push({ id: `sop-${idx}`, label: m.moduleName, type: m.diagramType });
    }
  });

  // 如果該單元未指定幾何圖形，預設使用通用函數變換坐標系
  if (list.length === 0) {
    list.push({ id: 'default', label: '函數坐標分析', type: 'function-transformation' });
  }
  return list;
});

const selectedDiagramType = ref<string>('');

watch(availableDiagrams, (newDiagrams) => {
  if (newDiagrams.length > 0) {
    selectedDiagramType.value = newDiagrams[0].type;
  } else {
    selectedDiagramType.value = 'function-transformation';
  }
}, { immediate: true });
</script>

<template>
  <div class="space-y-4">
    
    <!-- Top Action & Telemetry Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#30363d]">
      <div class="flex items-center gap-2">
        <button
          @click="emit('back')"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] font-mono text-xs transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>LIST // 資源列表</span>
        </button>

        <button
          @click="copyShareLink"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs transition-colors"
          :class="isCopied ? 'bg-amber-500/10 border-amber-500/80 text-amber-400' : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'"
          title="複製章節分享網址"
        >
          <component :is="isCopied ? Check : Share2" class="w-3.5 h-3.5" :class="isCopied ? 'text-amber-500' : 'text-[#8b949e]'" />
          <span>{{ isCopied ? 'URL_COPIED' : 'SHARE_URL' }}</span>
        </button>
      </div>

      <!-- High School Track Switcher (數A / 數B / 全部) -->
      <div v-if="hasTrackVariants" class="flex items-center gap-1 bg-[#161b22] p-0.5 rounded-md border border-[#30363d] font-mono text-xs">
        <span class="text-[#8b949e] text-[11px] px-1.5">TRACK:</span>
        <button
          @click="activeTrackTab = 'all'"
          class="px-2 py-0.5 rounded-md transition-colors font-mono"
          :class="activeTrackTab === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          ALL
        </button>
        <button
          @click="activeTrackTab = 'mathA'"
          class="px-2 py-0.5 rounded-md transition-colors font-mono"
          :class="activeTrackTab === 'mathA' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          MATH_A
        </button>
        <button
          @click="activeTrackTab = 'mathB'"
          class="px-2 py-0.5 rounded-md transition-colors font-mono"
          :class="activeTrackTab === 'mathB' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          MATH_B
        </button>
      </div>
      <div v-else class="font-mono text-xs text-[#8b949e]">
        <span class="px-2 py-0.5 rounded-md bg-[#161b22] border border-[#30363d]">
          {{ summary.mathTrack === 'mathA' ? '【數甲專屬】' : summary.mathTrack === 'mathB' ? '【數乙專屬】' : '【共同核心】' }}
        </span>
      </div>
    </div>

    <!-- Chapter Header Box: Compact High-Density Header -->
    <div class="p-3.5 rounded-md bg-[#161b22] border border-[#30363d] space-y-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Terminal class="w-4 h-4 text-amber-500" />
          <h2 class="text-lg sm:text-xl font-bold font-mono text-[#f0f6fc] tracking-tight">
            {{ chapterName }}
          </h2>
        </div>
        <span class="font-mono text-[11px] text-[#8b949e] px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d]">
          STATUS: VERIFIED
        </span>
      </div>

      <!-- Scope notice -->
      <div 
        v-if="displayedScopeNotice"
        class="px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs font-mono leading-relaxed"
      >
        <span class="text-amber-500 font-bold">[SCOPE]：</span>
        <span>{{ displayedScopeNotice }}</span>
      </div>

      <!-- Aha! Insight Box -->
      <div 
        v-if="displayedAhaInsight"
        class="px-3 py-2 rounded-md bg-[#0d1117] border border-amber-500/40 text-[#c9d1d9] text-xs font-mono leading-relaxed"
      >
        <span class="text-amber-400 font-bold">[KEY_INSIGHT]：</span>
        <span class="text-[#f0f6fc]">{{ displayedAhaInsight }}</span>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 右側上方：函數坐標互動區 (Interactive Coordinate & Function Workspace) -->
    <!-- ========================================================================= -->
    <section class="rounded-md bg-[#161b22] border border-[#30363d] overflow-hidden">
      <!-- Upper Section Header Bar -->
      <div class="px-3.5 py-2 border-b border-[#30363d] bg-[#161b22] flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <Activity class="w-3.5 h-3.5 text-amber-500" />
          <span class="font-mono font-bold text-xs text-amber-500">
            [COORDINATE_WORKSPACE // 函數坐標互動區]
          </span>
        </div>

        <div class="flex items-center gap-2 font-mono text-[11px] text-[#8b949e]">
          <span class="px-1.5 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d]">
            CANVAS: 2D_CARTESIAN
          </span>
          <span class="px-1.5 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d] text-amber-400">
            STATUS: INTERACTIVE
          </span>
        </div>
      </div>

      <!-- Diagram Selector Tabs (If multiple coordinate views available) -->
      <div 
        v-if="availableDiagrams.length > 1" 
        class="px-3 py-1.5 border-b border-[#30363d] bg-[#0d1117] flex items-center gap-1.5 overflow-x-auto font-mono text-xs"
      >
        <span class="text-[#8b949e] text-[11px] shrink-0">VIEW:</span>
        <button
          v-for="diag in availableDiagrams"
          :key="diag.id"
          @click="selectedDiagramType = diag.type"
          class="px-2 py-0.5 rounded-md transition-colors shrink-0 font-mono"
          :class="selectedDiagramType === diag.type 
            ? 'bg-amber-500 text-black font-bold' 
            : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22] border border-[#30363d]'"
        >
          [{{ diag.label }}]
        </button>
      </div>

      <!-- Interactive Canvas Body -->
      <div class="p-3 sm:p-4 flex flex-col items-center justify-center bg-[#0d1117]">
        <ConceptDiagram :type="selectedDiagramType" />
      </div>

      <!-- Bottom Coordinate Telemetry Strip -->
      <div class="px-3.5 py-1.5 border-t border-[#30363d] bg-[#161b22] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#8b949e]">
        <span>AXES: 1:1 SQUARE ASPECT // SCALE: DYNAMIC</span>
        <span>CONTROLS: DRAG TO PAN // WHEEL TO ZOOM // AMBER ACCENTS</span>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- 右側下方：步驟解題與診斷數據表 (Step-by-step Solving & Diagnostic Data Table) -->
    <!-- ========================================================================= -->

    <!-- Section 1: 步驟解題與破題核心 (SOP Derivation & Problem Solving Modules) -->
    <section v-if="displayedSopModules && displayedSopModules.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <Compass class="w-3.5 h-3.5 text-amber-500" />
          <h3 class="font-mono font-bold text-xs text-amber-500">
            [SOP_DERIVATION // 經典題型與步驟解題]
          </h3>
        </div>

        <button 
          type="button"
          @click="toggleAllSopSteps"
          class="text-xs font-mono text-[#8b949e] hover:text-amber-400 px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d] hover:border-amber-500/50 transition-colors"
        >
          {{ areAllSopStepsOpen ? '[折疊全部步驟]' : '[展開全部步驟]' }}
        </button>
      </div>

      <div class="space-y-3">
        <div 
          v-for="(mod, mIdx) in displayedSopModules"
          :key="mIdx"
          class="rounded-md bg-[#0d1117] border border-[#30363d] p-3 space-y-2.5"
        >
          <!-- Module Title & Track Badge -->
          <div class="flex items-center justify-between gap-2 border-b border-[#30363d] pb-2">
            <div class="flex items-center gap-2 font-mono">
              <span class="w-1.5 h-1.5 rounded-sm bg-amber-500"></span>
              <h4 class="text-xs sm:text-sm font-bold text-[#f0f6fc]">
                {{ mod.moduleName }}
              </h4>
            </div>
            <span 
              v-if="mod.track"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-[#161b22] border border-[#30363d] text-[#8b949e]"
            >
              {{ mod.track === 'mathA' ? '數A專屬' : mod.track === 'mathB' ? '數B專屬' : '共同核心' }}
            </span>
          </div>

          <!-- Question Statement -->
          <div 
            v-if="mod.question"
            class="p-2.5 rounded-md bg-[#161b22] border border-[#30363d] text-xs leading-relaxed text-[#f0f6fc]"
          >
            <span v-html="renderRichMathText(mod.question)"></span>
          </div>

          <!-- Mindset callout -->
          <div 
            v-if="mod.mindset"
            class="px-3 py-1.5 rounded-md bg-[#161b22] border border-amber-500/30 text-xs font-mono text-amber-300 leading-relaxed"
          >
            <span class="text-amber-500 font-bold">[MINDSET]：</span>
            <span v-html="renderRichMathText(mod.mindset)"></span>
          </div>

          <!-- Foldable Step-by-Step Toggle -->
          <button 
            type="button"
            @click="toggleSopSteps(mIdx)"
            class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-colors text-xs font-mono cursor-pointer"
          >
            <span class="flex items-center gap-1.5 text-amber-400">
              <Target class="w-3.5 h-3.5" />
              <span>{{ openSopSteps[mIdx] ? '收合推導步驟' : '展開推導步驟' }}</span>
              <span class="text-[#8b949e]">（{{ mod.steps.length }} STEPS）</span>
            </span>
            <component :is="openSopSteps[mIdx] ? ChevronUp : ChevronDown" class="w-3.5 h-3.5 text-[#8b949e]" />
          </button>

          <!-- Derivation Steps Body -->
          <div v-if="openSopSteps[mIdx]" class="space-y-2 pt-1 font-mono">
            <div 
              v-for="(step, sIdx) in mod.steps"
              :key="sIdx"
              class="p-2.5 rounded-md bg-[#161b22] border border-[#30363d] space-y-1.5"
            >
              <div class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30">
                <span>STEP_{{ String(sIdx + 1).padStart(2, '0') }}</span>
                <span>//</span>
                <span v-html="renderRichMathText(step.label)"></span>
              </div>
              <div class="text-xs text-[#c9d1d9] pl-2 border-l border-[#30363d] leading-relaxed font-sans whitespace-pre-line" v-html="renderRichMathText(step.text)"></div>
            </div>

            <!-- Conclusion / Result -->
            <div 
              v-if="mod.answer"
              class="px-3 py-2 rounded-md bg-[#161b22] border border-amber-500/40 text-xs font-mono text-[#f0f6fc] flex items-center gap-2"
            >
              <span class="px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-bold text-[10px]">
                RESULT
              </span>
              <span class="text-amber-300 font-sans" v-html="renderRichMathText(mod.answer)"></span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- Section 2: 核心觀念與公式推導數據表 (Core Concepts & Formulas Table) -->
    <section v-if="displayedConcepts && displayedConcepts.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <h3 class="font-mono font-bold text-xs text-amber-500">
          [FORMULA_TABLE // 核心觀念與公式精要]
        </h3>
        <span class="text-[11px] font-mono text-[#8b949e]">
          COUNT: {{ displayedConcepts.length }}
        </span>
      </div>

      <div class="space-y-3">
        <div 
          v-for="(concept, idx) in displayedConcepts" 
          :key="idx"
          class="rounded-md bg-[#0d1117] border border-[#30363d] p-3 space-y-2"
        >
          <div class="flex items-center justify-between gap-2 border-b border-[#30363d] pb-1.5">
            <h4 class="text-xs sm:text-sm font-bold font-mono text-[#f0f6fc] flex items-center gap-1.5">
              <span class="text-amber-500 font-mono">{{ String(idx + 1).padStart(2, '0') }}.</span>
              <span>{{ concept.title }}</span>
            </h4>
            <span 
              v-if="concept.track"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-[#161b22] border border-[#30363d] text-[#8b949e]"
            >
              {{ concept.track === 'mathA' ? '數A' : concept.track === 'mathB' ? '數B' : '共同' }}
            </span>
          </div>

          <!-- Description -->
          <div class="text-xs text-[#c9d1d9] leading-relaxed whitespace-pre-line" v-html="renderRichMathText(concept.description)"></div>

          <!-- Formulas List Table -->
          <div 
            v-if="concept.formulas && concept.formulas.length > 0"
            class="space-y-1.5 pt-1"
          >
            <div 
              v-for="(fItem, fIdx) in concept.formulas"
              :key="fIdx"
              class="px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] flex flex-wrap items-center gap-2 text-xs font-mono"
            >
              <span 
                v-if="renderFormulaItem(fItem).label" 
                class="font-bold text-amber-400 font-mono text-[11px] px-1 py-0.2 rounded-md bg-[#0d1117] border border-[#30363d]"
              >
                {{ renderFormulaItem(fItem).label }}
              </span>
              <span 
                class="text-[#f0f6fc] select-all font-sans text-xs sm:text-sm"
                v-html="renderFormulaItem(fItem).mathHtml"
              />
              <span 
                v-if="renderFormulaItem(fItem).note" 
                class="text-[11px] text-[#8b949e] font-mono ml-auto"
              >
                // {{ renderFormulaItem(fItem).note }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 3: 常見解題盲點與診斷數據表 (Diagnostic Data Table) -->
    <section v-if="displayedPitfalls && displayedPitfalls.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-3.5 h-3.5 text-amber-500" />
          <h3 class="font-mono font-bold text-xs text-amber-500">
            [DIAGNOSTIC_LOG // 常見解題盲點與診斷數據表]
          </h3>
        </div>
        <span class="text-[11px] font-mono text-[#8b949e]">
          TOTAL_ANOMALIES: {{ displayedPitfalls.length }}
        </span>
      </div>

      <!-- High Data Density Diagnostic Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs font-mono border-collapse border border-[#30363d]">
          <thead>
            <tr class="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d]">
              <th class="p-2.5 w-16 border-r border-[#30363d]">ID</th>
              <th class="p-2.5 border-r border-[#30363d]">DIAGNOSIS_RULE // 診斷盲點與成因</th>
              <th class="p-2.5 w-32 sm:w-40">SEVERITY</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#30363d]">
            <tr 
              v-for="(pitfall, pIdx) in displayedPitfalls"
              :key="pIdx"
              class="hover:bg-[#21262d] transition-colors"
            >
              <td class="p-2.5 text-amber-500 font-bold border-r border-[#30363d] align-top">
                ERR_{{ String(pIdx + 1).padStart(2, '0') }}
              </td>
              <td class="p-2.5 text-[#c9d1d9] font-sans leading-relaxed border-r border-[#30363d]">
                <span v-html="renderRichMathText(pitfall)"></span>
              </td>
              <td class="p-2.5 text-[#8b949e] font-mono text-[11px] align-top">
                <span class="px-1.5 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d] text-amber-400">
                  CRITICAL_FALLACY
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Section 4: 觀念自我檢測 (Practice Quiz Questions) -->
    <section v-if="displayedQuizQuestions && displayedQuizQuestions.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <HelpCircle class="w-3.5 h-3.5 text-amber-500" />
          <h3 class="font-mono font-bold text-xs text-amber-500">
            [SELF_CHECK // 觀念微檢測]
          </h3>
        </div>
      </div>

      <div class="space-y-2.5">
        <div 
          v-for="(q, qIdx) in displayedQuizQuestions"
          :key="qIdx"
          class="rounded-md bg-[#0d1117] border border-[#30363d] p-3 space-y-2 font-mono"
        >
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 rounded-md bg-[#161b22] text-amber-400 border border-[#30363d] text-[11px] font-bold">
              Q_{{ String(q.questionNumber || qIdx + 1).padStart(2, '0') }}
            </span>
            <h4 class="text-xs font-bold text-[#f0f6fc] font-sans">
              {{ q.title }}
            </h4>
          </div>

          <p class="text-xs text-[#c9d1d9] leading-relaxed font-sans p-2 rounded-md bg-[#161b22] border border-[#30363d]" v-html="renderRichMathText(q.question)"></p>

          <div v-if="q.hint">
            <button
              @click="toggleHint(qIdx)"
              class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-colors bg-[#161b22] hover:bg-[#21262d] text-amber-400 border border-[#30363d]"
            >
              <span>{{ openHints[qIdx] ? '收起解題提示' : '查看解題提示' }}</span>
              <component :is="openHints[qIdx] ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
            </button>

            <div 
              v-if="openHints[qIdx]"
              class="mt-2 p-2.5 rounded-md bg-[#161b22] border border-amber-500/40 text-xs font-sans text-[#c9d1d9] leading-relaxed whitespace-pre-line space-y-2"
            >
              <div v-html="renderRichMathText(q.hint)"></div>
              <div v-if="q.diagramType" class="p-2 rounded-md bg-[#0d1117] border border-[#30363d]">
                <ConceptDiagram :type="q.diagramType" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section 5: 單元附加資源清單 (Attached Resources) -->
    <section class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <FileText class="w-3.5 h-3.5 text-amber-500" />
          <h3 class="font-mono font-bold text-xs text-amber-500">
            [ATTACHED_FILES // 本單元實戰補充資源]
          </h3>
        </div>
        <span class="text-[11px] font-mono text-[#8b949e]">
          COUNT: {{ chapterResources.length }}
        </span>
      </div>

      <div v-if="chapterResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ResourceCard
          v-for="res in chapterResources"
          :key="res.id"
          :resource="res"
          @openLab="(item) => emit('openLab', item)"
          @openPdf="(item, ans) => emit('openPdf', item, ans)"
        />
      </div>

      <div 
        v-else 
        class="p-4 rounded-md bg-[#0d1117] border border-dashed border-[#30363d] text-center font-mono text-xs text-[#8b949e]"
      >
        本單元目前尚無附加實戰試卷或動態模型。
      </div>
    </section>

  </div>
</template>
