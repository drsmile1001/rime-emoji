import { StepFilterEmojiDefinition } from "@/funcs/Step.FilterEmojiDefinition";
import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import { UnicodeEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Unicode";
import { YamlEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Yaml";
import { GenderSymbolStrategy } from "@/services/EmojiFilterStrategy.GenderSymbol";
import { GenderedRoleStrategy } from "@/services/EmojiFilterStrategy.GenderedRole";
import type { EmojiFilterStrategy } from "@/services/EmojiFilterStrategy.Interface";
import { SkinToneStrategy } from "@/services/EmojiFilterStrategy.SkinTone";
import { YamlFilterEmojiDefinitionResultReporter } from "@/services/FilterEmojiDefinitionResultReporter.Yaml";
import { YamlStrategyReporter } from "@/services/StrategyReporter.Yaml";
import { describe, expect, test } from "bun:test";
import kleur from "kleur";
import { getTestConfig } from "./config/TestConfig";
import { FIXTURES_DIR, resolveTmpDir } from "./utils/TestDir";

describe("StepFilterEmojiDefinition.LAB", () => {
  const config = getTestConfig();
  const ENABLED = config.get("TEST_STEP_FILTER_LAB");
  const tmpDir = resolveTmpDir("StepFilterEmojiDefinition.LAB");
  test("執行完整策略並輸出至 YAML 報告", async () => {
    if (!ENABLED) {
      console.log(kleur.green("✅ TEST_STEP_FILTER_LAB 不為 true，跳過測試。"));
      return;
    }

    // 來源資料
    const sourceRepo: EmojiDefinitionRepo =
      config.get("TEST_INPUT") === "real"
        ? new UnicodeEmojiDefinitionRepo()
        : new YamlEmojiDefinitionRepo(
            FIXTURES_DIR,
            "raw-definitions.sample.yaml",
          );

    // 輸出資料
    const targetRepo: EmojiDefinitionRepo = new YamlEmojiDefinitionRepo(
      tmpDir,
      "filtered.yaml",
    );

    // 選擇策略
    const strategyMap: Record<string, () => EmojiFilterStrategy> = {
      skin: () => new SkinToneStrategy(),
      gender: () => new GenderSymbolStrategy(),
      "gendered-role": () => new GenderedRoleStrategy(),
    };
    const selected = config.get("TEST_STEP_FILTER_STRATEGIES");
    const strategies = selected.map((id) => strategyMap[id]());

    // 輸出報告
    const strategyReporter = new YamlStrategyReporter(tmpDir);
    const summaryReporter = new YamlFilterEmojiDefinitionResultReporter(
      `${tmpDir}/summary.yaml`,
    );

    const step = new StepFilterEmojiDefinition(
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
