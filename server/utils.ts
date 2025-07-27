/**
 * Safely parses a value into an integer, returning a default value if parsing fails.
 * Handles null, undefined, empty strings, and non-numeric values gracefully.
 *
 * @param value - The value to parse.
 * @param defaultValue - The value to return if parsing is not possible.
 * @returns The parsed integer or the default value.
 */
export const safeParseInt = (value: any, defaultValue: number = 1): number => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return defaultValue;
  }
  const parsed = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
