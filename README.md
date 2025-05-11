# 🧩 rime-emoji

一個為 Rime 輸入法與 OpenCC 專案打造的 emoji 處理工具鏈，支援從 Unicode 官方下載 emoji 定義、逐步過濾、編輯群組與中文別名，最終輸出符合輸入法或文字轉換工具需求的格式。

---

## 🔧 專案定位與設計理念

本專案為典型的 Pipeline 資料處理專案，其特色包含：

- 🧱 多階段處理：每個處理步驟明確獨立，便於理解與重用
- 🧪 開發導向資料產出：每個階段會輸出中繼資料，可用於觀察、測試、或作為下一步輸入
- 📦 具備工程穩定性與資料科學探索彈性：結構嚴謹但可允許反覆實驗
- 🧭 Clean Architecture + DI 策略：可替換的資料來源與策略，易測試、易維護

## 🏗 專案結構

```text
src/
├── entities/ # 📘 核心資料模型（emoji 定義、別名結構）
├── funcs/ # 🔁 每個處理階段（Step）可獨立執行或組合
│ └── Step.Xxx.ts # 各個步驟（fetch、filter、merge...）
├── services/ # 💾 副作用與策略（Repo、輸出、過濾）
├── utils/ # 🛠 通用工具，如 YAML 讀寫
├── index.ts # 🧩 CLI 入口，組合 Step 為命令
test/
├── Step.\*.test.ts # 🎯 每個步驟可單獨測試，也可用作臨時執行器
└── XxxRepo.test.ts # ✴️ Interface-based 測試可覆蓋多實作
```

## 🧪 Pipeline 開發流程（資料科學導向）

| 開發階段   | 操作                               | 輸出                      |
| ---------- | ---------------------------------- | ------------------------- |
| Fetch 定義 | 從 Unicode 官網抓取 emoji-test.txt | 完整原始 emoji 定義       |
| Filter     | 使用策略排除膚色、性別合成等項目   | 留下需要處理的 emoji 子集 |
| Merge 定義 | 將原始 emoji 加入可維護的群組檔    | `data/definitions/*.yaml` |
| 撰寫別名   | 手動填寫中文別名與領域別名         | `data/aliases/*.yaml`     |
| Validate   | 檢查別名重複、空值、對應錯誤       | 報告清單                  |
| Export     | 輸出為 OpenCC、Rime 格式           | `.json` / `.dict.yaml`    |

👉 每一階段都可透過 Step 執行、測試、或用作後續開發基礎。

## 🧱 核心概念對照表

| 類型                  | 說明                                           |
| --------------------- | ---------------------------------------------- |
| `EmojiDefinition`     | 原始資料單位（含 emoji 字元、名稱、群組資訊）  |
| `DefinitionAlias`     | 對 `group` / `subgroup` / `emoji` 的中文別名   |
| `DomainAlias`         | 使用者輸入詞 → emoji 的對應表（多義詞支援）    |
| `Step`                | 每個可執行的資料處理單位（具有明確責任與依賴） |
| `EmojiFilterStrategy` | 策略模式的篩選器，可按需注入多項過濾邏輯       |
| `*.Repo`              | 每一份資料的讀寫來源（YAML、Unicode、Memory）  |
| `*.Reporter`          | 中繼資料、分析報告的輸出接口（如 YAML 報告）   |

## 🔄 開發策略建議

- 每個步驟可獨立測試：透過注入 MemoryRepo 模擬資料流
- 每個資料來源都可替換：支援 Unicode、YAML、Fixture
- 可逐步導入：先從單一步驟開發，逐步擴展處理邏輯
- 資料優先於邏輯：所有處理流程均以 Entity 型別為核心輸入輸出

```mermaid
classDiagram
    class EmojiDefinition {
        emoji: id
        name
        group
        subgroup
    }

    class GroupAlias {
      group: id
      alias?: string;
    }

    class SubgroupAlias = {
      group: id
      subgroup: id
      alias?: string;
    };

    export type EmojiAlias = {
      emoji: id;
      alias?: string;
    };

    class AliasDefinition = {
      alias: id:
      domain: string;
      emojis: string[];
    }
```
