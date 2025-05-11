import { describe, expect, test } from "bun:test";
import { MemoryEmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Memory";
import { EmptyAliasValidator } from "@/services/DefinitionAliasValidator.EmptyAlias";

describe("EmptyAliasValidator", () => {
  test("應能產出 group、subgroup、emoji 的空 alias 錯誤", async () => {
    const repo = new MemoryEmojiAssignedAliasRepo();

    await repo.saveDefinitions([
      {
        group: "Smileys & Emotion",
        subgroup: "face-smiling",
        emoji: "😀",
        name: "Grinning Face",
        codePoints: ["1F600"],
      },
    ]);

    const validator = new EmptyAliasValidator(repo);
    const issues = await validator.validate();

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "MISS_GROUP_ALIAS_Smileys_20_26_20Emotion",
          validatorId: "empty-alias",
          type: "group-alias-missing",
        }),
        expect.objectContaining({
          code: "MISS_SUBGROUP_ALIAS_Smileys_20_26_20Emotion__face-smiling",
          type: "subgroup-alias-missing",
        }),
        expect.objectContaining({
          code: "MISS_EMOJI_ALIAS_1F600",
          type: "emoji-alias-missing",
        }),
      ]),
    );
  });
});
