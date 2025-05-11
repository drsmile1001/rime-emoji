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
    for (const { alias, subgroup, group } of subgroupAliases) {
      if (!alias.length) {
        issues.push({
          code: `MISS_SUBGROUP_ALIAS_${encodeKey(`${group}__${subgroup}`)}`,
          message: `子群組「${group} / ${subgroup}」缺少別名`,
          metadata: {},
        });
      }
    }

    const defs = await this.repo.getDefinitions();

    const emojiAliases = await this.repo.getEmojiAliases();
    for (const { alias, emoji } of emojiAliases) {
      if (!alias.length) {
        const def = defs.find((d) => d.emoji === emoji)!;
        issues.push({
          code: `MISS_EMOJI_ALIAS_${toCodePoints(emoji)}`,
          message: `Emoji ${emoji} 缺少別名`,
          metadata: {
            emoji: def.emoji,
            name: def.name,
            group: def.group,
            subgroup: def.subgroup,
          },
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
