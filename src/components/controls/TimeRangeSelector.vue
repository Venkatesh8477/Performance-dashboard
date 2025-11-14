<template>
  <div class="panel">
    <label>
      Range (ms)
      <select v-model.number="range">
        <option :value="60000">1 min</option>
        <option :value="300000">5 min</option>
        <option :value="3600000">1 hour</option>
        <option :value="null">All</option>
      </select>
    </label>
    <button @click="apply">Apply</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'TimeRangeSelector',
  emits: ['apply'],
  setup(_, { emit }) {
    const range = ref<number | null>(60000);
    function apply() {
      emit('apply', range.value);
    }
    return { range, apply };
  }
});
</script>

<style scoped>
.panel { padding:8px; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.04); display:flex; gap:8px; align-items:center }
select { padding:6px; border-radius:6px }
button { padding:6px 8px; border-radius:6px; background:#0b74de; color:white; border:none }
</style>
