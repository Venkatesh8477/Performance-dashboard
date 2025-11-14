export interface DataPoint {
  timestamp: number; 
  value: number;
  category?: string;
  [k: string]: any;
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  memoryMB?: number;
}
