import { parseEmojiTest } from "@/core/EmojiParser";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("EmojiParser", () => {
  const samplePath = join(__dirname, "./fixtures/emoji-test.sample.txt");
  const rawText = readFileSync(samplePath, "utf-8");
  const parsed = parseEmojiTest(rawText);

  test("應能成功解析多筆 fully-qualified emoji 條目", () => {
    expect(parsed.length).toBeGreaterThan(10);
  });

  test("每個條目應具有 emoji 與 name 欄位", () => {
    for (const entry of parsed) {
      expect(entry.emoji).toBeDefined();
      expect(entry.name.length).toBeGreaterThan(0);
    }
  });

  test("應正確保留群組與子群組", () => {
    const groupSet = new Set(parsed.map((p) => p.group));
    const subgroupSet = new Set(parsed.map((p) => p.subgroup));
    expect(groupSet.size).toBeGreaterThan(0);
    expect(subgroupSet.size).toBeGreaterThan(0);
  });
});
