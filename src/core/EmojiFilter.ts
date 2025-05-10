import type { EmojiDefinition } from "@/types";

/** 策略的回傳結果 */
export type EmojiFilterStrategyResult = {
  output: EmojiDefinition[];
  blocked: EmojiDefinition[];
};

/** 單一策略的實作 */
export type EmojiFilterStrategy = {
  id: string;
  description?: string;
  filter: (defs: EmojiDefinition[]) => EmojiFilterStrategyResult;
};

/** 每個策略實際的執行記錄 */
export type EmojiFilterStrategyRun = {
  strategy: EmojiFilterStrategy;
  input: EmojiDefinition[];
  output: EmojiDefinition[];
  blocked: EmojiDefinition[];
};

/** 最終整體過濾結果 */
export type EmojiFilterResult = {
  finalOutput: EmojiDefinition[];
  runs: EmojiFilterStrategyRun[];
};

/** 主流程：依序套用策略，記錄每一輪 input/output/blocked */
export function applyEmojiFilterStrategies(
  defs: EmojiDefinition[],
  strategies: EmojiFilterStrategy[],
): EmojiFilterResult {
  let current = defs;
  const runs: EmojiFilterStrategyRun[] = [];

  for (const strategy of strategies) {
    const input = current;
    const { output, blocked } = strategy.filter(input);
    runs.push({
      strategy,
      input,
      output,
      blocked,
    });
    current = output;
  }

  return {
    finalOutput: current,
    runs,
  };
}
