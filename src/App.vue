<template>
  <div class="app">
    <div class="left">
      <div class="toolbar">
        <label>Batch
          <input type="number" v-model.number="batchSize" />
        </label>
        <label>Interval ms
          <input type="number" v-model.number="intervalMs" />
        </label>
        <button @click="toggleRunning">{{ running ? 'Stop' : 'Start' }}</button>
        <button @click="stress">Stress 10k</button>
        <filter-panel :categories="categories" @apply="onFilter" />
        <time-range-selector @apply="onTimeRange" />
      </div>

      <line-chart :data="displayData" :width="1100" :height="380" />
      <div style="display:flex; gap:12px; margin-top:12px;">
        <bar-chart :data="displayData" :width="560" :height="220" />
        <scatter-plot :data="displayData" :width="560" :height="220" />
      </div>
      <heatmap :data="displayData" :width="1100" :height="180" />
    </div>

    <div class="right">
      <div class="metrics">
        <h3>Metrics</h3>
        <div>FPS: {{ fps }}</div>
        <div>Frame ms: {{ frameTime }}ms</div>
        <div>Data points: {{ buffer.length }}</div>
        <div>Memory: {{ memory }}</div>
      </div>

      <data-table :rows="tableRows" :viewportHeight="360" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch } from 'vue';
import LineChart from '@/components/charts/LineChart.vue';
import BarChart from '@/components/charts/BarChart.vue';
import ScatterPlot from '@/components/charts/ScatterPlot.vue';
import Heatmap from '@/components/charts/Heatmap.vue';
import DataTable from '@/components/DataTable.vue';
import FilterPanel from '@/components/controls/FilterPanel.vue';
import TimeRangeSelector from '@/components/controls/TimeRangeSelector.vue';
import { useDataStream } from '@/composables/useDataStream';
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor';

export default defineComponent({
  name: 'App',
  components: {
    LineChart,
    BarChart,
    ScatterPlot,
    Heatmap,
    DataTable,
    FilterPanel,
    TimeRangeSelector
  },
  setup() {
    const batchSize = ref(500);
    const intervalMs = ref(100);
    const running = ref(true);
    const series = ref(1);

    const { buffer } = useDataStream({ batchSize: batchSize.value, intervalMs: intervalMs.value, series: series.value, maxPoints: 200000 });

    
    const perf = usePerformanceMonitor();
    const fps = perf.fps;
    const frameTime = perf.frameTime;
    const memory = perf.memoryMB;

    
    const filter = ref<{ min?: number | null; max?: number | null; category?: string | null }>({});
    const timeRange = ref<number | null>(60000); // 1 min default

    function onFilter(payload: any) {
      filter.value = payload;
    }
    function onTimeRange(ms: number | null) {
      timeRange.value = ms;
    }

    
    const displayData = computed(() => {
      if (!buffer.value || buffer.value.length === 0) return [];
      let arr = buffer.value;
      if (timeRange.value) {
        const cutoff = Date.now() - timeRange.value;
        
        let idx = 0;
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i].timestamp < cutoff) { idx = i + 1; break; }
        }
        arr = arr.slice(idx);
      }
      if (filter.value) {
        const { min, max, category } = filter.value;
        if (min != null || max != null || category) {
          arr = arr.filter((p) => {
            if (min != null && p.value < min) return false;
            if (max != null && p.value > max) return false;
            if (category && p.category !== category) return false;
            return true;
          });
        }
      }
      
      if (arr.length > 10000) arr = arr.slice(arr.length - 10000);
      return arr;
    });


    const tableRows = computed(() => {
      const arr = buffer.value;
      return arr.slice(Math.max(0, arr.length - 2000));
    });

    
    const categories = computed(() => {
      const set = new Set<string>();
      for (let i = Math.max(0, buffer.value.length - 5000); i < buffer.value.length; i++) {
        const p = buffer.value[i];
        if (p && p.category) set.add(p.category);
      }
      return Array.from(set);
    });

    function toggleRunning() {
      running.value = !running.value;
     

    function stress() {
     
      batchSize.value = 10000;
    }

  
    return {
      batchSize,
      intervalMs,
      running,
      buffer,
      fps,
      frameTime,
      memory,
      displayData,
      tableRows,
      categories,
      onFilter,
      onTimeRange,
      toggleRunning,
      stress
    };
  }
});
</script>

<style scoped>
.app { display:flex; height:100vh; gap:12px; padding:12px; background:#f5f7fb; font-family:Inter,system-ui,sans-serif }
.left { flex:1; display:flex; flex-direction:column; gap:12px }
.right { width:380px; display:flex; flex-direction:column; gap:12px }
.toolbar { display:flex; gap:8px; align-items:center; padding:8px; background:#fff; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06) }
.metrics { padding:12px; background:#fff; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06) }
</style>
