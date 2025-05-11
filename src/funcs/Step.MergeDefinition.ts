import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import type { Step } from "./Step.Interface";
import type { CategoryAliasRepo } from "@/services/CategoryAliasRepo.Interface";

export class StepMergeDefinition implements Step {
  constructor(
    private readonly definitionRepo: EmojiDefinitionRepo,
    private readonly categoryAliasRepo: CategoryAliasRepo,
  ) {}

  async execute(): Promise<void> {
    const defs = await this.definitionRepo.getAll();
    await this.categoryAliasRepo.mergeDefinitions(defs);
  }
}
