<template>
  <div class="table-card" ref="scroll" @scroll="onScroll">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div
        v-for="(r, idx) in visibleRows"
        :key="r.timestamp + '-' + idx"
        :style="getStyle(idx)"
        class="row"
      >
        <div class="cell">{{ new Date(r.timestamp).toLocaleTimeString() }}.{{ String(r.timestamp % 1000).padStart(3,'0') }}</div>
        <div class="cell">{{ r.value.toFixed(2) }}</div>
        <div class="cell">{{ r.category ?? '-' }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import type { DataPoint } from '@/types/dashboard.types';

export default defineComponent({
  name: 'DataTable',
  props: {
    rows: { type: Array as () => DataPoint[], default: () => [] },
    rowHeight: { type: Number, default: 36 },
    viewportHeight: { type: Number, default: 300 }
  },
  setup(props) {
    const scroll = ref<HTMLElement | null>(null);
    const top = ref(0);
    function onScroll() {
      if (scroll.value) top.value = scroll.value.scrollTop;
    }
    const totalHeight = computed(() => props.rows.length * props.rowHeight);
    const startIndex = computed(() => Math.floor(top.value / props.rowHeight));
    const visibleCount = computed(() => Math.min(props.rows.length, Math.ceil(props.viewportHeight / props.rowHeight) + 10));
    const visibleRows = computed(() => props.rows.slice(startIndex.value, startIndex.value + visibleCount.value));

    function getStyle(i: number) {
      return {
        position: 'absolute',
        top: `${(startIndex.value + i) * props.rowHeight}px`,
        left: '0',
        right: '0',
        height: `${props.rowHeight}px`,
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        padding: '0 8px',
        borderBottom: '1px solid #f2f2f2',
        background: 'white'
      };
    }

    onMounted(() => {
      if (scroll.value) scroll.value.style.height = `${props.viewportHeight}px`;
    });

    watch(() => props.rows, () => {
      
      if (!scroll.value) return;
      scroll.value.scrollTop = Math.max(0, totalHeight.value - props.viewportHeight);
    });

    return { scroll, onScroll, totalHeight, visibleRows, getStyle };
  }
});
</script>

<style scoped>
.table-card { background:#fff; border-radius:8px; box-shadow:0 6px 18px rgba(0,0,0,0.06); overflow:auto }
.row .cell { min-width:0; padding:6px 8px; font-size:13px }
</style>
