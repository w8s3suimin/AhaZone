<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Lightbulb, AlertTriangle, BookOpen, Sparkles, FileText, ArrowLeft, CheckCircle2, Layers, Share2, Check, Compass, Target, HelpCircle, ChevronDown, ChevronUp } from 'lucide-vue-next';
import { getChapterSummary, ChapterSummary } from '../data/chapterSummaries';
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
});

// Check if current chapter has Math A / B differences
const hasTrackVariants = computed(() => {
  return summary.value.coreConcepts?.some(c => c.track === 'mathA' || c.track === 'mathB') ||
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

// Dynamically displayed concepts:
// 數A: 顯示 共同 + 數A專屬內容
// 數B: 顯示 共同 + 數B專屬內容
// 全部: 顯示全部
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

// Dynamically displayed SOP modules
const displayedSopModules = computed(() => {
  if (hasTrackVariants.value && activeTrackTab.value === 'mathB' && summary.value.trackVariants?.mathB?.sopModules) {
    return summary.value.trackVariants.mathB.sopModules;
  }
  return summary.value.sopModules || [];
});

// Dynamically displayed classic examples
const displayedClassicExamples = computed(() => {
  if (hasTrackVariants.value && activeTrackTab.value === 'mathB' && summary.value.trackVariants?.mathB?.classicExamples) {
    return summary.value.trackVariants.mathB.classicExamples;
  }
  return summary.value.classicExamples || [];
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
  <div class="space-y-6 animate-in fade-in duration-200">
    
    <!-- Top Action Bar -->
    <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
      <div class="flex items-center gap-2">
        <button
          @click="emit('back')"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
        >
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>返回全部資源清單</span>
        </button>

        <!-- 一鍵複製章節專屬分享連結 -->
        <button
          @click="copyShareLink"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm"
          :class="isCopied ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300' : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'"
          title="複製此章節的專屬分享網址，可直接傳送給學生開啟"
        >
          <component :is="isCopied ? Check : Share2" class="w-3.5 h-3.5" :class="isCopied ? 'text-emerald-400' : 'text-sky-400'" />
          <span>{{ isCopied ? '已複製章節分享網址！' : '複製章節分享網址' }}</span>
        </button>
      </div>

      <!-- Scope Badge -->
      <div class="flex items-center gap-2">
        <span 
          v-if="hasTrackVariants"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/60"
        >
          【高二 數A / 數B 分流單元】
        </span>
        <span 
          v-else-if="summary.mathTrack === 'mathA'"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/60"
        >
          【數甲 專屬單元】
        </span>
        <span 
          v-else-if="summary.mathTrack === 'mathB'"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/70 text-amber-300 border border-amber-700/60"
        >
          【數乙 專屬單元】
        </span>
        <span 
          v-else-if="summary.mathTrack === 'common'"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60"
        >
          【共同核心單元】
        </span>
      </div>
    </div>

    <!-- Chapter Header Box -->
    <div class="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 shadow-xl">
      <div class="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-2">
        <BookOpen class="w-4 h-4 text-sky-400" />
        <span>單元深度解析筆記</span>
      </div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
        {{ chapterName }}
      </h2>

      <!-- Math A / Math B Track Switcher (模式切換: 全部 / 數A / 數B) -->
      <div v-if="hasTrackVariants" class="mb-4 pt-3 border-t border-slate-800/80">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
            <Layers class="w-3.5 h-3.5 text-sky-400" />
            <span>模式切換：</span>
          </span>
          <div class="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800/90 gap-1">
            <button
              @click="activeTrackTab = 'all'"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              :class="activeTrackTab === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
            >
              全部
            </button>
            <button
              @click="activeTrackTab = 'mathA'"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              :class="activeTrackTab === 'mathA' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span>數A (共同 + 專屬)</span>
            </button>
            <button
              @click="activeTrackTab = 'mathB'"
              class="px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              :class="activeTrackTab === 'mathB' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>數B (共同 + 專屬)</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Scope notice -->
      <div 
        v-if="displayedScopeNotice"
        class="px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs leading-relaxed flex items-start gap-2.5 mb-4"
      >
        <CheckCircle2 class="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-sky-300">課綱範圍說明：</span>
          <span>{{ displayedScopeNotice }}</span>
        </div>
      </div>

      <!-- Aha! Insight Box -->
      <div class="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <Lightbulb class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-amber-300 block mb-1">訣竅 (Aha! Moment)：</span>
          <span class="text-amber-100/90 leading-relaxed">{{ displayedAhaInsight }}</span>
        </div>
      </div>
    </div>

    <!-- Core Concepts Section -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <Sparkles class="w-4 h-4 text-sky-400" />
          <span>核心觀念與公式精要</span>
        </h3>
        <span v-if="hasTrackVariants" class="text-[11px] text-slate-400">
          目前顯示：<strong class="text-sky-300 font-semibold">{{ activeTrackTab === 'all' ? '全部 (共同 + 數A + 數B)' : activeTrackTab === 'mathA' ? '數A (共同 + 數A專屬)' : '數B (共同 + 數B專屬)' }}</strong>
        </span>
      </div>

      <!-- 由上而下 1 2 3 4 單欄卡片整齊排列 -->
      <div class="space-y-4">
        <div 
          v-for="(concept, idx) in displayedConcepts" 
          :key="idx"
          class="p-5 sm:p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <h4 class="text-sm sm:text-base font-bold text-sky-300 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                <span>{{ concept.title }}</span>
              </h4>
              <span 
                v-if="concept.track === 'mathA'"
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 shrink-0"
              >
                數A專屬
              </span>
              <span 
                v-else-if="concept.track === 'mathB'"
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-700/60 shrink-0"
              >
                數B專屬
              </span>
              <span 
                v-else-if="concept.track === 'common'"
                class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 shrink-0"
              >
                共同核心
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-300 leading-relaxed mb-3" v-html="renderRichMathText(concept.description)"></p>
          </div>

          <!-- Visual Illustration Diagram (若單元具幾何圖解則動態呈現) -->
          <div 
            v-if="concept.diagramType"
            class="my-2.5 w-full flex flex-col items-center"
            :class="concept.diagramType === 'lens-optics' ? '' : 'rounded-2xl bg-slate-950/70 border border-slate-800/80 p-2 overflow-hidden shadow-inner'"
          >
            <ConceptDiagram :type="concept.diagramType" />
          </div>

          <!-- Formulas list: 以 KaTeX 數學排版引擎渲染真實分數、上下標與希臘字母 -->
          <div 
            v-if="concept.formulas && concept.formulas.length > 0"
            class="mt-2 space-y-2.5"
          >
            <div 
              v-for="(fItem, fIdx) in concept.formulas"
              :key="fIdx"
              class="px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800/90 text-slate-100 text-sm tracking-wide flex flex-wrap items-center gap-2 overflow-x-auto shadow-inner"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0"></span>
              <!-- 前置中文名稱標籤 -->
              <span 
                v-if="renderFormulaItem(fItem).label" 
                class="font-bold text-sky-400 shrink-0"
              >
                {{ renderFormulaItem(fItem).label }}
              </span>
              <!-- KaTeX 渲染之高畫質數學公式（含真實垂直分數線、精緻下標） -->
              <span 
                class="text-sky-100 select-all font-sans text-sm sm:text-base leading-none py-0.5"
                v-html="renderFormulaItem(fItem).mathHtml"
              />
              <!-- 後置補充備註說明 -->
              <span 
                v-if="renderFormulaItem(fItem).note" 
                class="text-xs text-slate-400 font-sans ml-1"
              >
                {{ renderFormulaItem(fItem).note }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Problem Solving Mindset Section -->
    <div v-if="displayedSopModules && displayedSopModules.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <Compass class="w-4 h-4 text-amber-400" />
          <span>核心破題思維</span>
        </h3>
        <span class="text-[11px] text-amber-400/90 font-semibold px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/50">
          解題關鍵
        </span>
      </div>

      <div class="space-y-4">
        <div 
          v-for="(mod, mIdx) in displayedSopModules"
          :key="mIdx"
          class="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-amber-500/30 shadow-lg space-y-3"
        >
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <h4 class="text-sm sm:text-base font-extrabold text-amber-200 tracking-wide">
              {{ mod.moduleName }}
            </h4>
          </div>

          <div 
            v-if="mod.mindset"
            class="px-3.5 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 font-medium"
          >
            {{ mod.mindset }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div 
              v-for="(step, sIdx) in mod.steps"
              :key="sIdx"
              class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-amber-500/40 transition-colors flex flex-col justify-start space-y-2"
            >
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 font-bold text-xs border border-amber-600/50 self-start">
                <Target class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{{ step.label }}</span>
              </div>
              <p class="text-xs text-slate-300 leading-relaxed font-sans" v-html="renderRichMathText(step.text)"></p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pitfalls Section -->
    <div v-if="displayedPitfalls && displayedPitfalls.length > 0" class="space-y-3">
      <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-rose-400" />
        <span>常見解題盲點與避坑提醒</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div 
          v-for="(pitfall, idx) in displayedPitfalls" 
          :key="idx"
          class="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 text-xs text-rose-200/90 flex items-start gap-2.5"
        >
          <span class="w-4 h-4 rounded-full bg-rose-900/60 text-rose-300 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
            {{ idx + 1 }}
          </span>
          <span class="leading-relaxed">{{ pitfall }}</span>
        </div>
      </div>
    </div>

    <!-- Classic Examples Section -->
    <div v-if="displayedClassicExamples && displayedClassicExamples.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          <span>經典範例與步驟化詳解</span>
        </h3>
        <span class="text-[11px] text-emerald-400/90 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50">
          實戰範例詳解
        </span>
      </div>

      <div class="space-y-5">
        <div 
          v-for="(ex, exIdx) in displayedClassicExamples"
          :key="exIdx"
          class="p-5 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 transition-all shadow-md space-y-4"
        >
          <!-- 題目抬頭 -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <h4 class="text-sm sm:text-base font-bold text-emerald-300 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{{ ex.title }}</span>
            </h4>
          </div>

          <!-- 題目內容 -->
          <div class="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs sm:text-sm text-slate-200 leading-relaxed">
            <span class="font-bold text-emerald-400 mr-1.5">【題目】：</span>
            <span v-html="renderRichMathText(ex.question)"></span>
          </div>

          <!-- 步驟解析 -->
          <div class="space-y-2.5">
            <div 
              v-for="(st, stIdx) in ex.solutionSteps"
              :key="stIdx"
              class="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/70 text-xs text-slate-300 leading-relaxed space-y-1.5"
            >
              <div class="font-bold text-sky-300 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                <span>{{ st.step }}</span>
              </div>
              <div class="text-slate-300 pl-3 border-l-2 border-slate-800 whitespace-pre-line" v-html="renderRichMathText(st.content)"></div>
            </div>
          </div>

          <!-- 最終答案 -->
          <div 
            v-if="ex.answer"
            class="px-4 py-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs font-bold text-emerald-300 flex items-center gap-2"
          >
            <Check class="w-4 h-4 text-emerald-400" />
            <span>結論答案：</span>
            <span class="text-emerald-200" v-html="renderRichMathText(ex.answer)"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Practice Quiz Questions Section -->
    <div v-if="displayedQuizQuestions && displayedQuizQuestions.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <HelpCircle class="w-4 h-4 text-purple-400" />
          <span>課後微檢測（觀念思考題）</span>
        </h3>
        <span class="text-[11px] text-purple-400/90 font-semibold px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/50">
          觀念微檢測
        </span>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div 
          v-for="(q, qIdx) in displayedQuizQuestions"
          :key="qIdx"
          class="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/30 transition-all space-y-3 shadow-md"
        >
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-700/60 text-xs font-bold">
              第 {{ q.questionNumber || qIdx + 1 }} 題
            </span>
            <h4 class="text-sm font-bold text-purple-200">
              {{ q.title }}
            </h4>
          </div>

          <p class="text-xs sm:text-sm text-slate-200 leading-relaxed p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80" v-html="renderRichMathText(q.question)"></p>

          <div v-if="q.hint" class="pt-1">
            <button
              @click="toggleHint(qIdx)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-purple-950/50 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50"
            >
              <Lightbulb class="w-3.5 h-3.5 text-purple-400" />
              <span>{{ openHints[qIdx] ? '收起思考提示' : '查看思考提示' }}</span>
              <component :is="openHints[qIdx] ? ChevronUp : ChevronDown" class="w-3.5 h-3.5" />
            </button>

            <div 
              v-if="openHints[qIdx]"
              class="mt-2.5 p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200/90 leading-relaxed whitespace-pre-line animate-in fade-in duration-150"
              v-html="renderRichMathText(q.hint)"
            >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attached Resources Section -->
    <div class="pt-6 border-t border-slate-800 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <FileText class="w-4 h-4 text-emerald-400" />
          <span>本單元實戰補充資源 (共 {{ chapterResources.length }} 筆)</span>
        </h3>
      </div>

      <div v-if="chapterResources.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ResourceCard
          v-for="res in chapterResources"
          :key="res.id"
          :resource="res"
          @openLab="(item) => emit('openLab', item)"
          @openPdf="(item, ans) => emit('openPdf', item, ans)"
        />
      </div>

      <!-- No attached files yet for this chapter -->
      <div 
        v-else 
        class="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2"
      >
        <p class="text-xs text-slate-400">
          本單元目前尚無專屬附加試卷或動態檔案。
        </p>
        <p class="text-[11px] text-slate-500">
          您可以直接將新試卷 PDF 放入 <code class="text-sky-400 font-mono">public/papers/</code>，即可自動在此單元呈現！
        </p>
      </div>
    </div>

  </div>
</template>
