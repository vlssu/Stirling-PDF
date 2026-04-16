<template>
  <ToolShell title="Remove Password" description="Remove password protection from a PDF">
    <FileUploader v-model:files="files" accept=".pdf" hint="Select a password-protected PDF" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="Current password">
        <el-input v-model="password" type="password" show-password placeholder="Enter the current password" />
        <el-text type="info" size="small">Requires qpdf to be installed on the server.</el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleRemovePassword"
      >
        Remove Password
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
const password = ref("");

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "removePassword",
  endpoint: "/security/remove-password",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "decrypted.pdf";
  return files.value[0].name.replace(".pdf", "_decrypted.pdf");
});

async function handleRemovePassword() {
  if (!files.value.length) return;
  await execute(files.value[0], { password: password.value });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
