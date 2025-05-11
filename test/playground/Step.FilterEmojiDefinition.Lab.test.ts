import { StepFilterDefinition } from "@/funcs/Step.FilterEmojiDefinition";
import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import { EmojiDefinitionRepoUnicode } from "@/services/EmojiDefinitionRepo.Unicode";
import { EmojiDefinitionRepoYaml } from "@/services/EmojiDefinitionRepo.Yaml";
import { FilterStrategyGenderSymbol } from "@/services/FilterStrategy.GenderSymbol";
import { FilterStrategyGenderedRole } from "@/services/FilterStrategy.GenderedRole";
import type { FilterStrategy } from "@/services/FilterStrategy.Interface";
import { FilterStrategySkinTone } from "@/services/FilterStrategy.SkinTone";
import { FilterSummaryReporterYaml } from "@/services/FilterSummaryReporter.Yaml";
import { FilterStrategyReporterYaml } from "@/services/FilterStrategyReporter.Yaml";
import { describe, expect, test } from "bun:test";
import kleur from "kleur";
import { getTestConfig } from "../config/TestConfig";
import { FIXTURES_DIR, resolveTmpDir } from "../utils/TestDir";

describe("StepFilterDefinition Lab", () => {
  const config = getTestConfig();
  const ENABLED = config.get("TEST_STEP_FILTER_LAB");
  const tmpDir = resolveTmpDir("Step.FilterDefinition.Lab");
  test("執行完整策略並輸出至 YAML 報告", async () => {
    if (!ENABLED) {
      console.log(kleur.green("✅ TEST_STEP_FILTER_LAB 不為 true，跳過測試。"));
      return;
    }

    // 來源資料
    const sourceRepo: EmojiDefinitionRepo =
      config.get("TEST_INPUT") === "real"
        ? new EmojiDefinitionRepoUnicode()
        : new EmojiDefinitionRepoYaml(
            FIXTURES_DIR,
            "raw-definitions.sample.yaml",
          );

    // 輸出資料
    const targetRepo: EmojiDefinitionRepo = new EmojiDefinitionRepoYaml(
      tmpDir,
      "filtered.yaml",
    );

    // 選擇策略
    const strategyMap: Record<string, () => FilterStrategy> = {
      skin: () => new FilterStrategySkinTone(),
      gender: () => new FilterStrategyGenderSymbol(),
      "gendered-role": () => new FilterStrategyGenderedRole(),
    };
    const selected = config.get("TEST_STEP_FILTER_STRATEGIES");
    const strategies = selected.map((id) => strategyMap[id]());

    // 輸出報告
    const strategyReporter = new FilterStrategyReporterYaml(tmpDir);
    const summaryReporter = new FilterSummaryReporterYaml(
      `${tmpDir}/summary.yaml`,
    );

    const step = new StepFilterDefinition(
      sourceRepo,
      strategies,
      strategyReporter,
      summaryReporter,
      targetRepo,
    );

    await step.execute();

    const result = await targetRepo.getAll();
    console.log(
      kleur.green(`✅ 已產出 ${result.length} 筆 emoji 定義至 ${tmpDir}`),
    );
    expect(result.length).toBeGreaterThan(0);
  });
});
