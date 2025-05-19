// Utility functions for converting between camelCase and snake_case using dynamic imports

export async function toCamelCase<T>(obj: any): Promise<T> {
  const camelcaseKeys = (await import('camelcase-keys')).default;
  return camelcaseKeys(obj, { deep: true }) as T;
}

export async function toSnakeCase(obj: any): Promise<any> {
  const snakecaseKeys = (await import('snakecase-keys')).default;
  return snakecaseKeys(obj, { deep: true });
}
