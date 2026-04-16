<template>
  <div class="download-section" v-if="blob">
    <el-alert type="success" :closable="false" class="success-alert">
      <template #title>
        <div class="success-content">
          <el-icon><CircleCheckFilled /></el-icon>
          <span>Processing complete!</span>
        </div>
      </template>
      <p>Your file is ready to download.</p>
    </el-alert>
    <el-button
      type="primary"
      size="large"
      @click="handleDownload"
      class="download-btn"
    >
      <el-icon><Download /></el-icon>
      Download {{ filename }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { CircleCheckFilled, Download } from "@element-plus/icons-vue";
import { downloadBlob } from "@/api/client";

interface Props {
  blob: Blob | null;
  filename: string;
}

const props = defineProps<Props>();

function handleDownload() {
  if (props.blob) {
    downloadBlob(props.blob, props.filename);
  }
}
</script>

<style scoped>
.download-section {
  margin-top: 20px;
}

.success-alert {
  margin-bottom: 16px;
}

.success-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.download-btn {
  width: 100%;
}
</style>
