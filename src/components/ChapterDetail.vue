<script setup lang="ts">
import { computed } from 'vue';
import { Lightbulb, AlertTriangle, BookOpen, Sparkles, FileText, ArrowLeft, CheckCircle2 } from 'lucide-vue-next';
import { CHAPTER_SUMMARIES, ChapterSummary } from '../data/chapterSummaries';
import { ResourceItem } from '../types';
import ResourceCard from './ResourceCard.vue';

const props = defineProps<{
  chapterName: string;
  resources: ResourceItem[];
}>();

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'openLab', item: ResourceItem): void;
  (e: 'openPdf', item: ResourceItem, viewAnswer: boolean): void;
}>();

// Lookup summary or build default
const summary = computed<ChapterSummary>(() => {
  // Find exact or partial match
  const matchKey = Object.keys(CHAPTER_SUMMARIES).find(k => 
    props.chapterName.includes(k) || k.includes(props.chapterName)
  );

  if (matchKey && CHAPTER_SUMMARIES[matchKey]) {
    return CHAPTER_SUMMARIES[matchKey];
  }

  // Default fallback for chapters not yet in the summary database
  return {
    chapter: props.chapterName,
    scopeNotice: props.chapterName.includes('數A') 
      ? '【數A重點】強調嚴密推導與多向度空間坐標分析。' 
      : props.chapterName.includes('數B') 
      ? '【數B重點】強調生活現象模型化與幾何直觀。' 
      : '【108課綱標準單元】依據高中及國中標準命題精神編排。',
    ahaInsight: `💡 探索「${props.chapterName}」的本質：透過幾何直觀與基本定義切入，而非死背繁複公式！`,
    coreConcepts: [
      {
        title: '核心定義與幾何意義',
        description: '回歸第一原理，理解定義的幾何圖示與物理圖像，有助於靈活應對大考情境素養題。'
      },
      {
        title: '標準題型解題心法',
        description: '掌握由已知條件轉化為方程式的設式技巧，善用輔助圖形化繁為簡。'
      }
    ],
    pitfalls: [
      '留意題目設定的定義域與正負條件限制。',
      '代數解出答案後，務必代回原題目檢驗是否符合實數幾何意義。'
    ]
  };
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
    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
      <button
        @click="emit('back')"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-colors"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>返回全部資源清單</span>
      </button>

      <!-- Scope Badge -->
      <div class="flex items-center gap-2">
        <span 
          v-if="summary.mathTrack === 'mathA'"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950/70 text-indigo-300 border border-indigo-700/60"
        >
          【數A 專屬單元】
        </span>
        <span 
          v-else-if="summary.mathTrack === 'mathB'"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950/70 text-amber-300 border border-amber-700/60"
        >
          【數B 專屬單元】
        </span>
        <span 
          v-else-if="summary.mathTrack === 'common'"
          class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60"
        >
          【數A + 數B 共同核心】
        </span>
      </div>
    </div>

    <!-- Chapter Header Box -->
    <div class="p-6 rounded-3xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 shadow-xl">
      <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-2">
        <BookOpen class="w-4 h-4 text-sky-400" />
        <span>單元深度解析筆記</span>
      </div>
      <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
        {{ chapterName }}
      </h2>

      <!-- Math A/B Scope notice -->
      <div 
        v-if="summary.scopeNotice"
        class="px-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-xs leading-relaxed flex items-start gap-2.5 mb-4"
      >
        <CheckCircle2 class="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-sky-300">課綱範圍說明：</span>
          <span>{{ summary.scopeNotice }}</span>
        </div>
      </div>

      <!-- Aha! Insight Box -->
      <div class="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
        <Lightbulb class="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-amber-300 block mb-1">💡 悟境頓悟點撥 (Aha! Moment)：</span>
          <span class="text-amber-100/90 leading-relaxed">{{ summary.ahaInsight }}</span>
        </div>
      </div>
    </div>

    <!-- Core Concepts Section -->
    <div class="space-y-4">
      <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
        <Sparkles class="w-4 h-4 text-sky-400" />
        <span>核心觀念與幾何公式整理</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="(concept, idx) in summary.coreConcepts" 
          :key="idx"
          class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors flex flex-col justify-between"
        >
          <div>
            <h4 class="text-sm font-bold text-sky-300 mb-1.5 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>{{ concept.title }}</span>
            </h4>
            <p class="text-xs text-slate-300 leading-relaxed mb-3">
              {{ concept.description }}
            </p>
          </div>
          <div 
            v-if="concept.formula"
            class="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300/90 overflow-x-auto"
          >
            {{ concept.formula }}
          </div>
        </div>
      </div>
    </div>

    <!-- Pitfalls Section -->
    <div v-if="summary.pitfalls && summary.pitfalls.length > 0" class="space-y-3">
      <h3 class="text-base font-bold text-slate-200 flex items-center gap-2">
        <AlertTriangle class="w-4 h-4 text-rose-400" />
        <span>常見解題盲點與避坑提醒</span>
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div 
          v-for="(pitfall, idx) in summary.pitfalls" 
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
