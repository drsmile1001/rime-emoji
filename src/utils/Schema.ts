import {
  Type,
  type TLiteral,
  type TString,
  type TTransform,
  type TUnion,
} from "@sinclair/typebox";

export function enumLiterals<
  T extends readonly (readonly [string, string] | [string])[],
>(
  description: string,
  defs: T,
): TUnion<[...{ [K in keyof T]: TLiteral<T[K][0]> }]> {
  return Type.Union(
    defs.map(([value, description]) => Type.Literal(value, { description })),
    {
      description,
    },
  ) as any;
}

export function enumLiteralArray<
  T extends readonly (readonly [string, string] | [string])[],
>(description: string, defs: T): TTransform<TString, T[number][0][]> {
  const literals = defs.map(([value]) => value) as T[number][0][];

  const transform = Type.Transform(Type.String())
    .Decode((v: string) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter((x) => literals.includes(x) as unknown as T[number][0][]),
    )
    .Encode((arr: T[number][0][]) => arr.join(",")) as unknown as TTransform<
    TString,
    T[number][0][]
  >;

  transform.description = description;
  return transform;
}

export function stringBoolean(
  description?: string,
): TTransform<TString, boolean> {
  const transform = Type.Transform(Type.String())
    .Decode((v: string) => v === "true")
    .Encode((v: boolean) => (v ? "true" : "false")) as unknown as TTransform<
    TString,
    boolean
  >;

  transform.description = description;
  return transform;
}
