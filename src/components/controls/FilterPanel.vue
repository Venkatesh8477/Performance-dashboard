<template>
  <div class="panel">
    <label>
      Min value
      <input type="number" v-model.number="min" />
    </label>
    <label>
      Max value
      <input type="number" v-model.number="max" />
    </label>
    <label>
      Category
      <select v-model="category">
        <option value="">All</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>
    <button @click="apply">Apply</button>
    <button @click="reset">Reset</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, toRefs } from 'vue';

export default defineComponent({
  name: 'FilterPanel',
  props: {
    categories: { type: Array as () => string[], default: () => [] }
  },
  emits: ['apply'],
  setup(props, { emit }) {
    const min = ref<number | null>(null);
    const max = ref<number | null>(null);
    const category = ref<string>('');
    function apply() {
      emit('apply', { min: min.value, max: max.value, category: category.value || null });
    }
    function reset() {
      min.value = null;
      max.value = null;
      category.value = '';
      apply();
    }
    return { min, max, category, apply, reset, categories: props.categories };
  }
});
</script>

<style scoped>
.panel { padding:8px; background:#fff; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.04); display:flex; gap:8px; align-items:center; flex-wrap:wrap }
label { display:flex; flex-direction:column; font-size:12px }
input, select { margin-top:6px; padding:6px; border-radius:6px; border:1px solid #e8e8e8 }
button { padding:6px 8px; border-radius:6px; background:#0b74de; color:white; border:none }
</style>
