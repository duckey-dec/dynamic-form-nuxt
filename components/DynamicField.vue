<script setup lang="ts">
import type { FieldDef } from '~/composables/usePageSchema'

const props = defineProps<{
  field: FieldDef
  modelValue: any
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

const { emptyRowFor } = usePageSchema()

// Ensure array fields always have an array to render, even if the
// source data was null/undefined.
const rows = computed<any[]>({
  get: () => (Array.isArray(props.modelValue) ? props.modelValue : []),
  set: (val) => emit('update:modelValue', val)
})

function updateLeaf(value: any) {
  emit('update:modelValue', value)
}

function updateRowField(rowIndex: number, childKey: string, value: any) {
  const next = rows.value.map((r) => ({ ...r }))
  next[rowIndex] = { ...next[rowIndex], [childKey]: value }
  rows.value = next
}

// --- "shopping cart" behaviors ---------------------------------
function addRow() {
  const children = props.field.children || []
  rows.value = [...rows.value, emptyRowFor(children)]
}

function removeRow(index: number) {
  rows.value = rows.value.filter((_, i) => i !== index)
}

function moveRow(index: number, dir: -1 | 1) {
  const target = index + dir
  if (target < 0 || target >= rows.value.length) return
  const next = [...rows.value]
  ;[next[index], next[target]] = [next[target], next[index]]
  rows.value = next
}
</script>

<template>
  <!-- ARRAY FIELD: repeatable rows, cart-style add/remove/reorder -->
  <div v-if="field.type === 'array'" class="df-array">
    <label class="df-label">{{ field.label || field.key }}</label>

    <div v-if="!rows.length" class="df-array-empty">
      No {{ (field.label || field.key).toLowerCase() }} yet.
    </div>

    <transition-group name="df-row" tag="div" class="df-rows">
      <div v-for="(row, i) in rows" :key="i" class="df-row-card">
        <div class="df-row-header">
          <span class="df-row-index">#{{ i + 1 }}</span>
          <div class="df-row-actions">
            <button type="button" class="df-icon-btn" :disabled="i === 0" @click="moveRow(i, -1)">↑</button>
            <button type="button" class="df-icon-btn" :disabled="i === rows.length - 1" @click="moveRow(i, 1)">↓</button>
            <button type="button" class="df-icon-btn df-remove" @click="removeRow(i)">✕ Remove</button>
          </div>
        </div>

        <div class="df-row-fields">
          <DynamicField
            v-for="child in field.children || []"
            :key="child.key"
            :field="child"
            :model-value="row[child.key]"
            @update:model-value="(v) => updateRowField(i, child.key, v)"
          />
        </div>
      </div>
    </transition-group>

    <button type="button" class="df-add-btn" @click="addRow">
      + Add {{ field.label || field.key }}
    </button>
  </div>

  <!-- LEAF FIELDS -->
  <div v-else class="df-field">
    <label class="df-label">
      {{ field.label || field.key }}
      <span v-if="field.required" class="df-required">*</span>
    </label>

    <textarea
      v-if="field.type === 'richtext' || field.type === 'textarea'"
      class="df-input df-textarea"
      :maxlength="field.max_length || undefined"
      :value="modelValue ?? ''"
      @input="updateLeaf(($event.target as HTMLTextAreaElement).value)"
    />

    <label v-else-if="field.type === 'boolean'" class="df-checkbox-row">
      <input
        type="checkbox"
        :checked="!!modelValue"
        @change="updateLeaf(($event.target as HTMLInputElement).checked)"
      />
      <span>{{ modelValue ? 'Yes' : 'No' }}</span>
    </label>

    <div v-else-if="field.type === 'image'" class="df-image-field">
      <input
        type="text"
        class="df-input"
        placeholder="Image URL"
        :value="modelValue ?? ''"
        @input="updateLeaf(($event.target as HTMLInputElement).value)"
      />
      <img v-if="modelValue" :src="modelValue" class="df-image-preview" alt="" />
    </div>

    <input
      v-else
      :type="field.type === 'url' ? 'url' : 'text'"
      class="df-input"
      :maxlength="field.max_length || undefined"
      :value="modelValue ?? ''"
      @input="updateLeaf(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<style scoped>
.df-field, .df-array { margin-bottom: 1rem; }
.df-label { display: block; font-size: 0.85rem; font-weight: 600; color: #374151; margin-bottom: 0.35rem; }
.df-required { color: #dc2626; }
.df-input {
  width: 100%; padding: 0.55rem 0.7rem; border: 1px solid #d1d5db; border-radius: 8px;
  font-size: 0.9rem; background: #fff; box-sizing: border-box;
}
.df-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
.df-textarea { min-height: 90px; resize: vertical; font-family: inherit; }
.df-checkbox-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; }
.df-image-field { display: flex; align-items: center; gap: 0.6rem; }
.df-image-preview { width: 42px; height: 42px; border-radius: 6px; object-fit: cover; border: 1px solid #e5e7eb; }

.df-array-empty { font-size: 0.85rem; color: #9ca3af; padding: 0.5rem 0; }
.df-rows { display: flex; flex-direction: column; gap: 0.75rem; }
.df-row-card {
  border: 1px solid #e5e7eb; border-radius: 10px; padding: 0.9rem;
  background: #fafafa;
}
.df-row-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; }
.df-row-index { font-size: 0.75rem; font-weight: 700; color: #6366f1; }
.df-row-actions { display: flex; gap: 0.35rem; }
.df-icon-btn {
  border: 1px solid #d1d5db; background: #fff; border-radius: 6px; font-size: 0.75rem;
  padding: 0.25rem 0.5rem; cursor: pointer; color: #374151;
}
.df-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.df-icon-btn.df-remove { color: #dc2626; border-color: #fecaca; }
.df-icon-btn.df-remove:hover { background: #fef2f2; }
.df-row-fields { padding-left: 0.25rem; border-left: 2px solid #e5e7eb; padding-left: 0.75rem; }

.df-add-btn {
  margin-top: 0.6rem; border: 1px dashed #a5b4fc; background: #eef2ff; color: #4338ca;
  border-radius: 8px; padding: 0.5rem 0.9rem; font-size: 0.85rem; font-weight: 600; cursor: pointer;
}
.df-add-btn:hover { background: #e0e7ff; }

.df-row-enter-active, .df-row-leave-active { transition: all 0.2s ease; }
.df-row-enter-from, .df-row-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
