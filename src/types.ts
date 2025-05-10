/**
 * 原始平坦化的emoji定義
 */
export type EmojiDefinition = {
  group: string;
  subgroup: string;
  name: string;
  emoji: string;
  codePoints: string[];
};

/**
 * 使用者定義的群組別名（中文)
 */
export type EmojiGroupAlias = {
  group: string;
  alias: string | null;
};

/**
 * 使用者定義的子群組別名（中文)
 */
export type EmojiSubgroupAlias = {
  group: string;
  subgroup: string;
  alias: string | null;
};

/**
 * 使用者定義的emoji別名（中文)
 */
export type EmojiAlias = {
  group: string;
  subgroup: string;
  emoji: string;
  alias: string | null;
};

/**
 * 使用者透過檔案維護的結構化定義
 */
export type EmojiDefinitionFile = {
  group: string;
  alias?: string;
  subgroups: {
    subgroup: string;
    alias?: string;
    emojis: {
      codePoints: string[];
      emoji: string;
      name: string;
      alias?: string;
    }[];
  }[];
}[];

export type AliasFile = AliasDomainDefinition[];

export type AliasDomainDefinition = {
  domain: string;
  aliases: AliasDefinition[];
};

export type AliasDefinition = {
  domain: string;
  alias: string;
  emojis: string[];
};
