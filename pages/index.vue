<script setup lang="ts">
const { page, loading, error, fetchPage, toBlogJson } = usePageSchema()

const endpoint = ref('blog')
const slug = ref('complete-guide-for-businesses-on-sending-otp-messages')
const showJson = ref(false)

async function load() {
  await fetchPage(endpoint.value, slug.value).catch(() => {})
}

const jsonPreview = computed(() =>
  page.value ? JSON.stringify(toBlogJson(), null, 2) : ''
)

function downloadJson() {
  const blob = new Blob([jsonPreview.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug.value || 'blog'}.json`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(load)
</script>

<template>
  <div class="wrap">
    <header class="topbar">
      <div>
        <h1>Dynamic Blog Form</h1>
        <p class="subtitle">Live schema from the page-builder API — array fields work like a shopping cart: add, remove, reorder.</p>
      </div>
    </header>

    <div class="fetch-bar">
      <input v-model="endpoint" class="df-input" placeholder="endpoint (e.g. blog)" />
      <input v-model="slug" class="df-input slug-input" placeholder="page slug" />
      <button class="primary-btn" :disabled="loading" @click="load">
        {{ loading ? 'Loading…' : 'Fetch' }}
      </button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <main v-if="page">
      <h2 class="page-title">{{ page.title }}</h2>

      <DynamicForm
        v-for="component in page.components"
        :key="component.id"
        :component="component"
      />

      <div class="actions">
        <button class="primary-btn" @click="showJson = !showJson">
          {{ showJson ? 'Hide' : 'Preview' }} blog.json
        </button>
        <button class="secondary-btn" @click="downloadJson">Download blog.json</button>
      </div>

      <pre v-if="showJson" class="json-preview">{{ jsonPreview }}</pre>
    </main>

    <p v-else-if="!loading && !error" class="empty">Enter a slug above and hit Fetch.</p>
  </div>
</template>

<style scoped>
.wrap { max-width: 860px; margin: 0 auto; padding: 2rem 1.25rem 4rem; font-family: system-ui, -apple-system, sans-serif; }
.topbar h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
.subtitle { color: #6b7280; font-size: 0.9rem; margin: 0 0 1.5rem; }
.fetch-bar { display: flex; gap: 0.6rem; margin-bottom: 1.5rem; }
.slug-input { flex: 1; }
.df-input {
  padding: 0.55rem 0.7rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 0.9rem;
}
.primary-btn {
  background: #4f46e5; color: #fff; border: none; border-radius: 8px; padding: 0.55rem 1.1rem;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
}
.primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.secondary-btn {
  background: #fff; color: #374151; border: 1px solid #d1d5db; border-radius: 8px; padding: 0.55rem 1.1rem;
  font-size: 0.9rem; font-weight: 600; cursor: pointer;
}
.page-title { font-size: 1.15rem; margin-bottom: 1rem; }
.actions { display: flex; gap: 0.6rem; margin-top: 1rem; }
.json-preview {
  margin-top: 1rem; background: #0f172a; color: #e2e8f0; padding: 1rem; border-radius: 10px;
  font-size: 0.78rem; overflow-x: auto; max-height: 420px;
}
.error { color: #dc2626; font-size: 0.9rem; }
.empty { color: #9ca3af; font-size: 0.9rem; }
</style>
