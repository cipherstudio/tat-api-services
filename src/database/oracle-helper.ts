import { DateOptions } from 'oracledb';

/**
 * Helper functions for Oracle database compatibility
 */
export class OracleHelper {
  /**
   * Safely converts a JavaScript object to JSON string for storage in CLOB
   * @param data Any JavaScript object
   * @returns JSON string or null
   */
  static toJsonClob(data: any): string | null {
    if (data === null || data === undefined) {
      return null;
    }
    return JSON.stringify(data);
  }

  /**
   * Parses a CLOB JSON string back to a JavaScript object
   * @param clob CLOB data from Oracle
   * @returns Parsed JavaScript object or null
   */
  static parseJsonClob(clob: string | null): any {
    if (!clob) {
      return null;
    }
    try {
      return JSON.parse(clob);
    } catch (e) {
      console.error('Error parsing CLOB JSON:', e);
      return null;
    }
  }

  /**
   * Formats a JavaScript Date object for Oracle
   * @param date JavaScript Date object
   * @returns Formatted date string for Oracle
   */
  static formatDate(date: Date): string {
    if (!date) {
      return null;
    }
    return date.toISOString();
  }

  /**
   * Creates options for Oracle DATE and TIMESTAMP columns
   * @returns DateOptions for Oracle
   */
  static getDateOptions(): DateOptions {
    return {
      outFormat: 'TIMESTAMP',
    };
  }

  /**
   * Builds a dynamic query for pagination that works with Oracle
   * @param baseQuery The base SQL query
   * @param page Page number (1-based)
   * @param limit Items per page
   * @returns Paginated Oracle query
   */
  static buildPaginatedQuery(
    baseQuery: string,
    page: number = 1,
    limit: number = 10,
  ): string {
    const offset = (page - 1) * limit;
    return `
      SELECT * FROM (
        SELECT a.*, ROWNUM rnum FROM (
          ${baseQuery}
        ) a WHERE ROWNUM <= ${offset + limit}
      ) WHERE rnum > ${offset}
    `;
  }

  /**
   * Helper for creating sequences for auto-increment functionality
   * @param sequenceName Name of the sequence
   * @returns SQL to create a sequence
   */
  static createSequenceSql(sequenceName: string): string {
    return `
      DECLARE
        v_count NUMBER;
      BEGIN
        SELECT COUNT(*) INTO v_count FROM USER_SEQUENCES WHERE SEQUENCE_NAME = '${sequenceName.toUpperCase()}';
        IF v_count = 0 THEN
          EXECUTE IMMEDIATE 'CREATE SEQUENCE ${sequenceName} START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE';
        END IF;
      END;
    `;
  }

  /**
   * Convert boolean values to 1/0 for Oracle
   * @param value Boolean value
   * @returns 1 for true, 0 for false
   */
  static booleanToNumber(value: boolean): number {
    return value ? 1 : 0;
  }

  /**
   * Convert number values (1/0) to boolean
   * @param value Number value
   * @returns Boolean
   */
  static numberToBoolean(value: number): boolean {
    return value === 1;
  }

  /**
   * Create a trigger for automatically setting created_at and updated_at
   * @param tableName The table to create the trigger for
   * @returns SQL to create the trigger
   */
  static createTimestampTriggerSql(tableName: string): string {
    const triggerName = `${tableName}_timestamps_trg`;
    return `
      DECLARE
        v_count NUMBER;
      BEGIN
        SELECT COUNT(*) INTO v_count FROM USER_TRIGGERS WHERE TRIGGER_NAME = '${triggerName.toUpperCase()}';
        IF v_count = 0 THEN
          EXECUTE IMMEDIATE '
            CREATE OR REPLACE TRIGGER ${triggerName}
            BEFORE INSERT OR UPDATE ON ${tableName}
            FOR EACH ROW
            BEGIN
              IF INSERTING THEN
                :new.created_at := SYSTIMESTAMP;
              END IF;
              :new.updated_at := SYSTIMESTAMP;
            END;
          ';
        END IF;
      END;
    `;
  }

  /**
   * Safely map entity fields to account for Oracle's case sensitivity
   * @param rowData Raw data from Oracle
   * @param entityType The entity class to map to
   * @returns Mapped entity
   */
  static mapToEntity<T>(rowData: any, entityType: new () => T): T {
    if (!rowData) return null;

    const entity = new entityType();
    const mapping: Record<string, string> = {
      // Add mappings for specific entities if needed
      // This handles the case-insensitivity of Oracle column names
      ID: 'id',
      EMAIL: 'email',
      PASSWORD: 'password',
      FULL_NAME: 'fullName',
      ROLE: 'role',
      IS_ACTIVE: 'isActive',
      REFRESH_TOKEN: 'refreshToken',
      LOGIN_ATTEMPTS: 'loginAttempts',
      LOCK_UNTIL: 'lockUntil',
      PASSWORD_RESET_TOKEN: 'passwordResetToken',
      PASSWORD_RESET_EXPIRES: 'passwordResetExpires',
      CREATED_AT: 'createdAt',
      UPDATED_AT: 'updatedAt',
    };

    // Copy properties from rowData to entity, using mapping for case conversion
    Object.keys(rowData).forEach((key) => {
      const propertyName = mapping[key] || key.toLowerCase();

      // Convert specific types
      if (propertyName === 'isActive' && typeof rowData[key] === 'number') {
        (entity as any)[propertyName] = this.numberToBoolean(rowData[key]);
      } else if (rowData[key] !== null && rowData[key] !== undefined) {
        (entity as any)[propertyName] = rowData[key];
      }
    });

    return entity;
  }
}
