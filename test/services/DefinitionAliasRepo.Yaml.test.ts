import { describe, expect, test, afterEach } from "bun:test";
import { createSampleEmojiDefinitions } from "../fixtures/Seeds";
import { getTestConfig } from "../config/TestConfig";
import { resolveTmpDir } from "../utils/TestDir";
import { MemoryEmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Memory";
import {
  YamlEmojiAssignedAliasRepo,
  type YamlDefinitionAlias,
} from "@/services/EmojiAssignedAliasRepo.Yaml";
import kleur from "kleur";
import { rm } from "node:fs/promises";
import type { EmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Interface";
import { YamlFile } from "@/utils/YamlFile";

describe("YamlDefinitionAliasRepo", () => {
  const config = getTestConfig();
  const outputDir: string[] = [];
  function requestOutputDir(id: string) {
    const dir = resolveTmpDir(`DefinitionAliasRepo.Yaml.${id}`);
    outputDir.push(dir);
    return dir;
  }

  afterEach(async () => {
    if (!config.get("KEEP_TEST_OUTPUT")) {
      for (const dir of outputDir) {
        await rm(dir, { recursive: true, force: true });
      }
    } else {
      console.warn(kleur.yellow(`⚠️ 測試輸出保留於 ${outputDir.join(", ")}`));
    }
  });

  test("應能將 emoji 定義存為分組 YAML 檔並讀回", async () => {
    const OUTPUT_DIR = requestOutputDir("save");
    const emojiRepo = new MemoryEmojiDefinitionRepo();
    const defs = createSampleEmojiDefinitions();
    await emojiRepo.saveAll(defs);

    const repo: EmojiAssignedAliasRepo = new YamlEmojiAssignedAliasRepo(
      OUTPUT_DIR,
    );
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

  test("應保留使用者填寫的 alias 不被覆蓋", async () => {
    const OUTPUT_DIR = requestOutputDir("merge");
    const defs = createSampleEmojiDefinitions();

    // 第一次寫入
    const repo = new YamlEmojiAssignedAliasRepo(OUTPUT_DIR);
    await repo.saveDefinitions(defs);

    // 模擬使用者填入 alias
    const groupFile = new YamlFile<any>(
      OUTPUT_DIR,
      "People_20_26_20Body.yaml",
      { name: "", subGroups: [] },
    );
    const data = await groupFile.read();
    data.alias = "人群";
    data.subGroups[0].alias = "手部";
    data.subGroups[0].emojis[0].alias = "招手";
    await groupFile.write(data);

    // 第二次執行 saveDefinitions，應保留 alias
    await repo.saveDefinitions(defs);

    const final = await groupFile.read();
    expect(final.alias).toBe("人群");
    expect(final.subGroups[0].alias).toBe("手部");
    expect(final.subGroups[0].emojis[0].alias).toBe("招手");
  });
});
