<script setup lang="ts">
import { FileText, Download, Eye, ExternalLink, ArrowRight, Play, CheckCircle } from 'lucide-vue-next';
import { ResourceItem } from '../types';

const props = defineProps<{
  resource: ResourceItem;
}>();

const emit = defineEmits<{
  (e: 'openLab', item: ResourceItem): void;
  (e: 'openPdf', item: ResourceItem, viewAnswer: boolean): void;
}>();

const handleLaunchLab = () => {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  if (isMobile && props.resource.filePath) {
    window.location.href = props.resource.filePath;
  } else {
    emit('openLab', props.resource);
  }
};
</script>

<template>
  <div class="group relative bg-[#161b22] border border-[#30363d] hover:border-amber-500/60 rounded-md p-4 transition-colors flex flex-col justify-between space-y-3 font-mono">
    
    <!-- Top Header -->
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-2 flex-wrap">
        <div class="flex items-center gap-1.5 flex-wrap">
          <!-- Type Badge -->
          <span 
            v-if="resource.type === 'dynamic'"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-[#0d1117] text-amber-400 border border-amber-500/40"
          >
            <Play class="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{{ resource.categoryLabel || '動態模擬室' }}</span>
          </span>
          <span 
            v-else-if="resource.type === 'pdf-exam'"
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#0d1117] text-[#c9d1d9] border border-[#30363d]"
          >
            <FileText class="w-3 h-3 text-[#8b949e]" />
            <span>測驗卷 (含詳解)</span>
          </span>
          <span 
            v-else
            class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-[#0d1117] text-[#c9d1d9] border border-[#30363d]"
          >
            <FileText class="w-3 h-3 text-[#8b949e]" />
            <span>複習講義</span>
          </span>

          <!-- Grade & Subject -->
          <span class="px-1.5 py-0.2 rounded-md text-[10px] bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
            {{ resource.gradeLabel }}
          </span>
          <span class="px-1.5 py-0.2 rounded-md text-[10px] bg-[#0d1117] text-[#8b949e] border border-[#30363d]">
            {{ resource.subjectLabel }}
          </span>
        </div>

        <span class="text-[10px] text-[#8b949e] truncate max-w-[150px]">
          {{ resource.chapter }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-sm sm:text-base font-bold text-[#f0f6fc] font-sans group-hover:text-amber-400 transition-colors">
        {{ resource.title }}
      </h3>
      <p v-if="resource.subtitle" class="text-xs text-[#8b949e] font-sans">
        {{ resource.subtitle }}
      </p>

      <p class="text-xs text-[#8b949e] font-sans leading-relaxed line-clamp-2">
        {{ resource.description }}
      </p>

      <!-- Aha! Moment Callout -->
      <div 
        v-if="resource.ahaInsight"
        class="p-2 rounded-md bg-[#0d1117] border border-[#30363d] text-xs text-[#c9d1d9] leading-relaxed"
      >
        <span class="text-amber-400 font-bold">[KEY_INSIGHT]：</span>
        <span class="font-sans text-[#8b949e]">{{ resource.ahaInsight }}</span>
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1 pt-1">
        <span 
          v-for="tag in resource.tags" 
          :key="tag"
          class="text-[10px] px-1.5 py-0.2 rounded-md bg-[#0d1117] text-[#8b949e] border border-[#30363d]"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-2.5 border-t border-[#30363d] flex items-center justify-between gap-2">
      <!-- Dynamic Buttons -->
      <div v-if="resource.type === 'dynamic'" class="w-full flex items-center gap-2">
        <button
          @click="handleLaunchLab"
          class="flex-1 py-1.5 px-3 rounded-md bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Play class="w-3.5 h-3.5 fill-black" />
          <span>{{ resource.actionLabel || '啟動互動模擬室' }}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
        <a
          :href="resource.filePath"
          target="_blank"
          rel="noopener noreferrer"
          class="p-1.5 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
          title="另開全螢幕分頁"
        >
          <ExternalLink class="w-3.5 h-3.5" />
        </a>
      </div>

      <!-- PDF Buttons -->
      <div v-else class="w-full flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-1">
          <button
            @click="emit('openPdf', resource, false)"
            class="flex-1 py-1.5 px-2.5 rounded-md bg-[#0d1117] hover:bg-[#21262d] hover:text-amber-400 text-[#c9d1d9] text-xs flex items-center justify-center gap-1 transition-colors border border-[#30363d] hover:border-amber-500/50 cursor-pointer"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>題目卷</span>
          </button>
          <button
            v-if="resource.answerPath"
            @click="emit('openPdf', resource, true)"
            class="py-1.5 px-2.5 rounded-md bg-[#0d1117] hover:bg-amber-500/10 text-amber-400 text-xs flex items-center justify-center gap-1 transition-colors border border-amber-500/40 cursor-pointer font-bold"
            title="查看詳解與答案"
          >
            <CheckCircle class="w-3.5 h-3.5" />
            <span>詳解卷</span>
          </button>
        </div>

        <a
          :href="resource.filePath"
          download
          class="p-1.5 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] transition-colors border border-[#30363d]"
          title="下載 PDF"
        >
          <Download class="w-3.5 h-3.5" />
        </a>
      </div>
    </div>

  </div>
</template>
