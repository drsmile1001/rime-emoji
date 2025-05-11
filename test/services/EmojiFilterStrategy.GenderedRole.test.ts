import type { EmojiDefinition } from "@/entities/EmojiDefinition";
import { FilterStrategyGenderedRole } from "@/services/FilterStrategy.GenderedRole";
import { describe, expect, test } from "bun:test";

describe("FilterStrategyGenderedRole", () => {
  test("應排除含 👨 / 👩 的 emoji", () => {
    const defs: EmojiDefinition[] = [
      {
        emoji: "👨‍⚕️",
        name: "man health worker",
        group: "People",
        subgroup: "person-role",
        codePoints: ["1F468", "200D", "2695", "FE0F"],
      },
      {
        emoji: "👩‍🍳",
        name: "woman cook",
        group: "People",
        subgroup: "person-role",
        codePoints: ["1F469", "200D", "1F373"],
      },
    ];

    const { blocked, output } = new FilterStrategyGenderedRole().filter(defs);
    expect(blocked.map((e) => e.emoji)).toEqual(["👨‍⚕️", "👩‍🍳"]);
    expect(output).toHaveLength(0);
  });

  test("應保留含 🧑 的中性人物 emoji", () => {
    const defs: EmojiDefinition[] = [
      {
        emoji: "🧑‍🏫",
        name: "teacher",
        group: "People",
        subgroup: "person-role",
        codePoints: ["1F9D1", "200D", "1F3EB"],
      },
    ];

    const { blocked, output } = new FilterStrategyGenderedRole().filter(defs);
    expect(blocked).toHaveLength(0);
    expect(output.map((e) => e.emoji)).toEqual(["🧑‍🏫"]);
  });

  test("應保留非人物 emoji，例如 🐻‍❄️", () => {
    const defs: EmojiDefinition[] = [
      {
        emoji: "🐻‍❄️",
        name: "polar bear",
        group: "Animals & Nature",
        subgroup: "animal-mammal",
        codePoints: ["1F43B", "200D", "2744", "FE0F"],
      },
    ];

    const { blocked, output } = new FilterStrategyGenderedRole().filter(defs);
    expect(blocked).toHaveLength(0);
    expect(output.map((e) => e.emoji)).toEqual(["🐻‍❄️"]);
  });
});
