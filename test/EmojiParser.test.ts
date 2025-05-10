import { parseEmojiTest } from "@/core/EmojiParser";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("EmojiParser", () => {
  const samplePath = join(__dirname, "./fixtures/emoji-test.sample.txt");
  const rawText = readFileSync(samplePath, "utf-8");
  const parsed = parseEmojiTest(rawText);

  test("應能成功解析多筆 emoji 條目", () => {
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test("每個 emoji 條目應包含必要欄位", () => {
    for (const item of parsed) {
      expect(item).toHaveProperty("group");
      expect(item).toHaveProperty("subgroup");
      expect(item).toHaveProperty("emoji");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("codePoints");
    }
  });
});
