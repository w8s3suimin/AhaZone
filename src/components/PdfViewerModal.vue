<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { X, Download, FileText, CheckCircle, ExternalLink, Lightbulb } from 'lucide-vue-next';
import { ResourceItem } from '../types';

const props = defineProps<{
  resource: ResourceItem | null;
  initialShowAnswer?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const activeTab = ref<'question' | 'answer'>('question');

watch(() => props.resource, (val) => {
  activeTab.value = props.initialShowAnswer && props.resource?.answerPath ? 'answer' : 'question';
  if (typeof document !== 'undefined') {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});

const currentPdfUrl = computed(() => {
  if (!props.resource) return '';
  return activeTab.value === 'answer' && props.resource.answerPath 
    ? props.resource.answerPath 
    : props.resource.filePath;
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="resource"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
    <div class="w-full h-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
      
      <!-- Top Header -->
      <div class="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <FileText class="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h2 class="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{{ resource.title }}</span>
              <span class="text-xs font-normal text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                {{ resource.gradeLabel }} · {{ resource.chapter }}
              </span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- Question / Answer Tab Switcher -->
          <div v-if="resource.answerPath" class="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              @click="activeTab = 'question'"
              class="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'question' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>題目卷</span>
            </button>
            <button
              @click="activeTab = 'answer'"
              class="px-3 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              :class="activeTab === 'answer' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
            >
              <CheckCircle class="w-3.5 h-3.5" />
              <span>詳解卷</span>
            </button>
          </div>

          <!-- Download Button -->
          <a
            :href="currentPdfUrl"
            download
            class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <Download class="w-3.5 h-3.5 text-sky-400" />
            <span class="hidden sm:inline">下載 PDF</span>
          </a>

          <!-- Open in new tab -->
          <a
            :href="currentPdfUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="在新分頁開啟"
          >
            <ExternalLink class="w-4 h-4" />
          </a>

          <!-- Close Button -->
          <button
            @click="emit('close')"
            class="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800 transition-colors"
            title="關閉"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Aha Callout Ribbon -->
      <div 
        v-if="resource.ahaInsight"
        class="px-4 py-2 bg-amber-950/30 border-b border-amber-900/40 text-amber-200 text-xs flex items-center gap-2"
      >
        <Lightbulb class="w-4 h-4 text-amber-400 shrink-0" />
        <div class="truncate">
          <span class="font-bold text-amber-300">解題心法：</span>
          <span>{{ resource.ahaInsight }}</span>
        </div>
      </div>

      <!-- PDF Viewer Body -->
      <div class="flex-1 w-full bg-slate-950 relative">
        <iframe
          :src="`${currentPdfUrl}#toolbar=1&navpanes=0`"
          :title="resource.title"
          class="w-full h-full border-0"
        />
      </div>

    </div>
    </div>
  </Teleport>
</template>
