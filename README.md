# 文件加密工具（前端）

这是一个基于 React 和 Vite 的前端项目，用于在浏览器端对文件进行 AES-GCM 加密与解密。

## 功能概述

- 在浏览器中使用 Web Crypto API（crypto.subtle）执行 AES-GCM 加密与解密。
- 使用 PBKDF2 从用户密码派生 AES 密钥（默认 100000 次迭代，SHA-256）。
- 支持将原始扩展名打包到加密文件中，解密后恢复扩展名。
- 支持单文件与多文件批量处理。

## 技术栈

- React 18
- Vite 5
- Chakra UI

## 安装与运行

在项目根目录执行：

```powershell
npm install
npm run dev
```

构建生产包：

```powershell
npm run build
```

构建产物默认输出到 `public` 目录（见 `vite.config.mjs` 中的 `build.outDir` 配置）。

## Node 版本

推荐在开发与构建时使用 Node.js 18.x（也可使用 Node 20.x）。

## 安全说明

- 所有加解密操作均在客户端执行，密钥不会发送到服务器。使用时请确保运行环境可信。
- PBKDF2 的迭代次数与密钥长度可根据安全需求调整；对高安全要求场景，应考虑更强的 KDF（如 Argon2）。
- 避免在不受信任的环境中直接使用示例代码处理高度敏感的数据，正式使用前请进行安全评估与代码审计。

## 项目结构

```
/
├─ public/            # 构建输出（以及静态文件）
├─ src/
│  ├─ components/     # React 组件
│  ├─ utils/          # 工具函数（如 crypto.js）
│  ├─ App.jsx
│  └─ index.jsx
├─ package.json
├─ vite.config.mjs
└─ README.md
```

## 后续改进计划

- 在 `package.json` 添加 `engines` 字段或添加 `.nvmrc` 以固定 Node 版本。
- 为大量文件批量处理实现并发限速或生成 zip 后下载（可引入 `jszip`）。
