/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Removes fields with `undefined` values from an object.
 * @param obj - The object to clean
 * @returns A new object without undefined values
 */
export function removeUndefined<T extends Record<string, any>>(
  obj: T,
): Partial<T> {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value;
    }
    return acc;
  }, {} as Partial<T>);
}
