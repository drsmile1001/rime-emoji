import { StepFetchLatestDefinition } from "@/funcs/Step.FetchLatestDefinition";
import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import { UnicodeEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Unicode";
import { YamlEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Yaml";
import { describe, expect, test } from "bun:test";
import { getTestConfig } from "./config/TestConfig";
import { FIXTURES_DIR, resolveTmpDir } from "./utils/TestDir";

describe("FetchLatestDefinition", () => {
  const SOURCE_YAML_DIR = FIXTURES_DIR;
  const SOURCE_YAML_FILE = "raw-definitions.sample.yaml";
  const OUTPUT_DIR = resolveTmpDir("FetchLatestDefinition");
  const OUTPUT_FILE_NAME = "definitions.yaml";
  const config = getTestConfig();
  test("執行後在存放區應該有來源資料", async () => {
    const source: EmojiDefinitionRepo =
      config.get("TEST_INPUT") === "real"
        ? new UnicodeEmojiDefinitionRepo()
        : new YamlEmojiDefinitionRepo(SOURCE_YAML_DIR, SOURCE_YAML_FILE);
    const target = new YamlEmojiDefinitionRepo(OUTPUT_DIR, OUTPUT_FILE_NAME);

    const step = new StepFetchLatestDefinition(source, target);
    await step.execute();
    const definitions = await target.getAll();
    expect(definitions).toBeDefined();
    expect(definitions.length).toBeGreaterThan(0);
    if (config.get("TEST_INPUT") !== "real") {
      //以 fixture 的資料檢驗
      const firstDefinition = definitions[0];
      expect(firstDefinition).toEqual({
        group: "Smileys & Emotion",
        subgroup: "face-smiling",
        emoji: "😀",
        name: "grinning face",
        codePoints: ["1F600"],
      });
    }
  });
});
