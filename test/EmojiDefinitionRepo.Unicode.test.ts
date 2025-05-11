import { UnicodeEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Unicode";
import { describe, expect, test } from "bun:test";
import kleur from "kleur";
import { expectToThrow } from "./utils/ExpectToThrow";
import { getTestConfig } from "./config/TestConfig";
import { resolveFixtureFile } from "./utils/TestDir";

describe("UnicodeEmojiDefinitionRepo", () => {
  const config = getTestConfig();
  const repo = new UnicodeEmojiDefinitionRepo();

  test("應能正確解析遠端 emoji-test.txt 並轉換為 EmojiDefinition[]", async () => {
    if (config.get("TEST_INPUT") !== "real") {
      console.warn(kleur.yellow("⚠️ TEST_INPUT 未設置為 real，跳過測試。"));
      return;
    }

    const defs = await repo.getAll();
    expect(Array.isArray(defs)).toBe(true);
    expect(defs.length).toBeGreaterThan(50); // 基本 sanity check

    for (const def of defs.slice(0, 5)) {
      expect(def).toHaveProperty("emoji");
      expect(def).toHaveProperty("name");
      expect(def).toHaveProperty("group");
      expect(def).toHaveProperty("subgroup");
      expect(Array.isArray(def.codePoints)).toBe(true);
    }
  });

  test("saveAll() 應拋出未實作錯誤", async () => {
    await expectToThrow(() => repo.saveAll());
  });

  test("應能成功解析多筆 emoji 條目", async () => {
    const samplePath = resolveFixtureFile("emoji-test.sample.txt");
    const file = Bun.file(samplePath);
    const rawText = await file.text();
    const parsed = await repo.parse(rawText);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
    for (const item of parsed) {
      expect(item).toHaveProperty("group");
      expect(item).toHaveProperty("subgroup");
      expect(item).toHaveProperty("emoji");
      expect(item).toHaveProperty("name");
      expect(item).toHaveProperty("codePoints");
    }
  });
});
