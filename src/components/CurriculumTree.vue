<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDown, ChevronRight, BookOpen, Atom, Calculator, RotateCcw, X, Filter } from 'lucide-vue-next';
import { TAIWAN_108_CURRICULUM, ChapterItem } from '../data/curriculum';
import { EducationStage, ResourceItem } from '../types';

const props = defineProps<{
  isOpen: boolean;
  stage: EducationStage;
  selectedChapter: string | null;
  resources: ResourceItem[];
}>();

const emit = defineEmits<{
  (e: 'update:stage', val: EducationStage): void;
  (e: 'selectChapter', chapter: string | null): void;
  (e: 'close'): void;
}>();

// Math Track Filter for High School: 'all' | 'mathA' | 'mathB' | 'common'
const mathTrackFilter = ref<'all' | 'mathA' | 'mathB' | 'common'>('all');

const expandedGrades = ref<Record<string, boolean>>({
  'junior-7': false,
  'junior-8': false,
  'senior-10': true,
  'senior-11': true,
  'senior-12': false,
});

const toggleGrade = (gradeId: string) => {
  expandedGrades.value[gradeId] = !expandedGrades.value[gradeId];
};

const visibleNodes = computed(() => {
  return TAIWAN_108_CURRICULUM.filter(node => {
    if (props.stage === 'all') return true;
    return node.stage === props.stage;
  });
});

// Filter chapters by math track
const filterChapters = (chapters: ChapterItem[], isSeniorMath: boolean) => {
  if (!isSeniorMath || mathTrackFilter.value === 'all') return chapters;

  return chapters.filter(c => {
    if (mathTrackFilter.value === 'mathA') {
      return c.mathTrack === 'mathA' || c.mathTrack === 'common';
    }
    if (mathTrackFilter.value === 'mathB') {
      return c.mathTrack === 'mathB' || c.mathTrack === 'common';
    }
    if (mathTrackFilter.value === 'common') {
      return c.mathTrack === 'common';
    }
    return true;
  });
};

const getResourceCountForChapter = (chapterName: string) => {
  const norm = chapterName.toLowerCase().replace(/\[.*?\]/g, '').trim();
  return props.resources.filter(r => {
    const rNorm = r.chapter.toLowerCase().replace(/\[.*?\]/g, '').trim();
    return norm.includes(rNorm) || rNorm.includes(norm);
  }).length;
};
</script>

