<template>
  <ToolShell title="Rotate PDF" description="Rotate all pages in a PDF by a chosen angle">
    <FileUploader
      v-model:files="files"
      accept=".pdf"
      hint="Select a PDF file"
    />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="Rotation angle">
        <el-radio-group v-model="angle">
          <el-radio-button :value="90">90°</el-radio-button>
          <el-radio-button :value="180">180°</el-radio-button>
          <el-radio-button :value="270">270°</el-radio-button>
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
        Rotate PDF
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
