<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, ChevronRight, BookOpen, Atom, Calculator, RotateCcw, X, Filter, Calendar } from 'lucide-vue-next';
import { CURRICULUM_DATA, ChapterItem } from '../data/curriculum';
import { EducationStage, ResourceItem } from '../types';

const props = withDefaults(defineProps<{
  mode?: 'embedded' | 'drawer';
  isOpen?: boolean;
  stage: EducationStage;
  selectedChapter: string | null;
  resources: ResourceItem[];
}>(), {
  mode: 'embedded',
  isOpen: false
});

const emit = defineEmits<{
  (e: 'update:stage', val: EducationStage): void;
  (e: 'selectChapter', chapter: string | null): void;
  (e: 'close'): void;
}>();

// Active stage: 'senior' by default, or 'junior'
const currentStage = computed<'junior' | 'senior'>({
  get: () => props.stage === 'junior' ? 'junior' : 'senior',
  set: (val) => emit('update:stage', val)
});

// Active Subject in Curriculum Map: 'math' | 'physics' | 'science'
const activeSubject = ref<'math' | 'physics' | 'science'>('math');

// Watch stage changes to set appropriate default subject
watch(() => props.stage, (newStage) => {
  if (newStage === 'junior' && activeSubject.value === 'physics') {
    activeSubject.value = 'science';
  } else if (newStage === 'senior' && activeSubject.value === 'science') {
    activeSubject.value = 'physics';
  }
}, { immediate: true });

// Math Track Filter for High School: 'all' | 'mathA' | 'mathB' | 'common'
const mathTrackFilter = ref<'all' | 'mathA' | 'mathB' | 'common'>('all');

// Expanded semesters accordion state
const expandedSemesters = ref<Record<string, boolean>>({
  's10-math-0': true,
  's10-math-1': false,
  's11-math-0': true,
  's11-math-1': true,
  's12-math-0': false,
  's12-math-1': false,
  's11-phy-0': true,
  's11-phy-1': false,
  'j8-0': true,
  'j8-1': false,
});

const toggleSemester = (key: string) => {
  expandedSemesters.value[key] = !expandedSemesters.value[key];
};

// Available subjects for current stage
const availableSubjects = computed(() => {
  if (currentStage.value === 'junior') {
    return [
      { id: 'math' as const, name: '國中數學', icon: Calculator },
      { id: 'science' as const, name: '國中自然', icon: Atom }
    ];
  } else {
    return [
      { id: 'math' as const, name: '高中數學', icon: Calculator },
      { id: 'physics' as const, name: '高中物理', icon: Atom }
    ];
  }
});

// Currently active curriculum tree data
const currentSubjectCurriculum = computed(() => {
  return CURRICULUM_DATA.find(s => s.stage === currentStage.value && s.id === activeSubject.value) || CURRICULUM_DATA[0];
});

