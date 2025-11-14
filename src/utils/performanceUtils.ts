import type { PerformanceMetrics } from '@/types/dashboard.types';

export function readMemoryMB(): number | undefined {
  const nav: any = performance as any;
  if (nav && nav.memory && nav.memory.usedJSHeapSize) {
    return Math.round(nav.memory.usedJSHeapSize / 1024 / 1024);
  }
  return undefined;
}


export class FpsCounter {
  private frames = 0;
  private last = performance.now();
  fps = 0;
  frameTimeMs = 0;

  tick() {
    const now = performance.now();
    this.frames++;
    this.frameTimeMs = now - this.last;
    if (now - this.last >= 250) {
      this.fps = Math.round((this.frames * 1000) / (now - this.last));
      this.frames = 0;
      this.last = now;
    }
  }

  snapshot(): PerformanceMetrics {
    return { fps: this.fps, frameTimeMs: Math.round(this.frameTimeMs) };
  }
}
