<template>
  <ToolShell title="旋转 PDF" description="将 PDF 中所有页面按指定角度旋转">
    <FileUploader
      v-model:files="files"
      accept=".pdf"
      hint="选择一个 PDF 文件"
    />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="旋转角度">
        <el-radio-group v-model="angle">
          <el-radio-button :value="90">顺时针 90°</el-radio-button>
          <el-radio-button :value="180">180°</el-radio-button>
          <el-radio-button :value="270">逆时针 90°</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleRotate"
      >
        旋转 PDF
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
const angle = ref(90);

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "rotate",
  endpoint: "/general/rotate-pdf",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "rotated.pdf";
  const base = files.value[0].name.replace(".pdf", "");
  return `${base}_rotated.pdf`;
});

async function handleRotate() {
  if (!files.value.length) return;
  await execute(files.value[0], { angle: angle.value });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
