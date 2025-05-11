import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import type { Step } from "./Step.Interface";
import type { EmojiAssignedAliasRepo as EmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Interface";

export class StepMergeDefinition implements Step {
  constructor(
    private readonly definitionRepo: EmojiDefinitionRepo,
    private readonly assignedAliasRepo: EmojiAssignedAliasRepo,
  ) {}

  async execute(): Promise<void> {
    const defs = await this.definitionRepo.getAll();
    await this.assignedAliasRepo.saveDefinitions(defs);
  }
}
