import { expect } from "bun:test";

export async function expectToThrow<ThrowError = undefined>(
  fn: () => Promise<unknown>,
) {
  let threw = false;
  let returnError: ThrowError | undefined;
  try {
    await fn();
  } catch (error) {
    threw = true;
    returnError = error as ThrowError;
  }
  expect(threw).toBe(true);
  return returnError as ThrowError;
}
