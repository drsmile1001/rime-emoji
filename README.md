# 🧩 rime-emoji

rime-emoji 是一套針對 emoji 輸入法需求所設計的別名維護工具。它提供：

- emoji 分類與語義的別名維護流程
- 自動補全與驗證的 CLI 工具
- 可匯出為 OpenCC 或 Rime 輸入法可用的字典格式

這讓使用者能夠以「自然語言方式」輸入 emoji，例如輸入「成功」快速輸出 ✅，或輸入「部署」出現 🚀 等常見對應。

## 🚀 立刻使用：套用現成 emoji 字典至 Rime

若你只想快速在 Rime 輸入法中使用 emoji，可依以下步驟操作：

### 1️⃣ 下載字典檔案

前往本專案的 `data/opencc/` 資料夾，複製 `emoji.txt`：

### 2️⃣ 放入 Rime 設定資料夾

將 `emoji.txt` 放入對應 Rime 資料夾：

- macOS / Linux（fcitx5）：
  `~/.local/share/fcitx5/rime/`
- Linux（ibus）：
  `~/.config/ibus/rime/`
- Windows（Weasel）：
  `%APPDATA%/Rime/`

### 3️⃣ 修改輸入方案設定

在你的 `luna_pinyin.custom.yaml` 中加入：

```yaml
patch:
"engine/filters/@before 0": simplifier@emoji_suggestion
emoji_suggestion:
  opencc_config: emoji.txt
  option_name: emoji_suggestion
```

### 4️⃣ 重新部署

重新部署 Rime 輸入法後，你就可以輸入中文詞彙取得對應 emoji 候選，例如：

- 輸入「成功」→ ✅ ✔️ ☑️
- 輸入「愛心」→ ❤️ 💗 🥰 💖
- 輸入「笑臉」→ 😀 😁 😊 😄

## ⚙️ 概念與使用說明：維護自己的 emoji 中文別名

如果你想打造自己的 emoji 中文輸入方案，可以使用本工具維護兩種別名字典：

### 📁 分類別名 `category-alias/`

分類別名依據 Unicode emoji 的群組（group）與子群組（subgroup）分類，例如：群組 `Smileys & Emotion`，子群組 `face-smiling` 包含各種臉部表情。

每個 emoji 可對應多個中文別名（以空格分隔），如下：

```yaml
name: Smileys & Emotion
subGroups:
  - name: face-smiling
    alias: 笑臉 表情 臉部
    emojis:
      - emoji: 😀
        name: E0.6 grinning face
        alias: 笑 臉 開心
      - emoji: 😁
        name: E0.6 beaming face with smiling eyes
        alias: 笑臉 喜悅 樂觀
      - emoji: 😊
        name: E0.6 smiling face with smiling eyes
        alias: 微笑 滿足 讚美
```

📥 當你這樣設定之後，Rime 輸入法將能有以下效果：

- 輸入「微笑」 → 😊
- 輸入「笑臉」 → 😀 😁
- 輸入「臉部」 → 😀 😁 😊 …（所有屬於 face-smiling 子群組的 emoji）

這些設定通常儲存在：

```txt
category-alias/Smileys_20_26_20Emotion.yaml
```

> （注意：檔名使用 URI 安全編碼，例如空格為 _、& 為 \_26_）

你可以依據需求擴充各分類檔，讓輸入詞更符合你的使用情境。

### 📁 語義別名 `semantic-alias/`

語義別名是依照「你想輸入什麼意思」來指定 emoji 候選。這種方式特別適合聊天、開發、教育等不同語境下，使用簡單詞彙就能快速輸出多個相關 emoji。

例如，在開發工作中，我們常需要表達「錯誤」、「部署」、「測試」等概念，可以這樣設定：

```yaml
- alias: 錯誤
  emojis: ❌ 🐞
- alias: 測試
  emojis: 🧪 ✅
- alias: 部署
  emojis: 🚀
- alias: 上線
  emojis: 🚀 ✅
```

📥 當你這樣設定之後，輸入效果會像這樣：

- 輸入「測試」 → 🧪 ✅
- 輸入「錯誤」 → ❌ 🐞
- 輸入「上線」 → 🚀 ✅
- 輸入「部署」 → 🚀

這些設定通常儲存在：

```txt
semantic-alias/development.yaml
```

你可以根據自己常用的詞彙，建立多個語義主題檔（如：development.yaml, emotion.yaml, communication.yaml），彈性維護輸入語境與表達風格。

### 🧠 分類與語義可同時使用

你可以同時啟用 `category-alias/` 和 `semantic-alias/`，讓 emoji 輸入更有彈性。

