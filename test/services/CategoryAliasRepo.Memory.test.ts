import type { EmojiAlias, SubgroupAlias } from "@/entities/CategoryAlias";
import type { CategoryAliasRepo } from "@/services/CategoryAliasRepo.Interface";
import { CategoryAliasRepoMemory } from "@/services/CategoryAliasRepo.Memory";
import { describe, expect, test } from "bun:test";
import { createSampleEmojiDefinitions } from "~test/fixtures/Seeds";

describe("CategoryAliasRepoMemory", () => {
  const defs = createSampleEmojiDefinitions();

  test("應能初始化 emoji 定義並查詢 group/subgroup/emoji 結構", async () => {
    const repo: CategoryAliasRepo = new CategoryAliasRepoMemory();
    await repo.mergeDefinitions(defs);

    const subgroupAliases = await repo.getSubgroupAliases();
    expect(subgroupAliases.length).toBe(2);
    expect(subgroupAliases).toEqual(
      expect.arrayContaining([
        { group: "People & Body", subgroup: "hand-fingers-part", alias: [] },
        { group: "Smileys & Emotion", subgroup: "face-smiling", alias: [] },
      ]),
    );

    const emojiAliases = await repo.getEmojiAliases();
    expect(emojiAliases.map((e) => e.emoji)).toEqual(
      expect.arrayContaining(["✋", "🖐️", "😀"]),
    );
  });

  test("應能補上 alias 並從查詢取得", async () => {
    const repo: CategoryAliasRepo = new CategoryAliasRepoMemory();
    await repo.mergeDefinitions(defs);

    const emojiAlias: EmojiAlias = { emoji: "😀", alias: ["笑臉"] };

    const subgroupAlias: SubgroupAlias = {
      group: "Smileys & Emotion",
      subgroup: "face-smiling",
      alias: ["微笑臉"],
    };

    await repo.patchEmojiAliases([emojiAlias]);
    await repo.patchSubgroupAliases([subgroupAlias]);

    const updatedEmojiAliases = await repo.getEmojiAliases();
    const updatedSubgroupAliases = await repo.getSubgroupAliases();

    expect(updatedEmojiAliases.find((e) => e.emoji === "😀")?.alias).toEqual([
      "笑臉",
    ]);
    expect(
      updatedSubgroupAliases.find((s) => s.subgroup === "face-smiling")?.alias,
    ).toEqual(["微笑臉"]);
  });

  test("應能查詢 emoji 清單 by group/subgroup", async () => {
    const repo: CategoryAliasRepo = new CategoryAliasRepoMemory();
    await repo.mergeDefinitions(defs);

    const smileys = await repo.getEmojiBySubgroup(
      "Smileys & Emotion",
      "face-smiling",
    );
    expect(smileys.length).toBe(1);
    expect(smileys[0].emoji).toBe("😀");
  });
});
