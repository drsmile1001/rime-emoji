import type { ValidationIssue } from "./AliasValidationReporter.Interface";
import type { CategoryAliasRepo } from "./CategoryAliasRepo.Interface";
import type { AliasValidator } from "./AliasValidator.Interface";

/**
 * 空別名檢查器：檢查 emoji、subgroup 中未填寫 alias 的項目
 */
export class AliasValidatorMissingAlias implements AliasValidator {
  readonly id = "empty-alias";

  constructor(private readonly repo: CategoryAliasRepo) {}

  async validate(): Promise<ValidationIssue[]> {
    const issues: ValidationIssue[] = [];

    const subgroupAliases = await this.repo.getSubgroupAliases();
    for (const sg of subgroupAliases) {
      if (!sg.alias.length) {
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
      if (!emoji.alias.length) {
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
