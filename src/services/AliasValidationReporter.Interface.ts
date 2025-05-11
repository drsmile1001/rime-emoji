// 定義單一驗證錯誤項目
export type ValidationIssue = {
  /** 唯一錯誤識別鍵，例如 MISS_EMOJI_ALIAS_1F600 */
  code: string;
  /** 錯誤簡述訊息 */
  message: string;
  /** 補充資料，用於 debug 或記錄 */
  metadata: Record<string, any>;
};

// 驗證結果摘要
export type ValidationSummary = {
  emojiTotal: number;
  emojiMissingAlias: number;
  duplicateEmojiAlias: number;
  groupMissingAlias: number;
  subgroupMissingAlias: number;
  [key: string]: number;
};

// 驗證報告輸入格式
export type AliasValidationResult = {
  issues: ValidationIssue[];
  summary: ValidationSummary;
};

// 輸出報告者介面
export interface AliasValidationReporter {
  report(data: AliasValidationResult): Promise<void>;
}
