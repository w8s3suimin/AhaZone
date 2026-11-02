<script setup lang="ts">
import { Sparkles, Search, X, Map, PanelRightClose, PanelRightOpen } from 'lucide-vue-next';

defineProps<{
  searchQuery: string;
  totalCount: number;
  selectedChapter: string | null;
  isDesktopSidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'toggleDesktopSidebar'): void;
  (e: 'openMobileDrawer'): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <header class="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
      <div class="flex items-center justify-between h-16 gap-4">
        
        <!-- Left: Brand Logo -->
        <div class="flex items-center gap-3 cursor-pointer shrink-0" @click="emit('reset')">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-brand-500 to-indigo-500 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
            <div class="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
              <Sparkles class="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                悟境
              </span>
              <span class="text-slate-400 font-mono text-xs sm:text-sm tracking-wide">｜ AhaZone</span>
            </div>
            <p class="text-[10px] text-slate-400 hidden sm:block">中學數理動態實驗室與複習資源庫</p>
          </div>
        </div>

        <!-- Middle: Search Bar (Desktop) -->
        <div class="flex-1 max-w-xl relative hidden md:block">
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              :value="searchQuery"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              placeholder="搜尋單元、觀念、試卷或關鍵字..."
              class="w-full pl-10 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="emit('update:searchQuery', '')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-3">
          <!-- Desktop Toggle Button (Right Side) -->
          <button
            @click="emit('toggleDesktopSidebar')"
            class="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition-all shadow-sm"
            :title="isDesktopSidebarOpen ? '收合右側單元地圖' : '展開右側單元地圖'"
          >
            <component :is="isDesktopSidebarOpen ? PanelRightClose : PanelRightOpen" class="w-4 h-4 text-sky-400" />
            <span>{{ isDesktopSidebarOpen ? '收合地圖' : '展開單元地圖' }}</span>
          </button>

          <!-- Mobile Unit Button (Right Side) -->
          <button
            @click="emit('openMobileDrawer')"
            class="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-all shadow-md shadow-sky-600/25"
          >
            <Map class="w-3.5 h-3.5" />
            <span>單元地圖</span>
          </button>
        </div>

      </div>

      <!-- Mobile Search Bar -->
      <div class="pb-3 md:hidden">
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            placeholder="搜尋單元、試卷或觀念..."
            class="w-full pl-10 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
          <button
            v-if="searchQuery"
            @click="emit('update:searchQuery', '')"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  </header>
</template>
