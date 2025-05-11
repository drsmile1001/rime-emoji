import { describe, expect, test, afterEach } from "bun:test";
import { createSampleEmojiDefinitions } from "../fixtures/Seeds";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";
import { MemoryEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Memory";
import {
  YamlDefinitionAliasRepo,
  type YamlDefinitionAlias,
} from "@/services/DefinitionAliasRepo.Yaml";
import kleur from "kleur";
import { rm } from "node:fs/promises";
import type { DefinitionAliasRepo } from "@/services/DefinitionAliasRepo.Interface";
import { YamlFile } from "@/utils/YamlFile";

describe("YamlDefinitionAliasRepo", () => {
  const config = getTestConfig();
  const OUTPUT_DIR = resolveTmpDir("DefinitionAliasRepo.Yaml");

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      await rm(OUTPUT_DIR, { recursive: true, force: true });
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${OUTPUT_DIR}`));
    }
  });

  test("應能將 emoji 定義存為分組 YAML 檔並讀回", async () => {
    const emojiRepo = new MemoryEmojiDefinitionRepo();
    const defs = createSampleEmojiDefinitions();
    await emojiRepo.saveAll(defs);

    const repo: DefinitionAliasRepo = new YamlDefinitionAliasRepo(OUTPUT_DIR);
    await repo.saveDefinitions(defs);

    const readBack = await new YamlFile<YamlDefinitionAlias>(
      OUTPUT_DIR,
      "People_20_26_20Body.yaml",
      {
        name: "",
        alias: undefined,
        subGroups: [],
      },
    ).read();

    // ✅ 驗證 YAML 結構
    expect(readBack).toEqual({
      name: "People & Body",
      alias: undefined,
      subGroups: [
        {
          name: "hand-fingers-part",
          alias: undefined,
          emojis: [
            { emoji: "✋", name: "Raised Hand", alias: undefined },
            {
              emoji: "🖐️",
              name: "Hand with Fingers Splayed",
              alias: undefined,
            },
          ],
        },
      ],
    });
  });
});
