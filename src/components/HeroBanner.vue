<script setup lang="ts">
import { FileText, Sparkles, BookOpen } from 'lucide-vue-next';
import { ResourceType, SubjectId } from '../types';

defineProps<{
  resourceType: ResourceType;
  subject: SubjectId;
}>();

const emit = defineEmits<{
  (e: 'update:resourceType', val: ResourceType): void;
  (e: 'update:subject', val: SubjectId): void;
}>();
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-5 sm:p-7 lg:p-8 mb-6 shadow-2xl">
    
    <!-- Background ambient decorative glow -->
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

    <div class="relative z-10 w-full">
      <!-- Main Title -->
      <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
        悟境 ｜ 
        <span class="bg-gradient-to-r from-sky-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
          AhaZone 教學資源庫
        </span>
      </h1>

      <p class="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed mb-5">
        涵蓋 108 課綱國中與高中數理體系，提供各單元觀念重點整理、動態 3D 幾何模擬實驗室與精選段考複習試卷。
      </p>

      <!-- Resource Type Filters & Subject Filters -->
      <div class="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
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
