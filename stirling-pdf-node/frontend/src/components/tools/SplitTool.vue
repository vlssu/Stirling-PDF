<template>
  <ToolShell title="拆分 PDF" description="将 PDF 拆分为独立页面或指定页面范围">
    <FileUploader
      v-model:files="files"
      accept=".pdf"
      hint="选择一个 PDF 文件（最大 500 MB）"
    />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="拆分页面（可选）">
        <el-input
          v-model="pageNumbers"
          placeholder='例如 "1,3,5-7"，留空则拆分所有页面'
        />
        <el-text type="info" size="small">
          使用基于 1 的页码或页码范围指定拆分点，留空则逐页拆分。
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
        拆分 PDF
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
