<script setup lang="ts">
import { Sparkles, Search, Layers, X, Menu, Map, BookOpen } from 'lucide-vue-next';

defineProps<{
  searchQuery: string;
  totalCount: number;
  selectedChapter: string | null;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'toggleDrawer'): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <header class="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-3 sm:gap-4">
        
        <!-- Left: Drawer Toggle Button & Brand -->
        <div class="flex items-center gap-2.5 sm:gap-3">
          <!-- Curriculum Map Trigger Button -->
          <button
            @click="emit('toggleDrawer')"
            class="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 border border-slate-700/80 hover:border-sky-500 font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm"
            title="開啟 108 課綱單元地圖"
          >
            <Map class="w-4 h-4 text-sky-400" />
            <span class="hidden sm:inline">課綱單元地圖</span>
            <span class="sm:hidden font-medium">單元</span>
          </button>

          <!-- Brand Logo -->
          <div class="flex items-center gap-2.5 cursor-pointer" @click="emit('reset')">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-brand-500 to-indigo-500 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center">
              <div class="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                <Sparkles class="w-4 h-4 text-sky-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                  悟境
                </span>
                <span class="text-slate-400 font-mono text-xs sm:text-sm tracking-wide">｜ AhaZone</span>
              </div>
              <p class="text-[10px] text-slate-400 hidden md:block">中學數理動態實驗室與複習資源庫</p>
            </div>
          </div>
        </div>

        <!-- Middle: Search Bar (Desktop) -->
        <div class="flex-1 max-w-md relative hidden md:block">
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              :value="searchQuery"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              placeholder="搜尋單元、觀念、試卷或關鍵字..."
              class="w-full pl-10 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
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

        <!-- Right: Active Chapter or Stats Indicator -->
        <div class="flex items-center gap-2">
          <div 
            v-if="selectedChapter"
            class="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-950/60 text-sky-300 border border-sky-800/80 max-w-[160px] sm:max-w-[240px] truncate"
          >
            <BookOpen class="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span class="truncate">{{ selectedChapter }}</span>
            <button 
              @click="emit('reset')" 
              class="hover:text-white font-bold ml-1 text-sm text-sky-400"
              title="關閉此單元"
            >
              ×
            </button>
          </div>

          <div v-else class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 border border-slate-700/60 rounded-full text-xs text-slate-300">
            <Layers class="w-3.5 h-3.5 text-sky-400" />
            <span>共 {{ totalCount }} 份資源</span>
          </div>
        </div>

      </div>

      <!-- Mobile Search Bar (Phone view) -->
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
