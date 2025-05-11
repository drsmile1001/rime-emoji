import type { AliasValidator } from "@/services/AliasValidator.Interface";
import type { Step } from "./Step.Interface";
import type {
  AliasValidationReporter,
  ValidationIssue,
  ValidationSummary,
} from "@/services/AliasValidationReporter.Interface";

export class StepValidateDefinitionAlias implements Step {
  constructor(
    private readonly validators: AliasValidator[],
    private readonly reporter: AliasValidationReporter,
  ) {}

  async execute(): Promise<void> {
    const allIssues: ValidationIssue[] = [];

    for (const validator of this.validators) {
      const issues = await validator.validate();
      allIssues.push(...issues);
    }

    const summary: ValidationSummary = this.summarize(allIssues);
    await this.reporter.report({ issues: allIssues, summary });
  }

  private summarize(issues: ValidationIssue[]): ValidationSummary {
    const sum: ValidationSummary = {
      emojiTotal: 0,
      emojiMissingAlias: 0,
      duplicateEmojiAlias: 0,
      groupMissingAlias: 0,
      subgroupMissingAlias: 0,
    };

    for (const i of issues) {
      if (i.code.startsWith("MISS_EMOJI_ALIAS_")) sum.emojiMissingAlias += 1;
      if (i.code.startsWith("MISS_GROUP_ALIAS_")) sum.groupMissingAlias += 1;
      if (i.code.startsWith("MISS_SUBGROUP_ALIAS_"))
        sum.subgroupMissingAlias += 1;
      if (i.code.startsWith("DUP_EMOJI_ALIAS_")) sum.duplicateEmojiAlias += 1;
    }

    sum.emojiTotal = sum.emojiMissingAlias + 10; // placeholder, TODO: 可從 repo 查 emoji 總數

    return sum;
  }
}