// Filter chapters by math track
const filterChapters = (chapters: ChapterItem[]) => {
  if (currentStage.value !== 'senior' || activeSubject.value !== 'math' || mathTrackFilter.value === 'all') {
    return chapters;
  }

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
  <!-- ================= Case A: Mobile Slide-over Drawer (Slide in from the RIGHT) ================= -->
  <div v-if="mode === 'drawer'">
    <!-- Backdrop overlay -->
    <div 
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
    />

    <!-- Slide-over Drawer (Right side) -->
    <aside 
      class="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm sm:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header with Stage Tabs on the Right -->
      <div class="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <BookOpen class="w-4 h-4 text-sky-400" />
          <h2 class="font-bold text-sm text-slate-100">108 課綱進度地圖</h2>
        </div>

        <div class="flex items-center gap-2">
          <!-- Stage Switcher: 國中 vs 高中 -->
          <div class="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800">
            <button
              @click="currentStage = 'junior'"
              class="px-2.5 py-1 text-xs font-semibold rounded transition-all"
              :class="currentStage === 'junior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              國中
            </button>
            <button
              @click="currentStage = 'senior'"
              class="px-2.5 py-1 text-xs font-semibold rounded transition-all"
              :class="currentStage === 'senior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              高中
            </button>
          </div>

          <button
            @click="emit('close')"
            class="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Subject Segmented Buttons -->
      <div class="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center gap-2">
        <span class="text-slate-400 text-xs font-semibold shrink-0">科目：</span>
        <div class="grid grid-cols-2 gap-1.5 flex-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            v-for="subj in availableSubjects"
            :key="subj.id"
            @click="activeSubject = subj.id"
            class="py-1 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            :class="activeSubject === subj.id ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
          >
            <component :is="subj.icon" class="w-3.5 h-3.5" />
            <span>{{ subj.name }}</span>
          </button>
        </div>
      </div>

      <!-- Math Track Filter (Only in Senior Math) -->
      <div 
        v-if="currentStage === 'senior' && activeSubject === 'math'"
        class="px-3.5 py-2 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs"
      >
        <span class="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
          <Filter class="w-3 h-3 text-sky-400" />
          數學分流：
        </span>
        <div class="flex bg-slate-900 p-0.5 rounded-md border border-slate-800">
          <button
            @click="mathTrackFilter = 'all'"
            class="px-2 py-0.5 rounded text-[11px] font-medium"
            :class="mathTrackFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400'"
          >
            全部
          </button>
          <button
            @click="mathTrackFilter = 'mathA'"
            class="px-2 py-0.5 rounded text-[11px] font-medium"
            :class="mathTrackFilter === 'mathA' ? 'bg-indigo-600 text-white' : 'text-slate-400'"
          >
            數A/數甲
          </button>
          <button
            @click="mathTrackFilter = 'mathB'"
            class="px-2 py-0.5 rounded text-[11px] font-medium"
            :class="mathTrackFilter === 'mathB' ? 'bg-amber-600 text-white' : 'text-slate-400'"
          >
            數B/數乙
          </button>
          <button
            @click="mathTrackFilter = 'common'"
            class="px-2 py-0.5 rounded text-[11px] font-medium"
            :class="mathTrackFilter === 'common' ? 'bg-emerald-600 text-white' : 'text-slate-400'"
          >
            共同
          </button>
        </div>
      </div>

      <!-- Chapter Tree List Organized by Semester & Progression -->
      <div class="flex-1 overflow-y-auto p-3.5 space-y-3">
        <div 
          v-for="grade in currentSubjectCurriculum.grades" 
          :key="grade.gradeId"
          class="space-y-2"
        >
          <!-- Grade Label -->
          <div class="text-[11px] font-extrabold text-slate-400 tracking-wider uppercase px-1 pt-1 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            <span>{{ grade.gradeName }}</span>
          </div>

          <!-- Semesters / Volumes Accordion -->
          <div 
            v-for="(sem, sIdx) in grade.semesters" 
            :key="sIdx"
            class="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40"
          >
            <button
              @click="toggleSemester(`${grade.gradeId}-${sIdx}`)"
              class="w-full px-3 py-2 flex items-center justify-between bg-slate-900/80 text-left hover:bg-slate-850 transition-colors"
            >
              <div class="flex items-center gap-2">
                <Calendar class="w-3.5 h-3.5 text-slate-400" />
                <span class="font-bold text-xs text-slate-200">{{ sem.name }}</span>
              </div>
              <component 
                :is="expandedSemesters[`${grade.gradeId}-${sIdx}`] ? ChevronDown : ChevronRight" 
                class="w-3.5 h-3.5 text-slate-400" 
              />
            </button>

            <!-- Chapters list -->
            <div 
              v-if="expandedSemesters[`${grade.gradeId}-${sIdx}`]"
              class="p-2 space-y-1 bg-slate-950/60 border-t border-slate-900"
            >
              <button
                v-for="chapter in filterChapters(sem.chapters)"
                :key="chapter.name"
                @click="emit('selectChapter', selectedChapter === chapter.name ? null : chapter.name); emit('close');"
                class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all"
                :class="selectedChapter === chapter.name 
                  ? 'bg-sky-600/30 text-sky-200 font-semibold border border-sky-500/50' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
              >
                <div class="flex items-center gap-1.5 truncate pr-2">
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
    </aside>
  </div>

  <!-- ================= Case B: Desktop Embedded Right Sidebar ================= -->
  <aside 
    v-else
    class="w-full bg-slate-900/70 border border-slate-800/80 rounded-3xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-xl"
  >
    <!-- Header with Title & Stage Switcher (國中 / 高中) -->
    <div class="flex items-center justify-between border-b border-slate-800 pb-3 gap-2">
      <div class="flex items-center gap-2">
        <BookOpen class="w-4 h-4 text-sky-400" />
        <h2 class="font-bold text-sm text-slate-200">108 課綱進度地圖</h2>
      </div>

      <!-- Stage Switcher Tabs (國中 vs 高中) -->
      <div class="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
        <button
          @click="currentStage = 'junior'"
          class="px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all"
          :class="currentStage === 'junior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
        >
          國中
        </button>
        <button
          @click="currentStage = 'senior'"
          class="px-2.5 py-0.5 text-[11px] font-semibold rounded transition-all"
          :class="currentStage === 'senior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
        >
          高中
        </button>
      </div>
    </div>

    <!-- Subject Selector Buttons -->
    <div class="grid grid-cols-2 gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
      <button
        v-for="subj in availableSubjects"
        :key="subj.id"
        @click="activeSubject = subj.id"
        class="py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
        :class="activeSubject === subj.id 
          ? 'bg-sky-600 text-white shadow-sm' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'"
      >
        <component :is="subj.icon" class="w-3.5 h-3.5" />
        <span>{{ subj.name }}</span>
      </button>
    </div>

    <!-- High School Math Track Filter (Only in Senior Math) -->
    <div 
      v-if="currentStage === 'senior' && activeSubject === 'math'"
      class="px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800/70 flex items-center justify-between text-xs"
    >
      <span class="text-slate-400 font-semibold text-[11px] flex items-center gap-1">
        <Filter class="w-3 h-3 text-sky-400" />
        分流：
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
          數A/數甲
        </button>
        <button
          @click="mathTrackFilter = 'mathB'"
          class="px-2 py-0.5 rounded text-[11px] font-medium transition-colors"
          :class="mathTrackFilter === 'mathB' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'"
        >
          數B/數乙
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

    <!-- Active Selected Chapter Indicator -->
    <div 
      v-if="selectedChapter"
      class="px-3 py-2 bg-sky-950/50 border border-sky-800/60 rounded-xl flex items-center justify-between text-xs text-sky-300"
    >
      <div class="truncate">
        <span class="text-slate-400 text-[10px] block">目前閱讀單元：</span>
        <span class="font-bold">{{ selectedChapter }}</span>
      </div>
      <button
        @click="emit('selectChapter', null)"
        class="text-sky-400 hover:text-white px-1.5 py-0.5 rounded bg-sky-900/40 text-[11px] font-semibold flex items-center gap-1"
      >
        <RotateCcw class="w-3 h-3" />
        <span>重置</span>
      </button>
    </div>

    <!-- Chapter List Accordion (Organized by progression) -->
    <div class="space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
      <div 
        v-for="grade in currentSubjectCurriculum.grades" 
        :key="grade.gradeId"
        class="space-y-1.5"
      >
        <!-- Grade Subtitle -->
        <div class="text-[11px] font-extrabold text-slate-400 tracking-wider px-1 pt-1 flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          <span>{{ grade.gradeName }}</span>
        </div>

        <!-- Semesters / Volumes Accordion -->
        <div 
          v-for="(sem, sIdx) in grade.semesters" 
          :key="sIdx"
          class="border border-slate-800/70 rounded-xl overflow-hidden bg-slate-950/40"
        >
          <!-- Semester Header -->
          <button
            @click="toggleSemester(`${grade.gradeId}-${sIdx}`)"
            class="w-full px-3 py-2 flex items-center justify-between bg-slate-900/80 hover:bg-slate-850 transition-colors text-left"
          >
            <div class="flex items-center gap-1.5">
              <Calendar class="w-3.5 h-3.5 text-slate-400" />
              <span class="font-bold text-xs text-slate-200">{{ sem.name }}</span>
            </div>
            <component 
              :is="expandedSemesters[`${grade.gradeId}-${sIdx}`] ? ChevronDown : ChevronRight" 
              class="w-3.5 h-3.5 text-slate-400" 
            />
          </button>

          <!-- Chapters list -->
          <div 
            v-if="expandedSemesters[`${grade.gradeId}-${sIdx}`]"
            class="p-1.5 space-y-0.5 bg-slate-950/60 border-t border-slate-900"
          >
            <button
              v-for="chapter in filterChapters(sem.chapters)"
              :key="chapter.name"
              @click="emit('selectChapter', selectedChapter === chapter.name ? null : chapter.name)"
              class="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all"
              :class="selectedChapter === chapter.name 
                ? 'bg-sky-600/30 text-sky-200 font-semibold border border-sky-500/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'"
            >
              <div class="flex items-center gap-1.5 truncate pr-2">
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
  </aside>
</template>
