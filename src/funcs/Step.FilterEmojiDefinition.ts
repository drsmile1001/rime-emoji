import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { EmojiDefinitionRepo } from "@/services/EmojiDefinitionRepo.Interface";
import type { EmojiFilterStrategy } from "@/services/EmojiFilterStrategy.Interface";
import type { FilterEmojiDefinitionResultReporter } from "@/services/FilterEmojiDefinitionResultReporter.Interface";
import type { StrategyReporter } from "@/services/StrategyReporter.Interface";
import type { Step } from "./Step.Interface";

export class StepFilterEmojiDefinition implements Step {
  constructor(
    private sourceDefinitionRepo: EmojiDefinitionRepo,
    private filterStrategies: EmojiFilterStrategy[],
    private strategyReporter: StrategyReporter,
    private summaryReporter: FilterEmojiDefinitionResultReporter,
    private filterDefinitionRepo: EmojiDefinitionRepo,
  ) {}

  async execute(): Promise<void> {
    const originalDefs = await this.sourceDefinitionRepo.getAll();
    const runs = await this.applyStrategies(originalDefs);
    const finalOutput = runs[runs.length - 1]?.output ?? originalDefs;

    await this.filterDefinitionRepo.saveAll(finalOutput);

    await this.summaryReporter.reportSummary({
      finalOutput,
      strategyRuns: runs.map(({ id, input, blocked }) => ({
        id,
        input,
        blocked,
      })),
    });
  }

  private async applyStrategies(defs: EmojiDefinition[]): Promise<
    {
      id: string;
      input: EmojiDefinition[];
      output: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[]
  > {
    const result: {
      id: string;
      input: EmojiDefinition[];
      output: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[] = [];

    let current = defs;

    for (const strategy of this.filterStrategies) {
      const input = current;
      const { output, blocked } = strategy.filter(input);
      await this.strategyReporter.report(strategy.id, blocked, input);
      result.push({ id: strategy.id, input, output, blocked });
      current = output;
    }

    return result;
  }
}
