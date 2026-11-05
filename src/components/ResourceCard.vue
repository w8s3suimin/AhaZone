<script setup lang="ts">
import { Sparkles, FileText, Download, Eye, ExternalLink, Lightbulb, CheckCircle, ArrowRight } from 'lucide-vue-next';
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
  <div class="group relative bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-sky-950/20 flex flex-col justify-between">
    
    <!-- Top Header -->
    <div>
      <div class="flex items-center justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Type Badge -->
          <span 
            v-if="resource.type === 'dynamic'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30"
          >
            <Sparkles class="w-3.5 h-3.5 text-sky-400" />
            {{ resource.categoryLabel || (resource.tags.includes('3D') ? '動態 3D 幾何實驗室' : '動態隨機出題卷') }}
          </span>
          <span 
            v-else-if="resource.type === 'pdf-exam'"
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20"
          >
            <FileText class="w-3.5 h-3.5 text-amber-400" />
            段考/複習測驗卷 (含詳解)
          </span>
          <span 
            v-else
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
          >
            <FileText class="w-3.5 h-3.5 text-emerald-400" />
            自編重點複習講義
          </span>

          <!-- Grade & Subject -->
          <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {{ resource.gradeLabel }}
          </span>
          <span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
            {{ resource.subjectLabel }}
          </span>
        </div>

        <span class="text-[11px] font-mono text-slate-500">
          {{ resource.chapter }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-bold text-slate-100 group-hover:text-sky-300 transition-colors mb-1.5">
        {{ resource.title }}
      </h3>
      <p v-if="resource.subtitle" class="text-xs font-medium text-slate-400 mb-3">
        {{ resource.subtitle }}
      </p>

      <p class="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
        {{ resource.description }}
      </p>

      <!-- Aha! 頓悟亮點引導 Callout -->
      <div 
        v-if="resource.ahaInsight"
        class="mb-4 p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-200/90 text-xs leading-relaxed flex items-start gap-2.5"
      >
        <Lightbulb class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-amber-300 block mb-0.5">訣竅 (Aha! Moment)：</span>
          <span>{{ resource.ahaInsight }}</span>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1.5 mb-5">
        <span 
          v-for="tag in resource.tags" 
          :key="tag"
          class="text-[10px] px-2 py-0.5 rounded-md bg-slate-950/60 text-slate-400 border border-slate-800/80"
        >
          #{{ tag }}
        </span>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
      <!-- Dynamic Buttons -->
      <div v-if="resource.type === 'dynamic'" class="w-full flex items-center gap-2">
        <button
          @click="handleLaunchLab"
          class="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/25 transition-all"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>{{ resource.actionLabel || (resource.tags.includes('3D') ? '啟動 3D 幾何模擬室' : '開啟動態訓練卷') }}</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
        <a
          :href="resource.filePath"
          target="_blank"
          rel="noopener noreferrer"
          class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="另開全螢幕分頁"
        >
          <ExternalLink class="w-4 h-4" />
        </a>
      </div>

      <!-- PDF Buttons -->
      <div v-else class="w-full flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 flex-1">
          <button
            @click="emit('openPdf', resource, false)"
            class="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 hover:border-sky-500"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>線上題目預覽</span>
          </button>
          <button
            v-if="resource.answerPath"
            @click="emit('openPdf', resource, true)"
            class="py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-600 text-emerald-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-800/60"
            title="查看解答與解析"
          >
            <CheckCircle class="w-3.5 h-3.5" />
            <span>詳解卷</span>
          </button>
        </div>

        <a
          :href="resource.filePath"
          download
          class="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-sky-300 transition-colors border border-slate-800"
          title="下載原始 PDF"
        >
          <Download class="w-4 h-4" />
        </a>
      </div>
    </div>

  </div>
</template>
