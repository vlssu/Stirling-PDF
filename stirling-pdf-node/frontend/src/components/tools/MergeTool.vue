<template>
  <ToolShell title="合并 PDF" description="将多个 PDF 文件合并为一个文档">
    <FileUploader
      v-model:files="files"
      multiple
      accept=".pdf"
      hint="选择两个或更多 PDF 文件（每个最大 500 MB）"
    />

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length < 2"
        @click="handleMerge"
      >
        合并 PDF
      </el-button>
    </div>

    <el-alert v-if="error" type="error" :title="error" show-icon :closable="false" />

    <DownloadButton :blob="resultBlob" filename="merged.pdf" />
  </ToolShell>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ToolShell from "@/components/shared/ToolShell.vue";
import FileUploader from "@/components/shared/FileUploader.vue";
import DownloadButton from "@/components/shared/DownloadButton.vue";
import { useToolOperation } from "@/composables/useToolOperation";

const files = ref<File[]>([]);
const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "merge",
  endpoint: "/general/merge-pdfs",
  multiFile: true,
});

async function handleMerge() {
  if (files.value.length < 2) return;
  await execute(files.value);
}
</script>

<style scoped>
.actions {
  margin: 20px 0;
}
</style>
