<template>
  <el-aside width="220px" class="sidebar">
    <el-menu
      :default-active="currentPath"
      router
      class="sidebar-menu"
    >
      <el-menu-item index="/">
        <el-icon><House /></el-icon>
        <span>首页</span>
      </el-menu-item>

      <el-menu-item-group
        v-for="(label, category) in TOOL_CATEGORIES"
        :key="category"
        :title="label"
      >
        <el-menu-item
          v-for="tool in toolsByCategory(category)"
          :key="tool.id"
          :index="`/tool/${tool.id}`"
        >
          <span>{{ tool.name }}</span>
        </el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { House } from "@element-plus/icons-vue";
import { TOOLS, TOOL_CATEGORIES } from "@/data/tools";
import type { ToolCategory } from "@/types/tool";

const route = useRoute();
const currentPath = computed(() => route.path);

function toolsByCategory(category: string) {
  return TOOLS.filter((t) => t.category === (category as ToolCategory));
}
</script>

<style scoped>
.sidebar {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  overflow-y: auto;
}

.sidebar-menu {
  border-right: none;
  height: 100%;
}

:deep(.el-menu-item-group__title) {
  font-size: 11px;
  font-weight: 600;
  color: #909399;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 12px 20px 4px;
}
</style>
