# Bun CLI Template

## 專案資料夾結構

```txt
rime-emoji/
├── src/
│   ├── index.ts                      # CLI 入口
│   ├── commands/                     # 每個 CLI 指令對應一檔案
│   │   ├── fetch.ts
│   │   ├── parse.ts
│   │   ├── build-definitions.ts     # 產生定義檔
│   │   ├── map-alias.ts
│   │   ├── check-conflicts.ts       # 衝突檢查報告
│   │   ├── export.ts
│   │   └── sync.ts
│   ├── core/                         # 無副作用的邏輯模組
│   │   ├── EmojiFetcher.ts
│   │   ├── EmojiParser.ts
│   │   ├── EmojiFilter.ts           # ✅ 自動排除膚色/性別組合等冗餘 emoji
│   │   ├── DefinitionBuilder.ts     # 建立分群與中文命名定義
│   │   ├── AliasMerger.ts           # 合併別名與定義資料
│   │   ├── ConflictChecker.ts       # emoji/zhName/alias 衝突檢查
│   │   ├── OpenCCExporter.ts
│   │   └── PipelineRunner.ts
│   ├── data/
│   │   ├── definitions/             # Unicode 群組定義（版本控 ✅）
│   │   │   └── definitions.zh.json
│   │   ├── aliases/                 # 分領域別名（版本控 ✅）
│   │   │   └── alias.zh.json
│   │   └── pipeline/                # 中繼資料（不進版控 ❌）
│   │       ├── 01-fetch/
│   │       ├── 02-parse/
│   │       ├── 03-filter/
│   │       ├── 04-definitions/
│   │       ├── 05-map-alias/
│   │       ├── 06-validate/
│   │       └── 07-export/
├── dist/
│   ├── opencc/emoji.zh.json
│   └── summary/conflicts.md
├── test/
│   ├── fixtures/
│   │   ├── emoji-test.sample.txt
│   │   └── alias.zh.sample.json
│   ├── core/
│   │   ├── EmojiParser.test.ts
│   │   ├── EmojiFilter.test.ts      # ✅ 檢驗膚色/性別組合已排除
│   │   ├── DefinitionBuilder.test.ts
│   │   ├── AliasMerger.test.ts
│   │   ├── ConflictChecker.test.ts
│   │   └── OpenCCExporter.test.ts
│   └── commands/
│       └── sync.test.ts

```

## 📘 專案總原則

| 項目                     | 說明                                                   |
| ------------------------ | ------------------------------------------------------ |
| Unicode 與使用者語意分離 | group/subgroup → 中文名稱；alias 定義概念群組          |
| 多領域輸出支援           | alias 可分類標記為 `開發`、`測試`、`書寫` 等           |
| 檢查與覆蓋衝突           | 若群組翻譯與別名產生衝突，可報告或合併                 |
| 架構可擴展               | 支援後續生成 Rime、OpenCC、Markdown 表格等多種輸出形式 |

## ✅ 開發階段與 TDD 順序

| 階段         | 測試模組                    | 重點                             |
| ------------ | --------------------------- | -------------------------------- |
| 1. fetch     | `EmojiFetcher.test.ts`      | 下載 emoji-test.txt              |
| 2. parse     | `EmojiParser.test.ts`       | 結構化分析 group/subgroup/emojis |
| 3. ✅ filter | `EmojiFilter.test.ts`       | 排除膚色、ZWJ 變體等不需要項目   |
| 4. build     | `DefinitionBuilder.test.ts` | 建立定義檔含 zhName              |
| 5. alias     | `AliasMerger.test.ts`       | 合併別名與定義群組               |
| 6. validate  | `ConflictChecker.test.ts`   | 發現 zhName/alias 衝突           |
| 7. export    | `OpenCCExporter.test.ts`    | 輸出 opencc/rime 用格式          |
| 8. sync      | `sync.test.ts`              | 整合流程驗證                     |

## ✅ 建議起始 alias.zh.json 檔案格式範例

```json
{
  "❤️": ["愛", "心", "紅心"],
  "😂": ["笑", "哭笑", "爆笑"],
  "⚠️": ["警告", "注意", "風險"]
}
```

# ✅ EmojiFilter 行為摘要（內建策略、無外部 config）

| 行為類型        | 判斷邏輯                                   |
| --------------- | ------------------------------------------ |
| 排除膚色修飾符  | codepoints 含 `1F3FB` \~ `1F3FF`           |
| 排除性別組合    | codepoints 含 `200D`（ZWJ）+ `2640`/`2642` |
| 排除 emoji 雜訊 | emoji 明確列入 internal blacklist          |
