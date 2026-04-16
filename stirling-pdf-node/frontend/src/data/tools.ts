import type { ToolDefinition } from "@/types/tool";

export const TOOLS: ToolDefinition[] = [
  // ── 通用 ───────────────────────────────────────────────────────────────────
  {
    id: "merge",
    name: "合并 PDF",
    description: "将多个 PDF 文件合并为一个文档",
    icon: "Files",
    category: "general",
    endpoint: "/general/merge-pdfs",
    multiFile: true,
  },
  {
    id: "split",
    name: "拆分 PDF",
    description: "将 PDF 拆分为独立页面或指定页面范围",
    icon: "Scissor",
    category: "general",
    endpoint: "/general/split-pages",
  },
  {
    id: "rotate",
    name: "旋转 PDF",
    description: "将 PDF 中的页面旋转 90°、180° 或 270°",
    icon: "Refresh",
    category: "general",
    endpoint: "/general/rotate-pdf",
  },
  {
    id: "extractPages",
    name: "提取页面",
    description: "从 PDF 中提取指定页面并保存为新文件",
    icon: "Document",
    category: "general",
    endpoint: "/general/extract-pages",
  },
  {
    id: "removePages",
    name: "删除页面",
    description: "从 PDF 中删除指定页面",
    icon: "Delete",
    category: "general",
    endpoint: "/general/remove-pages",
  },
  // ── 安全 ───────────────────────────────────────────────────────────────────
  {
    id: "addPassword",
    name: "添加密码",
    description: "为 PDF 设置访问密码保护",
    icon: "Lock",
    category: "security",
    endpoint: "/security/add-password",
  },
  {
    id: "removePassword",
    name: "移除密码",
    description: "解除 PDF 的密码保护",
    icon: "Unlock",
    category: "security",
    endpoint: "/security/remove-password",
  },
  {
    id: "watermark",
    name: "添加水印",
    description: "在 PDF 所有页面上添加文字水印",
    icon: "Edit",
    category: "security",
    endpoint: "/security/add-watermark",
  },
  // ── 杂项 ───────────────────────────────────────────────────────────────────
  {
    id: "compress",
    name: "压缩 PDF",
    description: "使用 Ghostscript 减小 PDF 文件体积",
    icon: "Fold",
    category: "misc",
    endpoint: "/misc/compress-pdf",
  },
  {
    id: "metadata",
    name: "编辑元数据",
    description: "查看并更新 PDF 的标题、作者等元数据",
    icon: "InfoFilled",
    category: "misc",
    endpoint: "/misc/update-metadata",
  },
  // ── 转换 ───────────────────────────────────────────────────────────────────
  {
    id: "imageToPdf",
    name: "图片转 PDF",
    description: "将 JPEG/PNG 等图片转换为 PDF 文档",
    icon: "Picture",
    category: "convert",
    endpoint: "/convert/img/pdf",
    multiFile: true,
  },
  {
    id: "pdfToImage",
    name: "PDF 转图片",
    description: "将 PDF 页面转换为 PNG 图片",
    icon: "PictureFilled",
    category: "convert",
    endpoint: "/convert/pdf/img",
  },
  {
    id: "officeToPdf",
    name: "Office 转 PDF",
    description: "将 Word / Excel / PowerPoint 文件转换为 PDF",
    icon: "CopyDocument",
    category: "convert",
    endpoint: "/convert/office/pdf",
  },
];

export const TOOL_CATEGORIES: Record<string, string> = {
  general: "通用",
  security: "安全",
  convert: "转换",
  misc: "杂项",
};
