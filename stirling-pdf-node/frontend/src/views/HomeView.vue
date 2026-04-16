<template>
  <div class="home-view">
    <div class="hero">
      <h1>Stirling PDF <span class="badge">Node.js 版</span></h1>
      <p>强大的开源 PDF 处理工具 — 基于 Vue 3 + Express + TypeScript 构建</p>
    </div>

    <div v-for="category in categoriesWithTools" :key="category.id" class="category-section">
      <h2 class="category-title">{{ category.label }}</h2>
      <div class="tools-grid">
        <router-link
          v-for="tool in category.tools"
          :key="tool.id"
          :to="`/tool/${tool.id}`"
          class="tool-card"
        >
          <div class="tool-icon">
            <component :is="iconMap[tool.icon] ?? defaultIcon" />
          </div>
          <div class="tool-info">
            <h3 class="tool-name">{{ tool.name }}</h3>
            <p class="tool-desc">{{ tool.description }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Files,
  Scissor,
  Refresh,
  Document,
  Delete,
  Lock,
  Unlock,
  Edit,
  Fold,
  InfoFilled,
  Picture,
  PictureFilled,
  CopyDocument,
} from "@element-plus/icons-vue";
import type { Component } from "vue";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";

const iconMap: Record<string, Component> = {
  Files,
  Scissor,
  Refresh,
  Document,
  Delete,
  Lock,
  Unlock,
  Edit,
  Fold,
  InfoFilled,
  Picture,
  PictureFilled,
  CopyDocument,
};
const defaultIcon = Document;

const categoriesWithTools = computed(() => {
  return Object.entries(TOOL_CATEGORIES).map(([id, label]) => ({
    id,
    label,
    tools: TOOLS.filter((t) => t.category === id),
  }));
});
</script>

<style scoped>
.home-view {
  max-width: 1100px;
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 32px 0 40px;
}

.hero h1 {
  font-size: 36px;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 8px;
}

.badge {
  font-size: 14px;
  font-weight: 600;
  background: #409eff;
  color: white;
  padding: 2px 10px;
  border-radius: 12px;
  vertical-align: middle;
}

.hero p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.category-section {
  margin-bottom: 40px;
}

.category-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.tool-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 24px 16px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  cursor: pointer;
}

.tool-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.tool-icon {
  font-size: 36px;
  color: #409eff;
  margin-bottom: 12px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.tool-icon .el-icon) {
  font-size: 36px;
}

.tool-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 6px;
}

.tool-desc {
  font-size: 12px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}
</style>
