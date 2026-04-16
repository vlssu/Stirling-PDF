<template>
  <ToolShell title="删除页面" description="从 PDF 中删除指定页面">
    <FileUploader v-model:files="files" accept=".pdf" hint="选择一个 PDF 文件" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="要删除的页面">
        <el-input
          v-model="pageNumbers"
          placeholder='例如 "1,3,5-7"'
        />
        <el-text type="info" size="small">
          使用基于 1 的页码，示例：「1」「2,4」「3-6」
        </el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="danger"
        size="large"
        :loading="loading"
        :disabled="files.length === 0 || !pageNumbers"
        @click="handleRemove"
      >
        删除页面
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
const pageNumbers = ref("");

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "removePages",
  endpoint: "/general/remove-pages",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "pages_removed.pdf";
  return files.value[0].name.replace(".pdf", "_pages_removed.pdf");
});

async function handleRemove() {
  if (!files.value.length || !pageNumbers.value) return;
  await execute(files.value[0], { pageNumbers: pageNumbers.value });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
