// emoji 中文別名的多義詞模型
export type DomainAlias = {
  alias: string; // 使用者輸入詞（如 "笑"）
  domain: string; // 所屬語意分類（如 "emotion"、"gesture"）
  emojis: string[]; // 多個 emoji unicode 字元
};

// 對應資料操作介面
export interface DomainAliasRepo {
  /** 儲存整批資料，會覆蓋原有內容 */
  saveAll(data: DomainAlias[]): Promise<void>;

  /** 讀取所有別名定義 */
  getAll(): Promise<DomainAlias[]>;

  /** 根據 alias 取得所有定義（可能跨多個 domain） */
  getByAlias(alias: string): Promise<DomainAlias[]>;

  /** 根據 domain 取得所有 alias */
  getByDomain(domain: string): Promise<DomainAlias[]>;
}
