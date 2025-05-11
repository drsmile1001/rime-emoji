import { YamlStrategyReporter } from "@/services/StrategyReporter.Yaml";
import { YamlFile } from "@/utils/YamlFile";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, rm } from "fs/promises";
import { getTestConfig } from "~test/config/TestConfig";
import { createSampleEmojiDefinitions } from "~test/fixtures/Seeds";
import { resolveTmpDir } from "~test/utils/TestDir";

describe("YamlStrategyReporter", () => {
  const OUTPUT_DIR = resolveTmpDir("YamlStrategyReporter");
  const REPORT_NAME = "test-strategy.report.yaml";
  const config = getTestConfig();
  beforeEach(async () => {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(OUTPUT_DIR, { recursive: true, force: true });
    } else {
      console.warn(`⚠️ 測試輸出保留於 ${OUTPUT_DIR}`);
    }
  });

  test("應正確輸出 emoji blocked 報告檔案", async () => {
    const defs = createSampleEmojiDefinitions();

    const reporter = new YamlStrategyReporter(OUTPUT_DIR);
    const input = defs;
    const blocked = [defs[2]]; // block 😀 (index 2)

    await reporter.report("test-strategy", blocked, input);
    const reportYamlFile = new YamlFile<
      {
        group: string;
        subgroup: string;
        emojis: string;
      }[]
    >(OUTPUT_DIR, REPORT_NAME, []);

    const parsed = await reportYamlFile.read();

    // parsed 是 array of groups
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);

    const allLines = parsed.flatMap((g) =>
      typeof g.emojis === "string" ? g.emojis.split("\n") : [],
    );

    // 至少要有 3 行 emoji
    expect(allLines.length).toBeGreaterThanOrEqual(3);

    // 應包含一個 🔴 emoji
    expect(allLines.some((line) => line.includes("🔴"))).toBe(true);
    expect(allLines.some((line) => line.includes("🟢"))).toBe(true);
    expect(allLines.some((line) => line.includes("😀"))).toBe(true);
  });
});
