import type { ValidationIssue } from "./AliasValidateResultReporter.Interface";

export interface DefinitionAliasValidator {
  readonly id: string;
  validate(): Promise<ValidationIssue[]>;
}
