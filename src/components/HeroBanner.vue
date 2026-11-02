<script setup lang="ts">
import { Sparkles, Compass, FileText, BookOpen } from 'lucide-vue-next';
import { ResourceType, SubjectId } from '../types';

defineProps<{
  resourceType: ResourceType;
  subject: SubjectId;
}>();

const emit = defineEmits<{
  (e: 'update:resourceType', val: ResourceType): void;
  (e: 'update:subject', val: SubjectId): void;
  (e: 'exploreConic'): void;
}>();
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-5 sm:p-8 lg:p-10 mb-8 shadow-2xl">
    
    <!-- Background ambient decorative glows -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
    <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

    <div class="relative z-10 w-full">
      
      <!-- Top Tag (Clean, no technical jargon) -->
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 border border-sky-500/20 text-sky-300 mb-3 sm:mb-4">
        <Sparkles class="w-3.5 h-3.5 text-sky-400" />
        <span>啟發頓悟與空間幾何思維</span>
      </div>

      <!-- Main Title -->
      <h1 class="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-3 sm:mb-4 leading-tight">
        點亮每一次 
        <span class="bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          恍然大悟的頓悟時刻
        </span>
      </h1>

      <p class="text-xs sm:text-base text-slate-300 max-w-3xl leading-relaxed mb-5 sm:mb-6">
        「悟境（AhaZone）」融合<strong>三維立體動態幾何</strong>與<strong>高品質段考複習試卷</strong>。
        打破抽象公式死背，藉由空間咬合與即時動態模擬，讓抽象定理躍然紙上。
      </p>

      <!-- Feature quick CTA -->
      <div class="flex flex-wrap gap-3 mb-6 sm:mb-8">
        <button
          @click="emit('exploreConic')"
          class="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02]"
        >
          <Compass class="w-4 h-4 text-white" />
          <span>立即體驗：雙圓錐截面 3D 幾何解析</span>
        </button>
      </div>

      <!-- Resource Type Filters & Subject Filters -->
      <div class="pt-5 sm:pt-6 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Resource Types Tabs -->
        <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span class="text-xs text-slate-400 font-semibold mr-1 hidden sm:inline">型態：</span>
          
          <button
            @click="emit('update:resourceType', 'all')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            :class="resourceType === 'all' ? 'bg-sky-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'"
          >
            全部資源
          </button>

          <button
            @click="emit('update:resourceType', 'dynamic')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            :class="resourceType === 'dynamic' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'"
          >
            <Sparkles class="w-3.5 h-3.5 text-sky-400" />
            <span>動態 3D 模擬</span>
          </button>

          <button
            @click="emit('update:resourceType', 'pdf-exam')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            :class="resourceType === 'pdf-exam' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'"
          >
            <FileText class="w-3.5 h-3.5 text-amber-400" />
            <span>段考/複習卷</span>
          </button>

          <button
            @click="emit('update:resourceType', 'pdf-lecture')"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            :class="resourceType === 'pdf-lecture' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'"
          >
            <BookOpen class="w-3.5 h-3.5 text-emerald-400" />
            <span>觀念重點</span>
          </button>
        </div>

        <!-- Subject Filter -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 font-semibold hidden sm:inline">科目：</span>
          <div class="flex bg-slate-950/80 p-1 rounded-lg border border-slate-800 w-full sm:w-auto justify-around">
            <button
              @click="emit('update:subject', 'all')"
              class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="subject === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'"
            >
              全部
            </button>
            <button
              @click="emit('update:subject', 'math')"
              class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="subject === 'math' ? 'bg-sky-600/60 text-sky-200' : 'text-slate-400 hover:text-slate-200'"
            >
              數學
            </button>
            <button
              @click="emit('update:subject', 'physics')"
              class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="subject === 'physics' ? 'bg-indigo-600/60 text-indigo-200' : 'text-slate-400 hover:text-slate-200'"
            >
              物理
            </button>
            <button
              @click="emit('update:subject', 'science')"
              class="px-2.5 py-1 text-xs font-medium rounded-md transition-colors"
              :class="subject === 'science' ? 'bg-emerald-600/60 text-emerald-200' : 'text-slate-400 hover:text-slate-200'"
            >
              國中自然
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
