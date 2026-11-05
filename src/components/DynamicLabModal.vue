<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { X, Maximize2, Minimize2, ExternalLink, RefreshCw, Lightbulb, Compass, FileText } from 'lucide-vue-next';
import { ResourceItem } from '../types';

const props = defineProps<{
  resource: ResourceItem | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isFullscreen = ref(false);
const showGuide = ref(true);
const iframeKey = ref(0);

watch(() => props.resource, (val) => {
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
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="resource"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200"
    >
    <div 
      class="w-full h-full max-w-7xl bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      :class="isFullscreen ? 'max-w-none rounded-none' : ''"
    >
      
      <!-- Top Header -->
      <div class="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center">
            <component :is="resource.tags.includes('3D') ? Compass : FileText" class="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h2 class="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{{ resource.title }}</span>
              <span class="text-xs font-normal text-sky-400 px-2 py-0.5 rounded bg-sky-950/60 border border-sky-800/80">
                {{ resource.gradeLabel }} · {{ resource.chapter }}
              </span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="showGuide = !showGuide"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border"
            :class="showGuide ? 'bg-amber-950/40 text-amber-300 border-amber-600/60' : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'"
          >
            <Lightbulb class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">觀念導引</span>
          </button>

          <button
            @click="iframeKey++"
            class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="重新載入"
          >
            <RefreshCw class="w-4 h-4" />
          </button>

          <a
            :href="resource.filePath"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="在新分頁開啟"
          >
            <ExternalLink class="w-4 h-4" />
          </a>

          <button
            @click="isFullscreen = !isFullscreen"
            class="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            :title="isFullscreen ? '退出全螢幕' : '全螢幕'"
          >
            <component :is="isFullscreen ? Minimize2 : Maximize2" class="w-4 h-4" />
          </button>

          <button
            @click="emit('close')"
            class="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-800 transition-colors"
            title="關閉"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        <!-- Iframe View -->
        <div class="flex-1 h-full w-full bg-slate-950">
          <iframe
            :key="iframeKey"
            :src="resource.filePath"
            :title="resource.title"
            class="w-full h-full border-0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope"
          />
        </div>

        <!-- Guide Sidebar -->
        <div 
          v-if="showGuide"
          class="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-4 overflow-y-auto space-y-4 text-xs text-slate-300"
        >
          <div class="flex items-center gap-2 text-amber-300 font-bold text-sm border-b border-slate-800 pb-2">
            <Lightbulb class="w-4 h-4 text-amber-400" />
            <span>悟境觀念指引 (Aha! Guide)</span>
          </div>

          <div v-if="resource.ahaInsight" class="bg-amber-950/20 border border-amber-600/30 rounded-xl p-3 text-amber-200/90 leading-relaxed">
            <div class="font-semibold text-amber-300 mb-1">🎯 探索目標：</div>
            <div>{{ resource.ahaInsight }}</div>
          </div>

          <div v-if="resource.learningGoals && resource.learningGoals.length > 0" class="space-y-2">
            <span class="font-semibold text-slate-200 block">學習核心任務：</span>
            <ul class="space-y-1.5 list-disc list-inside text-slate-400">
              <li v-for="(goal, idx) in resource.learningGoals" :key="idx" class="leading-relaxed">
                {{ goal }}
              </li>
            </ul>
          </div>

          <!-- Operation Tips (Dynamic based on resource) -->
          <div v-if="resource.operationTips && resource.operationTips.length > 0" class="space-y-2 pt-2 border-t border-slate-800">
            <span class="font-semibold text-slate-200 block">💡 互動操作密技：</span>
            <div class="space-y-2 text-slate-400">
              <div 
                v-for="(tip, idx) in resource.operationTips" 
                :key="idx"
                class="p-2 rounded bg-slate-950 border border-slate-800"
              >
                <strong 
                  class="block mb-0.5"
                  :class="tip.color === 'amber' ? 'text-amber-300' : tip.color === 'emerald' ? 'text-emerald-300' : tip.color === 'indigo' ? 'text-indigo-300' : 'text-sky-300'"
                >
                  {{ tip.title }}
                </strong>
                <span>{{ tip.desc }}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
    </div>
  </Teleport>
</template>
