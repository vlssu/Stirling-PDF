<template>
  <ToolShell title="Edit Metadata" description="View and update title, author, subject and more">
    <FileUploader v-model:files="files" accept=".pdf" hint="Select a PDF file" @change="loadMeta" />

    <div v-if="metaLoaded" class="meta-form">
      <el-divider content-position="left">Current Metadata</el-divider>
      <el-form label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Title">
              <el-input v-model="meta.title" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Author">
              <el-input v-model="meta.author" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Subject">
              <el-input v-model="meta.subject" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Keywords">
              <el-input v-model="meta.keywords" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Producer">
              <el-input v-model="meta.producer" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Creator">
              <el-input v-model="meta.creator" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="actions">
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="files.length === 0"
        @click="handleUpdateMeta"
      >
        Update Metadata
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
import { uploadFilesForJson } from "@/api/client";

interface PdfMeta {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  producer?: string;
  creator?: string;
}

const files = ref<File[]>([]);
const meta = ref<PdfMeta>({});
const metaLoaded = ref(false);
const metaError = ref<string | null>(null);

const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "metadata",
  endpoint: "/misc/update-metadata",
});

const outputFilename = computed(() => {
  if (!files.value.length) return "metadata.pdf";
  return files.value[0].name.replace(".pdf", "_metadata.pdf");
});

async function loadMeta(changedFiles: File[]) {
  if (!changedFiles.length) {
    metaLoaded.value = false;
    return;
  }
  try {
    const result = await uploadFilesForJson<PdfMeta>("/misc/get-metadata", changedFiles[0]);
    meta.value = result;
    metaLoaded.value = true;
    metaError.value = null;
  } catch (err) {
    metaError.value = err instanceof Error ? err.message : String(err);
    metaLoaded.value = false;
  }
}

async function handleUpdateMeta() {
  if (!files.value.length) return;
  await execute(files.value[0], {
    title: meta.value.title ?? "",
    author: meta.value.author ?? "",
    subject: meta.value.subject ?? "",
    keywords: meta.value.keywords ?? "",
    producer: meta.value.producer ?? "",
    creator: meta.value.creator ?? "",
  });
}
</script>

<style scoped>
.meta-form { margin: 16px 0; }
.actions { margin: 20px 0; }
</style>
