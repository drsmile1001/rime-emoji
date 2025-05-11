/**
 * 語義別名定義
 */
export type SemanticAlias = {
  /**
   * 別名（如 "成功"）
   */
  alias: string;
  /**
   * 語義類別（如 "development"）
   */
  semantic: string;
  emojis: string[]; // 多個 emoji unicode 字元
};
