import type { Step } from "./Step.Interface";
import type {
  DomainAliasRepo,
  DomainAlias,
} from "@/services/DomainAliasRepo.Interface";
import type { EmojiAssignedAliasRepo } from "@/services/EmojiAssignedAliasRepo.Interface";

/**
 * 根據已建立的分類別名（EmojiAssignedAliasRepo）
 * 建立初版 domain alias 定義（預設 domain 為 "default"）
 */
export class StepBuildDomainAliasFromAssigned implements Step {
  constructor(
    private readonly assignedAliasRepo: EmojiAssignedAliasRepo,
    private readonly targetRepo: DomainAliasRepo,
    private readonly domain: string = "default",
  ) {}

  async execute(): Promise<void> {
    const aliases: DomainAlias[] = [];

    const emojiAliases = await this.assignedAliasRepo.getEmojiAliases();
    for (const item of emojiAliases) {
      if (!item.alias.trim()) continue;
      aliases.push({
        alias: item.alias,
        domain: this.domain,
        emojis: [item.emoji],
      });
    }

    const groupAliases = await this.assignedAliasRepo.getGroupAliases();
    for (const group of groupAliases) {
      if (!group.alias.trim()) continue;
      const emojis = await this.assignedAliasRepo.getEmojiByGroup(group.group);
      if (emojis.length > 0) {
        aliases.push({
          alias: group.alias,
          domain: this.domain,
          emojis: emojis.map((e) => e.emoji),
        });
      }
    }

    const subgroupAliases = await this.assignedAliasRepo.getSubgroupAliases();
    for (const sg of subgroupAliases) {
      if (!sg.alias.trim()) continue;
      const emojis = await this.assignedAliasRepo.getEmojiBySubgroup(
        sg.group,
        sg.subgroup,
      );
      if (emojis.length > 0) {
        aliases.push({
          alias: sg.alias,
          domain: this.domain,
          emojis: emojis.map((e) => e.emoji),
        });
      }
    }

    await this.targetRepo.saveAll(aliases);
  }
}
