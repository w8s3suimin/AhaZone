<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import Navbar from './components/Navbar.vue';
import CurriculumTree from './components/CurriculumTree.vue';
import HeroBanner from './components/HeroBanner.vue';
import ResourceCard from './components/ResourceCard.vue';
import ChapterDetail from './components/ChapterDetail.vue';
import DynamicLabModal from './components/DynamicLabModal.vue';
import PdfViewerModal from './components/PdfViewerModal.vue';
import { INITIAL_RESOURCES } from './data/resources';
import { CURRICULUM_DATA } from './data/curriculum';
import { EducationStage, ResourceType, SubjectId, ResourceItem } from './types';
import { Search, Filter } from 'lucide-vue-next';

const resources = ref<ResourceItem[]>(INITIAL_RESOURCES);
const stage = ref<EducationStage>('senior');
const resourceType = ref<ResourceType>('all');
const subject = ref<SubjectId>('all');
const selectedChapter = ref<string | null>('指數函數與對數函數');
const searchQuery = ref<string>('');

// Desktop Sidebar State: Default TRUE (左側 300px 知識樹階層導航)
const isDesktopSidebarOpen = ref(true);

// Mobile Drawer State: Default FALSE
const isMobileDrawerOpen = ref(false);

// Modals state
const activeLab = ref<ResourceItem | null>(null);
const activePdf = ref<{ resource: ResourceItem; showAnswer: boolean } | null>(null);

// Filtered resources for card mode
const filteredResources = computed(() => {
  return resources.value.filter((item) => {
    // Stage filter
    if (stage.value !== 'all' && item.stage !== stage.value) return false;

    // Resource type filter
    if (resourceType.value !== 'all' && item.type !== resourceType.value) return false;

    // Subject filter
    if (subject.value !== 'all' && item.subject !== subject.value) return false;

    // Chapter filter (when in card mode)
    if (selectedChapter.value) {
      const itemChapter = item.chapter.toLowerCase().replace(/\[.*?\]/g, '').trim();
      const sel = selectedChapter.value.toLowerCase().replace(/\[.*?\]/g, '').trim();
      if (!itemChapter.includes(sel) && !sel.includes(itemChapter)) {
        return false;
      }
    }

    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const inTitle = item.title.toLowerCase().includes(q);
      const inSubtitle = item.subtitle?.toLowerCase().includes(q) || false;
      const inDesc = item.description.toLowerCase().includes(q);
      const inChapter = item.chapter.toLowerCase().includes(q);
      const inTags = item.tags.some(t => t.toLowerCase().includes(q));
      const inAha = item.ahaInsight ? item.ahaInsight.toLowerCase().includes(q) : false;

      if (!inTitle && !inSubtitle && !inDesc && !inChapter && !inTags && !inAha) {
        return false;
      }
    }

    return true;
  });
});

// View mode logic:
// If chapter is selected AND user has NOT explicitly selected a specific resourceType filter AND not searching:
// Show Chapter Detail Workbench View (Upper: Coordinate workspace + Lower: SOP derivation & diagnostic data table).
// Otherwise: Show Resource Cards Grid View.
const isChapterDetailView = computed(() => {
  return !!selectedChapter.value && resourceType.value === 'all' && !searchQuery.value.trim();
});

const resetFilters = () => {
  stage.value = 'all';
  resourceType.value = 'all';
  subject.value = 'all';
  selectedChapter.value = null;
  searchQuery.value = '';
};

const isMobileDevice = () => {
  return typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
};

const handleOpenLab = (item: ResourceItem) => {
  if (isMobileDevice() && item.filePath) {
    window.location.href = item.filePath;
  } else {
    activeLab.value = item;
  }
};

