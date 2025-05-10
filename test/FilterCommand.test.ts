import { describe, test, expect } from "bun:test";
import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";
import { runFilterCommand } from "@/commands/FilterCommand";

// 測試路徑設定
const TEST_INPUT_DIR = "data/pipeline/02-parse";
const FIXTURE_INPUT_FILE = "test/fixtures/raw-definitions.sample.yaml";

describe("FilterCommand", () => {
  test("應能將 definitions.yaml 過濾並產出 blocked.yaml", async () => {
    // 建立輸入路徑與檔案
    mkdirSync(TEST_INPUT_DIR, { recursive: true });
    copyFileSync(FIXTURE_INPUT_FILE, join(TEST_INPUT_DIR, "definitions.yaml"));

    // 執行過濾命令
    await runFilterCommand();
  });
});
