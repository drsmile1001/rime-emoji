import type { EmojiDefinition } from "@/entities/EmojiDefinition";

/**
 * 建立一組標準測試用 emoji 定義資料
 */
export function createSampleEmojiDefinitions(): EmojiDefinition[] {
  return [
    {
      group: "People & Body",
      subgroup: "hand-fingers-part",
      emoji: "✋",
      name: "Raised Hand",
      codePoints: ["270B"],
    },
    {
      group: "People & Body",
      subgroup: "hand-fingers-part",
      emoji: "🖐️",
      name: "Hand with Fingers Splayed",
      codePoints: ["1F590", "FE0F"],
    },
    {
      group: "Smileys & Emotion",
      subgroup: "face-smiling",
      emoji: "😀",
      name: "Grinning Face",
      codePoints: ["1F600"],
    },
  ];
}
