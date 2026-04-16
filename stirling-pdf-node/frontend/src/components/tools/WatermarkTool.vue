<template>
  <ToolShell title="添加水印" description="在 PDF 所有页面上添加文字水印">
    <FileUploader v-model:files="files" accept=".pdf" hint="选择一个 PDF 文件" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="水印文字">
        <el-input v-model="text" placeholder="例如：机密文件" />
      </el-form-item>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="字体大小">
            <el-input-number v-model="fontSize" :min="10" :max="200" :step="5" style="width:100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="不透明度（0–1）">
            <el-slider v-model="opacity" :min="0" :max="1" :step="0.05" show-input />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="旋转角度（°）">
            <el-input-number v-model="rotation" :min="-180" :max="180" :step="15" style="width:100%" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0 || !text"
        @click="handleWatermark"
      >
        添加水印
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
const text = ref("WATERMARK");
const fontSize = ref(50);
const opacity = ref(0.3);
const rotation = ref(45);

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "watermark",
  endpoint: "/security/add-watermark",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "watermarked.pdf";
  return files.value[0].name.replace(".pdf", "_watermarked.pdf");
});

async function handleWatermark() {
  if (!files.value.length || !text.value) return;
  await execute(files.value[0], {
    text: text.value,
    fontSize: fontSize.value,
    opacity: opacity.value,
    rotation: rotation.value,
  });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
