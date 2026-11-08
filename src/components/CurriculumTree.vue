<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ChevronDown, ChevronRight, RotateCcw, X, Filter, Folder, FolderOpen, Hash } from 'lucide-vue-next';
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

// When selectedChapter changes externally, auto expand relevant semester and switch subject
watch(() => props.selectedChapter, (chName) => {
  if (!chName) return;
  const cleanName = chName.toLowerCase().replace(/\[.*?\]/g, '').trim();
  for (const sub of CURRICULUM_DATA) {
    for (const g of sub.grades) {
      for (let sIdx = 0; sIdx < g.semesters.length; sIdx++) {
        const sem = g.semesters[sIdx];
        const hasChapter = sem.chapters.some(c => {
          const cClean = c.name.toLowerCase().replace(/\[.*?\]/g, '').trim();
          return cClean === cleanName || cClean.includes(cleanName) || cleanName.includes(cClean);
        });
        if (hasChapter) {
          activeSubject.value = sub.id;
          const semKey = `${g.gradeId}-${sIdx}`;
          expandedSemesters.value[semKey] = true;
          return;
        }
      }
    }
  }
}, { immediate: true });

// Available subjects for current stage
const availableSubjects = computed(() => {
  if (currentStage.value === 'junior') {
    return [
      { id: 'math' as const, name: '國中數學', code: 'J-MATH' },
      { id: 'science' as const, name: '國中自然', code: 'J-SCI' }
    ];
  } else {
    return [
      { id: 'math' as const, name: '高中數學', code: 'S-MATH' },
      { id: 'physics' as const, name: '高中物理', code: 'S-PHY' }
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
    if (!c.mathTrack || c.mathTrack === 'none') {
      return true;
    }
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
  <!-- Case A: Mobile Slide-over Drawer (Slide in from the LEFT) -->
  <div v-if="mode === 'drawer'">
    <div 
      v-if="isOpen"
      @click="emit('close')"
      class="fixed inset-0 bg-black/75 z-40 transition-opacity"
    />

    <aside 
      class="fixed top-0 left-0 bottom-0 w-[300px] bg-[#161b22] border-r border-[#30363d] z-50 flex flex-col transition-transform duration-200"
      :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <!-- Mobile Drawer Header -->
      <div class="p-3.5 border-b border-[#30363d] flex items-center justify-between">
        <div class="flex items-center gap-2">
          <Hash class="w-4 h-4 text-amber-500" />
          <span class="font-mono font-bold text-xs text-[#f0f6fc]">TREE // 知識樹導航</span>
        </div>
        <button
          @click="emit('close')"
          class="w-7 h-7 flex items-center justify-center rounded-md bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Drawer Content: Shared Tree Body -->
      <div class="flex-1 overflow-y-auto p-3.5 space-y-3">
        <!-- Stage Switcher -->
        <div class="grid grid-cols-2 bg-[#0d1117] p-1 rounded-md border border-[#30363d] gap-1">
          <button
            @click="currentStage = 'junior'"
            class="py-1 text-xs font-mono font-semibold rounded-md transition-colors"
            :class="currentStage === 'junior' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
          >
            國中 (JUNIOR)
          </button>
          <button
            @click="currentStage = 'senior'"
            class="py-1 text-xs font-mono font-semibold rounded-md transition-colors"
            :class="currentStage === 'senior' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
          >
            高中 (SENIOR)
          </button>
        </div>

        <!-- Subject Switcher -->
        <div class="grid grid-cols-2 gap-1 bg-[#0d1117] p-1 rounded-md border border-[#30363d]">
          <button
            v-for="subj in availableSubjects"
            :key="subj.id"
            @click="activeSubject = subj.id"
            class="py-1 px-2 rounded-md text-xs font-mono transition-colors text-center truncate"
            :class="activeSubject === subj.id 
              ? 'border border-amber-500 bg-amber-500/10 text-amber-400 font-bold' 
              : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'"
          >
            {{ subj.name }}
          </button>
        </div>

        <!-- Math Track Filter (High School Math) -->
        <div 
          v-if="currentStage === 'senior' && activeSubject === 'math'"
          class="px-2.5 py-1.5 bg-[#0d1117] rounded-md border border-[#30363d] flex items-center justify-between text-xs"
        >
          <span class="text-[#8b949e] font-mono text-[11px] flex items-center gap-1">
            <Filter class="w-3 h-3 text-amber-500" />
            TRACK:
          </span>
          <div class="flex gap-1 font-mono text-[11px]">
            <button
              v-for="t in [
                { key: 'all', label: 'ALL' },
                { key: 'mathA', label: '數A' },
                { key: 'mathB', label: '數B' },
                { key: 'common', label: '共同' }
              ]"
              :key="t.key"
              @click="mathTrackFilter = (t.key as any)"
              class="px-1.5 py-0.5 rounded-md transition-colors"
              :class="mathTrackFilter === t.key ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
            >
              {{ t.label }}
            </button>
          </div>
        </div>

        <!-- Tree Accordions -->
        <div class="space-y-2.5">
          <div 
            v-for="grade in currentSubjectCurriculum.grades" 
            :key="grade.gradeId"
            class="space-y-1"
          >
            <div class="text-[11px] font-mono text-[#8b949e] px-1 pt-1">
              // {{ grade.gradeName }}
            </div>

            <div 
              v-for="(sem, sIdx) in grade.semesters" 
              :key="sIdx"
              class="border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]"
            >
              <button
                @click="toggleSemester(`${grade.gradeId}-${sIdx}`)"
                class="w-full px-2.5 py-1.5 flex items-center justify-between bg-[#161b22] hover:bg-[#21262d] transition-colors text-left font-mono"
              >
                <div class="flex items-center gap-1.5 truncate">
                  <component 
                    :is="expandedSemesters[`${grade.gradeId}-${sIdx}`] ? FolderOpen : Folder" 
                    class="w-3.5 h-3.5 text-amber-500 shrink-0" 
                  />
                  <span class="text-xs text-[#f0f6fc] truncate">{{ sem.name }}</span>
                </div>
                <component 
                  :is="expandedSemesters[`${grade.gradeId}-${sIdx}`] ? ChevronDown : ChevronRight" 
                  class="w-3.5 h-3.5 text-[#8b949e] shrink-0" 
                />
              </button>

              <div 
                v-if="expandedSemesters[`${grade.gradeId}-${sIdx}`]"
                class="p-1 space-y-0.5 bg-[#0d1117] border-t border-[#30363d]"
              >
                <button
                  v-for="chapter in filterChapters(sem.chapters)"
                  :key="chapter.name"
                  @click="emit('selectChapter', selectedChapter === chapter.name ? null : chapter.name); emit('close')"
                  class="w-full text-left px-2 py-1 rounded-md text-xs flex items-center justify-between transition-colors font-mono"
                  :class="selectedChapter === chapter.name 
                    ? 'border-l-2 border-amber-500 bg-amber-500/10 text-amber-400 font-semibold pl-2' 
                    : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'"
                >
                  <div class="flex items-center gap-1.5 truncate pr-2">
                    <span 
                      v-if="chapter.tagLabel" 
                      class="text-[9px] px-1 py-0.2 rounded-md bg-[#161b22] border border-[#30363d] text-[#8b949e] shrink-0"
                    >
                      {{ chapter.tagLabel }}
                    </span>
                    <span class="truncate font-sans">{{ chapter.name }}</span>
                  </div>
                  <span 
                    v-if="getResourceCountForChapter(chapter.name) > 0"
                    class="px-1.5 py-0.2 rounded-md text-[10px] font-mono shrink-0"
                    :class="selectedChapter === chapter.name ? 'bg-amber-500 text-black font-bold' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'"
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

  <!-- Case B: Desktop 300px Left Workbench Column -->
  <aside 
    v-else
    class="w-[300px] min-w-[300px] max-w-[300px] bg-[#161b22] border border-[#30363d] rounded-md p-3.5 flex flex-col gap-3 shadow-none"
  >
    <!-- Header: Knowledge Tree Label -->
    <div class="flex items-center justify-between border-b border-[#30363d] pb-2.5">
      <div class="flex items-center gap-1.5">
        <Hash class="w-3.5 h-3.5 text-amber-500" />
        <span class="font-mono font-bold text-xs text-[#f0f6fc]">KNOWLEDGE_TREE</span>
      </div>
      <span class="font-mono text-[10px] text-[#8b949e] px-1.5 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d]">
        108課綱
      </span>
    </div>

    <!-- Stage Switcher Tabs (國中 vs 高中) -->
    <div class="grid grid-cols-2 bg-[#0d1117] p-1 rounded-md border border-[#30363d] gap-1">
      <button
        @click="currentStage = 'junior'"
        class="py-1 text-xs font-mono font-semibold rounded-md transition-colors text-center"
        :class="currentStage === 'junior' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
      >
        國中 (JUNIOR)
      </button>
      <button
        @click="currentStage = 'senior'"
        class="py-1 text-xs font-mono font-semibold rounded-md transition-colors text-center"
        :class="currentStage === 'senior' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
      >
        高中 (SENIOR)
      </button>
    </div>

    <!-- Subject Selector Buttons -->
    <div class="grid grid-cols-2 gap-1 bg-[#0d1117] p-1 rounded-md border border-[#30363d]">
      <button
        v-for="subj in availableSubjects"
        :key="subj.id"
        @click="activeSubject = subj.id"
        class="py-1 px-2 rounded-md text-xs font-mono transition-colors text-center truncate"
        :class="activeSubject === subj.id 
          ? 'border border-amber-500 bg-amber-500/10 text-amber-400 font-bold' 
          : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d]'"
      >
        {{ subj.name }}
      </button>
    </div>

    <!-- Math Track Filter (Only in Senior Math) -->
    <div 
      v-if="currentStage === 'senior' && activeSubject === 'math'"
      class="px-2.5 py-1.5 bg-[#0d1117] rounded-md border border-[#30363d] flex items-center justify-between text-xs"
    >
      <span class="text-[#8b949e] font-mono text-[11px] flex items-center gap-1">
        <Filter class="w-3 h-3 text-amber-500" />
        分流：
      </span>

      <div class="flex gap-1 font-mono text-[11px]">
        <button
          v-for="t in [
            { key: 'all', label: '全部' },
            { key: 'mathA', label: '數A' },
            { key: 'mathB', label: '數B' },
            { key: 'common', label: '共同' }
          ]"
          :key="t.key"
          @click="mathTrackFilter = (t.key as any)"
          class="px-1.5 py-0.5 rounded-md transition-colors"
          :class="mathTrackFilter === t.key ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <!-- Active Selected Chapter Indicator -->
    <div 
      v-if="selectedChapter"
      class="px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md flex items-center justify-between text-xs font-mono"
    >
      <div class="truncate pr-2">
        <span class="text-[#8b949e] text-[10px] block">ACTIVE:</span>
        <span class="font-bold text-amber-400 truncate block font-sans">{{ selectedChapter }}</span>
      </div>
      <button
        @click="emit('selectChapter', null)"
        class="text-[#8b949e] hover:text-amber-500 p-1 rounded-md hover:bg-[#21262d] transition-colors shrink-0"
        title="清除單元選擇，檢視全部資源"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Chapter List Accordion (Scrollable Area) -->
    <div class="space-y-2 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      <div 
        v-for="grade in currentSubjectCurriculum.grades" 
        :key="grade.gradeId"
        class="space-y-1"
      >
        <!-- Grade Subtitle -->
        <div class="text-[11px] font-mono text-[#8b949e] px-1 pt-1">
          // {{ grade.gradeName }}
        </div>

        <!-- Semesters / Volumes Accordion -->
        <div 
          v-for="(sem, sIdx) in grade.semesters" 
          :key="sIdx"
          class="border border-[#30363d] rounded-md overflow-hidden bg-[#0d1117]"
        >
          <!-- Semester Header -->
          <button
            @click="toggleSemester(`${grade.gradeId}-${sIdx}`)"
            class="w-full px-2.5 py-1.5 flex items-center justify-between bg-[#161b22] hover:bg-[#21262d] transition-colors text-left font-mono"
          >
            <div class="flex items-center gap-1.5 truncate">
              <component 
                :is="expandedSemesters[`${grade.gradeId}-${sIdx}`] ? FolderOpen : Folder" 
                class="w-3.5 h-3.5 text-amber-500 shrink-0" 
              />
              <span class="text-xs text-[#f0f6fc] truncate">{{ sem.name }}</span>
            </div>
            <component 
              :is="expandedSemesters[`${grade.gradeId}-${sIdx}`] ? ChevronDown : ChevronRight" 
              class="w-3.5 h-3.5 text-[#8b949e] shrink-0" 
            />
          </button>

          <!-- Chapters list -->
          <div 
            v-if="expandedSemesters[`${grade.gradeId}-${sIdx}`]"
            class="p-1 space-y-0.5 bg-[#0d1117] border-t border-[#30363d]"
          >
            <button
              v-for="chapter in filterChapters(sem.chapters)"
              :key="chapter.name"
              @click="emit('selectChapter', selectedChapter === chapter.name ? null : chapter.name)"
              class="w-full text-left px-2 py-1 rounded-md text-xs flex items-center justify-between transition-colors font-mono"
              :class="selectedChapter === chapter.name 
                ? 'border-l-2 border-amber-500 bg-amber-500/10 text-amber-400 font-semibold pl-2' 
                : 'text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#161b22]'"
            >
              <div class="flex items-center gap-1.5 truncate pr-2">
                <span 
                  v-if="chapter.tagLabel" 
                  class="text-[9px] px-1 py-0.2 rounded-md bg-[#161b22] border border-[#30363d] text-[#8b949e] shrink-0"
                >
                  {{ chapter.tagLabel }}
                </span>
                <span class="truncate font-sans">{{ chapter.name }}</span>
              </div>

              <span 
                v-if="getResourceCountForChapter(chapter.name) > 0"
                class="px-1.5 py-0.2 rounded-md text-[10px] font-mono shrink-0"
                :class="selectedChapter === chapter.name ? 'bg-amber-500 text-black font-bold' : 'bg-[#161b22] text-[#8b949e] border border-[#30363d]'"
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
