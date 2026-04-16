<template>
  <ToolShell title="提取页面" description="从 PDF 中提取指定页面并保存为新文件">
    <FileUploader v-model:files="files" accept=".pdf" hint="选择一个 PDF 文件" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="要提取的页面">
        <el-input
          v-model="pageNumbers"
          placeholder='例如 "1,3,5-7" 或 "all"'
        />
        <el-text type="info" size="small">
          使用基于 1 的页码，示例：「1,3」「2-5」「1,3,5-8」「all」
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
        提取页面
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
