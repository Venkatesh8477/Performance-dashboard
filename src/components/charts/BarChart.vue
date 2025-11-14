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
  name: 'BarChart',
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
      const plotW = props.width - 60;
      const plotH = props.height - 40;
      ctx.save();
      ctx.translate(40, 10);

      const len = props.data.length;
      if (!len) return;

      // simple aggregation: bucket into 100 bars for performance
      const buckets = 100;
      const bucketVals = new Float64Array(buckets);
      const start = props.data[0].timestamp;
      const end = props.data[len - 1].timestamp;
      const range = Math.max(1, end - start);
      for (let i = 0; i < len; i++) {
        const p = props.data[i];
        const idx = Math.floor(((p.timestamp - start) / range) * (buckets - 1));
        bucketVals[Math.max(0, Math.min(buckets - 1, idx))] += p.value;
      }
      const maxV = Math.max(...Array.from(bucketVals)) || 1;
      const bw = plotW / buckets;
      ctx.fillStyle = '#0b74de';
      for (let i = 0; i < buckets; i++) {
        const h = (bucketVals[i] / maxV) * plotH;
        ctx.fillRect(i * bw, plotH - h, Math.max(1, bw - 1), h);
      }
      ctx.restore();
    }

    watch(
      () => props.data,
      () => {
        // throttle: requestAnimationFrame boundary
        requestAnimationFrame(draw);
      },
      { deep: false }
    );

    // mount
    return { canvas };
  }
});
</script>

<style scoped>
.chart-card { background:white; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06) }
canvas { display:block; width:100%; height:100% }
</style>
