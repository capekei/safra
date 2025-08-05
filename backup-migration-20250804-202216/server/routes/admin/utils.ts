/**
 * Utility functions for admin routes
 */

/**
 * Safely parse an integer from a string, returning default value if invalid
 */
export function safeParseInt(value: string | undefined, defaultValue: number): number;
export function safeParseInt(value: string | undefined, defaultValue?: undefined): number | null;
export function safeParseInt(value: string | undefined, defaultValue?: number): number | null {
  if (!value) return defaultValue ?? null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? (defaultValue ?? null) : parsed;
}

/**
 * Validate and sanitize string input
 */
export function sanitizeString(input: string | undefined): string {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, 1000); // Limit length to prevent abuse
}

/**
 * Check if a value is a valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