<template>
  <div>
    <!-- Backdrop overlay when drawer is open -->
    <div 
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
    />

    <!-- Slide-over Drawer / Panel -->
    <aside 
      class="fixed top-0 left-0 bottom-0 z-50 w-full max-w-md sm:max-w-lg bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Drawer Header with Stage Tabs on the Right (Requirement 6) -->
      <div class="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
        
        <!-- Left: Title -->
        <div class="flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-sky-400" />
          <h2 class="font-bold text-sm text-slate-100">108 課綱單元地圖</h2>
        </div>

        <!-- Right: Stage Switcher Tabs (Requirement 6) -->
        <div class="flex items-center gap-2">
          <div class="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              @click="emit('update:stage', 'all')"
              class="px-2 py-1 text-[11px] font-semibold rounded-md transition-all"
              :class="stage === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              全部
            </button>
            <button
              @click="emit('update:stage', 'junior')"
              class="px-2 py-1 text-[11px] font-semibold rounded-md transition-all"
              :class="stage === 'junior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              國中
            </button>
            <button
              @click="emit('update:stage', 'senior')"
              class="px-2 py-1 text-[11px] font-semibold rounded-md transition-all"
              :class="stage === 'senior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              高中
            </button>
          </div>

          <!-- Close Drawer Button -->
          <button
            @click="emit('close')"
            class="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="關閉地圖"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

      </div>

      <!-- Math Track (數A / 數B) Filter Bar (Requirement 5) -->
      <div 
        v-if="stage !== 'junior'"
        class="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs"
      >
        <span class="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
          <Filter class="w-3 h-3 text-sky-400" />
          高中數學分流：
        </span>

        <div class="flex bg-slate-900 p-0.5 rounded-md border border-slate-800">
          <button
            @click="mathTrackFilter = 'all'"
            class="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
            :class="mathTrackFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            全部
          </button>
          <button
            @click="mathTrackFilter = 'mathA'"
            class="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
            :class="mathTrackFilter === 'mathA' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            數A
          </button>
          <button
            @click="mathTrackFilter = 'mathB'"
            class="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
            :class="mathTrackFilter === 'mathB' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            數B
          </button>
          <button
            @click="mathTrackFilter = 'common'"
            class="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
            :class="mathTrackFilter === 'common' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'"
          >
            共同
          </button>
        </div>
      </div>

      <!-- Selected Chapter Banner -->
      <div 
        v-if="selectedChapter"
        class="px-4 py-2 bg-sky-950/50 border-b border-sky-800/60 flex items-center justify-between text-xs text-sky-300"
      >
        <div class="truncate">
          <span class="text-slate-400 text-[10px] block">目前閱讀單元：</span>
          <span class="font-bold">{{ selectedChapter }}</span>
        </div>
        <button
          @click="emit('selectChapter', null)"
          class="flex items-center gap-1 text-[11px] text-sky-400 hover:text-white px-2 py-0.5 rounded bg-sky-900/40"
        >
          <RotateCcw class="w-3 h-3" />
          <span>清除選取</span>
        </button>
      </div>

      <!-- Curriculum Tree Content List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div 
          v-for="gradeNode in visibleNodes" 
          :key="gradeNode.id"
          class="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40"
        >
          <!-- Grade Header Button -->
          <button
            @click="toggleGrade(gradeNode.id)"
            class="w-full px-3.5 py-2.5 flex items-center justify-between bg-slate-900/80 hover:bg-slate-850 transition-colors text-left"
          >
            <div class="flex items-center gap-2">
              <span 
                class="w-2 h-2 rounded-full"
                :class="gradeNode.stage === 'senior' ? 'bg-indigo-400' : 'bg-emerald-400'"
              />
              <span class="font-bold text-xs text-slate-200">{{ gradeNode.name }}</span>
            </div>
            <component 
              :is="expandedGrades[gradeNode.id] ? ChevronDown : ChevronRight" 
              class="w-3.5 h-3.5 text-slate-400" 
            />
          </button>

          <!-- Subjects & Chapters -->
          <div 
            v-if="expandedGrades[gradeNode.id]"
            class="p-2 space-y-3 bg-slate-950/60 border-t border-slate-900"
          >
            <div 
              v-for="subj in gradeNode.subjects" 
              :key="subj.id"
              class="space-y-1"
            >
              <div class="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400">
                <Calculator v-if="subj.id === 'math'" class="w-3 h-3 text-sky-400" />
                <Atom v-else class="w-3 h-3 text-amber-400" />
                <span>{{ subj.name }}</span>
              </div>

              <div class="pl-2 space-y-1">
                <button
                  v-for="chapter in filterChapters(subj.chapters, subj.id === 'math' && gradeNode.stage === 'senior')"
                  :key="chapter.name"
                  @click="emit('selectChapter', selectedChapter === chapter.name ? null : chapter.name); emit('close');"
                  class="w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-all"
                  :class="selectedChapter === chapter.name 
                    ? 'bg-sky-600/30 text-sky-200 font-semibold border border-sky-500/50' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
                >
                  <div class="flex items-center gap-1.5 truncate pr-2">
                    <!-- Math A/B Tag badge on chapter name (Requirement 5) -->
                    <span 
                      v-if="chapter.tagLabel" 
                      class="text-[9px] px-1 py-0.2 rounded font-bold shrink-0"
                      :class="chapter.mathTrack === 'mathA' 
                        ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                        : chapter.mathTrack === 'mathB' 
                        ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800'"
                    >
                      {{ chapter.tagLabel }}
                    </span>
                    <span class="truncate">{{ chapter.name }}</span>
                  </div>

                  <span 
                    v-if="getResourceCountForChapter(chapter.name) > 0"
                    class="px-1.5 py-0.2 rounded-full text-[10px] font-bold shrink-0"
                    :class="selectedChapter === chapter.name ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'"
                  >
                    {{ getResourceCountForChapter(chapter.name) }}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </aside>
  </div>
</template>
