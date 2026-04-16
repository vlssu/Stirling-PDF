<template>
  <ToolShell title="压缩 PDF" description="使用 Ghostscript 减小 PDF 文件体积（需要服务器已安装 Ghostscript）">
    <FileUploader v-model:files="files" accept=".pdf" hint="选择一个 PDF 文件" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="质量 / 压缩级别">
        <el-select v-model="quality" style="width: 100%">
          <el-option value="screen" label="屏幕（最小，72 DPI）" />
          <el-option value="ebook" label="电子书（中等，150 DPI）" />
          <el-option value="printer" label="打印（高质量，300 DPI）" />
          <el-option value="prepress" label="印前（最高，色彩管理）" />
          <el-option value="default" label="默认" />
        </el-select>
        <el-text type="info" size="small">
          需要在服务器上安装 Ghostscript（<code>gs</code>）。
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
        压缩 PDF
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
