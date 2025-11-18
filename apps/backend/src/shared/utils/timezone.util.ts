/**
 * Utility for formatting dates in a specific timezone
 */
export class TimezoneUtil {
  /**
   * Format a date in the specified timezone
   * @param date - The date to format
   * @param timezone - IANA timezone identifier (e.g., 'UTC', 'Europe/Zurich')
   * @returns Formatted date string in DD.MM.YYYY HH:MM format
   */
  static formatDate(date: Date, timezone: string = 'UTC'): string {
    if (!date) return 'undefined';

    try {
      // Create formatter with the specified timezone
      const formatter = new Intl.DateTimeFormat('de-CH', {
        timeZone: timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      // Format the date
      const parts = formatter.formatToParts(date);
      const partsMap = parts.reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {} as Record<string, string>);

      return `${partsMap.day}.${partsMap.month}.${partsMap.year} ${partsMap.hour}:${partsMap.minute}`;
    } catch (error) {
      return `Error formatting date: ${error.message}`;
    }
  }

  /**
   * Format a date in the specified timezone with timezone name
   * @param date - The date to format
   * @param timezone - IANA timezone identifier (e.g., 'UTC', 'Europe/Zurich')
   * @returns Formatted date string with timezone info
   */
  static formatDateWithTimezone(date: Date, timezone: string = 'UTC'): string {
    const formatted = this.formatDate(date, timezone);
    return `${formatted} (${timezone})`;
  }
}
