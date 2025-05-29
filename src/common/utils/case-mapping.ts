// Utility functions for converting between camelCase and snake_case using dynamic imports

function isClassInstance(obj: any): boolean {
  return obj instanceof Object && !Array.isArray(obj) && obj.constructor !== Object;
}

function toPlainObject(obj: any): any {
  return isClassInstance(obj) ? Object.assign({}, obj) : obj;
}

export async function toCamelCase<T>(obj: any): Promise<T> {
  const camelcaseKeys = (await import('camelcase-keys')).default;
  const plainObj = toPlainObject(obj);
  return camelcaseKeys(plainObj, { deep: true }) as T;
}

export async function toSnakeCase(obj: any): Promise<any> {
  const snakecaseKeys = (await import('snakecase-keys')).default;
  const plainObj = toPlainObject(obj);
  return snakecaseKeys(plainObj, { deep: true });
}
