import { describe, expect, test } from "bun:test";
import { StepMergeDefinition } from "@/funcs/Step.MergeDefinition";
import { EmojiDefinitionRepoMemory } from "@/services/EmojiDefinitionRepo.Memory";
import { CategoryAliasRepoMemory } from "@/services/CategoryAliasRepo.Memory";
import { createSampleEmojiDefinitions } from "../fixtures/Seeds";

describe("StepMergeDefinition", () => {
  test("應能初始化 aliasRepo 的群組結構", async () => {
    const emojiRepo = new EmojiDefinitionRepoMemory();
    const aliasRepo = new CategoryAliasRepoMemory();

    const sampleDefs = createSampleEmojiDefinitions();
    await emojiRepo.saveAll(sampleDefs);

    const step = new StepMergeDefinition(emojiRepo, aliasRepo);
    await step.execute();

    // ✅ 驗證 group alias
    const groupAliases = await aliasRepo.getGroupAliases();
    expect(groupAliases).toEqual(
      expect.arrayContaining([
        { group: "People & Body", alias: "" },
        { group: "Smileys & Emotion", alias: "" },
      ]),
    );

    // ✅ 驗證 subgroup alias
    const subgroupAliases = await aliasRepo.getSubgroupAliases();
    expect(subgroupAliases).toEqual(
      expect.arrayContaining([
        {
          group: "People & Body",
          subgroup: "hand-fingers-part",
          alias: "",
        },
        {
          group: "Smileys & Emotion",
          subgroup: "face-smiling",
          alias: "",
        },
      ]),
    );

    // ✅ 驗證 emoji alias
    const emojiAliases = await aliasRepo.getEmojiAliases();
    expect(emojiAliases).toEqual(
      expect.arrayContaining([
        { emoji: "✋", alias: "" },
        { emoji: "🖐️", alias: "" },
        { emoji: "😀", alias: "" },
      ]),
    );
  });
});
