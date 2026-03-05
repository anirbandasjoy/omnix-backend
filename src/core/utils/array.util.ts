export function compareArrays<T>(
  oldArray: T[],
  newArray: T[],
): {
  deletedItems: T[];
  newItems: T[];
  commonItems: T[];
} {
  const oldSet = new Set(oldArray);
  const newSet = new Set(newArray);

  const deletedItems: T[] = oldArray.filter((item) => !newSet.has(item));
  const newItems: T[] = newArray.filter((item) => !oldSet.has(item));
  const commonItems: T[] = oldArray.filter((item) => newSet.has(item));

  return { deletedItems, newItems, commonItems };
}

export function hasLength<T>(
  value: T,
  length = 0,
): value is Extract<T, readonly unknown[]> {
  return Array.isArray(value) && value.length > length;
}

export const hasGaps = (arr: number[]) => {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] !== arr[i - 1] + 1) return true;
  }
  return false;
};
