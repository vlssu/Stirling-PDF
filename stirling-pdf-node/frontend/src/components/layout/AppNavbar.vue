<template>
  <el-header class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="brand-link">
        <span class="brand-icon">📄</span>
        <span class="brand-name">Stirling PDF</span>
      </router-link>
    </div>
    <div class="navbar-actions">
      <el-text type="info" size="small">
        Node.js 版 — Vue + Express + TypeScript
      </el-text>
    </div>
  </el-header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2c3e50;
  color: white;
  padding: 0 24px;
  height: 60px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: white;
}

.brand-icon {
  font-size: 24px;
}

.brand-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

:deep(.el-text) {
  color: rgba(255, 255, 255, 0.7);
}
</style>
