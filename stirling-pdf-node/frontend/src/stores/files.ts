import { defineStore } from "pinia";
import { ref } from "vue";

export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
}

function generateId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useFilesStore = defineStore("files", () => {
  const files = ref<UploadedFile[]>([]);
  const currentToolId = ref<string | null>(null);

  function addFile(file: File): UploadedFile {
    const entry: UploadedFile = {
      id: generateId(),
      file,
      name: file.name,
      size: file.size,
    };
    files.value.push(entry);
    return entry;
  }

  function addFiles(newFiles: File[]): UploadedFile[] {
    return newFiles.map(addFile);
  }

  function removeFile(id: string): void {
    const idx = files.value.findIndex((f) => f.id === id);
    if (idx >= 0) files.value.splice(idx, 1);
  }

  function clearFiles(): void {
    files.value = [];
  }

  function setCurrentTool(toolId: string | null): void {
    currentToolId.value = toolId;
  }

  return {
    files,
    currentToolId,
    addFile,
    addFiles,
    removeFile,
    clearFiles,
    setCurrentTool,
  };
});
