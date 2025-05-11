import type { EmojiAssignedAliasRepo } from "./EmojiAssignedAliasRepo.Interface";
import type { ValidationIssue } from "./AliasValidateResultReporter.Interface";
import type { DefinitionAliasValidator } from "./DefinitionAliasValidator.Interface";

/**
 * 空別名檢查器：檢查 emoji、group、subgroup 中未填寫 alias 的項目
 */
export class EmptyAliasValidator implements DefinitionAliasValidator {
  readonly id = "empty-alias";

  constructor(private readonly repo: EmojiAssignedAliasRepo) {}

  async validate(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    const groupAliases = await this.repo.getGroupAliases();
    for (const group of groupAliases) {
      if (!group.alias?.trim()) {
        issues.push({
          code: `MISS_GROUP_ALIAS_${encodeKey(group.group)}`,
          validatorId: this.id,
          type: "group-alias-missing",
          severity: "warn",
          message: `群組「${group.group}」缺少別名`,
          metadata: { group: group.group },
        });
      }
    }

    const subgroupAliases = await this.repo.getSubgroupAliases();
    for (const sg of subgroupAliases) {
      if (!sg.alias?.trim()) {
        issues.push({
          code: `MISS_SUBGROUP_ALIAS_${encodeKey(
            `${sg.group}__${sg.subgroup}`,
          )}`,
          validatorId: this.id,
          type: "subgroup-alias-missing",
          severity: "warn",
          message: `子群組「${sg.group} / ${sg.subgroup}」缺少別名`,
          metadata: sg,
        });
      }
    }

    const emojiAliases = await this.repo.getEmojiAliases();
    for (const emoji of emojiAliases) {
      if (!emoji.alias?.trim()) {
        issues.push({
          code: `MISS_EMOJI_ALIAS_${toCodePoints(emoji.emoji)}`,
          validatorId: this.id,
          type: "emoji-alias-missing",
          severity: "warn",
          message: `Emoji ${emoji.emoji} 缺少別名`,
          metadata: emoji,
        });
      }
    }

    return issues;
  }
}

function encodeKey(value: string): string {
  return encodeURIComponent(value).replace(/%/g, "_");
}

function toCodePoints(emoji: string): string {
  return [...emoji]
    .map((c) => c.codePointAt(0)?.toString(16).toUpperCase())
    .join("_");
}