// 根據章節名稱反查所屬學段 (國中/高中) 與學科
const findChapterContext = (chapterName: string) => {
  const cleanName = chapterName.toLowerCase().replace(/\[.*?\]/g, '').trim();
  for (const sub of CURRICULUM_DATA) {
    for (const g of sub.grades) {
      for (const sem of g.semesters) {
        for (const ch of sem.chapters) {
          const chClean = ch.name.toLowerCase().replace(/\[.*?\]/g, '').trim();
          if (chClean === cleanName || chClean.includes(cleanName) || cleanName.includes(chClean)) {
            return {
              stage: sub.stage as EducationStage,
              subject: sub.id as SubjectId,
              chapter: ch.name
            };
          }
        }
      }
    }
  }
  return null;
};

// 1. 初始化讀取瀏覽器網址參數：?chapter=xxx
onMounted(() => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const chapterParam = params.get('chapter');
  if (chapterParam) {
    const ctx = findChapterContext(chapterParam);
    if (ctx) {
      stage.value = ctx.stage;
      selectedChapter.value = ctx.chapter;
    } else {
      selectedChapter.value = chapterParam;
    }
    resourceType.value = 'all';
    searchQuery.value = '';
  } else {
    // 預設載入高中數學經典單元「指數函數與對數函數」，呈現函數坐標互動區與步驟解題數據表
    selectedChapter.value = '指數函數與對數函數';
    stage.value = 'senior';
  }

  // 監聽瀏覽器上一頁/下一頁 (popstate)
  window.addEventListener('popstate', () => {
    const p = new URLSearchParams(window.location.search);
    const ch = p.get('chapter');
    selectedChapter.value = ch || null;
  });
});

// 2. 當 selectedChapter 改變時，自動同步更新瀏覽器網址
watch(selectedChapter, (newCh) => {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (newCh) {
    url.searchParams.set('chapter', newCh);
    const ctx = findChapterContext(newCh);
    if (ctx) {
      stage.value = ctx.stage;
    }
  } else {
    url.searchParams.delete('chapter');
  }
  window.history.replaceState({}, '', url.toString());
});
</script>

