import { describe, expect, test } from "bun:test";
import { createSampleEmojiDefinitions } from "../fixtures/Seeds";
import type { EmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Interface";
import type {
  EmojiAlias,
  GroupAlias,
  SubgroupAlias,
} from "@/entities/EmojiAssignedAlias";
import { MemoryEmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Memory";

describe("MemoryDefinitionAliasRepo", () => {
  const defs = createSampleEmojiDefinitions();

  test("應能初始化 emoji 定義並查詢 group/subgroup/emoji 結構", async () => {
    const repo: EmojiAssignedAliasRepo = new MemoryEmojiAssignedAliasRepo();
    await repo.saveDefinitions(defs);

    const groupAliases = await repo.getGroupAliases();
    expect(groupAliases.map((g) => g.group)).toEqual(
      expect.arrayContaining(["People & Body", "Smileys & Emotion"]),
    );

    const subgroupAliases = await repo.getSubgroupAliases();
    expect(subgroupAliases.length).toBe(2);
    expect(subgroupAliases).toEqual(
      expect.arrayContaining([
        { group: "People & Body", subgroup: "hand-fingers-part", alias: "" },
        { group: "Smileys & Emotion", subgroup: "face-smiling", alias: "" },
      ]),
    );

    const emojiAliases = await repo.getEmojiAliases();
    expect(emojiAliases.map((e) => e.emoji)).toEqual(
      expect.arrayContaining(["✋", "🖐️", "😀"]),
    );
  });

  test("應能補上 alias 並從查詢取得", async () => {
    const repo: EmojiAssignedAliasRepo = new MemoryEmojiAssignedAliasRepo();
    await repo.saveDefinitions(defs);

    const emojiAlias: EmojiAlias = { emoji: "😀", alias: "笑臉" };
    const groupAlias: GroupAlias = {
      group: "Smileys & Emotion",
      alias: "表情",
    };
    const subgroupAlias: SubgroupAlias = {
      group: "Smileys & Emotion",
      subgroup: "face-smiling",
      alias: "微笑臉",
    };

    await repo.patchEmojiAliases([emojiAlias]);
    await repo.patchGroupAliases([groupAlias]);
    await repo.patchSubgroupAliases([subgroupAlias]);

    const updatedEmojiAliases = await repo.getEmojiAliases();
    const updatedGroupAliases = await repo.getGroupAliases();
    const updatedSubgroupAliases = await repo.getSubgroupAliases();

    expect(updatedEmojiAliases.find((e) => e.emoji === "😀")?.alias).toBe(
      "笑臉",
    );
    expect(
      updatedGroupAliases.find((g) => g.group === "Smileys & Emotion")?.alias,
    ).toBe("表情");
    expect(
      updatedSubgroupAliases.find((s) => s.subgroup === "face-smiling")?.alias,
    ).toBe("微笑臉");
  });

  test("應能查詢 emoji 清單 by group/subgroup", async () => {
    const repo: EmojiAssignedAliasRepo = new MemoryEmojiAssignedAliasRepo();
    await repo.saveDefinitions(defs);

    const people = await repo.getEmojiByGroup("People & Body");
    expect(people.length).toBe(2);
    expect(people.map((e) => e.emoji)).toEqual(
      expect.arrayContaining(["✋", "🖐️"]),
    );

    const smileys = await repo.getEmojiBySubgroup(
      "Smileys & Emotion",
      "face-smiling",
    );
    expect(smileys.length).toBe(1);
    expect(smileys[0].emoji).toBe("😀");
  });
});
