import { describe, test } from "bun:test";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";
import { YamlDefinitionAliasRepo } from "@/services/DefinitionAliasRepo.Yaml";
import kleur from "kleur";
import type { DefinitionAliasRepo } from "@/services/DefinitionAliasRepo.Interface";
import { YamlEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Yaml";

describe("YamlDefinitionAliasRepo.LAB", () => {
  const config = getTestConfig();
  const OUTPUT_DIR = resolveTmpDir("YamlDefinitionAliasRepo.LAB");

  test("取用過濾過的 emoji 建立別名定義檔", async () => {
    if (!config.get("YAML_DEFINITION_ALIAS_REPO_LAB")) {
      console.log(
        kleur.green("✅ YAML_DEFINITION_ALIAS_REPO_LAB 不為 true，跳過測試。"),
      );
      return;
    }
    const INPUT_DIR = resolveTmpDir("StepFilterEmojiDefinition.LAB");
    const source = new YamlEmojiDefinitionRepo(INPUT_DIR, "filtered.yaml");
    const defs = await source.getAll();
    const repo: DefinitionAliasRepo = new YamlDefinitionAliasRepo(OUTPUT_DIR);
    await repo.saveDefinitions(defs);
    console.log(
      kleur.green(`✅ 已產出 ${defs.length} 筆 emoji 定義至 ${OUTPUT_DIR}`),
    );
  });
});
