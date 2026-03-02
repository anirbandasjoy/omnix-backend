/* eslint-disable @typescript-eslint/no-unsafe-argument */
export function isEnumValue<T extends object, E extends T[keyof T]>(
  enumObj: T,
  value: unknown,
): value is E {
  return Object.values(enumObj as any).includes(value as E);
}

export function enumToArray<T extends Record<string, string>>(
  enumObj: T,
): [T[keyof T], ...T[keyof T][]] {
  return Object.values(enumObj) as [T[keyof T], ...T[keyof T][]];
}
