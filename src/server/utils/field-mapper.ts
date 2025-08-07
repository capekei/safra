/**
 * Universal Field Mapper for SafraReport
 * Handles snake_case ↔ camelCase conversion between database and TypeScript layers
 * Optimized for Dominican Republic's expensive data plans
 */

export interface FieldMapping {
  [key: string]: string;
}

export class FieldMapper {
  // Database (snake_case) to TypeScript (camelCase) mapping
  private static readonly DB_TO_JS: FieldMapping = {
    // Common fields
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    user_id: 'userId',
    category_id: 'categoryId',
    province_id: 'provinceId',
    business_id: 'businessId',
    author_id: 'authorId',
    
    // Article fields
    featured_image: 'featuredImage',
    video_url: 'videoUrl',
    is_breaking: 'isBreaking',
    is_featured: 'isFeatured',
    published_at: 'publishedAt',
    category_ids: 'categoryIds',
    scheduled_for: 'scheduledFor',
    
    // Review fields
    reviewer_name: 'reviewerName',
    
    // Business fields
    phone_number: 'phoneNumber',
    website_url: 'websiteUrl',
    opening_hours: 'openingHours',
    social_media: 'socialMedia',
    
    // Classified fields
    contact_info: 'contactInfo',
    expires_at: 'expiresAt',
    
    // Admin fields
    first_name: 'firstName',
    last_name: 'lastName',
    last_login: 'lastLogin',
    password_hash: 'passwordHash',
    created_by: 'createdBy',
    
    // User preference fields
    email_notifications: 'emailNotifications',
    sms_notifications: 'smsNotifications',
    preferred_categories: 'preferredCategories',
    preferred_provinces: 'preferredProvinces',
  };

  // TypeScript (camelCase) to Database (snake_case) mapping
  private static readonly JS_TO_DB: FieldMapping = Object.fromEntries(
    Object.entries(FieldMapper.DB_TO_JS).map(([key, value]) => [value, key])
  );

  /**
   * Convert database result (snake_case) to JavaScript object (camelCase)
   */
  static toJS<T = any>(data: any): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => FieldMapper.toJS(item)) as T;
    }

    if (data instanceof Date) {
      return data as T;
    }

    if (typeof data !== 'object') {
      return data;
    }

    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const jsKey = FieldMapper.DB_TO_JS[key] || key;
      result[jsKey] = FieldMapper.toJS(value);
    }

    return result;
  }

  /**
   * Convert JavaScript object (camelCase) to database format (snake_case)
   */
  static toDB<T = any>(data: any): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => FieldMapper.toDB(item)) as T;
    }

    if (data instanceof Date) {
      return data as T;
    }

    if (typeof data !== 'object') {
      return data;
    }

    const result: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const dbKey = FieldMapper.JS_TO_DB[key] || key;
      result[dbKey] = FieldMapper.toDB(value);
    }

    return result;
  }

  /**
   * Convert raw database rows to camelCase format
   * Optimized for Dominican Republic's data constraints
   */
  static mapRows<T = any>(rows: any[]): T[] {
    return rows.map(row => FieldMapper.toJS<T>(row));
  }

  /**
   * Convert single database row to camelCase format
   */
  static mapRow<T = any>(row: any): T {
    return FieldMapper.toJS<T>(row);
  }

  /**
   * Helper method to convert field names in SQL queries
   * Useful for dynamic query building
   */
  static getDbFieldName(jsFieldName: string): string {
    return FieldMapper.JS_TO_DB[jsFieldName] || jsFieldName;
  }

  /**
   * Helper method to get JavaScript field name from database field
   */
  static getJsFieldName(dbFieldName: string): string {
    return FieldMapper.DB_TO_JS[dbFieldName] || dbFieldName;
  }

  /**
   * Build SELECT clause with proper field mapping
   * Example: buildSelectClause(['id', 'createdAt', 'userId'])
   * Returns: 'id, created_at as "createdAt", user_id as "userId"'
   */
  static buildSelectClause(jsFields: string[], tableAlias?: string): string {
    const prefix = tableAlias ? `${tableAlias}.` : '';
    
    return jsFields
      .map(jsField => {
        const dbField = FieldMapper.getDbFieldName(jsField);
        if (dbField === jsField) {
          return `${prefix}${dbField}`;
        }
        return `${prefix}${dbField} as "${jsField}"`;
      })
      .join(', ');
  }
}