<template>
  <div class="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans selection:bg-amber-500 selection:text-black">
    
    <!-- Top Navigation Header -->
    <Navbar
      :searchQuery="searchQuery"
      @update:searchQuery="(q) => searchQuery = q"
      :totalCount="resources.length"
      :selectedChapter="selectedChapter"
      :isDesktopSidebarOpen="isDesktopSidebarOpen"
      @toggleDesktopSidebar="isDesktopSidebarOpen = !isDesktopSidebarOpen"
      @openMobileDrawer="isMobileDrawerOpen = true"
      @reset="resetFilters"
    />

    <!-- Main Workbench Area: 左右分欄 Workbench 佈局 -->
    <main class="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-6 py-4">
      <div class="flex flex-col lg:flex-row gap-4 items-start w-full">
        
        <!-- 左側 300px 知識樹階層導航 (Desktop 300px 固定寬度) -->
        <div 
          v-if="isDesktopSidebarOpen"
          class="hidden lg:block w-[300px] shrink-0 sticky top-16"
        >
          <CurriculumTree
            mode="embedded"
            :stage="stage"
            @update:stage="(s) => stage = s"
            :selectedChapter="selectedChapter"
            @selectChapter="(ch) => selectedChapter = ch"
            :resources="resources"
          />
        </div>

        <!-- 右側 Workbench 主工作區 -->
        <div class="flex-1 min-w-0 w-full space-y-4">
          
          <!-- Condition A: Chapter Workbench Mode (上方：函數坐標互動區；下方：步驟解題與診斷數據表) -->
          <ChapterDetail
            v-if="isChapterDetailView && selectedChapter"
            :chapterName="selectedChapter"
            :stage="stage"
            :resources="resources"
            @back="selectedChapter = null"
            @openLab="handleOpenLab"
            @openPdf="(item, ans) => activePdf = { resource: item, showAnswer: ans }"
          />

          <!-- Condition B: Overview / Search / Filter List Mode -->
          <div v-else class="space-y-4">
            
            <!-- Hero / Overview Filter Bar -->
            <HeroBanner
              :resourceType="resourceType"
              @update:resourceType="(t) => resourceType = t"
              :subject="subject"
              @update:subject="(s) => subject = s"
            />

            <!-- Filter Status Bar Header -->
            <div class="flex flex-wrap items-center justify-between gap-2.5 bg-[#161b22] border border-[#30363d] px-3.5 py-2 rounded-md font-mono text-xs">
              <div class="flex items-center gap-2 text-[#8b949e]">
                <Filter class="w-3.5 h-3.5 text-amber-500" />
                <span>
                  MATCHED_RESOURCES: <strong class="text-amber-400 font-bold">{{ filteredResources.length }}</strong>
                </span>
                <span v-if="selectedChapter" class="text-[#c9d1d9]">
                  // CHAPTER: <span class="text-amber-400">{{ selectedChapter }}</span>
                </span>
                <span v-if="resourceType !== 'all'" class="text-[#8b949e]">
                  // FILTERED
                </span>
              </div>

              <button
                v-if="stage !== 'all' || resourceType !== 'all' || subject !== 'all' || selectedChapter || searchQuery"
                @click="resetFilters"
                class="text-[#8b949e] hover:text-amber-400 transition-colors underline"
              >
                CLEAR_FILTERS
              </button>
            </div>

            <!-- Cards Grid (Workbench Clean Grid) -->
            <div 
              v-if="filteredResources.length > 0" 
              class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5"
            >
              <ResourceCard
                v-for="res in filteredResources"
                :key="res.id"
                :resource="res"
                @openLab="handleOpenLab"
                @openPdf="(item, viewAns) => activePdf = { resource: item, showAnswer: viewAns }"
              />
            </div>

            <!-- Empty State -->
            <div v-else class="bg-[#161b22] border border-dashed border-[#30363d] rounded-md p-10 text-center font-mono">
              <Search class="w-10 h-10 text-[#484f58] mx-auto mb-3" />
              <h3 class="text-sm font-bold text-[#f0f6fc] mb-1">找不到符合條件的教學資源</h3>
              <p class="text-xs text-[#8b949e] max-w-md mx-auto mb-4 font-sans">
                可點選左側課綱知識樹瀏覽單元重點筆記，或更換關鍵字重新搜尋。
              </p>
              <button
                @click="resetFilters"
                class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-md transition-colors"
              >
                RESET_ALL
              </button>
            </div>

          </div>

        </div>

      </div>
    </main>

    <!-- Mobile Slide-over Drawer (300px from Left) -->
    <CurriculumTree
      mode="drawer"
      :isOpen="isMobileDrawerOpen"
      :stage="stage"
      @update:stage="(s) => stage = s"
      :selectedChapter="selectedChapter"
      @selectChapter="(ch) => selectedChapter = ch"
      :resources="resources"
      @close="isMobileDrawerOpen = false"
    />

    <!-- Workbench Compact Footer -->
    <footer class="mt-8 bg-[#161b22] border-t border-[#30363d] py-3.5 text-xs font-mono text-[#8b949e]">
      <div class="max-w-[1920px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-[#f0f6fc]">AhaZone</span>
          <span>// 108 課綱中學數理解析工作台</span>
        </div>

        <div class="flex items-center gap-4 text-[11px]">
          <span>STATUS: OPERATIONAL</span>
          <span class="text-amber-500">ACCENT: #f59e0b</span>
          <span>GRAPHITE: #0d1117</span>
        </div>
      </div>
    </footer>

    <!-- Dynamic 3D Lab Modal -->
    <DynamicLabModal
      :resource="activeLab"
      @close="activeLab = null"
    />

    <!-- PDF Exam & Lecture Modal -->
    <PdfViewerModal
      :resource="activePdf?.resource || null"
      :initialShowAnswer="activePdf?.showAnswer || false"
      @close="activePdf = null"
    />

  </div>
</template>
