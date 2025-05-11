import { describe, test, expect, afterEach } from "bun:test";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";
import { rm } from "node:fs/promises";
import kleur from "kleur";
import { SemanticAliasRepoYaml } from "@/services/SemanticAliasRepo.Yaml";
import type { SemanticAlias } from "@/entities/SemanticAlias";

const SAMPLE: SemanticAlias[] = [
  {
    alias: "笑",
    semantic: "emotion",
    emojis: ["😀", "😃", "😄"],
  },
  {
    alias: "微笑",
    semantic: "emotion",
    emojis: ["🙂", "😊"],
  },
  {
    alias: "笑",
    semantic: "gesture",
    emojis: ["✋"],
  },
];

describe("SemanticAliasRepoYaml", () => {
  const config = getTestConfig();
  const OUTPUT_DIR = resolveTmpDir("SemanticAliasRepo.Yaml");
  const repo = new SemanticAliasRepoYaml(OUTPUT_DIR);

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(OUTPUT_DIR, { recursive: true, force: true });
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${OUTPUT_DIR}`));
    }
  });

  test("應能存取多個 semantic 並正確讀回", async () => {
    await repo.saveAll(SAMPLE);
    const all = await repo.getAll();
    expect(all).toEqual(expect.arrayContaining(SAMPLE));
  });

  test("應能依 alias 查詢所有 semantic 定義", async () => {
    await repo.saveAll(SAMPLE);
    const result = await repo.getByAlias("笑");
    expect(result).toHaveLength(2);
    expect(result.map((x) => x.semantic).sort()).toEqual([
      "emotion",
      "gesture",
    ]);
  });

  test("應能依 semantic 讀取單一檔案內容", async () => {
    await repo.saveAll(SAMPLE);
    const result = await repo.getByDomain("emotion");
    expect(result).toHaveLength(2);
    expect(result.map((x) => x.alias).sort()).toEqual(["微笑", "笑"]);
  });
});
