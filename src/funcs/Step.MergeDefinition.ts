import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import type { Step } from "./Step.Interface";
import type { DefinitionAliasRepo } from "@/services/DefinitionAliasRepo.Interface";

export class StepMergeDefinition implements Step {
  constructor(
    private readonly emojiRepo: EmojiDefinitionRepo,
    private readonly aliasRepo: DefinitionAliasRepo,
  ) {}

  async execute(): Promise<void> {
    const defs = await this.emojiRepo.getAll();
    await this.aliasRepo.saveDefinitions(defs);
  }
}
