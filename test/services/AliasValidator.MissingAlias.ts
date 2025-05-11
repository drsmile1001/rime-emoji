import { describe, expect, test } from "bun:test";
import { CategoryAliasRepoMemory } from "@/services/CategoryAliasRepo.Memory";
import { AliasValidatorMissingAlias } from "@/services/AliasValidator.MissingAlias";

describe("AliasValidatorEmpty", () => {
  test("應能產出 group、subgroup、emoji 的空 alias 錯誤", async () => {
    const repo = new CategoryAliasRepoMemory();

    await repo.mergeDefinitions([
      {
        group: "Smileys & Emotion",
        subgroup: "face-smiling",
        emoji: "😀",
        name: "Grinning Face",
        codePoints: ["1F600"],
      },
    ]);

    const validator = new AliasValidatorMissingAlias(repo);
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
