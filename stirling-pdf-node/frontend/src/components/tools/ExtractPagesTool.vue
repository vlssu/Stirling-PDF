<template>
  <ToolShell title="Extract Pages" description="Extract specific pages from a PDF into a new file">
    <FileUploader v-model:files="files" accept=".pdf" hint="Select a PDF file" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="Pages to extract">
        <el-input
          v-model="pageNumbers"
          placeholder='e.g. "1,3,5-7" or "all"'
        />
        <el-text type="info" size="small">
          Use 1-based page numbers. Examples: "1,3", "2-5", "1,3,5-8", "all"
        </el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleExtract"
      >
        Extract Pages
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
const pageNumbers = ref("all");

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "extractPages",
  endpoint: "/general/extract-pages",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "extracted.pdf";
  return files.value[0].name.replace(".pdf", "_extracted.pdf");
});

async function handleExtract() {
  if (!files.value.length) return;
  await execute(files.value[0], { pageNumbers: pageNumbers.value });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
