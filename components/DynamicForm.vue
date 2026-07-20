<script setup lang="ts">
import type { PageComponent } from '~/composables/usePageSchema'

const props = defineProps<{
  component: PageComponent
}>()

function updateField(key: string, value: any) {
  props.component.data[key] = value
}
</script>

<template>
  <div class="df-block">
    <div class="df-block-header">
      <h3>{{ component.definition.name }}</h3>
      <code class="df-block-slug">{{ component.definition.slug }}</code>
    </div>

    <div class="df-block-fields">
      <DynamicField
        v-for="field in component.definition.fields"
        :key="field.key"
        :field="field"
        :model-value="component.data[field.key]"
        @update:model-value="(v) => updateField(field.key, v)"
      />
    </div>
  </div>
</template>

<style scoped>
.df-block {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
  padding: 1.25rem 1.4rem; margin-bottom: 1.25rem;
}
.df-block-header {
  display: flex; align-items: baseline; gap: 0.6rem; margin-bottom: 1rem;
  border-bottom: 1px solid #f1f1f4; padding-bottom: 0.6rem;
}
.df-block-header h3 { margin: 0; font-size: 1rem; text-transform: capitalize; }
.df-block-slug { font-size: 0.7rem; color: #9ca3af; }
</style>
