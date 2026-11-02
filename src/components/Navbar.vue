<script setup lang="ts">
import { Sparkles, Search, Layers, X } from 'lucide-vue-next';
import { EducationStage, ResourceType } from '../types';

defineProps<{
  stage: EducationStage;
  resourceType: ResourceType;
  searchQuery: string;
  totalCount: number;
}>();

const emit = defineEmits<{
  (e: 'update:stage', val: EducationStage): void;
  (e: 'update:resourceType', val: ResourceType): void;
  (e: 'update:searchQuery', val: string): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <header class="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16 gap-4">
        
        <!-- Brand Logo -->
        <div class="flex items-center gap-3 shrink-0 cursor-pointer" @click="emit('reset')">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-brand-500 to-indigo-500 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
            <div class="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles class="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
                悟境
              </span>
              <span class="text-slate-400 font-mono text-sm tracking-wide">｜ AhaZone</span>
              <span class="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded">Vue 3</span>
            </div>
            <p class="text-[11px] text-slate-400 hidden sm:block">108課綱 數理動態實驗室與複習資源庫</p>
          </div>
        </div>

        <!-- Search bar -->
        <div class="flex-1 max-w-md relative hidden md:block">
          <div class="relative">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              :value="searchQuery"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              placeholder="搜尋單元、觀念、試卷或關鍵字 (如：圓錐截面、三角函數、物理)..."
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

        <!-- Right Section: Stage Tabs -->
        <div class="flex items-center gap-2">
          <div class="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            <button
              @click="emit('update:stage', 'all')"
              class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
              :class="stage === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              全學段
            </button>
            <button
              @click="emit('update:stage', 'junior')"
              class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
              :class="stage === 'junior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              國中 (七～九年級)
            </button>
            <button
              @click="emit('update:stage', 'senior')"
              class="px-3 py-1 text-xs font-semibold rounded-md transition-all"
              :class="stage === 'senior' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              高中 (高一～高三)
            </button>
          </div>

          <!-- Quick Badge -->
          <div class="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-800/60 border border-slate-700/60 rounded-full text-xs text-slate-300">
            <Layers class="w-3.5 h-3.5 text-sky-400" />
            <span>共 {{ totalCount }} 份精選資源</span>
          </div>
        </div>
      </div>

      <!-- Mobile search bar -->
      <div class="pb-3 md:hidden">
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            placeholder="搜尋單元、試卷或觀念..."
            class="w-full pl-10 pr-9 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
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
