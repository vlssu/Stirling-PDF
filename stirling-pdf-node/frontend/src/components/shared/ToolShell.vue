<template>
  <div class="tool-shell">
    <div class="tool-header">
      <el-page-header @back="$router.push('/')">
        <template #content>
          <span class="tool-title">{{ title }}</span>
        </template>
      </el-page-header>
      <p class="tool-description">{{ description }}</p>
    </div>

    <el-card class="tool-card">
      <slot />
    </el-card>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
}

withDefaults(defineProps<Props>(), {
  description: "",
});
</script>

<style scoped>
.tool-shell {
  max-width: 800px;
  margin: 0 auto;
}

.tool-header {
  margin-bottom: 20px;
}

.tool-title {
  font-size: 20px;
  font-weight: 600;
}

.tool-description {
  margin: 8px 0 0;
  color: #606266;
  font-size: 14px;
}

.tool-card {
  border-radius: 8px;
}
</style>
