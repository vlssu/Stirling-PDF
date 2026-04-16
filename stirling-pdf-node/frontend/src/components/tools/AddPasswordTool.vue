<template>
  <ToolShell title="添加密码" description="为 PDF 设置用户访问密码">
    <FileUploader v-model:files="files" accept=".pdf" hint="选择一个 PDF 文件" />

    <el-form label-position="top" class="params-form" v-if="files.length > 0">
      <el-form-item label="用户密码（打开文件时需要输入）">
        <el-input v-model="password" type="password" show-password placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="所有者密码（可选，默认与用户密码相同）">
        <el-input v-model="ownerPassword" type="password" show-password placeholder="请输入所有者密码" />
      </el-form-item>
      <el-form-item label="加密强度">
        <el-radio-group v-model="keyLength">
          <el-radio-button :value="256">256 位 AES</el-radio-button>
          <el-radio-button :value="128">128 位 RC4</el-radio-button>
          <el-radio-button :value="40">40 位 RC4</el-radio-button>
        </el-radio-group>
        <el-text type="info" size="small">需要在服务器上安装 qpdf。</el-text>
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
        添加密码
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
