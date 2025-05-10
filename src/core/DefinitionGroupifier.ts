import type { EmojiDefinition, EmojiDefinitionFile } from "@/types";

/**
 * 將平坦化的 EmojiDefinition[] 根據 group/subgroup 重建為 EmojiDefinitionFile
 */
export function groupifyDefinitions(
  defs: EmojiDefinition[],
): EmojiDefinitionFile {
  const groupMap = new Map<string, Map<string, EmojiDefinition[]>>();

  for (const def of defs) {
    if (!groupMap.has(def.group)) {
      groupMap.set(def.group, new Map());
    }
    const subgroupMap = groupMap.get(def.group)!;
    if (!subgroupMap.has(def.subgroup)) {
      subgroupMap.set(def.subgroup, []);
    }
    subgroupMap.get(def.subgroup)!.push(def);
  }

  const result: EmojiDefinitionFile = [];

  for (const [group, subgroups] of groupMap.entries()) {
    const subgroupList = Array.from(subgroups.entries()).map(
      ([subgroup, emojis]) => ({
        subgroup,
        emojis: emojis.map((e) => ({
          emoji: e.emoji,
          name: e.name,
          codePoints: e.codePoints,
        })),
      }),
    );
    result.push({
      group,
      subgroups: subgroupList,
    });
  }

  return result;
}
