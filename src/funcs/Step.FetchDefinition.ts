import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import type { Step } from "./Step.Interface";

export class StepFetchDefinition implements Step {
  constructor(
    private source: EmojiDefinitionRepo,
    private local: EmojiDefinitionRepo,
  ) {}

  async execute() {
    const defs = await this.source.getAll();
    await this.local.saveAll(defs);
  }
}
