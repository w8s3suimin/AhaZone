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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 font-mono"
    >
    <div 
      class="w-full h-full max-w-7xl bg-[#161b22] border border-[#30363d] rounded-md overflow-hidden flex flex-col shadow-2xl"
      :class="isFullscreen ? 'max-w-none rounded-none' : ''"
    >
      
      <!-- Top Header -->
      <div class="px-3.5 py-2.5 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <component :is="resource.tags.includes('3D') ? Compass : FileText" class="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div>
            <h2 class="text-xs sm:text-sm font-bold text-[#f0f6fc] flex items-center gap-2">
              <span class="font-sans">{{ resource.title }}</span>
              <span class="text-[10px] text-amber-400 px-1.5 py-0.2 rounded-md bg-[#161b22] border border-[#30363d]">
                {{ resource.gradeLabel }} // {{ resource.chapter }}
              </span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-xs">
          <button
            @click="showGuide = !showGuide"
            class="px-2.5 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 transition-colors border"
            :class="showGuide ? 'bg-amber-500 text-black font-bold border-amber-500' : 'bg-[#161b22] text-[#8b949e] border-[#30363d] hover:text-[#f0f6fc]'"
          >
            <Lightbulb class="w-3.5 h-3.5" />
            <span class="hidden sm:inline">GUIDE // 操作指引</span>
          </button>

          <button
            @click="iframeKey++"
            class="p-1 rounded-md bg-[#161b22] text-[#8b949e] hover:text-amber-500 border border-[#30363d] transition-colors"
            title="重新載入"
          >
            <RefreshCw class="w-3.5 h-3.5" />
          </button>

          <a
            :href="resource.filePath"
            target="_blank"
            rel="noopener noreferrer"
            class="p-1 rounded-md bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
            title="在新分頁開啟"
          >
            <ExternalLink class="w-3.5 h-3.5" />
          </a>

          <button
            @click="isFullscreen = !isFullscreen"
            class="p-1 rounded-md bg-[#161b22] text-[#8b949e] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
            :title="isFullscreen ? '退出全螢幕' : '全螢幕'"
          >
            <component :is="isFullscreen ? Minimize2 : Maximize2" class="w-3.5 h-3.5" />
          </button>

          <button
            @click="emit('close')"
            class="p-1 rounded-md bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-500 border border-[#30363d] transition-colors"
            title="關閉"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        <!-- Iframe View -->
        <div class="flex-1 h-full w-full bg-[#0d1117]">
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
          class="w-full md:w-80 lg:w-96 bg-[#161b22] border-t md:border-t-0 md:border-l border-[#30363d] p-3.5 overflow-y-auto space-y-3 text-xs text-[#c9d1d9]"
        >
          <div class="flex items-center gap-1.5 text-amber-400 font-bold text-xs border-b border-[#30363d] pb-2">
            <Lightbulb class="w-3.5 h-3.5 text-amber-500" />
            <span>[GUIDE // 操作與目標分析]</span>
          </div>

          <div v-if="resource.ahaInsight" class="bg-[#0d1117] border border-[#30363d] rounded-md p-2.5 text-[#c9d1d9] leading-relaxed">
            <div class="font-bold text-amber-400 mb-0.5">[TARGET]：</div>
            <div class="font-sans text-[#8b949e]">{{ resource.ahaInsight }}</div>
          </div>

          <div v-if="resource.learningGoals && resource.learningGoals.length > 0" class="space-y-1.5">
            <span class="font-bold text-[#f0f6fc] block">[KEY_TASKS]：</span>
            <ul class="space-y-1 list-disc list-inside text-[#8b949e] font-sans">
              <li v-for="(goal, idx) in resource.learningGoals" :key="idx" class="leading-relaxed">
                {{ goal }}
              </li>
            </ul>
          </div>

          <!-- Operation Tips -->
          <div v-if="resource.operationTips && resource.operationTips.length > 0" class="space-y-1.5 pt-2 border-t border-[#30363d]">
            <span class="font-bold text-[#f0f6fc] block">[INTERACTION_TIPS]：</span>
            <div class="space-y-1.5 text-[#8b949e]">
              <div 
                v-for="(tip, idx) in resource.operationTips" 
                :key="idx"
                class="p-2 rounded-md bg-[#0d1117] border border-[#30363d]"
              >
                <strong class="block mb-0.5 text-amber-400 font-mono">
                  {{ tip.title }}
                </strong>
                <span class="font-sans">{{ tip.desc }}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
    </div>
  </Teleport>
</template>
