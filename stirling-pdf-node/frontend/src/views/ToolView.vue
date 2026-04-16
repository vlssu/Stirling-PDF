<template>
  <div class="tool-view">
    <component :is="toolComponent" v-if="toolComponent" />
    <el-empty
      v-else
      description="工具未找到"
      :image-size="120"
    >
      <el-button @click="$router.push('/')">返回首页</el-button>
    </el-empty>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Component } from "vue";
import type { ToolId } from "@/types/tool";

// Tool components (lazy-loaded for code splitting)
import MergeTool from "@/components/tools/MergeTool.vue";
import SplitTool from "@/components/tools/SplitTool.vue";
import RotateTool from "@/components/tools/RotateTool.vue";
import CompressTool from "@/components/tools/CompressTool.vue";
import ExtractPagesTool from "@/components/tools/ExtractPagesTool.vue";
import RemovePagesTool from "@/components/tools/RemovePagesTool.vue";
import AddPasswordTool from "@/components/tools/AddPasswordTool.vue";
import RemovePasswordTool from "@/components/tools/RemovePasswordTool.vue";
import WatermarkTool from "@/components/tools/WatermarkTool.vue";
import MetadataTool from "@/components/tools/MetadataTool.vue";
import ImageToPdfTool from "@/components/tools/ImageToPdfTool.vue";
import PdfToImageTool from "@/components/tools/PdfToImageTool.vue";
import OfficeToPdfTool from "@/components/tools/OfficeToPdfTool.vue";

const TOOL_MAP: Record<ToolId, Component> = {
  merge: MergeTool,
  split: SplitTool,
  rotate: RotateTool,
  compress: CompressTool,
  extractPages: ExtractPagesTool,
  removePages: RemovePagesTool,
  addPassword: AddPasswordTool,
  removePassword: RemovePasswordTool,
  watermark: WatermarkTool,
  metadata: MetadataTool,
  imageToPdf: ImageToPdfTool,
  pdfToImage: PdfToImageTool,
  officeToPdf: OfficeToPdfTool,
};

interface Props {
  toolId: string;
}

const props = defineProps<Props>();

const toolComponent = computed(() => {
  return TOOL_MAP[props.toolId as ToolId] ?? null;
});
</script>

<style scoped>
.tool-view {
  padding: 8px 0;
}
</style>
