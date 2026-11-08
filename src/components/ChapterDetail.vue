<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  ArrowLeft, Share2, Check, Target, ChevronDown, ChevronUp, 
  BookOpen, Compass, AlertTriangle, HelpCircle, FileText, Sparkles
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
</script>

<template>
  <div class="space-y-4">
    
    <!-- Top Action Bar -->
    <div class="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[#30363d]">
      <div class="flex items-center gap-2">
        <button
          @click="emit('back')"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] font-mono text-xs transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>返回全部資源清單</span>
        </button>

        <button
          @click="copyShareLink"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-xs transition-colors"
          :class="isCopied ? 'bg-amber-500/10 border-amber-500/80 text-amber-400' : 'bg-[#161b22] hover:bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'"
          title="複製此章節的專屬分享網址"
        >
          <component :is="isCopied ? Check : Share2" class="w-3.5 h-3.5" :class="isCopied ? 'text-amber-500' : 'text-[#8b949e]'" />
          <span>{{ isCopied ? '已複製分享網址' : '複製分享網址' }}</span>
        </button>
      </div>

      <!-- High School Track Switcher (數A / 數B / 全部) -->
      <div v-if="hasTrackVariants" class="flex items-center gap-1 bg-[#161b22] p-0.5 rounded-md border border-[#30363d] font-mono text-xs">
        <span class="text-[#8b949e] text-[11px] px-1.5">分流：</span>
        <button
          @click="activeTrackTab = 'all'"
          class="px-2 py-0.5 rounded-md transition-colors font-mono"
          :class="activeTrackTab === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          全部
        </button>
        <button
          @click="activeTrackTab = 'mathA'"
          class="px-2 py-0.5 rounded-md transition-colors font-mono"
          :class="activeTrackTab === 'mathA' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          數A
        </button>
        <button
          @click="activeTrackTab = 'mathB'"
          class="px-2 py-0.5 rounded-md transition-colors font-mono"
          :class="activeTrackTab === 'mathB' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          數B
        </button>
      </div>
      <div v-else class="font-mono text-xs text-[#8b949e]">
        <span class="px-2 py-0.5 rounded-md bg-[#161b22] border border-[#30363d]">
          {{ summary.mathTrack === 'mathA' ? '【數甲專屬單元】' : summary.mathTrack === 'mathB' ? '【數乙專屬單元】' : '【共同核心單元】' }}
        </span>
      </div>
    </div>

    <!-- Chapter Header Box: Compact Workbench Header -->
    <div class="p-3.5 sm:p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-2">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-xl font-bold font-mono text-[#f0f6fc] tracking-tight">
          {{ chapterName }}
        </h2>
        <span class="font-mono text-[11px] text-[#8b949e] px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d]">
          單元解析
        </span>
      </div>

      <!-- Scope notice -->
      <div 
        v-if="displayedScopeNotice"
        class="px-3 py-1.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-xs font-mono leading-relaxed"
      >
        <span class="text-amber-500 font-bold">[課綱範圍]：</span>
        <span>{{ displayedScopeNotice }}</span>
      </div>

      <!-- Aha! Insight Box -->
      <div 
        v-if="displayedAhaInsight"
        class="px-3 py-2 rounded-md bg-[#0d1117] border border-amber-500/40 text-[#c9d1d9] text-xs font-mono leading-relaxed"
      >
        <span class="text-amber-400 font-bold">[核心訣竅]：</span>
        <span class="text-[#f0f6fc]">{{ displayedAhaInsight }}</span>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 第一大板塊：重點整理 (Core Concepts & Formulas) -->
    <!-- ========================================================================= -->
    <section class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 sm:p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-amber-500" />
          <h3 class="font-mono font-bold text-xs sm:text-sm text-amber-500">
            [一、重點整理 // 核心觀念與公式精要]
          </h3>
        </div>
        <span v-if="hasTrackVariants" class="text-xs font-mono text-[#8b949e]">
          模式：<strong class="text-amber-400 font-semibold">{{ activeTrackTab === 'all' ? '全部 (共同 + 數A + 數B)' : activeTrackTab === 'mathA' ? '數A (共同 + 數A專屬)' : '數B (共同 + 數B專屬)' }}</strong>
        </span>
      </div>

      <!-- 由上而下單欄排列 -->
      <div class="space-y-3">
        <div 
          v-for="(concept, idx) in displayedConcepts" 
          :key="idx"
          class="rounded-md bg-[#0d1117] border border-[#30363d] p-3.5 space-y-2.5"
        >
          <!-- 概念標題與標籤 -->
          <div class="flex items-center justify-between gap-2 border-b border-[#30363d] pb-1.5">
            <h4 class="text-xs sm:text-sm font-bold font-mono text-[#f0f6fc] flex items-center gap-1.5">
              <span class="text-amber-500">{{ String(idx + 1).padStart(2, '0') }}.</span>
              <span>{{ concept.title }}</span>
            </h4>
            <span 
              v-if="concept.track === 'mathA'"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-[#161b22] text-amber-400 border border-amber-500/40 shrink-0"
            >
              數A專屬
            </span>
            <span 
              v-else-if="concept.track === 'mathB'"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-[#161b22] text-amber-400 border border-amber-500/40 shrink-0"
            >
              數B專屬
            </span>
            <span 
              v-else-if="concept.track === 'common'"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-[#161b22] text-[#8b949e] border border-[#30363d] shrink-0"
            >
              共同核心
            </span>
          </div>

          <!-- 佈局分支：若設定 diagramPosition === 'top'，在說明/表格最上方呈現圖形 -->
          <div 
            v-if="concept.diagramPosition === 'top' && concept.diagramType"
            class="my-2.5 w-full flex flex-col items-center rounded-md bg-[#161b22] border border-[#30363d] p-2 overflow-hidden"
          >
            <ConceptDiagram :type="concept.diagramType" />
          </div>

          <!-- 觀念文字說明 -->
          <div class="text-xs sm:text-sm text-[#c9d1d9] leading-relaxed whitespace-pre-line" v-html="renderRichMathText(concept.description)"></div>

          <!-- 佈局分支：若設定 diagramPosition === 'right'，在寬螢幕將短公式置於左、圖形置於右 -->
          <div 
            v-if="concept.diagramPosition === 'right' && concept.diagramType"
            class="mt-2.5 grid grid-cols-1 lg:grid-cols-2 gap-3 items-center"
          >
            <!-- 左欄：公式列表 -->
            <div 
              v-if="concept.formulas && concept.formulas.length > 0"
              class="space-y-2"
            >
              <div 
                v-for="(fItem, fIdx) in concept.formulas"
                :key="fIdx"
                class="px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono flex flex-wrap items-center gap-2 overflow-x-auto"
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

            <!-- 右欄：圖解 -->
            <div class="w-full flex flex-col items-center rounded-md bg-[#161b22] border border-[#30363d] p-2 overflow-hidden h-full justify-center">
              <ConceptDiagram :type="concept.diagramType" />
            </div>
          </div>

          <!-- 預設垂直單欄佈局：若不是 top 且不是 right，圖形在說明下方，公式在最下 -->
          <template v-else-if="concept.diagramPosition !== 'top'">
            <div 
              v-if="concept.diagramType"
              class="my-2.5 w-full flex flex-col items-center rounded-md bg-[#161b22] border border-[#30363d] p-2 overflow-hidden"
            >
              <ConceptDiagram :type="concept.diagramType" />
            </div>

            <!-- 公式列表 -->
            <div 
              v-if="concept.formulas && concept.formulas.length > 0"
              class="mt-2 space-y-2"
            >
              <div 
                v-for="(fItem, fIdx) in concept.formulas"
                :key="fIdx"
                class="px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono flex flex-wrap items-center gap-2 overflow-x-auto"
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
          </template>

          <!-- 若 diagramPosition === 'top' 但有填寫 formulas，在下方呈現公式卡片 -->
          <template v-else-if="concept.formulas && concept.formulas.length > 0">
            <div class="mt-2 space-y-2">
              <div 
                v-for="(fItem, fIdx) in concept.formulas"
                :key="fIdx"
                class="px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono flex flex-wrap items-center gap-2 overflow-x-auto"
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
          </template>
        </div>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- 第二大板塊：經典範例 (Problem Solving Mindset & Integrated Examples) -->
    <!-- ========================================================================= -->
    <section v-if="displayedSopModules && displayedSopModules.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 sm:p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <Compass class="w-4 h-4 text-amber-500" />
          <h3 class="font-mono font-bold text-xs sm:text-sm text-amber-500">
            [二、經典範例 // 經典題型與破題核心]
          </h3>
        </div>

        <div class="flex items-center gap-2">
          <button 
            type="button"
            @click="toggleAllSopSteps"
            class="text-xs font-mono text-[#8b949e] hover:text-amber-400 px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d] hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <span>{{ areAllSopStepsOpen ? '[折疊全部步驟]' : '[展開全部步驟]' }}</span>
          </button>
        </div>
      </div>

      <div class="space-y-3">
        <div 
          v-for="(mod, mIdx) in displayedSopModules"
          :key="mIdx"
          class="rounded-md bg-[#0d1117] border border-[#30363d] p-3.5 space-y-2.5"
        >
          <!-- 模組標題 -->
          <div class="flex items-center justify-between gap-2 border-b border-[#30363d] pb-2">
            <div class="flex items-center gap-2 font-mono">
              <span class="w-1.5 h-1.5 rounded-sm bg-amber-500"></span>
              <h4 class="text-xs sm:text-sm font-bold text-[#f0f6fc]">
                {{ mod.moduleName }}
              </h4>
            </div>
            <span 
              v-if="mod.track"
              class="px-1.5 py-0.2 rounded-md text-[10px] font-mono bg-[#161b22] text-[#8b949e] border border-[#30363d]"
            >
              {{ mod.track === 'mathA' ? '數A專屬' : mod.track === 'mathB' ? '數B專屬' : '共同核心' }}
            </span>
          </div>

          <!-- 先有題目：具體範例題目置頂 -->
          <div 
            v-if="mod.question"
            class="p-3 rounded-md bg-[#161b22] border border-[#30363d] text-xs sm:text-sm text-[#f0f6fc] leading-relaxed"
          >
            <span v-html="renderRichMathText(mod.question)"></span>
          </div>

          <!-- 破題直覺心法提示 -->
          <div 
            v-if="mod.mindset"
            class="px-3 py-2 rounded-md bg-[#161b22] border border-amber-500/30 text-xs font-mono text-amber-300 leading-relaxed"
          >
            <span class="text-amber-500 font-bold">[破題心法]：</span>
            <span v-html="renderRichMathText(mod.mindset)"></span>
          </div>

          <!-- 折疊步驟開關按鈕 -->
          <button 
            type="button"
            @click="toggleSopSteps(mIdx)"
            class="w-full flex items-center justify-between px-3 py-2 rounded-md bg-[#161b22] border border-[#30363d] hover:border-amber-500/50 transition-colors text-xs font-mono cursor-pointer"
          >
            <span class="flex items-center gap-2 text-amber-400 font-medium">
              <Target class="w-3.5 h-3.5" />
              <span>{{ openSopSteps[mIdx] ? '收合步驟解析與圖形' : '展開步驟解析與圖形' }}</span>
              <span class="text-[#8b949e]">（共 {{ mod.steps.length }} 步{{ mod.diagramType ? '，含圖形判定' : '' }}）</span>
            </span>
            <component :is="openSopSteps[mIdx] ? ChevronUp : ChevronDown" class="w-3.5 h-3.5 text-[#8b949e]" />
          </button>

          <!-- 折疊區域：圖形視覺化 + 步驟 1, 2, 3 垂直單欄排列（由上而下） + 結論答案 -->
          <div v-if="openSopSteps[mIdx]" class="space-y-2.5 pt-1 font-mono">
            <!-- 函數圖形視覺化 -->
            <div 
              v-if="mod.diagramType"
              class="my-2 w-full flex flex-col items-center rounded-md bg-[#161b22] border border-[#30363d] p-2 overflow-hidden"
            >
              <ConceptDiagram :type="mod.diagramType" />
            </div>

            <!-- 步驟由上而下垂直單欄排列 -->
            <div class="flex flex-col space-y-2">
              <div 
                v-for="(step, sIdx) in mod.steps"
                :key="sIdx"
                class="p-3 rounded-md bg-[#161b22] border border-[#30363d] space-y-1.5"
              >
                <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold text-xs border border-amber-500/30">
                  <Target class="w-3 h-3 text-amber-400 shrink-0" />
                  <span v-html="renderRichMathText(step.label)"></span>
                </div>
                <div class="text-xs text-[#c9d1d9] pl-2.5 border-l border-[#30363d] leading-relaxed font-sans whitespace-pre-line" v-html="renderRichMathText(step.text)"></div>
              </div>
            </div>

            <!-- 結論答案 -->
            <div 
              v-if="mod.answer"
              class="px-3 py-2 rounded-md bg-[#161b22] border border-amber-500/40 text-xs font-mono text-[#f0f6fc] flex items-center gap-2"
            >
              <span class="px-1.5 py-0.5 rounded-md bg-amber-500 text-black font-bold text-[10px]">
                結論答案
              </span>
              <span class="text-amber-300 font-sans" v-html="renderRichMathText(mod.answer)"></span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- 第三大板塊：常見迷思 (Common Pitfalls & Misconceptions) -->
    <!-- ========================================================================= -->
    <section v-if="displayedPitfalls && displayedPitfalls.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 sm:p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <AlertTriangle class="w-4 h-4 text-amber-500" />
          <h3 class="font-mono font-bold text-xs sm:text-sm text-amber-500">
            [三、常見迷思 // 常見解題盲點與避坑提醒]
          </h3>
        </div>
        <span class="text-[11px] font-mono text-[#8b949e]">
          共 {{ displayedPitfalls.length }} 項提醒
        </span>
      </div>

      <div class="flex flex-col space-y-2">
        <div 
          v-for="(pitfall, idx) in displayedPitfalls" 
          :key="idx"
          class="p-3 rounded-md bg-[#0d1117] border border-[#30363d] text-xs sm:text-sm text-[#c9d1d9] flex items-start gap-2.5 font-mono"
        >
          <span class="w-5 h-5 rounded-md bg-[#161b22] border border-[#30363d] text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
            {{ idx + 1 }}
          </span>
          <span class="leading-relaxed whitespace-pre-line font-sans" v-html="renderRichMathText(pitfall)"></span>
        </div>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- 第四大板塊：課後練習 (Practice Quiz Questions) -->
    <!-- ========================================================================= -->
    <section v-if="displayedQuizQuestions && displayedQuizQuestions.length > 0" class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 sm:p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <HelpCircle class="w-4 h-4 text-amber-500" />
          <h3 class="font-mono font-bold text-xs sm:text-sm text-amber-500">
            [四、課後練習 // 觀念微檢測]
          </h3>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-2.5">
        <div 
          v-for="(q, qIdx) in displayedQuizQuestions"
          :key="qIdx"
          class="rounded-md bg-[#0d1117] border border-[#30363d] p-3.5 space-y-2.5 font-mono"
        >
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-[#161b22] text-amber-400 border border-[#30363d] text-xs font-bold">
              第 {{ q.questionNumber || qIdx + 1 }} 題
            </span>
            <h4 class="text-xs sm:text-sm font-bold text-[#f0f6fc] font-sans">
              {{ q.title }}
            </h4>
          </div>

          <p class="text-xs sm:text-sm text-[#c9d1d9] leading-relaxed p-3 rounded-md bg-[#161b22] border border-[#30363d] font-sans" v-html="renderRichMathText(q.question)"></p>

          <div v-if="q.hint">
            <button
              @click="toggleHint(qIdx)"
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-colors bg-[#161b22] hover:bg-[#21262d] text-amber-400 border border-[#30363d]"
            >
              <span>{{ openHints[qIdx] ? '收起思考提示' : '查看思考提示' }}</span>
              <component :is="openHints[qIdx] ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
            </button>

            <div 
              v-if="openHints[qIdx]"
              class="mt-2 p-3 rounded-md bg-[#161b22] border border-amber-500/40 text-xs font-sans text-[#c9d1d9] leading-relaxed whitespace-pre-line space-y-2.5"
            >
              <div v-html="renderRichMathText(q.hint)"></div>
              <div 
                v-if="q.diagramType"
                class="my-2 w-full flex flex-col items-center rounded-md bg-[#0d1117] border border-[#30363d] p-2 overflow-hidden"
              >
                <ConceptDiagram :type="q.diagramType" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ========================================================================= -->
    <!-- 第五大板塊：單元資源 (Attached Resources) -->
    <!-- ========================================================================= -->
    <section class="rounded-md bg-[#161b22] border border-[#30363d] p-3.5 sm:p-4 space-y-3">
      <div class="flex items-center justify-between border-b border-[#30363d] pb-2">
        <div class="flex items-center gap-2">
          <FileText class="w-4 h-4 text-amber-500" />
          <h3 class="font-mono font-bold text-xs sm:text-sm text-amber-500">
            [五、單元資源 // 本單元實戰補充資源]
          </h3>
        </div>
        <span class="text-[11px] font-mono text-[#8b949e]">
          共 {{ chapterResources.length }} 筆資源
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
        本單元目前尚無專屬附加試卷或動態檔案。
      </div>
    </section>

  </div>
</template>
