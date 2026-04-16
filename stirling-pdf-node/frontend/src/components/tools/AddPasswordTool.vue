<template>
  <ToolShell title="Add Password" description="Protect a PDF with a user password">
    <FileUploader v-model:files="files" accept=".pdf" hint="Select a PDF file" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="User password (required to open the file)">
        <el-input v-model="password" type="password" show-password placeholder="Enter password" />
      </el-form-item>
      <el-form-item label="Owner password (optional, defaults to user password)">
        <el-input v-model="ownerPassword" type="password" show-password placeholder="Enter owner password" />
      </el-form-item>
      <el-form-item label="Encryption strength">
        <el-radio-group v-model="keyLength">
          <el-radio-button :value="256">256-bit AES</el-radio-button>
          <el-radio-button :value="128">128-bit RC4</el-radio-button>
          <el-radio-button :value="40">40-bit RC4</el-radio-button>
        </el-radio-group>
        <el-text type="info" size="small">Requires qpdf to be installed on the server.</el-text>
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0 || !password"
        @click="handleAddPassword"
      >
        Add Password
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
const ownerPassword = ref("");
const keyLength = ref(256);

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "addPassword",
  endpoint: "/security/add-password",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "encrypted.pdf";
  return files.value[0].name.replace(".pdf", "_encrypted.pdf");
});

async function handleAddPassword() {
  if (!files.value.length || !password.value) return;
  await execute(files.value[0], {
    password: password.value,
    ownerPassword: ownerPassword.value || password.value,
    keyLength: keyLength.value,
  });
}
</script>

<style scoped>
.params-form { margin-top: 16px; }
.actions { margin: 20px 0; }
</style>
