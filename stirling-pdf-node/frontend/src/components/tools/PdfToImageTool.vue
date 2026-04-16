<template>
  <ToolShell title="PDF to Images" description="Convert PDF pages to PNG images (requires pdftoppm)">
    <FileUploader v-model:files="files" accept=".pdf" hint="Select a PDF file" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="Resolution (DPI)">
        <el-select v-model="dpi" style="width:100%">
          <el-option :value="72" label="72 DPI (screen)" />
          <el-option :value="150" label="150 DPI (medium)" />
          <el-option :value="300" label="300 DPI (print quality)" />
        </el-select>
        <el-text type="info" size="small">
          Requires <code>pdftoppm</code> (poppler-utils) to be installed on the server.
        </el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleConvert"
      >
        Convert to Images
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
const dpi = ref(150);

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "pdfToImage",
  endpoint: "/convert/pdf/img",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "images.zip";
  return files.value[0].name.replace(".pdf", "_images.zip");
});

async function handleConvert() {
  if (!files.value.length) return;
  await execute(files.value[0], { dpi: dpi.value });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
