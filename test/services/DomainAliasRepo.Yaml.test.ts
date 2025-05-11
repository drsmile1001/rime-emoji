import { describe, test, expect, afterEach } from "bun:test";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";
import { rm } from "node:fs/promises";
import kleur from "kleur";
import type { DomainAlias } from "@/services/DomainAliasRepo.Interface";
import { YamlDomainAliasRepo } from "@/services/DomainAliasRepo.Yaml";

const SAMPLE: DomainAlias[] = [
  {
    alias: "笑",
    domain: "emotion",
    emojis: ["😀", "😃", "😄"],
  },
  {
    alias: "微笑",
    domain: "emotion",
    emojis: ["🙂", "😊"],
  },
  {
    alias: "笑",
    domain: "gesture",
    emojis: ["✋"],
  },
];

describe("YamlDomainAliasRepo", () => {
  const config = getTestConfig();
  const OUTPUT_DIR = resolveTmpDir("DomainAliasRepo.Yaml");
  const repo = new YamlDomainAliasRepo(OUTPUT_DIR);

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(OUTPUT_DIR, { recursive: true, force: true });
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${OUTPUT_DIR}`));
    }
  });

  test("應能存取多個 domain 並正確讀回", async () => {
    await repo.saveAll(SAMPLE);
    const all = await repo.getAll();
    expect(all).toEqual(expect.arrayContaining(SAMPLE));
  });

  test("應能依 alias 查詢所有 domain 定義", async () => {
    await repo.saveAll(SAMPLE);
    const result = await repo.getByAlias("笑");
    expect(result).toHaveLength(2);
    expect(result.map((x) => x.domain).sort()).toEqual(["emotion", "gesture"]);
  });

  test("應能依 domain 讀取單一檔案內容", async () => {
    await repo.saveAll(SAMPLE);
    const result = await repo.getByDomain("emotion");
    expect(result).toHaveLength(2);
    expect(result.map((x) => x.alias).sort()).toEqual(["微笑", "笑"]);
  });
});
