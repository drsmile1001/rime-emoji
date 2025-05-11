import { FilterSummaryReporterYaml } from "@/services/FilterSummaryReporter.Yaml";
import { YamlFile } from "@/utils/YamlFile";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdir, readFile, rm } from "fs/promises";
import kleur from "kleur";
import { join } from "path";
import { getTestConfig } from "~test/config/TestConfig";
import { createSampleEmojiDefinitions } from "~test/fixtures/Seeds";
import { resolveTmpDir } from "~test/utils/TestDir";

describe("FilterSummaryReporterYaml", () => {
  const OUTPUT_DIR = resolveTmpDir("FilterSummaryReporterYaml");
  const config = getTestConfig();

  beforeEach(async () => {
    await rm(OUTPUT_DIR, { recursive: true, force: true });
    await mkdir(OUTPUT_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(OUTPUT_DIR, { recursive: true, force: true });
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${OUTPUT_DIR}`));
    }
  });

  test("應輸出 blocked.pass.report.yaml 與 blocked.summary.yaml", async () => {
    const reporter = new FilterSummaryReporterYaml(OUTPUT_DIR);

    const defs = createSampleEmojiDefinitions();

    await reporter.reportSummary({
      finalOutput: defs.slice(0, 2),
      strategyRuns: [
        {
          id: "test-strategy",
          input: defs,
          blocked: defs.slice(2),
        },
      ],
    });

    const passReportPath = join(OUTPUT_DIR, "blocked.pass.report.yaml");

    const readBackSummary = await new YamlFile<{
      totalKept: number;
      totalBlocked: number;
      byStrategy: {
        id: string;
        input: number;
        blocked: number;
        kept: number;
      }[];
    }>(OUTPUT_DIR, "blocked.summary.yaml", {
      totalKept: 0,
      totalBlocked: 0,
      byStrategy: [],
    }).read();

    expect(readBackSummary.totalKept).toBe(2);
    expect(readBackSummary.totalBlocked).toBe(1);
    expect(readBackSummary.byStrategy[0]).toMatchObject({
      id: "test-strategy",
      input: 3,
      blocked: 1,
      kept: 2,
    });

    const passText = await readFile(passReportPath, "utf-8");
    expect(passText).toContain("🟢"); // 至少有一行 emoji
    expect(passText).toContain("✋"); // from sample
  });
});
