<script setup lang="ts">
import { computed } from 'vue';
import OpticsSimulator from './OpticsSimulator.vue';
import FunctionGraph from './FunctionGraph.vue';

const props = defineProps<{
  type: string;
}>();
</script>

<template>
  <div class="w-full select-none flex flex-col items-center">
    
    <!-- ========================================================================= -->
    <!-- 1. 等速圓周運動與向心加速度 (circular-motion) -->
    <!-- ========================================================================= -->
    <svg 
      v-if="type === 'circular-motion'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <!-- Gradients & Arrow Markers -->
        <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#818cf8" stop-opacity="0.05"/>
        </linearGradient>
        <marker id="arrow-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
        <marker id="arrow-a" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
      </defs>

      <!-- Background Grid Subtlety -->
      <rect width="380" height="200" rx="16" fill="#090d16" />
      <circle cx="180" cy="100" r="65" fill="url(#orbitGrad)" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="4 4" />
      
      <!-- Radius line -->
      <line x1="180" y1="100" x2="236" y2="67" stroke="#475569" stroke-width="1.2" stroke-dasharray="2 2" />
      <text x="202" y="90" fill="#94a3b8" font-size="11" font-family="sans-serif">半徑 R</text>

      <!-- Center point -->
      <circle cx="180" cy="100" r="3.5" fill="#64748b" />
      <text x="168" y="104" fill="#64748b" font-size="10" font-family="sans-serif">O</text>

      <!-- Moving object on orbit at angle -30 deg -->
      <!-- Position: (180 + 65*cos(-30°), 100 + 65*sin(-30°)) = (180 + 56.3, 100 - 32.5) = (236.3, 67.5) -->
      <!-- Velocity v vector (tangent: direction (-sin(-30°), cos(-30°)) = (0.5, 0.866) ... wait, counterclockwise tangent at (cos θ, sin θ) is (-sin θ, cos θ) -->
      <!-- θ = -30°, so tangent = (sin 30°, cos 30°) = (0.5, 0.866) pointing down-right or up-left (-0.5, -0.866) -->
      <!-- Tangent vector arrow: from (236, 67.5) to (211, 24) -->
      <line x1="236" y1="67.5" x2="216" y2="33" stroke="#34d399" stroke-width="2.5" marker-end="url(#arrow-v)" />
      <text x="222" y="32" fill="#34d399" font-weight="bold" font-size="12" font-family="sans-serif">切線速度 v</text>

      <!-- Centripetal acceleration a_c vector (towards center (180, 100)) -->
      <line x1="236" y1="67.5" x2="198" y2="89.5" stroke="#38bdf8" stroke-width="2.5" marker-end="url(#arrow-a)" />
      <text x="204" y="70" fill="#38bdf8" font-weight="bold" font-size="12" font-family="sans-serif">向心加速度 a_c</text>

      <!-- Right angle mark between v and a_c -->
      <path d="M 230 57 L 223 61 L 229 71" fill="none" stroke="#f59e0b" stroke-width="1.2" />

      <!-- Object node -->
      <circle cx="236" cy="67.5" r="6" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />

      <!-- Explanation Badges -->
      <g transform="translate(14, 155)">
        <rect width="352" height="32" rx="8" fill="#0f172a" stroke="#1e293b" />
        <circle cx="16" cy="16" r="3" fill="#38bdf8" />
        <text x="28" y="20" fill="#94a3b8" font-size="11" font-family="sans-serif">
          核心幾何特徵：<tspan fill="#34d399" font-weight="bold">v ⊥ a_c</tspan>（速度恆垂直於向心加速度）⟹ 向心力不做功，僅改變方向
        </text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 2. 平面斜向拋射運動 (projectile-motion) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'projectile-motion'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <linearGradient id="trajGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
        </linearGradient>
        <marker id="arrow-proj" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-comp" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#94a3b8" />
        </marker>
      </defs>

      <rect width="380" height="200" rx="16" fill="#090d16" />
      
      <!-- Ground line -->
      <line x1="30" y1="145" x2="350" y2="145" stroke="#334155" stroke-width="2" />

      <!-- Trajectory curve: from (50, 145) to (330, 145), peak at (190, 45) -->
      <!-- Quadratic bezier: start 50,145; control 190,-55; end 330,145 -->
      <path d="M 50 145 Q 190 -5 330 145" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <path d="M 50 145 Q 190 -5 330 145 L 330 145 L 50 145 Z" fill="url(#trajGrad)" />

      <!-- Initial Velocity Vector Decomposition -->
      <line x1="50" y1="145" x2="100" y2="90" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-proj)" />
      <text x="105" y="90" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">v₀</text>

      <line x1="50" y1="145" x2="100" y2="145" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#arrow-comp)" />
      <text x="65" y="160" fill="#94a3b8" font-size="10" font-family="sans-serif">v₀ cosθ</text>

      <line x1="50" y1="145" x2="50" y2="95" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3" marker-end="url(#arrow-comp)" />
      <text x="15" y="115" fill="#94a3b8" font-size="10" font-family="sans-serif">v₀ sinθ</text>

      <!-- Launch angle theta arc -->
      <path d="M 75 145 A 25 25 0 0 0 68 127" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <text x="74" y="136" fill="#f59e0b" font-size="10" font-family="sans-serif">θ</text>

      <!-- Highest Point H -->
      <circle cx="190" cy="50" r="4.5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      <line x1="190" y1="50" x2="230" y2="50" stroke="#34d399" stroke-width="2" marker-end="url(#arrow-comp)" />
      <text x="235" y="54" fill="#34d399" font-size="10" font-family="sans-serif">v_x = v₀ cosθ (v_y = 0)</text>

      <!-- Height H indicator -->
      <line x1="190" y1="50" x2="190" y2="145" stroke="#64748b" stroke-width="1" stroke-dasharray="2 2" />
      <text x="195" y="105" fill="#38bdf8" font-weight="bold" font-size="11" font-family="sans-serif">射高 H</text>

      <!-- Range R indicator -->
      <line x1="50" y1="172" x2="330" y2="172" stroke="#64748b" stroke-width="1.2" />
      <circle cx="50" cy="172" r="2" fill="#64748b" />
      <circle cx="330" cy="172" r="2" fill="#64748b" />
      <text x="160" y="188" fill="#e2e8f0" font-weight="bold" font-size="11" font-family="sans-serif">水平射程 R (θ=45° 時最大)</text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 3. 直線運動 v-t 圖幾何本質 (vt-graph) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'vt-graph'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <linearGradient id="trapezoidGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#34d399" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="#34d399" stop-opacity="0.05"/>
        </linearGradient>
      </defs>

      <rect width="380" height="200" rx="16" fill="#090d16" />
      
      <!-- Coordinate axes -->
      <line x1="50" y1="150" x2="340" y2="150" stroke="#475569" stroke-width="1.5" />
      <text x="345" y="154" fill="#94a3b8" font-size="11" font-family="sans-serif">時間 t</text>
      
      <line x1="60" y1="160" x2="60" y2="30" stroke="#475569" stroke-width="1.5" />
      <text x="50" y="24" fill="#94a3b8" font-size="11" font-family="sans-serif">速度 v</text>

      <!-- Trapezoid area: from t=0 (60, 110) [v₀] to t=T (260, 50) [v] -->
      <polygon points="60,110 260,50 260,150 60,150" fill="url(#trapezoidGrad)" stroke="#34d399" stroke-width="1" stroke-dasharray="3 3" />

      <!-- The linear velocity function line -->
      <line x1="60" y1="110" x2="260" y2="50" stroke="#38bdf8" stroke-width="3" />
      <circle cx="60" cy="110" r="4" fill="#38bdf8" />
      <circle cx="260" cy="50" r="4" fill="#38bdf8" />

      <!-- Labels on axes -->
      <text x="36" y="114" fill="#e2e8f0" font-size="11" font-family="sans-serif">v₀</text>
      <line x1="56" y1="110" x2="64" y2="110" stroke="#94a3b8" stroke-width="1.5" />

      <text x="42" y="54" fill="#e2e8f0" font-size="11" font-family="sans-serif">v</text>
      <line x1="56" y1="50" x2="64" y2="50" stroke="#94a3b8" stroke-width="1.5" />
      <line x1="60" y1="50" x2="260" y2="50" stroke="#334155" stroke-dasharray="2 2" stroke-width="1" />

      <text x="256" y="166" fill="#e2e8f0" font-size="11" font-family="sans-serif">t</text>
      <line x1="260" y1="146" x2="260" y2="154" stroke="#94a3b8" stroke-width="1.5" />

      <!-- Annotations -->
      <g transform="translate(130, 95)">
        <text x="0" y="0" fill="#34d399" font-weight="bold" font-size="12" font-family="sans-serif">夾面積 = 位移 Δx</text>
        <text x="0" y="16" fill="#94a3b8" font-size="10" font-family="sans-serif">梯形公式：((v₀ + v)/2) × t</text>
      </g>

      <g transform="translate(140, 38)">
        <text x="0" y="0" fill="#38bdf8" font-weight="bold" font-size="12" font-family="sans-serif">斜率 = 加速度 a</text>
        <text x="0" y="14" fill="#94a3b8" font-size="10" font-family="sans-serif">Δv / Δt</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 4. 單位圓與三角函數坐標定義 (unit-circle) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'unit-circle'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="200" rx="16" fill="#090d16" />
      
      <!-- Coordinate axes -->
      <line x1="30" y1="100" x2="270" y2="100" stroke="#334155" stroke-width="1.5" />
      <text x="275" y="104" fill="#94a3b8" font-size="11" font-family="sans-serif">x</text>

      <line x1="150" y1="180" x2="150" y2="20" stroke="#334155" stroke-width="1.5" />
      <text x="146" y="14" fill="#94a3b8" font-size="11" font-family="sans-serif">y</text>

      <!-- Unit circle r = 60 -->
      <circle cx="150" cy="100" r="60" fill="none" stroke="#475569" stroke-width="1.5" />

      <!-- Point P at θ = 50°: x = 150 + 60*cos(50°) = 150 + 38.6 = 188.6; y = 100 - 60*sin(50°) = 100 - 46 = 54 -->
      <!-- Triangle legs -->
      <!-- Horizontal cos leg -->
      <line x1="150" y1="100" x2="188.6" y2="100" stroke="#38bdf8" stroke-width="2.5" />
      <text x="156" y="115" fill="#38bdf8" font-weight="bold" font-size="11" font-family="sans-serif">x = cosθ</text>

      <!-- Vertical sin leg -->
      <line x1="188.6" y1="100" x2="188.6" y2="54" stroke="#34d399" stroke-width="2.5" stroke-dasharray="2 2" />
      <text x="194" y="80" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">y = sinθ</text>

      <!-- Hypotenuse r = 1 -->
      <line x1="150" y1="100" x2="188.6" y2="54" stroke="#f59e0b" stroke-width="2" />
      <circle cx="188.6" cy="54" r="4.5" fill="#f59e0b" stroke="#ffffff" stroke-width="1.5" />
      <text x="196" y="50" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">P(cosθ, sinθ)</text>

      <!-- Angle arc θ -->
      <path d="M 170 100 A 20 20 0 0 0 163 85" fill="none" stroke="#f59e0b" stroke-width="1.5" />
      <text x="168" y="93" fill="#f59e0b" font-size="10" font-family="sans-serif">θ</text>

      <!-- Quadrant Memory Legend on the right -->
      <g transform="translate(290, 30)">
        <rect width="76" height="140" rx="8" fill="#0f172a" stroke="#1e293b" />
        <text x="10" y="20" fill="#e2e8f0" font-size="11" font-weight="bold" font-family="sans-serif">象限正負</text>
        <text x="10" y="44" fill="#34d399" font-size="10" font-family="sans-serif">Ⅰ: 全為正</text>
        <text x="10" y="68" fill="#38bdf8" font-size="10" font-family="sans-serif">Ⅱ: sin 正</text>
        <text x="10" y="92" fill="#f59e0b" font-size="10" font-family="sans-serif">Ⅲ: tan 正</text>
        <text x="10" y="116" fill="#818cf8" font-size="10" font-family="sans-serif">Ⅳ: cos 正</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 5. 平面向量正射影 (vector-projection) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'vector-projection'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <marker id="arrow-vec" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-proj-v" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#34d399" />
        </marker>
      </defs>

      <rect width="380" height="180" rx="16" fill="#090d16" />
      
      <!-- Vector v along line -->
      <line x1="50" y1="120" x2="320" y2="120" stroke="#475569" stroke-width="1.5" />
      <line x1="50" y1="120" x2="290" y2="120" stroke="#94a3b8" stroke-width="2.5" marker-end="url(#arrow-vec)" />
      <text x="296" y="124" fill="#94a3b8" font-weight="bold" font-size="12" font-family="sans-serif">向量 v</text>

      <!-- Vector u at angle -->
      <line x1="50" y1="120" x2="200" y2="45" stroke="#f59e0b" stroke-width="2.5" marker-end="url(#arrow-vec)" />
      <text x="140" y="65" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">向量 u</text>

      <!-- Perpendicular dropping line -->
      <line x1="200" y1="45" x2="200" y2="120" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3 3" />
      <path d="M 190 120 L 190 110 L 200 110" fill="none" stroke="#f43f5e" stroke-width="1.2" />

      <!-- Projection vector on v -->
      <line x1="50" y1="120" x2="200" y2="120" stroke="#34d399" stroke-width="3.5" marker-end="url(#arrow-proj-v)" />
      
      <!-- Projection vector annotation -->
      <g transform="translate(60, 145)">
        <text x="0" y="0" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">
          正射影向量 proj_v u = [ (u · v) / |v|² ] v
        </text>
        <text x="0" y="16" fill="#94a3b8" font-size="10" font-family="sans-serif">
          投影長度 = |u · v| / |v|（u 在 v 方向的光影投影）
        </text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 6. 雙圓錐截面幾何分析 (conic-sections) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'conic-sections'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="200" rx="16" fill="#090d16" />

      <!-- Double Cone Profile Silhouette -->
      <!-- Vertex at (140, 100) -->
      <!-- Upper cone: from (80, 25) to (200, 25) to (140, 100) -->
      <polygon points="80,25 200,25 140,100" fill="#1e293b" fill-opacity="0.4" stroke="#475569" stroke-width="1.5" />
      <ellipse cx="140" cy="25" rx="60" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />

      <!-- Lower cone: from (80, 175) to (200, 175) to (140, 100) -->
      <polygon points="80,175 200,175 140,100" fill="#1e293b" fill-opacity="0.4" stroke="#475569" stroke-width="1.5" />
      <ellipse cx="140" cy="175" rx="60" ry="12" fill="none" stroke="#475569" stroke-width="1.2" />

      <!-- Vertex O -->
      <circle cx="140" cy="100" r="3" fill="#38bdf8" />
      <text x="146" y="103" fill="#94a3b8" font-size="10" font-family="sans-serif">頂點</text>

      <!-- Cutting Plane Lines -->
      <!-- 1. Circle: Horizontal line -->
      <line x1="75" y1="50" x2="205" y2="50" stroke="#38bdf8" stroke-width="2" />
      
      <!-- 2. Ellipse: Slight tilt -->
      <line x1="70" y1="80" x2="200" y2="40" stroke="#34d399" stroke-width="2" />

      <!-- 3. Parabola: Parallel to generator -->
      <line x1="100" y1="165" x2="205" y2="35" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3 3" />

      <!-- 4. Hyperbola: Vertical cut through both cones -->
      <line x1="175" y1="15" x2="175" y2="185" stroke="#f43f5e" stroke-width="2" />

      <!-- Classification Legend on the right -->
      <g transform="translate(225, 20)">
        <rect width="140" height="160" rx="10" fill="#0f172a" stroke="#1e293b" />
        <text x="12" y="24" fill="#e2e8f0" font-size="11" font-weight="bold" font-family="sans-serif">截角 θ 與母線半角 α</text>
        
        <circle cx="18" cy="46" r="4" fill="#38bdf8" />
        <text x="28" y="50" fill="#38bdf8" font-size="11" font-family="sans-serif">正圓 (θ = 90° 水平)</text>

        <circle cx="18" cy="74" r="4" fill="#34d399" />
        <text x="28" y="78" fill="#34d399" font-size="11" font-family="sans-serif">橢圓 (θ > α 封閉單葉)</text>

        <circle cx="18" cy="102" r="4" fill="#f59e0b" />
        <text x="28" y="106" fill="#f59e0b" font-size="11" font-family="sans-serif">拋物線 (θ = α 平行母線)</text>

        <circle cx="18" cy="130" r="4" fill="#f43f5e" />
        <text x="28" y="134" fill="#f43f5e" font-size="11" font-family="sans-serif">雙曲線 (θ < α 同割雙葉)</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 7. 幾何光學透鏡與面鏡動態成像實驗室 (lens-optics) -->
    <!-- ========================================================================= -->
    <OpticsSimulator v-else-if="type === 'lens-optics'" />

    <!-- ========================================================================= -->
    <!-- 8. 楊氏雙狹縫干涉 (double-slit) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'double-slit'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Slits barrier at x=70 -->
      <line x1="70" y1="20" x2="70" y2="70" stroke="#64748b" stroke-width="4" />
      <line x1="70" y1="85" x2="70" y2="105" stroke="#64748b" stroke-width="4" />
      <line x1="70" y1="120" x2="70" y2="170" stroke="#64748b" stroke-width="4" />
      <text x="40" y="76" fill="#38bdf8" font-size="10" font-family="sans-serif">S₁</text>
      <text x="40" y="124" fill="#38bdf8" font-size="10" font-family="sans-serif">S₂</text>
      <text x="76" y="99" fill="#94a3b8" font-size="9" font-family="sans-serif">間距 d</text>

      <!-- Screen at x=310 -->
      <line x1="310" y1="20" x2="310" y2="170" stroke="#475569" stroke-width="2" />
      <text x="316" y="32" fill="#94a3b8" font-size="10" font-family="sans-serif">光屏</text>

      <!-- Ray 1 from S1 to P(310, 50) -->
      <line x1="70" y1="77" x2="310" y2="50" stroke="#38bdf8" stroke-width="1.5" />
      <!-- Ray 2 from S2 to P(310, 50) -->
      <line x1="70" y1="113" x2="310" y2="50" stroke="#38bdf8" stroke-width="1.5" />
      
      <!-- Fringes pattern on screen -->
      <rect x="306" y="44" width="8" height="12" fill="#38bdf8" rx="2" />
      <text x="320" y="54" fill="#38bdf8" font-size="10" font-family="sans-serif">亮帶 (m=1)</text>

      <rect x="306" y="90" width="8" height="14" fill="#38bdf8" rx="2" />
      <text x="320" y="100" fill="#38bdf8" font-size="10" font-family="sans-serif">中央亮帶 (m=0)</text>

      <!-- Distance L indicator -->
      <line x1="70" y1="155" x2="310" y2="155" stroke="#475569" stroke-dasharray="2 2" stroke-width="1" />
      <text x="170" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">雙狹縫至光屏距離 L ⟹ 條紋間距 Δy = (L/d)λ</text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 9. 波耳氫原子能階躍遷光譜 (bohr-atom) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'bohr-atom'" 
      viewBox="0 0 380 200" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <marker id="arrow-trans" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect width="380" height="200" rx="16" fill="#090d16" />

      <!-- Energy level rungs: En = -13.6 / n^2 -->
      <!-- n=1: E1 = -13.6 (y=165) -->
      <line x1="50" y1="165" x2="330" y2="165" stroke="#38bdf8" stroke-width="2.5" />
      <text x="14" y="169" fill="#38bdf8" font-weight="bold" font-size="11" font-family="sans-serif">n = 1</text>
      <text x="336" y="169" fill="#64748b" font-size="10" font-family="sans-serif">-13.6 eV</text>

      <!-- n=2: E2 = -3.4 (y=115) -->
      <line x1="50" y1="115" x2="330" y2="115" stroke="#34d399" stroke-width="2" />
      <text x="14" y="119" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">n = 2</text>
      <text x="336" y="119" fill="#64748b" font-size="10" font-family="sans-serif">-3.4 eV</text>

      <!-- n=3: E3 = -1.51 (y=80) -->
      <line x1="50" y1="80" x2="330" y2="80" stroke="#f59e0b" stroke-width="1.5" />
      <text x="14" y="84" fill="#f59e0b" font-size="10" font-family="sans-serif">n = 3</text>
      <text x="336" y="84" fill="#64748b" font-size="10" font-family="sans-serif">-1.5 eV</text>

      <!-- n=4: E4 = -0.85 (y=55) -->
      <line x1="50" y1="55" x2="330" y2="55" stroke="#94a3b8" stroke-width="1.2" />
      <text x="14" y="59" fill="#94a3b8" font-size="10" font-family="sans-serif">n = 4</text>
      <text x="336" y="59" fill="#64748b" font-size="10" font-family="sans-serif">-0.85 eV</text>

      <!-- n=infinity: E=0 (y=30) -->
      <line x1="50" y1="30" x2="330" y2="30" stroke="#475569" stroke-width="1" stroke-dasharray="3 3" />
      <text x="14" y="34" fill="#64748b" font-size="10" font-family="sans-serif">n=∞</text>
      <text x="336" y="34" fill="#64748b" font-size="10" font-family="sans-serif">0 eV</text>

      <!-- Transition series -->
      <!-- Lyman Series to n=1 (Ultraviolet) -->
      <line x1="90" y1="115" x2="90" y2="165" stroke="#818cf8" stroke-width="2" marker-end="url(#arrow-trans)" />
      <line x1="110" y1="80" x2="110" y2="165" stroke="#818cf8" stroke-width="2" marker-end="url(#arrow-trans)" />
      <text x="75" y="145" fill="#818cf8" font-size="10" font-weight="bold" font-family="sans-serif">萊曼系 (紫外光)</text>

      <!-- Balmer Series to n=2 (Visible) -->
      <line x1="190" y1="80" x2="190" y2="115" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrow-trans)" />
      <line x1="210" y1="55" x2="210" y2="115" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow-trans)" />
      <text x="175" y="100" fill="#f43f5e" font-size="10" font-weight="bold" font-family="sans-serif">巴耳末系 (可見光)</text>

      <!-- Paschen Series to n=3 (Infrared) -->
      <line x1="280" y1="55" x2="280" y2="80" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-trans)" />
      <text x="250" y="70" fill="#f59e0b" font-size="10" font-weight="bold" font-family="sans-serif">帕申系 (紅外光)</text>

      <text x="100" y="190" fill="#94a3b8" font-size="10" font-family="sans-serif">
        光子能量 hf = |E₂ - E₁| ⟹ 躍遷至基態釋放最高能量紫外光
      </text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 10. 電磁感應與冷次定律 (lenz-law) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'lenz-law'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <defs>
        <marker id="arrow-flux" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#38bdf8" />
        </marker>
        <marker id="arrow-cur" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#f59e0b" />
        </marker>
      </defs>

      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Bar Magnet approaching from left -->
      <!-- S Pole -->
      <rect x="50" y="75" width="40" height="30" rx="3" fill="#3b82f6" />
      <text x="65" y="95" fill="#ffffff" font-weight="bold" font-size="14" font-family="sans-serif">S</text>
      <!-- N Pole -->
      <rect x="90" y="75" width="40" height="30" rx="3" fill="#ef4444" />
      <text x="105" y="95" fill="#ffffff" font-weight="bold" font-size="14" font-family="sans-serif">N</text>

      <!-- Velocity vector of magnet moving right -->
      <line x1="135" y1="90" x2="165" y2="90" stroke="#ffffff" stroke-width="2" marker-end="url(#arrow-flux)" />
      <text x="142" y="80" fill="#ffffff" font-size="10" font-family="sans-serif">靠近 v</text>

      <!-- Wire loop coil on right -->
      <ellipse cx="260" cy="90" rx="25" ry="55" fill="none" stroke="#f59e0b" stroke-width="3" />
      
      <!-- Induced N pole on loop face opposing the approaching N pole -->
      <text x="215" y="95" fill="#ef4444" font-weight="bold" font-size="14" font-family="sans-serif">N 極</text>
      
      <!-- Opposing magnetic field vector from coil pointing left -->
      <line x1="250" y1="90" x2="190" y2="90" stroke="#38bdf8" stroke-width="2" stroke-dasharray="3 3" marker-end="url(#arrow-flux)" />
      <text x="195" y="115" fill="#38bdf8" font-size="10" font-family="sans-serif">感應磁場 B_ind</text>

      <!-- Induced current direction arrows on loop -->
      <path d="M 270 45 A 25 55 0 0 1 270 135" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow-cur)" />
      <text x="290" y="95" fill="#f59e0b" font-weight="bold" font-size="11" font-family="sans-serif">感應電流 I</text>

      <text x="45" y="155" fill="#94a3b8" font-size="11" font-family="sans-serif">
        冷次定律核心口訣：<tspan fill="#34d399" font-weight="bold">「來拒去留」</tspan>——磁鐵 N 極靠近時，線圈左側產生 N 極抗拒排斥！
      </text>
    </svg>

    <!-- ========================================================================= -->
    <!-- 11. 簡諧運動 SHM 圓周投影 (shm-projection) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'shm-projection'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Left Reference Circle -->
      <circle cx="90" cy="90" r="50" fill="none" stroke="#334155" stroke-width="1.5" stroke-dasharray="3 3" />
      <circle cx="90" cy="90" r="2.5" fill="#64748b" />

      <!-- Particle P on circle at angle θ -->
      <circle cx="125" cy="55" r="4.5" fill="#f59e0b" />
      <line x1="90" y1="90" x2="125" y2="55" stroke="#f59e0b" stroke-width="1.5" />
      <text x="132" y="52" fill="#f59e0b" font-size="10" font-family="sans-serif">P(ωt)</text>
      <text x="100" y="80" fill="#94a3b8" font-size="10" font-family="sans-serif">振幅 A</text>

      <!-- Projection line from circle to horizontal oscillator -->
      <line x1="125" y1="55" x2="125" y2="150" stroke="#38bdf8" stroke-width="1.2" stroke-dasharray="2 2" />

      <!-- Horizontal oscillating track below -->
      <line x1="40" y1="150" x2="340" y2="150" stroke="#475569" stroke-width="2" />
      
      <!-- Center equilibrium mark (90, 150) -->
      <line x1="90" y1="144" x2="90" y2="156" stroke="#94a3b8" stroke-width="1.5" />
      <text x="82" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">x = 0</text>

      <!-- Amplitude marks -A and +A -->
      <line x1="40" y1="144" x2="40" y2="156" stroke="#94a3b8" stroke-width="1.5" />
      <text x="32" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">-A</text>

      <line x1="140" y1="144" x2="140" y2="156" stroke="#94a3b8" stroke-width="1.5" />
      <text x="134" y="168" fill="#94a3b8" font-size="10" font-family="sans-serif">+A</text>

      <!-- Projecting mass on track -->
      <circle cx="125" cy="150" r="5" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />
      <text x="110" y="138" fill="#38bdf8" font-size="10" font-family="sans-serif">x = A cos(ωt)</text>

      <!-- Explanation on the right -->
      <g transform="translate(195, 30)">
        <rect width="165" height="95" rx="8" fill="#0f172a" stroke="#1e293b" />
        <text x="12" y="24" fill="#34d399" font-weight="bold" font-size="11" font-family="sans-serif">SHM 的投影本質</text>
        <text x="12" y="44" fill="#e2e8f0" font-size="10" font-family="sans-serif">• 等速圓周在直徑上的投影</text>
        <text x="12" y="64" fill="#e2e8f0" font-size="10" font-family="sans-serif">• 平衡點：速度最大，合力為0</text>
        <text x="12" y="84" fill="#e2e8f0" font-size="10" font-family="sans-serif">• 端點處：速度為0，恢復力最大</text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 12. 動植物細胞構造對比 (cell-structure) -->
    <!-- ========================================================================= -->
    <svg 
      v-else-if="type === 'cell-structure'" 
      viewBox="0 0 380 180" 
      class="w-full max-w-md h-auto drop-shadow-md"
    >
      <rect width="380" height="180" rx="16" fill="#090d16" />

      <!-- Left: Plant Cell (Hexagonal with cell wall) -->
      <polygon points="40,90 65,45 135,45 160,90 135,135 65,135" fill="#14532d" fill-opacity="0.25" stroke="#22c55e" stroke-width="3" />
      <polygon points="45,90 68,50 132,50 155,90 132,130 68,130" fill="none" stroke="#86efac" stroke-width="1" />
      <!-- Nucleus -->
      <circle cx="85" cy="80" r="12" fill="#818cf8" stroke="#ffffff" stroke-width="1" />
      <!-- Large Vacuole -->
      <ellipse cx="120" cy="90" rx="18" ry="24" fill="#38bdf8" fill-opacity="0.35" stroke="#38bdf8" stroke-width="1.2" />
      <text x="105" y="94" fill="#bae6fd" font-size="9" font-family="sans-serif">大液胞</text>
      <!-- Chloroplasts -->
      <ellipse cx="75" cy="115" rx="7" ry="4" fill="#16a34a" />
      <ellipse cx="120" cy="60" rx="7" ry="4" fill="#16a34a" />
      <text x="75" y="152" fill="#22c55e" font-weight="bold" font-size="12" font-family="sans-serif">植物細胞</text>

      <!-- Right: Animal Cell (Round & flexible) -->
      <ellipse cx="270" cy="90" rx="55" ry="45" fill="#1e293b" fill-opacity="0.4" stroke="#f59e0b" stroke-width="2" />
      <!-- Nucleus -->
      <circle cx="270" cy="90" r="14" fill="#818cf8" stroke="#ffffff" stroke-width="1" />
      <text x="260" y="94" fill="#ffffff" font-size="9" font-family="sans-serif">細胞核</text>
      <!-- Small vacuoles -->
      <circle cx="240" cy="70" r="4" fill="#38bdf8" fill-opacity="0.5" />
      <circle cx="295" cy="110" r="5" fill="#38bdf8" fill-opacity="0.5" />
      <text x="245" y="152" fill="#f59e0b" font-weight="bold" font-size="12" font-family="sans-serif">動物細胞</text>

      <!-- Distinctions Legend Banner -->
      <g transform="translate(30, 8)">
        <text x="0" y="14" fill="#94a3b8" font-size="10" font-family="sans-serif">
          植物專有構造：<tspan fill="#22c55e" font-weight="bold">細胞壁</tspan>、<tspan fill="#22c55e" font-weight="bold">葉綠體</tspan>、<tspan fill="#38bdf8" font-weight="bold">大型中央液胞</tspan>
        </text>
      </g>
    </svg>

    <!-- ========================================================================= -->
    <!-- 13. 指數函數與對數函數對稱性與凹凸性 (exp-log-symmetry) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'exp-log-symmetry'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="對稱與凹凸性：y = 2^x 與 y = log₂(x) 對稱於 y = x"
        titleColor="#f59e0b"
        :width="460"
        :height="260"
        :xRange="[-3.2, 5.5]"
        :yRange="[-2.2, 5.5]"
        :padding="{ top: 26, right: 30, bottom: 24, left: 30 }"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.6 },
          { fn: (x: number) => x > 0.03 ? Math.log2(x) : NaN, domain: [0.03, 5.5], color: '#34d399', strokeWidth: 2.6 },
          { fn: (x: number) => x, color: '#f59e0b', strokeWidth: 1.5, dashArray: '4 4' }
        ]"
        :lines="[
          { x1: 0, y1: 1, x2: 1, y2: 0, color: '#64748b', strokeWidth: 1, dashArray: '2 2' },
          { x1: 1, y1: 2, x2: 2, y2: 1, color: '#64748b', strokeWidth: 1, dashArray: '2 2' },
          { x1: 2, y1: 4, x2: 4, y2: 2, color: '#64748b', strokeWidth: 1, dashArray: '2 2' },
          { x1: 0, y1: 1, x2: 2, y2: 4, color: '#f43f5e', strokeWidth: 1.6, dashArray: '3 3' },
          { x1: 1, y1: 2, x2: 1, y2: 2.5, color: '#f43f5e', strokeWidth: 1.5 }
        ]"
        :points="[
          { x: 0, y: 1, color: '#38bdf8', label: '(0, 1)', labelPos: 'left' },
          { x: 1, y: 2, color: '#38bdf8', label: '(1, 2)', labelPos: 'left' },
          { x: 2, y: 4, color: '#38bdf8', label: '(2, 4)', labelPos: 'right' },
          { x: 1, y: 0, color: '#34d399', label: '(1, 0)', labelPos: 'bottom' },
          { x: 2, y: 1, color: '#34d399', label: '(2, 1)', labelPos: 'bottom-right' },
          { x: 4, y: 2, color: '#34d399', label: '(4, 2)', labelPos: 'bottom-right' },
          { x: 1, y: 2.5, color: '#f43f5e', radius: 3.5, label: '弦中點(1, 2.5)', labelPos: 'top-left' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <!-- Curve 1 Label -->
          <text 
            :x="toScreenX(2.2) + 8" 
            :y="toScreenY(4.6)" 
            fill="#38bdf8" 
            font-size="12" 
            font-weight="bold"
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan> = 2<tspan font-style="italic" font-size="8" dy="-4">x</tspan>
            <tspan font-size="9" font-family="sans-serif" font-weight="normal" fill="#7dd3fc" dx="4">凹向上</tspan>
          </text>
          <!-- Curve 2 Label -->
          <text 
            :x="toScreenX(4.2)" 
            :y="toScreenY(2.1) - 10" 
            fill="#34d399" 
            font-size="12" 
            font-weight="bold"
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan> = log₂<tspan font-style="italic">x</tspan>
            <tspan font-size="9" font-family="sans-serif" font-weight="normal" fill="#6ee7b7" dx="4">凹向下</tspan>
          </text>
          <!-- Symmetry Axis Label -->
          <text 
            :x="toScreenX(3.8)" 
            :y="toScreenY(3.8) - 8" 
            fill="#f59e0b" 
            font-size="11" 
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan> = <tspan font-style="italic">x</tspan>（對稱軸）
          </text>
          <!-- Jensen Comparison note -->
          <text 
            :x="toScreenX(1) - 8" 
            :y="toScreenY(2.25)" 
            fill="#fda4af" 
            font-size="9" 
            font-family="sans-serif"
            text-anchor="end"
            class="chart-halo"
          >
            弦中點 2.5 > 曲線點 2.0
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        幾何核心：<span class="text-amber-400 font-bold">對稱於 y = x</span>；指數恆過 <span class="text-sky-400 font-bold">(0, 1)</span> 漸近線為 x 軸；對數恆過 <span class="text-emerald-400 font-bold">(1, 0)</span> 漸近線為 y 軸
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 14. 函數圖形平移與伸縮外觀補償法 (function-transformation) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'function-transformation'" 
      class="w-full max-w-md flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="外觀補償法：左右以 y 軸為中心、上下以 x 軸為中心"
        titleColor="#38bdf8"
        :width="420"
        :height="220"
        :xRange="[-3.5, 4.5]"
        :yRange="[-1, 6]"
        :padding="{ top: 26, right: 26, bottom: 24, left: 26 }"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#64748b', strokeWidth: 1.8, dashArray: '3 3' },
          { fn: (x: number) => Math.pow(2, x - 2), color: '#38bdf8', strokeWidth: 2.4 },
          { fn: (x: number) => Math.pow(2, x) + 2, color: '#34d399', strokeWidth: 2.4 }
        ]"
        :points="[
          { x: 0, y: 1, color: '#94a3b8', label: '(0, 1)', labelPos: 'left' },
          { x: 2, y: 1, color: '#38bdf8', label: '(2, 1)', labelPos: 'bottom-right' },
          { x: 0, y: 3, color: '#34d399', label: '(0, 3)', labelPos: 'top-left' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <!-- Horizontal translation arrow from (0, 1) to (2, 1) -->
          <line 
            :x1="toScreenX(0) + 6" 
            :y1="toScreenY(1)" 
            :x2="toScreenX(2) - 8" 
            :y2="toScreenY(1)" 
            stroke="#38bdf8" 
            stroke-width="1.8" 
            marker-end="url(#arrow-axis-generic)" 
          />
          <text 
            :x="toScreenX(1)" 
            :y="toScreenY(1) - 6" 
            fill="#38bdf8" 
            font-size="9" 
            text-anchor="middle" 
            font-family="sans-serif"
            class="chart-halo"
          >
            向右平移 2
          </text>
          
          <!-- Vertical translation arrow from (0, 1) to (0, 3) -->
          <line 
            :x1="toScreenX(0)" 
            :y1="toScreenY(1) - 6" 
            :x2="toScreenX(0)" 
            :y2="toScreenY(3) + 8" 
            stroke="#34d399" 
            stroke-width="1.8" 
            marker-end="url(#arrow-axis-generic)" 
          />
          <text 
            :x="toScreenX(0) - 8" 
            :y="toScreenY(2)" 
            fill="#34d399" 
            font-size="9" 
            text-anchor="end" 
            font-family="sans-serif"
            class="chart-halo"
          >
            向上平移 2
          </text>

          <!-- Baseline curve label -->
          <text 
            :x="toScreenX(-1.5)" 
            :y="toScreenY(Math.pow(2, -1.5)) - 8" 
            fill="#94a3b8" 
            font-size="11" 
            font-family="'KaTeX_Math', 'KaTeX_Main', serif" 
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan> = 2<tspan font-style="italic" font-size="8" dy="-4">x</tspan>
          </text>

          <!-- Shifted curves labels -->
          <text 
            :x="toScreenX(2.8)" 
            :y="toScreenY(Math.pow(2, 0.8)) + 4" 
            fill="#38bdf8" 
            font-size="11" 
            font-weight="bold" 
            font-family="'KaTeX_Math', 'KaTeX_Main', serif" 
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan> = 2<tspan font-size="8" dy="-4"><tspan font-style="italic">x</tspan> - 2</tspan>
          </text>
          <text 
            :x="toScreenX(1.4)" 
            :y="toScreenY(Math.pow(2, 1.4) + 2) - 8" 
            fill="#34d399" 
            font-size="11" 
            font-weight="bold" 
            font-family="'KaTeX_Math', 'KaTeX_Main', serif" 
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan> = 2<tspan font-style="italic" font-size="8" dy="-4">x</tspan><tspan dy="4"> + 2</tspan>
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Rule Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        外觀補償心法：<span class="text-sky-400 font-bold">左右平移以 y 軸為中心</span>內部補償；<span class="text-emerald-400 font-bold">上下平移以 x 軸為中心</span>外部增減
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 15. 超越方程式圖形交點判定 (transcendental-roots-2x) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'transcendental-roots-2x'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="超越方程式圖形判定：y₁ = 2^x 與 y₂ = x + 3"
        titleColor="#38bdf8"
        :width="460"
        :height="240"
        :xRange="[-4.2, 3.8]"
        :yRange="[-1.5, 7.5]"
        :padding="{ top: 26, right: 30, bottom: 24, left: 30 }"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.6 },
          { fn: (x: number) => x + 3, color: '#f43f5e', strokeWidth: 2.4 }
        ]"
        :points="[
          { x: -3, y: 0, color: '#f43f5e', label: '(-3, 0)', labelPos: 'bottom' },
          { x: 0, y: 3, color: '#f43f5e', label: '(0, 3)', labelPos: 'left' },
          { x: 0, y: 1, color: '#38bdf8', label: '(0, 1)', labelPos: 'right' },
          { x: -2.857, y: 0.143, color: '#f59e0b', radius: 4.5, label: '交點A(-3,-2)', labelPos: 'top-left' },
          { x: 2.457, y: 5.457, color: '#f59e0b', radius: 4.5, label: '交點B(0,3)', labelPos: 'bottom-right' }
        ]"
        :lines="[
          { x1: 0, y1: 1, x2: 0, y2: 3, color: '#f59e0b', strokeWidth: 1.2, dashArray: '2 2' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <!-- Mathematical Equation Labels on Curves with Halo -->
          <text 
            :x="toScreenX(2.8) + 8" 
            :y="toScreenY(Math.pow(2, 2.8))" 
            fill="#38bdf8" 
            font-size="12" 
            font-weight="bold"
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan><tspan font-size="8" dy="2">1</tspan><tspan dy="-2"> = 2</tspan><tspan font-style="italic" font-size="8" dy="-4">x</tspan>
          </text>
          <text 
            :x="toScreenX(-1.8)" 
            :y="toScreenY(-1.8 + 3) - 10" 
            fill="#f43f5e" 
            font-size="12" 
            font-weight="bold"
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan><tspan font-size="8" dy="2">2</tspan><tspan dy="-2"> = </tspan><tspan font-style="italic">x</tspan> + 3
          </text>
          <!-- Height comparison note at x = 0 -->
          <text 
            :x="toScreenX(0) + 6" 
            :y="toScreenY(2)" 
            fill="#fbbf24" 
            font-size="9" 
            font-family="sans-serif"
            class="chart-halo"
          >
            x=0: 直線高於指數
          </text>
        </template>
      </FunctionGraph>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        幾何破題本質：<span class="text-amber-400 font-bold">方程式實根個數 ≡ 函數圖形交點個數（恰 2 個交點）</span>，遠方指數必反超直線！
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 15-B. 範例二圖形交點判定實根區間：2^x = x + 6 (transcendental-roots-x6) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'transcendental-roots-x6'" 
      class="w-full max-w-xl flex flex-col items-center gap-2 select-none"
    >
      <FunctionGraph
        title="由圖形判定實根區間：y₁ = 2^x 與 y₂ = x + 6"
        titleColor="#38bdf8"
        :width="460"
        :height="240"
        :xRange="[-7.5, 5]"
        :yRange="[-1.5, 18]"
        :yStep="3"
        :padding="{ top: 26, right: 30, bottom: 24, left: 30 }"
        :functions="[
          { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.6 },
          { fn: (x: number) => x + 6, color: '#f43f5e', strokeWidth: 2.4 }
        ]"
        :points="[
          { x: -6, y: 0, color: '#f43f5e', label: '(-6, 0)', labelPos: 'bottom' },
          { x: 0, y: 6, color: '#f43f5e', label: '(0, 6)', labelPos: 'left' },
          { x: 0, y: 1, color: '#38bdf8', label: '(0, 1)', labelPos: 'right' },
          { x: -5.984, y: 0.016, color: '#f59e0b', radius: 4.5, label: '交點A(-6,-5)', labelPos: 'top-right' },
          { x: 3.256, y: 9.256, color: '#f59e0b', radius: 4.5, label: '交點B(3,4)', labelPos: 'bottom-right' }
        ]"
        :lines="[
          { x1: 0, y1: 1, x2: 0, y2: 6, color: '#f59e0b', strokeWidth: 1.2, dashArray: '2 2' }
        ]"
      >
        <template #default="{ toScreenX, toScreenY }">
          <text 
            :x="toScreenX(3.8) + 6" 
            :y="toScreenY(Math.pow(2, 3.8))" 
            fill="#38bdf8" 
            font-size="12" 
            font-weight="bold"
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan><tspan font-size="8" dy="2">1</tspan><tspan dy="-2"> = 2</tspan><tspan font-style="italic" font-size="8" dy="-4">x</tspan>
          </text>
          <text 
            :x="toScreenX(-3.5)" 
            :y="toScreenY(-3.5 + 6) - 10" 
            fill="#f43f5e" 
            font-size="12" 
            font-weight="bold"
            font-family="'KaTeX_Math', 'KaTeX_Main', serif"
            class="chart-halo"
          >
            <tspan font-style="italic">y</tspan><tspan font-size="8" dy="2">2</tspan><tspan dy="-2"> = </tspan><tspan font-style="italic">x</tspan> + 6
          </text>
          <text 
            :x="toScreenX(0) + 6" 
            :y="toScreenY(3.5)" 
            fill="#fbbf24" 
            font-size="9" 
            font-family="sans-serif"
            class="chart-halo"
          >
            x=0: 直線高於指數
          </text>
        </template>
      </FunctionGraph>

      <div class="w-full px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        勘根核心：直線截距 <span class="text-rose-400 font-bold">(-6, 0)</span> 與 <span class="text-rose-400 font-bold">(0, 6)</span>；在 <span class="text-amber-400 font-bold">(-6, -5)</span> 與 <span class="text-amber-400 font-bold">(3, 4)</span> 指數與直線高低互換，恰有 2 相異實根！
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 16. 觀念辨析題多圖形交點分析 (transcendental-multi-roots) -->
    <!-- ========================================================================= -->
    <div 
      v-else-if="type === 'transcendental-multi-roots'" 
      class="w-full max-w-xl flex flex-col items-center gap-2.5 select-none"
    >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        <!-- Subpanel 1: 2^x = -x -->
        <FunctionGraph
          title="(1) 2^x + x = 0 ⟹ 2^x = -x"
          titleColor="#38bdf8"
          :width="230"
          :height="175"
          :xRange="[-3.5, 2.5]"
          :yRange="[-1.5, 4.5]"
          :padding="{ top: 26, right: 18, bottom: 20, left: 20 }"
          :functions="[
            { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.4 },
            { fn: (x: number) => -x, color: '#f43f5e', strokeWidth: 2.2 }
          ]"
          :points="[
            { x: -0.641, y: 0.641, color: '#f59e0b', label: '交點A(-1,0)', labelPos: 'top-left' }
          ]"
          :badges="[
            { x: -0.5, y: -0.8, text: '恰有 1 個相異實根', color: '#e0f2fe', bgColor: '#0369a1' }
          ]"
        />

        <!-- Subpanel 2: 2^x = x^2 -->
        <FunctionGraph
          title="(2) 2^x - x² = 0 ⟹ 2^x = x²"
          titleColor="#a78bfa"
          :width="230"
          :height="175"
          :xRange="[-2.2, 4.5]"
          :yRange="[-1.5, 18]"
          :yStep="3"
          :padding="{ top: 26, right: 18, bottom: 20, left: 20 }"
          :functions="[
            { fn: (x: number) => Math.pow(2, x), color: '#38bdf8', strokeWidth: 2.4 },
            { fn: (x: number) => x * x, color: '#f59e0b', strokeWidth: 2.2 }
          ]"
          :points="[
            { x: -0.767, y: 0.588, color: '#f43f5e', label: '交點A(-1,0)', labelPos: 'top-left' },
            { x: 2, y: 4, color: '#f43f5e', label: '交點B(2,4)', labelPos: 'bottom-right' },
            { x: 4, y: 16, color: '#f43f5e', label: '交點C(4,16)', labelPos: 'top-left' }
          ]"
          :badges="[
            { x: 1.15, y: -0.8, text: '共有 3 個相異實根！', color: '#ede9fe', bgColor: '#6d28d9' }
          ]"
        />
      </div>

      <!-- Bottom Insight Legend -->
      <div class="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 text-center font-sans">
        直覺化移項本質：不用盲目運算，<span class="text-sky-400 font-bold">將方程式拆成能畫的兩圖形</span>，由交點位置與曲線走勢一目了然！
      </div>
    </div>

  </div>
</template>
