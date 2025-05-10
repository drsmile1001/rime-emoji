# Bun CLI Template

## 專案資料夾結構

```txt
rime-emoji/
├── bun.lockb
├── package.json
├── tsconfig.json
├── .gitignore
├── .prettierrc.yaml
├── setup.ts
├── src/
│   ├── index.ts                      # CLI 入口
│   ├── commands/                     # 每個 CLI 指令對應一檔案
│   │   ├── fetch.ts
│   │   ├── parse.ts
│   │   ├── map-alias.ts
│   │   ├── export.ts
│   │   └── sync.ts
│   ├── core/                         # 純邏輯模組（方便測試）
│   │   ├── EmojiFetcher.ts
│   │   ├── EmojiParser.ts
│   │   ├── AliasMapper.ts
│   │   ├── OpenCCExporter.ts
│   │   └── PipelineRunner.ts
│   ├── data/
│   │   ├── mappings/                 # 手動維護：需版本控 ✅
│   │   │   ├── alias.zh.json         # emoji ➜ 中文別名
│   │   │   └── group.zh.json         # 群組/子群組 ➜ 中文翻譯
│   │   └── pipeline/                 # 自動產物：不進版控 ❌
│   │       ├── 01-fetch/
│   │       ├── 02-parse/
│   │       ├── 03-map-alias/
│   │       └── 04-export/
│   └── utils/
│       └── fs.ts                     # 輔助工具：如 loadJson/writeJson 等
├── dist/                             # 最終產出（可重建，可選版本控）
│   ├── opencc/emoji.zh.json
│   ├── rime/emoji.dict.yaml
│   └── summary/emoji-table.md
├── test/                             # 測試與 fixture
│   ├── fixtures/
│   │   └── sample-emoji.txt
│   ├── core/
│   │   ├── EmojiParser.test.ts
│   │   └── AliasMapper.test.ts
│   └── commands/
│       ├── fetch.test.ts
│       └── sync.test.ts

```

## 📘 專案總原則

| 槤目            | 說明                                        |
| --------------- | ------------------------------------------- |
| 分階段設計      | 每階段有單一職責、單一輸入/輸出、可獨立重建 |
| 中間產物快取    | 不進 Git，但允許重用、比對、檢查中間結果    |
| 結果集中於 dist | 最終給人／程式使用的格式都輸出至 `dist/`    |
| 全流程 TDD      | 每個階段皆有單元與整合測試                  |
| CLI 可重組      | CLI 僅作為參數控制與流程組裝，不含邏輯      |

## ✅ 下一步：TDD 開發順序建議

| 階段         | 單元測試模組             | 重點驗證                             |
| ------------ | ------------------------ | ------------------------------------ |
| 1. fetch     | `EmojiFetcher.test.ts`   | 可取得來源並快取                     |
| 2. parse     | `EmojiParser.test.ts`    | emoji-test.txt 解析成結構化陣列      |
| 3. map-alias | `AliasMapper.test.ts`    | emoji 搭配別名與群組翻譯產生語意資料 |
| 4. export    | `OpenCCExporter.test.ts` | 輸出為符合 OpenCC 規格的 JSON        |
| 5. sync      | `sync.test.ts`           | 串聯全部步驟，並驗證產出完整性       |

## ✅ 建議起始 alias.zh.json 檔案格式範例

```json
{
  "❤️": ["愛", "心", "紅心"],
  "😂": ["笑", "哭笑", "爆笑"],
  "⚠️": ["警告", "注意", "風險"]
}
```
