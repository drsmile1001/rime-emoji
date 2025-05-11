export interface Step {
  execute: () => Promise<void>;
}
