<template>
  <ToolShell title="Split PDF" description="Split a PDF into separate pages or page ranges">
    <FileUploader
      v-model:files="files"
      accept=".pdf"
      hint="Select a PDF file (up to 500 MB)"
    />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="Pages to split at (optional)">
        <el-input
          v-model="pageNumbers"
          placeholder='e.g. "1,3,5-7" or leave empty for all pages'
        />
        <el-text type="info" size="small">
          Specify page numbers (1-based) or ranges to split at. Leave blank to split every page.
        </el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleSplit"
      >
        Split PDF
      </el-button>
    </div>

    <el-alert v-if="error" type="error" :title="error" show-icon :closable="false" />

    <DownloadButton :blob="resultBlob" :filename="splitFilename" />
  </ToolShell>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import ToolShell from "@/components/shared/ToolShell.vue";
import FileUploader from "@/components/shared/FileUploader.vue";
import DownloadButton from "@/components/shared/DownloadButton.vue";
import { useToolOperation } from "@/composables/useToolOperation";

const files = ref<File[]>([]);
const pageNumbers = ref("");

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "split",
  endpoint: "/general/split-pages",
});

const splitFilename = computed(() => {
  if (!files.value.length) return "split.zip";
  const base = files.value[0].name.replace(".pdf", "");
  return `${base}_split.zip`;
});

async function handleSplit() {
  if (!files.value.length) return;
  await execute(files.value[0], { pageNumbers: pageNumbers.value });
}
</script>

<style scoped>
.params-form {
  margin-top: 16px;
}
.actions {
  margin: 20px 0;
}
</style>