這代表 emoji 可以同時從它的「圖像分類」與「語義用途」兩個角度被搜尋與輸出。例如：

#### 👊 這個 emoji 的雙重角色

你可以這樣設定分類別名（分類為「身體部位 > 手部」）：

```yaml
- emoji: 👊
  alias: 拳頭 出拳 攻擊
```

又在語義別名中這樣設定它的情境用途：

```yaml
- alias: 加油
  emojis: 👊 💪
- alias: 努力
  emojis: 👊 🚀
```

📥 最終你會有這樣的輸入效果：

- 輸入「拳頭」→ 👊（分類別名）
- 輸入「加油」→ 👊 💪（語義別名）
- 輸入「努力」→ 👊 🚀（語義別名）

這種設計讓你能根據 emoji 的「原意」與「使用情境」各自建立輸入詞，彼此不衝突，並可以持續擴充語彙。

你可以隨時依照需求，選擇只使用分類、只使用語義，或同時啟用兩者。

## 🛠️ CLI 工具與使用流程

本專案使用 [Bun](https://bun.sh) 作為執行環境，請先安裝：

```bash
curl -fsSL https://bun.sh/install | bash
```

安裝後請確認 bun 已加入你的 shell 環境中：

```bash
bun --version
```

進入專案資料夾後，執行：

```bash
bun install
```

### 🧪 CLI 指令說明

你可以依序執行以下指令來建立與驗證 emoji 中文別名字典：

| 指令               | 說明                                              |
| ------------------ | ------------------------------------------------- |
| `bun run fetch`    | 下載並解析 Unicode 官方的 emoji 定義              |
| `bun run filter`   | 過濾膚色、性別等合成 emoji，產出乾淨的 emoji 定義 |
| `bun run merge`    | 合併 emoji 定義至分類別名檔，補全缺漏欄位         |
| `bun run validate` | 驗證是否有缺少別名、重複定義或格式錯誤            |
| `bun run export`   | 將別名輸出為 OpenCC `.txt` 格式字典               |

### 📋 範例流程

```bash
bun run fetch       # 抓取最新 emoji 定義
bun run filter      # 移除非必要組合 emoji
bun run merge       # 建立/更新分類別名 YAML
```

✅ 此時你可以開始編輯別名定義檔：

- 編輯 category-alias/ 下的分類檔案（按 emoji 分類分檔）
- 編輯 semantic-alias/ 下的語義檔案（依主題自由組織）

```bash
bun run validate    # 驗證你所維護的別名檔案內容是否正確
bun run export      # 匯出為 OpenCC 替換字典檔（例如 emoji.txt）
```

完成後你會在 data/opencc/emoji.txt 看到產出結果，這就是 Rime 輸入法可用的輸入詞 → emoji 對應表。

## 🏗️ 專案架構

### 📁 資料與設定檔案

| 資料夾/檔案             | 說明                                       |
| ----------------------- | ------------------------------------------ |
| `category-alias/`       | 按 emoji 分類儲存分類別名檔，每群組一檔    |
| `semantic-alias/`       | 按語義主題儲存語義別名檔，可自由命名與分群 |
| `data/opencc/emoji.txt` | 匯出結果，供 Rime/OpenCC 使用              |

### 🧩 核心程式模組

| 位置                  | 說明                                                |
| --------------------- | --------------------------------------------------- |
| `src/index.ts`        | CLI 工具入口，註冊所有指令                          |
| `src/funcs/Step.*.ts` | 各個處理流程（如 fetch、filter、merge）皆為獨立模組 |
| `src/entities/`       | 定義 emoji 結構、別名型別等核心資料模型             |
| `src/services/`       | 包含各類 Repo、Validator、Reporter 抽象化模組       |

### 🧪 測試結構

| 位置                            | 說明                                     |
| ------------------------------- | ---------------------------------------- |
| `test/services/`                | 各個 service/repo 的單元測試             |
| `test/playground/*.Lab.test.ts` | 實驗性測試場域，用來驗證整體資料處理流程 |

這樣的結構可以讓你：

- 只專注維護 emoji YAML，不需理解內部程式邏輯
- 也可以深入開發流程，擴充過濾策略、驗證器或輸出格式

所有流程都可經由 CLI 自動化操作，測試可單獨執行，也支援 TDD 模式。

## 📄 授權 License

本專案採用 **GNU General Public License v3 (GPL-3.0)** 授權條款。

你可以自由使用、修改與散布本工具與產出，但必須使用相同授權釋出衍生版本，並保留原始作者與授權聲明。使用本工具不提供任何商業或法律保證。

---

本專案由 [@drsmile1001](https://github.com/drsmile1001) 製作與維護。
