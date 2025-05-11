import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { FilterSummaryReporter } from "@/services/FilterSummaryReporter.Interface";

export class FilterSummaryReporterFake implements FilterSummaryReporter {
  public summaryCalled: boolean = false;
  public receivedSummary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  } | null = null;

  async reportSummary(summary: {
    finalOutput: EmojiDefinition[];
    strategyRuns: {
      id: string;
      input: EmojiDefinition[];
      blocked: EmojiDefinition[];
    }[];
  }): Promise<void> {
    this.summaryCalled = true;
    this.receivedSummary = summary;
  }
}
