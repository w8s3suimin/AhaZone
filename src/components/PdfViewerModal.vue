<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { X, Download, FileText, CheckCircle, ExternalLink } from 'lucide-vue-next';
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

const iframeSrc = computed(() => {
  if (!currentPdfUrl.value) return '';
  if (currentPdfUrl.value.includes('drive.google.com')) {
    return currentPdfUrl.value;
  }
  return `${currentPdfUrl.value}#toolbar=1&navpanes=0`;
});

const downloadUrl = computed(() => {
  if (!currentPdfUrl.value) return '';
  const driveMatch = currentPdfUrl.value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  }
  return currentPdfUrl.value;
});
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="resource"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4"
    >
    <div class="w-full h-full max-w-6xl bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden flex flex-col shadow-2xl">
      
      <!-- Top Header -->
      <div class="px-4 py-3 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <FileText class="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <h2 class="text-sm sm:text-base font-bold text-[#f0f6fc] flex items-center gap-2">
              <span>{{ resource.title }}</span>
              <span class="text-xs text-[#8b949e] px-2 py-0.5 rounded-md bg-[#161b22] border border-[#30363d]">
                {{ resource.gradeLabel }} · {{ resource.chapter }}
              </span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <!-- Question / Answer Tab Switcher -->
          <div v-if="resource.answerPath" class="flex bg-[#161b22] p-0.5 rounded-md border border-[#30363d]">
            <button
              @click="activeTab = 'question'"
              class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
              :class="activeTab === 'question' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
            >
              <FileText class="w-3.5 h-3.5" />
              <span>題目卷</span>
            </button>
            <button
              @click="activeTab = 'answer'"
              class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors"
              :class="activeTab === 'answer' ? 'bg-amber-500 text-black font-bold' : 'text-[#8b949e] hover:text-[#f0f6fc]'"
            >
              <CheckCircle class="w-3.5 h-3.5" />
              <span>詳解卷</span>
            </button>
          </div>

          <!-- Download Button -->
          <a
            :href="downloadUrl"
            download
            class="px-2.5 py-1 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] flex items-center gap-1.5 transition-colors font-semibold"
            title="下載 PDF 檔案"
          >
            <Download class="w-3.5 h-3.5 text-amber-500" />
            <span class="hidden sm:inline">下載 PDF</span>
          </a>

          <!-- External open -->
          <a
            :href="currentPdfUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
            title="在新分頁開啟"
          >
            <ExternalLink class="w-3.5 h-3.5" />
          </a>

          <!-- Close -->
          <button
            @click="emit('close')"
            class="p-1.5 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-500 border border-[#30363d] transition-colors"
            title="關閉"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Aha Insight Banner -->
      <div 
        v-if="resource.ahaInsight"
        class="bg-[#0d1117] px-4 py-2 border-b border-[#30363d] text-xs text-[#c9d1d9] flex items-center gap-2"
      >
        <span class="text-amber-400 font-bold">訣竅 (Aha! Moment)：</span>
        <span class="text-[#8b949e] truncate">{{ resource.ahaInsight }}</span>
      </div>

      <!-- PDF Embedded Viewer -->
      <div class="flex-1 w-full h-full bg-[#0d1117] relative">
        <iframe
          v-if="currentPdfUrl"
          :src="iframeSrc"
          :title="resource.title"
          class="w-full h-full border-0"
        />
        <div v-else class="flex items-center justify-center h-full text-xs text-[#8b949e]">
          無法載入 PDF 檔案路徑
        </div>
      </div>

    </div>
    </div>
  </Teleport>
</template>
