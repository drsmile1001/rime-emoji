# Bun CLI Template

這是一個基於 [Bun](https://bun.sh/) 與 [cac](https://github.com/cacjs/cac) 的最小化 CLI 專案模板，適合快速建立命令列工具。

---

## 🚀 快速開始

使用 Bun 官方指令初始化專案：

```bash
bun create drsmile1001/bun-template my-cli
cd my-cli
bun run src/index.ts hello
```

## 📦 指令範例

目前預設支援一個 hello 指令：

```bash
bun run src/index.ts hello [name]
```

輸出：

```bash
Hello, world!
Hello, Bun!
```
