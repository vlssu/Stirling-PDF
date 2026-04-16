<template>
  <ToolShell title="Office to PDF" description="Convert Word, Excel, or PowerPoint to PDF (requires LibreOffice)">
    <FileUploader
      v-model:files="files"
      accept=".doc,.docx,.xls,.xlsx,.ppt,.pptx,.odt,.ods,.odp,.rtf,.txt,.csv"
      hint="Select an Office document"
    />
    <el-text type="info" size="small">
      Requires <code>libreoffice</code> to be installed on the server.
    </el-text>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleConvert"
      >
        Convert to PDF
      </el-button>
    </div>

    <el-alert v-if="error" type="error" :title="error" show-icon :closable="false" />
    <DownloadButton :blob="resultBlob" :filename="outputFilename" />
  </ToolShell>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ToolShell from "@/components/shared/ToolShell.vue";
import FileUploader from "@/components/shared/FileUploader.vue";
import DownloadButton from "@/components/shared/DownloadButton.vue";
import { useToolOperation } from "@/composables/useToolOperation";

const files = ref<File[]>([]);

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "officeToPdf",
  endpoint: "/convert/office/pdf",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "converted.pdf";
  const name = files.value[0].name;
  const base = name.substring(0, name.lastIndexOf(".")) || name;
  return `${base}_converted.pdf`;
});

async function handleConvert() {
  if (!files.value.length) return;
  await execute(files.value[0]);
}
</script>

<style scoped>
.actions { margin: 20px 0; }
</style>
