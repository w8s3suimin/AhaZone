<script setup lang="ts">
import { Search, X, PanelLeftClose, PanelLeftOpen, Terminal } from 'lucide-vue-next';

defineProps<{
  searchQuery: string;
  totalCount: number;
  selectedChapter: string | null;
  isDesktopSidebarOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:searchQuery', val: string): void;
  (e: 'toggleDesktopSidebar'): void;
  (e: 'openMobileDrawer'): void;
  (e: 'reset'): void;
}>();
</script>

<template>
  <header class="sticky top-0 z-30 bg-[#161b22] border-b border-[#30363d]">
    <div class="w-full px-4 sm:px-6">
      <div class="flex items-center justify-between h-14 gap-4">
        
        <!-- Left: Workbench Brand Logo & Title -->
        <div class="flex items-center gap-3 shrink-0">
          <!-- Toggle Desktop Sidebar (300px tree) Button -->
          <button
            @click="emit('toggleDesktopSidebar')"
            class="hidden lg:flex items-center justify-center w-8 h-8 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-[#f59e0b] border border-[#30363d] transition-colors"
            :title="isDesktopSidebarOpen ? '收合左側知識樹' : '展開左側知識樹'"
          >
            <component :is="isDesktopSidebarOpen ? PanelLeftClose : PanelLeftOpen" class="w-4 h-4" />
          </button>

          <!-- Mobile Unit Map Drawer Button -->
          <button
            @click="emit('openMobileDrawer')"
            class="lg:hidden flex items-center justify-center w-8 h-8 rounded-md bg-[#0d1117] text-amber-500 border border-[#30363d] transition-colors"
            title="開啟知識樹導航"
          >
            <PanelLeftOpen class="w-4 h-4" />
          </button>

          <div class="flex items-center gap-2.5 cursor-pointer" @click="emit('reset')">
            <div class="w-7 h-7 rounded-md bg-[#0d1117] border border-[#30363d] flex items-center justify-center text-amber-500 font-mono font-bold text-sm">
              <Terminal class="w-4 h-4" />
            </div>
            <div class="flex items-baseline gap-2">
              <span class="font-mono font-bold text-base tracking-wider text-[#f0f6fc]">
                AhaZone
              </span>
              <span class="text-[#8b949e] font-mono text-xs hidden sm:inline">
                // 108 課綱數理解析工作台
              </span>
            </div>
          </div>
        </div>

        <!-- Middle: Terminal-styled Search Bar -->
        <div class="flex-1 max-w-md relative hidden md:block">
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              :value="searchQuery"
              @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              placeholder="檢索單元、公式、範例或關鍵字..."
              class="w-full pl-9 pr-8 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs font-mono text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
            <button
              v-if="searchQuery"
              @click="emit('update:searchQuery', '')"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#f0f6fc]"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Right Side Workbench Telemetry Status & Actions -->
        <div class="flex items-center gap-3">
          <div class="hidden sm:flex items-center gap-2 font-mono text-[11px] text-[#8b949e]">
            <span class="px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d]">
              INDEX: <strong class="text-amber-500">{{ totalCount }}</strong>
            </span>
            <span v-if="selectedChapter" class="px-2 py-0.5 rounded-md bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] truncate max-w-[140px]">
              {{ selectedChapter }}
            </span>
          </div>

          <button
            v-if="selectedChapter || searchQuery"
            @click="emit('reset')"
            class="px-2.5 py-1 rounded-md bg-[#0d1117] hover:bg-[#21262d] text-[#8b949e] hover:text-amber-500 border border-[#30363d] hover:border-amber-500 font-mono text-xs transition-colors"
          >
            RESET
          </button>
        </div>

      </div>

      <!-- Mobile Search Bar -->
      <div class="pb-2.5 md:hidden">
        <div class="relative">
          <Search class="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            :value="searchQuery"
            @input="emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
            placeholder="檢索單元、公式或關鍵字..."
            class="w-full pl-9 pr-8 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs font-mono text-[#f0f6fc] placeholder-[#484f58] focus:outline-none focus:border-amber-500"
          />
          <button
            v-if="searchQuery"
            @click="emit('update:searchQuery', '')"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  </header>
</template>
