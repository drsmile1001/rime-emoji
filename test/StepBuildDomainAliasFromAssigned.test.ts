import { afterEach, describe, expect, test } from "bun:test";
import kleur from "kleur";
import { rm } from "node:fs/promises";
import { getTestConfig } from "./config/TestConfig";
import { resolveTmpDir } from "./utils/TestDir";
import { YamlDomainAliasRepo } from "@/services/DomainAliasRepo.Yaml";
import { MemoryEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Memory";
import { createSampleEmojiDefinitions } from "./fixtures/Seeds";
import { StepBuildDomainAliasFromAssigned } from "@/funcs/Step.BuildDomainAliasFromAssigned";
import {
  YamlEmojiAssignedAliasRepo,
  type YamlDefinitionAlias,
} from "@/services/EmojiAssignedAliasRepo.Yaml";
import { YamlFile } from "@/utils/YamlFile";

describe("StepBuildDomainAliasFromAssigned", () => {
  const config = getTestConfig();
  const TMP_DIR = resolveTmpDir("StepBuildDomainAliasFromAssigned");
  const ASSIGNED_ALIAS_DIR = TMP_DIR + "/assigned";
  const DOMAIN_ALIAS_DIR = TMP_DIR + "/domain";

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(TMP_DIR, { recursive: true, force: true });
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${TMP_DIR}`));
    }
  });

  test("應能從分類別名構建出 domain alias", async () => {
    const defs = createSampleEmojiDefinitions();
    const defRepo = new MemoryEmojiDefinitionRepo();
    await defRepo.saveAll(defs);

    const assignedRepo = new YamlEmojiAssignedAliasRepo(ASSIGNED_ALIAS_DIR);
    await assignedRepo.saveDefinitions(defs); // 使用 defs 初始化

    // 人工加入 alias
    const yamlFile = new YamlFile<YamlDefinitionAlias>(
      ASSIGNED_ALIAS_DIR,
      "People_20_26_20Body.yaml",
      {
        name: "--",
        subGroups: [],
      },
    );
    const readback = await yamlFile.read();
    readback.alias = "身體";
    yamlFile.write(readback);

    const domainRepo = new YamlDomainAliasRepo(DOMAIN_ALIAS_DIR);

    const step = new StepBuildDomainAliasFromAssigned(
      assignedRepo,
      domainRepo,
      "default",
    );
    await step.execute();

    const result = await domainRepo.getAll();
    const aliases = result.map((x) => x.alias);

    expect(aliases).toContain("身體");
    expect(result.every((x) => x.domain === "default")).toBe(true);
  });
});
