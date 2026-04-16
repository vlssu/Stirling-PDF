# Stirling PDF — Node.js 版

[Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF) 的 Node.js 移植版，**前后端一体化**单项目结构：

| 层级 | 技术 |
|------|------|
| **后端** | [Express 5](https://expressjs.com/) + TypeScript |
| **前端** | [Vue 3](https://vuejs.org/) + [Vite](https://vitejs.dev/) + TypeScript |
| **UI 库** | [Element Plus](https://element-plus.org/)（中文） |
| **状态管理** | [Pinia](https://pinia.vuejs.org/) |
| **PDF 处理** | [pdf-lib](https://pdf-lib.js.org/) |
| **文件上传** | [multer](https://github.com/expressjs/multer) |

---

## 支持的功能

| 工具 | API 端点 |
|------|----------|
| 合并 PDF | `POST /api/v1/general/merge-pdfs` |
| 拆分 PDF | `POST /api/v1/general/split-pages` |
| 旋转 PDF | `POST /api/v1/general/rotate-pdf` |
| 提取页面 | `POST /api/v1/general/extract-pages` |
| 删除页面 | `POST /api/v1/general/remove-pages` |
| 添加密码 | `POST /api/v1/security/add-password` |
| 移除密码 | `POST /api/v1/security/remove-password` |
| 添加水印 | `POST /api/v1/security/add-watermark` |
| 压缩 PDF | `POST /api/v1/misc/compress-pdf` |
| 获取/更新元数据 | `POST /api/v1/misc/get-metadata`、`POST /api/v1/misc/update-metadata` |
| 图片转 PDF | `POST /api/v1/convert/img/pdf` |
| PDF 转图片 | `POST /api/v1/convert/pdf/img` |
| Office 转 PDF | `POST /api/v1/convert/office/pdf` |
| 空白页检测 | `POST /api/v1/filter/blank-pages` |

---

## 项目结构

```
stirling-pdf-node/
├── package.json          # 统一依赖（前后端合并）
├── tsconfig.json         # 前端 TypeScript 配置（vue-tsc）
├── tsconfig.server.json  # 后端 TypeScript 配置（tsc 编译）
├── tsconfig.node.json    # vite.config.ts 配置
├── vite.config.ts        # Vite 配置（前端入口）
├── index.html            # 前端 HTML 入口
│
├── backend/              # Express + TypeScript 后端源码
│   └── src/
│       ├── app.ts                # 应用入口
│       ├── controllers/          # API 控制器
│       ├── services/pdfService.ts
│       ├── middleware/
│       └── utils/
│
└── frontend/             # Vue 3 + TypeScript 前端源码
    └── src/
        ├── main.ts
        ├── App.vue
        ├── api/client.ts
        ├── composables/
        ├── components/
        ├── views/
        └── ...
```

---

## 系统依赖

| 依赖 | 版本要求 | 用途 |
|------|----------|------|
| **Node.js** | ≥ 18.0.0 | 所有功能 |
| **Ghostscript (`gs`)** | 任意 | 压缩 PDF |
| **qpdf** | 任意 | 添加 / 移除密码 |
| **LibreOffice** | 任意 | Office 转 PDF |
| **poppler-utils (`pdftoppm`)** | 任意 | PDF 转图片 |

---

## 快速开始

### 安装依赖

```bash
cd stirling-pdf-node
npm install
```

### 开发模式（一键启动前后端）

```bash
npm run dev
# 后端监听 http://localhost:3001
# 前端开发服务器 http://localhost:5173（自动代理 /api/* 至后端）
```

打开浏览器访问 [http://localhost:5173](http://localhost:5173)。

### 单独启动

```bash
# 仅后端
npm run dev:server

# 仅前端
npm run dev:client
```

### 生产构建

```bash
# 1. 构建前端 SPA（输出到 public/）
# 2. 编译后端 TypeScript（输出到 dist/）
npm run build

# 启动生产服务（同时提供前端静态文件和 API）
npm start
# 访问 http://localhost:3001
```

---

## API 参考

所有端点接受 `multipart/form-data`，文件字段名为 `fileInput`。

### 合并 PDF
```
POST /api/v1/general/merge-pdfs
字段: fileInput[]（2 个或更多 PDF 文件）
返回: application/pdf
```

### 拆分 PDF
```
POST /api/v1/general/split-pages
字段: fileInput（PDF），pageNumbers（可选，例如 "1,3,5-7"）
返回: application/zip
```

### 旋转 PDF
```
POST /api/v1/general/rotate-pdf
字段: fileInput（PDF），angle（90 | 180 | 270）
返回: application/pdf
```

### 添加密码
```
POST /api/v1/security/add-password
字段: fileInput（PDF），password，ownerPassword（可选），keyLength（40|128|256）
返回: application/pdf
依赖: qpdf
```

### 移除密码
```
POST /api/v1/security/remove-password
字段: fileInput（PDF），password
返回: application/pdf
依赖: qpdf
```

### 添加水印
```
POST /api/v1/security/add-watermark
字段: fileInput（PDF），text，fontSize（默认 50），opacity（默认 0.3），rotation（默认 45）
返回: application/pdf
```

### 压缩 PDF
```
POST /api/v1/misc/compress-pdf
字段: fileInput（PDF），quality（screen|ebook|printer|prepress|default）
返回: application/pdf
依赖: Ghostscript（gs）
```

### 获取元数据
```
POST /api/v1/misc/get-metadata
字段: fileInput（PDF）
返回: application/json { title, author, subject, keywords, producer, creator }
```

### 更新元数据
```
POST /api/v1/misc/update-metadata
字段: fileInput（PDF），title，author，subject，keywords，producer，creator
返回: application/pdf
```

### 图片转 PDF
```
POST /api/v1/convert/img/pdf
字段: fileInput[]（JPEG/PNG 图片）
返回: application/pdf
```

### PDF 转图片
```
POST /api/v1/convert/pdf/img
字段: fileInput（PDF），dpi（72|150|300，默认 150）
返回: image/png（单页）| application/zip（多页）
依赖: pdftoppm（poppler-utils）
```

### Office 转 PDF
```
POST /api/v1/convert/office/pdf
字段: fileInput（Office 文档）
返回: application/pdf
依赖: LibreOffice
```

---

## 架构说明

### fetch-only HTTP 客户端

前端所有 HTTP 请求使用原生 `fetch`，无 axios 依赖。参见 `frontend/src/api/client.ts`。

### useToolOperation 组合式函数

每个工具通过统一的组合式函数管理状态：

```typescript
const { loading, error, resultBlob, execute } = useToolOperation({
  toolId: "merge",
  endpoint: "/general/merge-pdfs",
  multiFile: true,
});
```

### PDF 处理

- 纯 Node.js 操作（合并、拆分、旋转、水印、元数据）→ **pdf-lib**
- 压缩 → **Ghostscript CLI**（`gs`）
- 加密 → **qpdf CLI**
- Office 转换 → **LibreOffice CLI**
- PDF 渲染 → **pdftoppm CLI**（poppler-utils）

