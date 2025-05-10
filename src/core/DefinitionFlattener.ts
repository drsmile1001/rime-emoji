import type { EmojiDefinition, EmojiDefinitionFile } from "@/types";

/**
 * 將結構化的 EmojiDefinitionFile 解構為平坦的 EmojiDefinition[]
 */
export function flattenDefinitions(
  file: EmojiDefinitionFile,
): EmojiDefinition[] {
  const result: EmojiDefinition[] = [];
  for (const group of file) {
    const groupName = group.group;
    for (const subgroup of group.subgroups) {
      const subgroupName = subgroup.subgroup;
      for (const emoji of subgroup.emojis) {
        result.push({
          group: groupName,
          subgroup: subgroupName,
          name: emoji.name,
          emoji: emoji.emoji,
          codePoints: emoji.codePoints,
        });
      }
    }
  }
  return result;
}
