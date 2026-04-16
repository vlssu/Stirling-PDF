<template>
  <ToolShell title="图片转 PDF" description="将 JPEG/PNG 等图片转换为 PDF 文档">
    <FileUploader
      v-model:files="files"
      multiple
      accept="image/jpeg,image/png,image/gif,image/bmp,image/webp"
      hint="选择一张或多张图片文件"
    />

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleConvert"
      >
        转换为 PDF
      </el-button>
    </div>

    <el-alert v-if="error" type="error" :title="error" show-icon :closable="false" />
    <DownloadButton :blob="resultBlob" filename="images_converted.pdf" />
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
  toolId: "imageToPdf",
  endpoint: "/convert/img/pdf",
  multiFile: true,
});

async function handleConvert() {
  if (!files.value.length) return;
  await execute(files.value);
}
</script>

<style scoped>
.actions { margin: 20px 0; }
</style>
