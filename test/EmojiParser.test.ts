import { parseEmojiTest } from "@/core/EmojiParser";
import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("EmojiParser", () => {
  const samplePath = join(__dirname, "./fixtures/emoji-test.sample.txt");
  const rawText = readFileSync(samplePath, "utf-8");
  const parsed = parseEmojiTest(rawText);

  test("應能成功解析多個 emoji group 且每個群組內含 emoji", () => {
    expect(parsed.length).toBeGreaterThan(0);
    parsed.forEach((group) => {
      expect(group.name.length).toBeGreaterThan(0);
      expect(group.subgroups.length).toBeGreaterThan(0);
      group.subgroups.forEach((sub) => {
        expect(sub.name.length).toBeGreaterThan(0);
        expect(sub.emojis.length).toBeGreaterThan(0);
      });
    });
  });

  test("每個 emoji 條目應包含 emoji 與 name 欄位", () => {
    for (const group of parsed) {
      for (const subgroup of group.subgroups) {
        for (const emojiDef of subgroup.emojis) {
          expect(emojiDef.emoji).toBeDefined();
          expect(emojiDef.name.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
