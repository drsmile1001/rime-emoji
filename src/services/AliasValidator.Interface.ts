import type { ValidationIssue } from "./AliasValidationReporter.Interface";

export interface AliasValidator {
  readonly id: string;
  validate(): Promise<ValidationIssue[]>;
}
