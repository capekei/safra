/**
 * Dominican Republic (DR) currency formatting utilities
 * Optimized for Spanish-speaking users and DOP currency display
 */

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  compact?: boolean;
  decimals?: number;
}

/**
 * Formats a number as Dominican Peso (DOP) currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted currency string in Spanish (Dominican) locale
 */
export function formatDOPPrice(
  amount: number, 
  options: CurrencyFormatOptions = {}
): string {
  const {
    showSymbol = true,
    compact = false,
    decimals = 2
  } = options;

  try {
    // Base formatting with Spanish (Dominican Republic) locale
    const formatter = new Intl.NumberFormat('es-DO', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'DOP',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      ...(compact && {
        notation: 'compact',
        compactDisplay: 'short'
      })
    });

    return formatter.format(amount);
  } catch (error) {
    console.error('Error formatting DOP currency:', error);
    // Fallback formatting
    const formattedNumber = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return showSymbol ? `RD$${formattedNumber}` : formattedNumber;
  }
}

/**
 * Formats a price range in DOP
 * @param min - Minimum price
 * @param max - Maximum price
 * @param options - Formatting options
 * @returns Formatted price range string
 */
export function formatDOPPriceRange(
  min: number, 
  max: number, 
  options: CurrencyFormatOptions = {}
): string {
  const formattedMin = formatDOPPrice(min, options);
  const formattedMax = formatDOPPrice(max, options);
  return `${formattedMin} - ${formattedMax}`;
}

/**
 * Parses a DOP currency string back to number
 * @param dopString - Currency string like "RD$1,500.00"
 * @returns Parsed number or null if invalid
 */
export function parseDOPPrice(dopString: string): number | null {
  try {
    // Remove currency symbols and common formatting
    const cleanString = dopString
      .replace(/RD\$|DOP|\$|,/g, '')
      .trim();
    
    const parsed = parseFloat(cleanString);
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Error parsing DOP currency:', error);
    return null;
  }
}

/**
 * Dominican Republic specific currency utilities
 */
export const DOPCurrency = {
  format: formatDOPPrice,
  formatRange: formatDOPPriceRange,
  parse: parseDOPPrice,
  symbol: 'RD$',
  code: 'DOP',
  locale: 'es-DO'
} as const;