import type { DataPoint } from '@/types/dashboard.types';


export function generatePoint(baseTs: number, index: number, series = 1): DataPoint {
  const t = baseTs + index;
 
  const value =
    Math.sin((t + series * 13) / 1000) * (20 + (series % 3) * 5) +
    Math.cos((t + series * 17) / 1500) * 10 +
    (Math.random() - 0.5) * 6;
  return { timestamp: t, value, category: `s${series}` };
}


export function generateBatch(baseTs: number, count: number, series = 1): DataPoint[] {
  const out: DataPoint[] = new Array(count);
  for (let i = 0; i < count; i++) out[i] = generatePoint(baseTs + i, i, series);
  return out;
}
