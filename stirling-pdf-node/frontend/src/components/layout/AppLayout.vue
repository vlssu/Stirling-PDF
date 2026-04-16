<template>
  <div class="app-shell">
    <AppNavbar />
    <div class="app-body">
      <AppSidebar />
      <main class="app-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from "./AppNavbar.vue";
import AppSidebar from "./AppSidebar.vue";
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-body {
  display: flex;
  flex: 1;
}

.app-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
}
</style>
