import type { SemanticAlias } from "@/entities/SemanticAlias";

/**
 * 語義別名定義儲存庫介面
 */
export interface SemanticAliasRepo {
  /** 儲存整批資料，會覆蓋原有內容 */
  saveAll(data: SemanticAlias[]): Promise<void>;

  /** 讀取所有別名定義 */
  getAll(): Promise<SemanticAlias[]>;

  /** 根據 alias 取得所有定義（可能跨多個語義) */
  getByAlias(alias: string): Promise<SemanticAlias[]>;

  /** 根據語義取得所有別名 */
  getByDomain(semantic: string): Promise<SemanticAlias[]>;
}
