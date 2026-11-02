<script setup lang="ts">
import { ref, computed } from 'vue';
import { ChevronDown, ChevronRight, BookOpen, Atom, Calculator, RotateCcw } from 'lucide-vue-next';
import { TAIWAN_108_CURRICULUM } from '../data/curriculum';
import { EducationStage, ResourceItem } from '../types';

const props = defineProps<{
  stage: EducationStage;
  selectedChapter: string | null;
  resources: ResourceItem[];
}>();

const emit = defineEmits<{
  (e: 'selectChapter', chapter: string | null): void;
}>();

const expandedGrades = ref<Record<string, boolean>>({
  'junior-7': true,
  'junior-8': true,
  'senior-10': true,
  'senior-11': true,
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

const getResourceCountForChapter = (chapterName: string) => {
  return props.resources.filter(r => 
    r.chapter.toLowerCase().includes(chapterName.toLowerCase()) || 
    chapterName.toLowerCase().includes(r.chapter.toLowerCase())
  ).length;
};
</script>

<template>
  <aside class="w-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-4">
    <div class="flex items-center justify-between border-b border-slate-800 pb-3">
      <div class="flex items-center gap-2">
        <BookOpen class="w-4 h-4 text-sky-400" />
        <h2 class="font-bold text-sm text-slate-200">108 課綱單元地圖</h2>
      </div>
      <button
        v-if="selectedChapter"
        @click="emit('selectChapter', null)"
        class="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
        title="清除章節篩選"
      >
        <RotateCcw class="w-3 h-3" />
        <span>重置</span>
      </button>
    </div>

    <!-- Active Chapter Indicator -->
    <div 
      v-if="selectedChapter"
      class="px-3 py-2 bg-sky-950/40 border border-sky-800/60 rounded-lg flex items-center justify-between text-xs text-sky-300"
    >
      <div class="truncate">
        <span class="text-slate-400 block text-[10px]">已選取單元：</span>
        <span class="font-semibold">{{ selectedChapter }}</span>
      </div>
      <button
        @click="emit('selectChapter', null)"
        class="text-sky-400 hover:text-white ml-2 text-sm font-bold"
      >
        ×
      </button>
    </div>

    <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      <div 
        v-for="gradeNode in visibleNodes" 
        :key="gradeNode.id"
        class="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/40"
      >
        <!-- Grade Header Button -->
        <button
          @click="toggleGrade(gradeNode.id)"
          class="w-full px-3 py-2.5 flex items-center justify-between bg-slate-900/70 hover:bg-slate-800/50 transition-colors text-left"
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

            <div class="pl-3 space-y-0.5">
              <button
                v-for="chapter in subj.chapters"
                :key="chapter"
                @click="emit('selectChapter', selectedChapter === chapter ? null : chapter)"
                class="w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center justify-between transition-all"
                :class="selectedChapter === chapter 
                  ? 'bg-sky-600/30 text-sky-300 font-semibold border border-sky-500/40' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'"
              >
                <span class="truncate pr-1">{{ chapter }}</span>
                <span 
                  v-if="getResourceCountForChapter(chapter) > 0"
                  class="px-1.5 py-0.2 rounded-full text-[10px] font-bold"
                  :class="selectedChapter === chapter ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'"
                >
                  {{ getResourceCountForChapter(chapter) }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>
