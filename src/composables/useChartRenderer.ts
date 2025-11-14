import { onMounted, onUnmounted, watch, ref } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { setupCanvas, clearFull } from '@/utils/canvasUtils';
import type { PerformanceObserverEntryList } from 'perf_hooks';


export function useChartRenderer(
  canvasRef: { value: HTMLCanvasElement | null },
  opts: { width: number; height: number; margin?: { left: number; right: number; top: number; bottom: number } }
) {
  const margin = opts.margin ?? { left: 40, right: 10, top: 10, bottom: 30 };
  let ctx: CanvasRenderingContext2D | null = null;
  let rafId = 0;
  const viewport = ref({ pan: 0, zoom: 1 }); 
  let dataRef: DataPoint[] = [];
  const fpsTick = ref<() => void>(() => {});

  function setData(dp: DataPoint[]) {
   
    dataRef = dp;
  }

  function setTick(fn: () => void) {
    fpsTick.value = fn;
  }

  function attach() {
    const c = canvasRef.value!;
    ctx = setupCanvas(c, opts.width, opts.height);
  }

  function worldToScreen(x: number, y: number, bounds: { w: number; h: number; startTime: number; endTime: number }) {
    const tx = ((x - bounds.startTime) / (bounds.endTime - bounds.startTime)) * bounds.w;
    
    const mid = bounds.h / 2;
    return { x: tx, y: mid - y };
  }

  function renderLoop() {
    if (!ctx) return;
    const w = opts.width;
    const h = opts.height;
    clearFull(ctx, w, h);

   
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    
    const plotW = w - margin.left - margin.right;
    const plotH = h - margin.top - margin.bottom;
    ctx.translate(margin.left, margin.top);

    const len = dataRef.length;
    if (len > 1) {
      const startTime = dataRef[0].timestamp;
      const endTime = dataRef[len - 1].timestamp;
      const timeRange = Math.max(1, endTime - startTime);

      
      let minV = Infinity;
      let maxV = -Infinity;
      for (let i = 0; i < len; i++) {
        const v = dataRef[i].value;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      }
      const vRange = Math.max(1e-6, maxV - minV);

      
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * plotH;
        ctx.moveTo(0, y);
        ctx.lineTo(plotW, y);
      }
      ctx.stroke();

      
      ctx.beginPath();
      const start = startTime;
      for (let i = 0; i < len; i++) {
        const p = dataRef[i];
        const x = ((p.timestamp - start) / timeRange) * plotW;
        const y = ((p.value - minV) / vRange) * plotH;
        const sy = plotH - y;
        if (i === 0) ctx.moveTo(x, sy);
        else ctx.lineTo(x, sy);
      }
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = '#1177dd';
      ctx.stroke();

     
      if (len <= 20000) {
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        for (let i = 0; i < len; i += Math.max(1, Math.floor(len / 2000))) {
          const p = dataRef[i];
          const x = ((p.timestamp - start) / timeRange) * plotW;
          const y = ((p.value - minV) / vRange) * plotH;
          const sy = plotH - y;
          ctx.rect(x - 0.5, sy - 0.5, 1, 1);
        }
        ctx.fillStyle = '#0b74de';
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      
      ctx.strokeStyle = '#e6e6e6';
      ctx.strokeRect(0, 0, plotW, plotH);
    }

    ctx.restore();

    
    try {
      fpsTick.value();
    } catch (err) {
    
    }

    rafId = requestAnimationFrame(renderLoop);
  }

  onMounted(() => {
    attach();
    rafId = requestAnimationFrame(renderLoop);
  });

  onUnmounted(() => {
    if (rafId) cancelAnimationFrame(rafId);
  });

  return { setData, setTick, viewport };
}
