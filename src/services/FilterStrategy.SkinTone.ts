import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { FilterStrategy } from "./FilterStrategy.Interface";

export class FilterStrategySkinTone implements FilterStrategy {
  readonly id = "skin-tone";
  readonly description = "排除含膚色修飾符的 emoji";
  readonly skinToneModifiers = ["1F3FB", "1F3FC", "1F3FD", "1F3FE", "1F3FF"];
  filter(defs: EmojiDefinition[]) {
    const output: typeof defs = [];
    const blocked: typeof defs = [];

    for (const def of defs) {
      const upperCodePoints = def.codePoints.map((cp) => cp.toUpperCase());
      const hasSkinTone = upperCodePoints.some((cp) =>
        this.skinToneModifiers.includes(cp),
      );

      if (hasSkinTone) {
        blocked.push(def);
      } else {
        output.push(def);
      }
    }

    return { output, blocked };
  }
}
