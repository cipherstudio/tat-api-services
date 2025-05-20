export function omitFields<T extends object>(
  obj: T,
  fields: string[],
): Partial<T> {
  const result = { ...obj };
  for (const field of fields) {
    delete result[field as keyof T];
  }
  return result;
}
