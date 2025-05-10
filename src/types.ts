export type DefinitionsFile = EmojiGroupDefinition[];
export type EmojiGroupDefinition = {
  name: string;
  subgroups: EmojiSubgroupDefinition[];
};

export type EmojiSubgroupDefinition = {
  name: string;
  zhName?: string;
  emojis: EmojiDefinition[];
};

export type EmojiDefinition = {
  name: string;
  zhName?: string;
  emoji: string;
};

export type AliasFile = AliasDomainDefinition[];

export type AliasDomainDefinition = {
  domain: string;
  aliases: AliasDefinition[];
};

export type AliasDefinition = {
  alias: string;
  emojis: string[];
};
