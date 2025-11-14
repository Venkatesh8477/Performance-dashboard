<template>
  <div class="chart-card" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="canvas" />
    <div class="overlay-controls">
      <button @click="doZoomIn">+</button>
      <button @click="doZoomOut">-</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { useChartRenderer } from '@/composables/useChartRenderer';
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor';

export default defineComponent({
  name: 'LineChart',
  props: {
    data: { type: Array as () => DataPoint[], required: true },
    width: { type: Number, default: 1200 },
    height: { type: Number, default: 360 }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    const { setData, setTick } = useChartRenderer(canvas, { width: props.width, height: props.height });
    const perf = usePerformanceMonitor();

    // expose fps via perf monitor (parent can observe)
    const tick = () => perf.tick();
    setTick(tick);

    watch(
      () => props.data,
      (v) => {
        // pass sliced reference (caller should keep slice)
        setData(v);
      }
    );

    function doZoomIn() {
      // TODO: simple placeholder for zoom UI, advanced zoom managed in renderer
      // Not necessary to re-render here since the renderer uses the dataRef
    }
    function doZoomOut() {}

    return { canvas, doZoomIn, doZoomOut, fps: perf.fps, frameTime: perf.frameTime, memory: perf.memoryMB };
  }
});
</script>

<style scoped>
.chart-card {
  position: relative;
  background: white;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(0,0,0,0.06);
  overflow: hidden;
}
canvas { display:block; width:100%; height:100% }
.overlay-controls { position:absolute; right:8px; top:8px; display:flex; gap:6px }
</style>
