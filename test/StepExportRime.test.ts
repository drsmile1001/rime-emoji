import { describe, test, expect, afterEach } from "bun:test";
import { getTestConfig } from "./config/TestConfig";
import { resolveTmpDir } from "./utils/TestDir";
import { rm, readFile } from "node:fs/promises";
import kleur from "kleur";

import { createSampleEmojiDefinitions } from "./fixtures/Seeds";
import { MemoryEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Memory";
import { YamlDomainAliasRepo } from "@/services/DomainAliasRepo.Yaml";
import { StepBuildDomainAliasFromAssigned } from "@/funcs/Step.BuildDomainAliasFromAssigned";
import { StepExportRime } from "@/funcs/Step.ExportRime";
import { YamlFile } from "@/utils/YamlFile";
import {
  YamlEmojiAssignedAliasRepo,
  type YamlDefinitionAlias,
} from "@/services/EmojiAssignedAliasRepo.Yaml";

const FILE_NAME = "emoji.txt";

describe("StepExportRime", () => {
  const config = getTestConfig();
  const TMP_DIR = resolveTmpDir("StepExportRime");
  const ASSIGNED_ALIAS_DIR = TMP_DIR + "/assigned";
  const DOMAIN_ALIAS_DIR = TMP_DIR + "/domain";
  const OUTPUT_DIR = TMP_DIR + "/out";

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(TMP_DIR, { recursive: true, force: true });
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${TMP_DIR}`));
    }
  });

  test("應能正確合併分類別名與領域別名並輸出為 txt", async () => {
    // 準備 emoji 定義
    const defs = createSampleEmojiDefinitions();
    const defRepo = new MemoryEmojiDefinitionRepo();
    await defRepo.saveAll(defs);

    // 建立 assigned alias（加上 group alias: 身體）
    const assignedRepo = new YamlEmojiAssignedAliasRepo(ASSIGNED_ALIAS_DIR);
    await assignedRepo.saveDefinitions(defs);
    const yamlFile = new YamlFile<YamlDefinitionAlias>(
      ASSIGNED_ALIAS_DIR,
      "People_20_26_20Body.yaml",
      { name: "-", subGroups: [] },
    );
    const y = await yamlFile.read();
    y.alias = "身體";
    y.subGroups[0].emojis[0].alias = "手掌";
    await yamlFile.write(y);

    // 建立 domain alias
    const domainRepo = new YamlDomainAliasRepo(DOMAIN_ALIAS_DIR);
    const buildStep = new StepBuildDomainAliasFromAssigned(
      assignedRepo,
      domainRepo,
      "default",
    );
    await buildStep.execute();

    // 執行輸出
    const exportStep = new StepExportRime(
      assignedRepo,
      domainRepo,
      OUTPUT_DIR,
      FILE_NAME,
    );
    await exportStep.execute();

    const txt = await readFile(`${OUTPUT_DIR}/${FILE_NAME}`, "utf8");
    expect(txt).toContain("身體");
    expect(txt).toMatch(/身體\t身體.+/);
    expect(txt).toMatch(/手掌\t手掌.*✋/); // 來自 emoji alias
  });
});
