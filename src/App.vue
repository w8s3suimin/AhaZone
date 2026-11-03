<script setup lang="ts">
import { ref, computed } from 'vue';
import Navbar from './components/Navbar.vue';
import CurriculumTree from './components/CurriculumTree.vue';
import HeroBanner from './components/HeroBanner.vue';
import ResourceCard from './components/ResourceCard.vue';
import ChapterDetail from './components/ChapterDetail.vue';
import DynamicLabModal from './components/DynamicLabModal.vue';
import PdfViewerModal from './components/PdfViewerModal.vue';
import { INITIAL_RESOURCES } from './data/resources';
import { EducationStage, ResourceType, SubjectId, ResourceItem } from './types';
import { Search, Filter, CheckCircle2 } from 'lucide-vue-next';

const resources = ref<ResourceItem[]>(INITIAL_RESOURCES);
const stage = ref<EducationStage>('all');
const resourceType = ref<ResourceType>('all');
const subject = ref<SubjectId>('all');
const selectedChapter = ref<string | null>(null);
const searchQuery = ref<string>('');

// Desktop Sidebar State: Default TRUE (展開放在右側空白處)
const isDesktopSidebarOpen = ref(true);

// Mobile Drawer State: Default FALSE (從右側滑出)
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
      const inAha = item.ahaInsight.toLowerCase().includes(q);

      if (!inTitle && !inSubtitle && !inDesc && !inChapter && !inTags && !inAha) {
        return false;
      }
    }

    return true;
  });
});

// View mode logic:
// If chapter is selected AND user has NOT explicitly selected a specific resourceType filter (i.e. resourceType === 'all') AND not searching:
// Show Chapter Detail View (Concept summary + Attached resources below).
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

const handleExploreConic = () => {
  const conicLab = resources.value.find(r => r.id === 'res-dynamic-conic-sections');
  if (conicLab) {
    handleOpenLab(conicLab);
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
    
    <!-- Top Navigation (Widescreen container) -->
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

    <!-- Main Container: Spans up to 1680px for wide desktop screens -->
    <main class="flex-1 max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full">
      
      <!-- Hero Section (只在首頁顯示，進入單元專注學習時自動隱藏) -->
      <HeroBanner
        v-if="!selectedChapter"
        :resourceType="resourceType"
        @update:resourceType="(t) => resourceType = t"
        :subject="subject"
        @update:subject="(s) => subject = s"
        @exploreConic="handleExploreConic"
      />

      <!-- Main Layout Grid: Left Content + Right Curriculum Sidebar on Desktop -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        <!-- Main Content Area: Takes 8-9 cols when sidebar open, or full 12 cols when collapsed -->
        <div 
          class="transition-all duration-300"
          :class="isDesktopSidebarOpen ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'"
        >
          
          <!-- Condition A: Chapter Concept Detail Mode -->
          <ChapterDetail
            v-if="isChapterDetailView && selectedChapter"
            :chapterName="selectedChapter"
            :resources="resources"
            @back="selectedChapter = null"
            @openLab="handleOpenLab"
            @openPdf="(item, ans) => activePdf = { resource: item, showAnswer: ans }"
          />

          <!-- Condition B: Resource Cards Grid Mode -->
          <div v-else class="space-y-6">
            
            <!-- Filter Bar Header -->
            <div class="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 border border-slate-800/80 px-4 py-3 rounded-2xl">
              <div class="flex items-center gap-2 text-xs text-slate-300">
                <Filter class="w-3.5 h-3.5 text-sky-400" />
                <span>
                  共篩選出 <strong class="text-sky-300 font-bold">{{ filteredResources.length }}</strong> 筆資源
                </span>
                <span v-if="selectedChapter" class="text-slate-400">
                  （單元：<span class="text-amber-300">{{ selectedChapter }}</span>）
                </span>
                <span v-if="resourceType !== 'all'" class="text-slate-400">
                  （型態篩選中）
                </span>
              </div>

              <button
                v-if="stage !== 'all' || resourceType !== 'all' || subject !== 'all' || selectedChapter || searchQuery"
                @click="resetFilters"
                class="text-xs text-slate-400 hover:text-sky-300 transition-colors underline"
              >
                清除所有篩選條件
              </button>
            </div>

            <!-- Cards Grid (Fluid 2/3/4 columns on wider screen) -->
            <div 
              v-if="filteredResources.length > 0" 
              class="grid grid-cols-1 gap-5"
              :class="isDesktopSidebarOpen ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'"
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
            <div v-else class="bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
              <Search class="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 class="text-lg font-bold text-slate-300 mb-2">找不到符合條件的教學資源</h3>
              <p class="text-xs text-slate-500 max-w-md mx-auto mb-6">
                可點選右側課綱單元地圖瀏覽章節重點筆記，或更換關鍵字重新搜尋。
              </p>
              <button
                @click="resetFilters"
                class="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                重置篩選條件
              </button>
            </div>

          </div>

        </div>

        <!-- Desktop Right Sidebar: Default EXPANDED on the RIGHT (Utilizes widescreen right space) -->
        <div 
          v-if="isDesktopSidebarOpen"
          class="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-20"
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

      </div>

    </main>

    <!-- Mobile Slide-over Drawer (Opens from the RIGHT side!) -->
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

    <!-- Footer -->
    <footer class="mt-16 bg-slate-950 border-t border-slate-900 py-10">
      <div class="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="space-y-1">
          <div class="flex items-center justify-center sm:justify-start gap-2">
            <span class="font-extrabold text-base tracking-tight text-white">悟境</span>
            <span class="text-slate-400 font-mono text-sm">｜ AhaZone</span>
          </div>
          <p class="text-xs text-slate-500">
            專為台灣國中、高中 108 課綱數理體系打造的動態直觀學習庫
          </p>
        </div>

        <div class="flex items-center gap-4 text-xs text-slate-400">
          <span class="flex items-center gap-1.5">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-400" />
            <span>108 課綱數理整合平台</span>
          </span>
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
