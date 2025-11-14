<template>
  <div class="chart-card" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { setupCanvas, clearFull } from '@/utils/canvasUtils';

function valueToColor(v: number, max: number) {
  const ratio = Math.max(0, Math.min(1, v / max));
  const r = Math.floor(255 * ratio);
  const g = Math.floor(180 * (1 - ratio));
  const b = Math.floor(255 * (1 - ratio * 0.8));
  return `rgb(${r},${g},${b})`;
}

export default defineComponent({
  name: 'Heatmap',
  props: {
    data: { type: Array as () => DataPoint[], required: true },
    width: { type: Number, default: 800 },
    height: { type: Number, default: 300 },
    cols: { type: Number, default: 200 }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    let ctx: CanvasRenderingContext2D | null = null;

    function draw() {
      if (!canvas.value) return;
      if (!ctx) ctx = setupCanvas(canvas.value, props.width, props.height);
      clearFull(ctx, props.width, props.height);
      const plotW = props.width;
      const plotH = props.height;
      const cols = props.cols;
      const rows = Math.max(1, Math.ceil(props.data.length / cols));
      const cellW = plotW / cols;
      const cellH = plotH / rows;
      // accumulate value per cell
      const grid = new Float64Array(cols * rows);
      let max = 0;
      for (let i = 0; i < props.data.length; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const idx = row * cols + col;
        grid[idx] += Math.abs(props.data[i].value);
        if (grid[idx] > max) max = grid[idx];
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const v = grid[r * cols + c];
          ctx!.fillStyle = valueToColor(v, max || 1);
          ctx!.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }
    }

    watch(
      () => props.data,
      () => requestAnimationFrame(draw),
      { deep: false }
    );

    return { canvas };
  }
});
</script>

<style scoped>
.chart-card { background:white; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06) }
canvas { display:block; width:100%; height:100% }
</style>
