<template>
  <div class="chart-card" :style="{ width: width + 'px', height: height + 'px' }">
    <canvas ref="canvas" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { setupCanvas, clearFull } from '@/utils/canvasUtils';

export default defineComponent({
  name: 'ScatterPlot',
  props: {
    data: { type: Array as () => DataPoint[], required: true },
    width: { type: Number, default: 800 },
    height: { type: Number, default: 300 }
  },
  setup(props) {
    const canvas = ref<HTMLCanvasElement | null>(null);
    let ctx: CanvasRenderingContext2D | null = null;

    function draw() {
      if (!canvas.value) return;
      if (!ctx) ctx = setupCanvas(canvas.value, props.width, props.height);
      clearFull(ctx, props.width, props.height);

      const plotW = props.width - 40;
      const plotH = props.height - 30;
      ctx.save();
      ctx.translate(20, 10);

      const len = props.data.length;
      if (!len) return;
      let minV = Infinity, maxV = -Infinity;
      const start = props.data[0].timestamp;
      const end = props.data[len - 1].timestamp;
      for (let i = 0; i < len; i++) {
        const v = props.data[i].value;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
      const vRange = Math.max(1e-6, maxV - minV);
      ctx.fillStyle = '#e85d75';
      ctx.beginPath();
      // draw subsampled scatter for performance
      const step = Math.max(1, Math.floor(len / 3000));
      for (let i = 0; i < len; i += step) {
        const p = props.data[i];
        const x = ((p.timestamp - start) / (end - start)) * plotW;
        const y = plotH - ((p.value - minV) / vRange) * plotH;
        ctx.rect(x - 1, y - 1, 2, 2);
      }
      ctx.fill();
      ctx.restore();
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
