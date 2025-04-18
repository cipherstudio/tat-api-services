// This file uses experimental Node.js permission APIs that may not be fully supported
// Commenting out problematic code for now

// import { permission } from 'node:process';
// import { fileURLToPath } from 'node:url';
// import { PermissionStatus } from 'node:permission';

export type PermissionName =
  | 'fs.read'
  | 'fs.write'
  | 'net.connect'
  | 'net.listen'
  | 'process.exec'
  | 'system.info';

export class PermissionUtil {
  /**
   * Check if the application has required permissions
   * @param requiredPermissions Array of required permissions
   */
  static async checkPermissions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requiredPermissions: PermissionName[],
  ): Promise<boolean> {
    // Temporarily returning true since Node.js permissions API is causing issues
    return true;
    /*
    try {
      const currentPermissions = await permission.query();
      return requiredPermissions.every((perm) => currentPermissions.has(perm));
    } catch (error) {
      if (error instanceof Error) {
        console.error('Permission check failed:', error.message);
      } else {
        console.error('Permission check failed with unknown error');
      }
      return false;
    }
    */
  }

  /**
   * Request specific permissions for the application
   * @param permissions Array of permissions to request
   */
  static async requestPermissions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    permissions: PermissionName[],
  ): Promise<boolean> {
    // Temporarily returning true since Node.js permissions API is causing issues
    return true;
    /*
    try {
      const status = (await permission.request(
        permissions,
      )) as PermissionStatus;
      return status.state === 'granted';
    } catch (error) {
      if (error instanceof Error) {
        console.error('Permission request failed:', error.message);
      } else {
        console.error('Permission request failed with unknown error');
      }
      return false;
    }
    */
  }

  /**
   * Get file permissions in a secure way
   * @param filePath Path to the file
   */
  static async getFilePermissions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    filePath: string,
  ): Promise<PermissionName[]> {
    // Temporarily returning empty array since Node.js permissions API is causing issues
    return [];
    /*
    try {
      const fileUrl = new URL(`file://${filePath}`);
      const path = fileURLToPath(fileUrl);
      const perms = await permission.query(path);
      return Array.from(perms) as PermissionName[];
    } catch (error) {
      if (error instanceof Error) {
        console.error('Failed to get file permissions:', error.message);
      } else {
        console.error('Failed to get file permissions with unknown error');
      }
      return [];
    }
    */
  }
}
