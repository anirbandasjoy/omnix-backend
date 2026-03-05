export type FlattenObjectKeys<
  T extends Record<string, unknown>,
  Key = keyof T,
> = Key extends string
  ? T[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenObjectKeys<T[Key]>}`
    : Key
  : never;

// ----------------------------------------------------------------------

export type NestedValue<
  T,
  P extends string,
> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? NestedValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

// ----------------------------------------------------------------------

export type DotPaths<T extends Record<string, readonly string[]>> = {
  [K in keyof T]: K extends string
    ? T[K][number] extends string
      ? `${K}.${T[K][number]}`
      : never
    : never;
}[keyof T];

// ----------------------------------------------------------------------

export function MakeDotPathEnum<T extends Record<string, readonly string[]>>(
  map: T,
): Record<DotPaths<T>, DotPaths<T>> {
  const entries = Object.entries(
    map as Record<string, readonly string[]>,
  ).flatMap(([key, arr]) =>
    arr.map((action) => [`${key}.${action}`, `${key}.${action}`] as const),
  );
  return Object.fromEntries(entries) as Record<DotPaths<T>, DotPaths<T>>;
}
