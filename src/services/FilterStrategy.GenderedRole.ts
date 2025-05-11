import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import type { FilterStrategy } from "./FilterStrategy.Interface";

/**
 * FilterStrategyGenderedRole
 *
 * ✅ 目的：
 *   - 排除含有特定性別角色（man 👨 / woman 👩）的 emoji。
 *
 * ❌ 不處理家庭/情侶組合。
 * 🧪 可在實測中觀察誤殺後再加入 allowlist。
 */
export class FilterStrategyGenderedRole implements FilterStrategy {
  readonly id = "gendered-role";
  readonly description = "排除含 👨 / 👩 的 emoji（中性人物 🧑 不受影響）";
  readonly genderedPersons = ["1F468", "1F469"];

  filter(defs: EmojiDefinition[]) {
    {
      const output: typeof defs = [];
      const blocked: typeof defs = [];

      for (const def of defs) {
        const hasGenderedPerson = def.codePoints
          .map((cp) => cp.toUpperCase())
          .some((cp) => this.genderedPersons.includes(cp));

        if (hasGenderedPerson) {
          blocked.push(def);
        } else {
          output.push(def);
        }
      }

      return { output, blocked };
    }
  }
}
