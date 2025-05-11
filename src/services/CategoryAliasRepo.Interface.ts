import type { EmojiAlias, SubgroupAlias } from "@/entities/CategoryAlias";
import type { EmojiDefinition } from "@/entities/EmojiDefinition";

/**
 * emoji 定義的存取與別名維護介面
 */
export interface CategoryAliasRepo {
  /**
   * 以原始 emoji 定義初始化資料結構。
   * 實作端應建立所有群組、子群組、emoji 對應資料。
   * alias 欄位預設為空字串。
   */
  mergeDefinitions(defs: EmojiDefinition[]): Promise<void>;

  /**
   * 提供 alias 修補功能，模擬 YAML 編輯行為。
   */
  patchSubgroupAliases(aliases: SubgroupAlias[]): Promise<void>;
  patchEmojiAliases(aliases: EmojiAlias[]): Promise<void>;

  /**
   * 查詢目前的別名（可用於 export / validate）
   */
  getSubgroupAliases(): Promise<SubgroupAlias[]>;
  getEmojiAliases(): Promise<EmojiAlias[]>;

  /**
   * 查詢 emoji 定義，依據 group/subgroup 層級回傳
   */
  getEmojiBySubgroup(
    group: string,
    subgroup: string,
  ): Promise<EmojiDefinition[]>;
}
