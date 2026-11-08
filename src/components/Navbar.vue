<script setup lang="ts">
import { Sparkles, Search, X, Map, PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next';

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
  <header class="sticky top-0 z-30 bg-[#161b22] border-b border-[#30363d]">
    <div class="max-w-[1920px] mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-16 gap-4">
        
        <!-- Left: Brand Logo & Title -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Toggle Desktop Sidebar (300px tree) Button -->
          <button
            @click="emit('toggleDesktopSidebar')"
            class="hidden lg:flex items-center justify-center w-8 h-8 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-500 border border-[#30363d] transition-colors"
            :title="isDesktopSidebarOpen ? '收合左側單元地圖' : '展開左側單元地圖'"
          >
            <component :is="isDesktopSidebarOpen ? PanelLeftClose : PanelLeftOpen" class="w-4 h-4" />
          </button>

          <!-- Original Brand Logo & Text -->
          <div class="flex items-center gap-3 cursor-pointer" @click="emit('reset')">
            <div class="w-9 h-9 rounded-md bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-600 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center">
              <div class="w-full h-full bg-[#0d1117] rounded-[5px] flex items-center justify-center">
                <Sparkles class="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  悟境
                </span>
                <span class="text-slate-400 font-mono text-xs sm:text-sm tracking-wide">｜ AhaZone</span>
              </div>
              <p class="text-[10px] text-slate-400 hidden sm:block">中學數理動態實驗室與複習資源庫</p>
            </div>
          </div>
        </div>

        <!-- Middle: Search Bar (Desktop) -->
        <div class="flex-1 max-w-xl relative hidden md:block">
          <div class="relative">
            <Search class="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              :value="searchQuery"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              placeholder="搜尋單元、觀念、試卷或關鍵字..."
              class="w-full pl-10 pr-9 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="emit('update:searchQuery', '')"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f0f6fc]"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Right Side Actions -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 text-xs text-[#8b949e]">
            <span class="px-2.5 py-1 rounded-md bg-[#0d1117] border border-[#30363d]">
              共 <strong class="text-amber-500 font-mono">{{ totalCount }}</strong> 筆資源
            </span>
            <span v-if="selectedChapter" class="px-2.5 py-1 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] truncate max-w-[160px]">
              {{ selectedChapter }}
            </span>
          </div>

          <button
            v-if="selectedChapter || searchQuery"
            @click="emit('reset')"
            class="px-2.5 py-1 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-500 border border-[#30363d] hover:border-amber-500 text-xs transition-colors"
          >
            重置條件
          </button>

          <!-- Mobile Unit Button -->
          <button
            @click="emit('openMobileDrawer')"
            class="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
          >
            <Map class="w-3.5 h-3.5" />
            <span>單元地圖</span>
          </button>
        </div>

      </div>

      <!-- Mobile Search Bar -->
      <div class="pb-3 md:hidden">
        <div class="relative">
          <Search class="w-4 h-4 text-[#8b949e] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            placeholder="搜尋單元、試卷或觀念..."
            class="w-full pl-10 pr-9 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-amber-500"
          />
          <button
            v-if="searchQuery"
            @click="emit('update:searchQuery', '')"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  </header>
</template>
