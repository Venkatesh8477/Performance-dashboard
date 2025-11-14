import { ref, onMounted, onUnmounted } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';
import { generateBatch } from '@/utils/dataGenerator';


export function useDataStream(opts?: {
  batchSize?: number;
  intervalMs?: number;
  maxPoints?: number;
  series?: number;
}) {
  const batchSize = opts?.batchSize ?? 100;
  const intervalMs = opts?.intervalMs ?? 100;
  const maxPoints = opts?.maxPoints ?? 200_000;
  const series = opts?.series ?? 1;

  const buffer = ref<DataPoint[]>([]);
  let mainTimer: number | null = null;
  let worker: Worker | null = null;

  function appendBatch(batch: DataPoint[]) {
    buffer.value.push(...batch);
    if (buffer.value.length > maxPoints) {
      
      const over = buffer.value.length - maxPoints;
      buffer.value.splice(0, over);
    }
  }

  onMounted(() => {
    
    try {
      const workerSrc = `
        self.onmessage = function(e) {
          const { batchSize, intervalMs, series } = e.data;
          function generatePoint(base, i) {
            const t = base + i;
            const value = Math.sin((t + series * 13) / 1000) * (20 + (series % 3) * 5) + Math.cos((t + series * 17) / 1500) * 10 + (Math.random()-0.5)*6;
            return { timestamp: t, value, category: 's' + series };
          }
          function loop() {
            const now = Date.now();
            const out = [];
            for (let i=0;i<batchSize;i++) out.push(generatePoint(now + i, i));
            self.postMessage(out);
            setTimeout(loop, intervalMs);
          }
          loop();
        };
      `;
      const blob = new Blob([workerSrc], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      worker = new Worker(url);
      worker.onmessage = (ev) => appendBatch(ev.data as DataPoint[]);
      worker.postMessage({ batchSize, intervalMs, series });
    } catch (err) {
     
      mainTimer = window.setInterval(() => {
        appendBatch(generateBatch(Date.now(), batchSize, series));
      }, intervalMs);
    }
  });

  onUnmounted(() => {
    if (mainTimer) window.clearInterval(mainTimer);
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });

  return { buffer, appendBatch };
}
