<template>
  <ToolShell title="Merge PDF" description="Combine multiple PDF files into one document">
    <FileUploader
      v-model:files="files"
      multiple
      accept=".pdf"
      hint="Select two or more PDF files (up to 500 MB each)"
    />

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length < 2"
        @click="handleMerge"
      >
        Merge PDFs
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
