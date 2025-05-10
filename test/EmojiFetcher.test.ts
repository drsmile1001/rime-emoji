import {
  fetchLatestEmojiTestText,
  saveRawEmojiTestText,
  runFetchPipeline,
  OUTPUT_PATH,
} from "@/core/EmojiFetcher";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { mkdir } from "fs/promises";
import { describe, expect, test } from "bun:test";

describe("EmojiFetcher", () => {
  test("fetchLatestEmojiTestText 應能下載文字內容，包含 'emoji-test' 關鍵字", async () => {
    const text = await fetchLatestEmojiTestText();
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(1000);
    expect(text).toMatch(/emoji-test/i);
  });

  test("saveRawEmojiTestText 應將檔案寫入正確位置", async () => {
    const content = "test content";
    await mkdir(join(OUTPUT_PATH, ".."), { recursive: true });
    await saveRawEmojiTestText(content);
    const saved = readFileSync(OUTPUT_PATH, "utf-8");
    expect(saved).toBe(content);
  });

  test("runFetchPipeline 應能完成下載並寫入，檔案內容需包含 emoji 字串", async () => {
    const savedPath = await runFetchPipeline();
    expect(savedPath).toBe(OUTPUT_PATH);
    expect(existsSync(savedPath)).toBe(true);
    const content = readFileSync(savedPath, "utf-8");
    expect(content).toMatch(/emoji/i);
  });
});
