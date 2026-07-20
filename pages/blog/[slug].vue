<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div style="padding:40px">
    <h1>Blog Page</h1>
    <p>Slug: {{ route.params.slug }}</p>
  </div>
</template>