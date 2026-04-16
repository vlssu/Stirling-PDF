import { ref } from "vue";
import { uploadFiles, downloadBlob } from "@/api/client";
import type { ToolOperationConfig } from "@/types/tool";

/**
 * Composable that wraps a PDF tool API call.
 * All HTTP requests are made via native fetch (via api/client.ts).
 */
export function useToolOperation(config: ToolOperationConfig) {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const resultBlob = ref<Blob | null>(null);

  /**
   * Execute the tool operation.
   * @param files  Single file or array of files to upload
   * @param params Extra form fields (e.g. angle, password, etc.)
   */
  async function execute(
    files: File | File[],
    params: Record<string, string | number | boolean> = {}
  ): Promise<void> {
    loading.value = true;
    error.value = null;
    resultBlob.value = null;

    try {
      const blob = await uploadFiles(
        config.endpoint,
        files,
        params,
        "fileInput"
      );
      resultBlob.value = blob;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Trigger a browser download of the result.
   */
  function download(filename: string): void {
    if (resultBlob.value) {
      downloadBlob(resultBlob.value, filename);
    }
  }

  function reset(): void {
    resultBlob.value = null;
    error.value = null;
  }

  return { loading, error, resultBlob, execute, download, reset };
}
