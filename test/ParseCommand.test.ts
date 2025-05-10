import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";
import { describe, test, expect } from "bun:test";
import { EmojiDefinitionRepoFs } from "@/core/EmojiDefinitionRepoFs";
import { runParseCommand } from "@/commands/ParseCommand";

const FIXTURE_INPUT = "test/fixtures/emoji-test.sample.txt";
const TEST_INPUT_DIR = "data/pipeline/01-fetch";
const TEST_INPUT_FILE = "emoji-test.txt";
const TEST_OUTPUT_DIR = "data/pipeline/02-parse";

describe("parse command", () => {
  test("應該能解析 emoji-test.txt 並產出 definitions.yaml", async () => {
    // 安排 fixture ➜ pipeline 輸入位置
    mkdirSync(TEST_INPUT_DIR, { recursive: true });
    copyFileSync(FIXTURE_INPUT, join(TEST_INPUT_DIR, TEST_INPUT_FILE));

    // 執行 CLI
    await runParseCommand();

    // 透過 repo 載入結果
    const repo = new EmojiDefinitionRepoFs(TEST_OUTPUT_DIR);
    const parsed = await repo.load();

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed[0]).toHaveProperty("group");
    expect(parsed[0]).toHaveProperty("subgroup");
    expect(parsed[0]).toHaveProperty("emoji");
    expect(parsed[0]).toHaveProperty("name");
    expect(parsed[0]).toHaveProperty("codePoints");
  });
});
