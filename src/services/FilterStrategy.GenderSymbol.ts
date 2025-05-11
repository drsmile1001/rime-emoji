import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { FilterStrategy } from "./FilterStrategy.Interface";

/**
 * FilterStrategyGenderSymbol
 *
 * ✅ 目的：
 *   - 排除含有 Unicode 性別符號 ♀️ (2640), ♂️ (2642) 的合成 emoji。
 *
 * 🛡️ 排除誤殺：
 *   - 對於 subgroup 為 "gender" 的 emoji（單獨性別符號），保留不過濾。
 */
export class FilterStrategyGenderSymbol implements FilterStrategy {
  readonly id = "gender-symbol";
  readonly description = "排除含性別符號 (♀️ / ♂️) 的合成 emoji，保留符號本體";
  readonly genderSymbols = ["2640", "2642"];
  filter(defs: EmojiDefinition[]) {
    const output: typeof defs = [];
    const blocked: typeof defs = [];

    for (const def of defs) {
      if (def.subgroup === "gender") {
        output.push(def); // 保留 ♀️、♂️
        continue;
      }

      const hasGenderSymbol = def.codePoints
        .map((cp) => cp.toUpperCase())
        .some((cp) => this.genderSymbols.includes(cp));

      if (hasGenderSymbol) {
        blocked.push(def);
      } else {
        output.push(def);
      }
    }

    return { output, blocked };
  }
}
