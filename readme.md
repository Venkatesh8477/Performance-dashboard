# ⚡ Performance-Critical Data Visualization Dashboard (Vue 3 + TypeScript)

A high-performance real-time dashboard built with **Vue 3 Composition API**, **Canvas-based rendering**, **Web Workers**, and **Vite**.  
The system can smoothly handle **10,000+ data points at 60fps**, supports real-time updates, and includes optimized charting components (Line, Bar, Scatter, Heatmap) written from scratch.

---

## 🚀 Features

### **Core**
- Real-time time-series streaming (100ms interval)
- Web Worker data generation (fallback to main thread)
- Canvas-based charts (60fps target)
- Virtualized data table (thousands of rows)
- Interactive filtering + time range selection
- Memory-efficient sliding-window model
- FPS + memory performance monitor

### **Charts Included**
- LineChart (high-density)
- BarChart (aggregated buckets)
- ScatterPlot (subsampled)
- Heatmap (cell-based grid renderer)

---

## 🛠️ Setup

### 1️⃣ Install dependencies
```bash
npm install
