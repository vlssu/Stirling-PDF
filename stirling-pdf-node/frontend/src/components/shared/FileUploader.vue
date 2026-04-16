<template>
  <div
    class="file-uploader"
    :class="{ 'drag-over': isDragging }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="triggerFileInput"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      class="file-input-hidden"
      @change="onFileChange"
    />

    <div class="upload-placeholder" v-if="!files.length">
      <el-icon class="upload-icon" size="48"><UploadFilled /></el-icon>
      <p class="upload-text">
        <strong>Click to upload</strong> or drag and drop
      </p>
      <p class="upload-hint">{{ hint }}</p>
    </div>

    <div v-else class="file-list">
      <div
        v-for="(file, idx) in files"
        :key="idx"
        class="file-item"
      >
        <el-icon><Document /></el-icon>
        <span class="file-name">{{ file.name }}</span>
        <span class="file-size">{{ formatSize(file.size) }}</span>
        <el-button
          type="danger"
          size="small"
          text
          circle
          @click.stop="removeFile(idx)"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <div class="add-more" @click.stop="triggerFileInput" v-if="multiple">
        <el-icon><Plus /></el-icon>
        <span>Add more files</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UploadFilled, Document, Close, Plus } from "@element-plus/icons-vue";

interface Props {
  multiple?: boolean;
  accept?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false,
  accept: ".pdf",
  hint: "PDF files up to 500 MB",
});

const emit = defineEmits<{
  (e: "update:files", files: File[]): void;
  (e: "change", files: File[]): void;
}>();

const isDragging = ref(false);
const files = ref<File[]>([]);
const inputRef = ref<HTMLInputElement | null>(null);

function triggerFileInput() {
  inputRef.value?.click();
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const droppedFiles = Array.from(e.dataTransfer?.files ?? []);
  addFiles(droppedFiles);
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  addFiles(Array.from(input.files ?? []));
  input.value = "";
}

function addFiles(newFiles: File[]) {
  if (props.multiple) {
    files.value = [...files.value, ...newFiles];
  } else {
    files.value = newFiles.slice(0, 1);
  }
  emit("update:files", files.value);
  emit("change", files.value);
}

function removeFile(idx: number) {
  files.value.splice(idx, 1);
  emit("update:files", files.value);
  emit("change", files.value);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style scoped>
.file-uploader {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-uploader:hover,
.drag-over {
  border-color: #409eff;
  background: #ecf5ff;
}

.file-input-hidden {
  display: none;
}

.upload-placeholder {
  text-align: center;
  color: #909399;
}

.upload-icon {
  color: #c0c4cc;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  margin: 8px 0 4px;
}

.upload-hint {
  font-size: 12px;
  color: #c0c4cc;
}

.file-list {
  width: 100%;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  margin-bottom: 8px;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.file-size {
  color: #909399;
  font-size: 12px;
  white-space: nowrap;
}

.add-more {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: #409eff;
  cursor: pointer;
  border: 1px dashed #409eff;
  border-radius: 6px;
  font-size: 13px;
}

.add-more:hover {
  background: #ecf5ff;
}
</style>
