<script setup lang="ts">
import { FileText, Play, BookOpen, Layers } from 'lucide-vue-next';
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
  <div class="rounded-md bg-[#161b22] border border-[#30363d] p-4 mb-4 font-mono">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
      <div>
        <h1 class="text-base sm:text-lg font-bold text-[#f0f6fc] flex items-center gap-2">
          <span class="w-2 h-2 rounded-sm bg-amber-500"></span>
          <span>AhaZone // 數理資源總覽檢索</span>
        </h1>
        <p class="text-xs text-[#8b949e] font-sans mt-0.5">
          收錄 108 課綱中學數理核心單元解析、函數坐標互動模型與題庫資源。
        </p>
      </div>

      <div class="flex items-center gap-2 text-xs text-[#8b949e]">
        <span class="px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d]">
          WORKBENCH_ACTIVE
        </span>
      </div>
    </div>

    <!-- Resource Type Filters & Subject Filters -->
    <div class="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
      <!-- Resource Types Tabs -->
      <div class="flex items-center gap-1.5 flex-wrap text-xs">
        <span class="text-[#8b949e] text-[11px] mr-1 hidden sm:inline">TYPE:</span>
        
        <button
          @click="emit('update:resourceType', 'all')"
          class="px-2.5 py-1 rounded-md transition-colors"
          :class="resourceType === 'all' ? 'bg-amber-500 text-black font-bold' : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]'"
        >
          全部資源
        </button>

        <button
          @click="emit('update:resourceType', 'dynamic')"
          class="px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
          :class="resourceType === 'dynamic' ? 'bg-amber-500 text-black font-bold' : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]'"
        >
          <Play class="w-3 h-3" />
          <span>動態模擬</span>
        </button>

        <button
          @click="emit('update:resourceType', 'pdf-exam')"
          class="px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
          :class="resourceType === 'pdf-exam' ? 'bg-amber-500 text-black font-bold' : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]'"
        >
          <FileText class="w-3 h-3" />
          <span>測驗卷</span>
        </button>

        <button
          @click="emit('update:resourceType', 'pdf-lecture')"
          class="px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
          :class="resourceType === 'pdf-lecture' ? 'bg-amber-500 text-black font-bold' : 'bg-[#0d1117] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d]'"
        >
          <BookOpen class="w-3 h-3" />
          <span>觀念筆記</span>
        </button>
      </div>

      <!-- Subject Filter -->
      <div class="flex items-center gap-1.5 text-xs">
        <span class="text-[#8b949e] text-[11px] hidden sm:inline">SUBJ:</span>
        <div class="flex bg-[#0d1117] p-0.5 rounded-md border border-[#30363d] gap-1">
          <button
            @click="emit('update:subject', 'all')"
            class="px-2 py-0.5 rounded-md transition-colors"
            :class="subject === 'all' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
          >
            全部
          </button>
          <button
            @click="emit('update:subject', 'math')"
            class="px-2 py-0.5 rounded-md transition-colors"
            :class="subject === 'math' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
          >
            數學
          </button>
          <button
            @click="emit('update:subject', 'physics')"
            class="px-2 py-0.5 rounded-md transition-colors"
            :class="subject === 'physics' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
          >
            物理/理化
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
