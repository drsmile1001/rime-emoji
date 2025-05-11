import type { CategoryAliasRepo } from "@/services/CategoryAliasRepo.Interface";
import { CategoryAliasRepoYaml } from "@/services/CategoryAliasRepo.Yaml";
import { EmojiDefinitionRepoYaml } from "@/services/EmojiDefinitionRepo.Yaml";
import { describe, test } from "bun:test";
import kleur from "kleur";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";

describe("CategoryAliasRepoYaml Lab", () => {
  const config = getTestConfig();
  const OUTPUT_DIR = resolveTmpDir("CategoryAliasRepoYaml.Lab");

  test("取用過濾過的 emoji 建立別名定義檔", async () => {
    if (!config.get("YAML_DEFINITION_ALIAS_REPO_LAB")) {
      console.log(
        kleur.green("✅ YAML_DEFINITION_ALIAS_REPO_LAB 不為 true，跳過測試。"),
      );
      return;
    }
    const INPUT_DIR = resolveTmpDir("StepFilterEmojiDefinition.Lab");
    const source = new EmojiDefinitionRepoYaml(INPUT_DIR, "filtered.yaml");
    const defs = await source.getAll();
    const repo: CategoryAliasRepo = new CategoryAliasRepoYaml(OUTPUT_DIR);
    await repo.mergeDefinitions(defs);
    console.log(
      kleur.green(`✅ 已產出 ${defs.length} 筆 emoji 定義至 ${OUTPUT_DIR}`),
    );
  });
});
