import type { Static, TObject, TSchema, TTransform } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";

type StaticWithTransform<T extends TSchema> = T extends TTransform<
  any,
  infer To
>
  ? To
  : Static<T>;

export interface ConfigProvider<TConfig extends Record<string, unknown>> {
  get<TKey extends keyof TConfig>(key: TKey): TConfig[TKey];
  set<TKey extends keyof TConfig>(
    key: TKey,
    value: TConfig[TKey] | undefined,
  ): void;
}
export class EnvConfigProvider<TSchema extends TObject>
  implements
    ConfigProvider<{
      [K in keyof TSchema["properties"]]: StaticWithTransform<
        TSchema["properties"][K]
      >;
    }>
{
  private records: Partial<{
    [K in keyof TSchema["properties"]]: StaticWithTransform<
      TSchema["properties"][K]
    >;
  }>;

  constructor(
    schema: TSchema,
    private fallback: Partial<{
      [K in keyof TSchema["properties"]]: StaticWithTransform<
        TSchema["properties"][K]
      >;
    }> = {},
  ) {
    const raw = Value.Clone(Bun.env);
    const cleaned = Value.Clean(schema, raw);
    this.records = {
      ...this.fallback,
      ...Value.Decode(schema, cleaned),
    };
  }

  get<TKey extends keyof TSchema["properties"]>(
    key: TKey,
  ): StaticWithTransform<TSchema["properties"][TKey]> {
    const val = this.records[key];
    if (val === undefined) {
      throw new Error(`Missing config key: ${String(key)}`);
    }
    return val;
  }

  set<TKey extends keyof TSchema["properties"]>(
    key: TKey,
    value: StaticWithTransform<TSchema["properties"][TKey]> | undefined,
  ): void {
    this.records[key] = value;
  }
}
