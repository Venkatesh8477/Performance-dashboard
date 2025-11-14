import { ref, onMounted, onUnmounted } from 'vue';
import { readMemoryMB, FpsCounter } from '@/utils/performanceUtils';

const POLL_INTERVAL = 1000;

export function usePerformanceMonitor() {
  const fps = ref(0);
  const frameTime = ref(0);
  const memoryMB = ref<string>('N/A');
  const counter = new FpsCounter();

  let pollTimer: number | null = null;

  function tick() {
    counter.tick();
    const snap = counter.snapshot();
    fps.value = snap.fps;
    frameTime.value = snap.frameTimeMs;
  }

  onMounted(() => {
    pollTimer = window.setInterval(() => {
      const mem = readMemoryMB();
      memoryMB.value = mem !== undefined ? `${mem} MB` : 'N/A';
    }, POLL_INTERVAL);
  });

  onUnmounted(() => {
    if (pollTimer) window.clearInterval(pollTimer);
  });

 
  return { fps, frameTime, memoryMB, tick };
}
