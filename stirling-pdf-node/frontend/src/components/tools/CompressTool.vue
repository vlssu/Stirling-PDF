<template>
  <ToolShell title="Compress PDF" description="Reduce file size using Ghostscript (must be installed)">
    <FileUploader v-model:files="files" accept=".pdf" hint="Select a PDF file" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="Quality / Compression level">
        <el-select v-model="quality" style="width: 100%">
          <el-option value="screen" label="Screen (smallest, 72 DPI)" />
          <el-option value="ebook" label="eBook (medium, 150 DPI)" />
          <el-option value="printer" label="Printer (high, 300 DPI)" />
          <el-option value="prepress" label="Prepress (highest, colour managed)" />
          <el-option value="default" label="Default" />
        </el-select>
        <el-text type="info" size="small">
          Requires Ghostscript (<code>gs</code>) to be installed on the server.
        </el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleCompress"
      >
        Compress PDF
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
const quality = ref("ebook");

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "compress",
  endpoint: "/misc/compress-pdf",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "compressed.pdf";
  return files.value[0].name.replace(".pdf", "_compressed.pdf");
});

async function handleCompress() {
  if (!files.value.length) return;
  await execute(files.value[0], { quality: quality.value });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
