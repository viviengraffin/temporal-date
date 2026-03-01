import {
  alterZonedDateTime,
  convertToAnotherTimezone,
  getZonedDateFromArgs,
} from "./utils/zonedDate.ts";
import type { DateOptions, ZonedDateTimeModifications } from "./types.ts";

/**
 * A class for handling date and time with timezone support, using the Temporal API.
 * Provides methods similar to the native Date object, but with timezone awareness.
 */
export class TemporalDate {
  /**
   * Converts this TemporalDate to another timezone.
   *
   * @param timezone - The target timezone (e.g., "Europe/Paris").
   * @param value - The TemporalDate instance to convert.
   * @returns A new TemporalDate instance in the target timezone.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "America/New_York" });
   * const parisDate = TemporalDate.convertToAnotherTimezone("Europe/Paris", date);
   * ```
   */
  static convertToAnotherTimezone(timezone: string, value: TemporalDate) {
    const instant = value.zoned.toInstant();
    return new this({ timezone, locale: value.locale }, instant.epochMilliseconds);
  }

  /** @internal The internal Temporal.ZonedDateTime instance. */
  protected zoned: Temporal.ZonedDateTime;
  /** @internal The locale for formatting. */
  protected locale?: string;

  /**
   * Creates a new TemporalDate instance.
   *
   * @param options - The date options, including timezone and optional locale.
   * @param args - The date arguments. Can be:
   *   - A single number (epoch milliseconds),
   *   - A single string (ISO date string),
   *   - A single Date object,
   *   - A tuple of year, month, day, etc.
   *
   * @example
   * ```ts
   * // From epoch milliseconds
   * const date1 = new TemporalDate({ timezone: "UTC" }, Date.now());
   *
   * // From ISO string
   * const date2 = new TemporalDate({ timezone: "UTC" }, "2023-10-05T12:00:00Z");
   *
   * // From Date object
   * const date3 = new TemporalDate({ timezone: "UTC" }, new Date());
   *
   * // From year, month, day, etc.
   * const date4 = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5);
   * ```
   */
  constructor(options: DateOptions);
  constructor(options: DateOptions, epochMillisecond: number);
  constructor(options: DateOptions, string: string);
  constructor(options: DateOptions, date: Date);
  constructor(options: DateOptions, year: number, month: number);
  constructor(
    options: DateOptions,
    ...args: (number | string | Date)[]
  ) {
    this.zoned = getZonedDateFromArgs(options.timezone, args);
    if(options.locale) {
      this.locale=options.locale;
    }
  }

  /**
   * Gets the UTC representation of this date.
   *
   * @returns The UTC Temporal.ZonedDateTime.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * const utcDate = date.utc;
   * ```
   */
  protected get utc() {
    return TemporalDate.convertToAnotherTimezone("UTC", this).zoned;
  }

  /**
   * Updates the date with the given modifications (defined timezone time).
   *
   * @param modifications - The modifications to apply.
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.update({ year: 2024, month: 1 });
   * ```
   */
  protected update(modifications: ZonedDateTimeModifications): number {
    this.zoned = alterZonedDateTime(this.zoned, modifications);
    return this.getTime();
  }

  /**
   * Updates the date with the given modifications (UTC time).
   *
   * @param modifications - The modifications to apply.
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.updateFromUTC({ hour: 12 });
   * ```
   */
  protected updateFromUTC(modifications: ZonedDateTimeModifications): number {
    const zoned = alterZonedDateTime(this.utc, modifications);
    this.zoned = convertToAnotherTimezone(this.zoned.timeZoneId, zoned);
    return this.getTime();
  }

  /**
   * Gets the full year (4 digits).
   *
   * @returns The full year.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5);
   * console.log(date.getFullYear()); // 2023
   * ```
   */
  getFullYear() {
    return this.zoned.year;
  }

  /**
   * Sets the full year (local time).
   *
   * @param year - The year to set.
   * @param month - Optional month to set (0-11).
   * @param day - Optional day to set (1-31).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setFullYear(2024);
   * date.setFullYear(2024, 0); // January 2024
   * date.setFullYear(2024, 0, 1); // January 1, 2024
   * ```
   */
  setFullYear(year: number): number;
  setFullYear(year: number, month: number): number;
  setFullYear(year: number, month: number, day: number): number;
  setFullYear(year: number, month?: number, day?: number): number {
    return this.update({ year, month, day });
  }

  /**
   * Gets the year (2 digits for 1900-1999).
   *
   * @returns The year (e.g., 99 for 1999, 2023 for 2023).
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 1999, 9, 5);
   * console.log(date.getYear()); // 99
   * ```
   */
  getYear() {
    const year = this.getFullYear();

    if (year >= 1900 && year < 2000) {
      return year - 1900;
    }

    return year;
  }

  /**
   * Sets the year (2 digits for 1900-1999).
   *
   * @param year - The year to set.
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setYear(99); // Sets year to 1999
   * date.setYear(2024); // Sets year to 2024
   * ```
   */
  setYear(year: number) {
    return this.update({ year: year >= 0 && year < 100 ? year + 1900 : year });
  }

  /**
   * Gets the full year in UTC.
   *
   * @returns The full year in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCFullYear());
   * ```
   */
  getUTCFullYear() {
    return this.utc.year;
  }

  /**
   * Sets the full year in UTC.
   *
   * @param year - The year to set.
   * @param month - Optional month to set (0-11).
   * @param day - Optional day to set (1-31).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCFullYear(2024);
   * ```
   */
  setUTCFullYear(year: number): number;
  setUTCFullYear(year: number, month: number): number;
  setUTCFullYear(year: number, month: number, day: number): number;
  setUTCFullYear(year: number, month?: number, day?: number): number {
    return this.updateFromUTC({ year, month, day });
  }

  /**
   * Gets the month (0-11).
   *
   * @returns The month (0 = January, 11 = December).
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5);
   * console.log(date.getMonth()); // 9 (October)
   * ```
   */
  getMonth() {
    return this.zoned.month - 1;
  }

  /**
   * Sets the month (local time).
   *
   * @param month - The month to set (0-11).
   * @param day - Optional day to set (1-31).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setMonth(9); // October
   * date.setMonth(9, 15); // October 15
   * ```
   */
  setMonth(month: number): number;
  setMonth(month: number, day: number): number;
  setMonth(month: number, day?: number): number {
    return this.update({ month, day });
  }

  /**
   * Gets the month in UTC (0-11).
   *
   * @returns The month in UTC (0 = January, 11 = December).
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCMonth());
   * ```
   */
  getUTCMonth() {
    return this.utc.month - 1;
  }

  /**
   * Sets the month in UTC.
   *
   * @param month - The month to set (0-11).
   * @param day - Optional day to set (1-31).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCMonth(9); // October
   * ```
   */
  setUTCMonth(month: number): number;
  setUTCMonth(month: number, day: number): number;
  setUTCMonth(month: number, day?: number): number {
    return this.updateFromUTC({ month, day });
  }

  /**
   * Gets the day of the month (1-31).
   *
   * @returns The day of the month.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5);
   * console.log(date.getDate()); // 5
   * ```
   */
  getDate() {
    return this.zoned.day;
  }

  /**
   * Sets the day of the month (local time).
   *
   * @param value - The day to set (1-31).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setDate(15);
   * ```
   */
  setDate(value: number) {
    return this.update({ day: value });
  }

  /**
   * Gets the day of the month in UTC (1-31).
   *
   * @returns The day of the month in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCDate());
   * ```
   */
  getUTCDate() {
    return this.utc.day;
  }

  /**
   * Sets the day of the month in UTC.
   *
   * @param day - The day to set (1-31).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCDate(15);
   * ```
   */
  setUTCDate(day: number) {
    return this.updateFromUTC({ day });
  }

  /**
   * Gets the day of the week (0-6, 0 = Sunday).
   *
   * @returns The day of the week.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5);
   * console.log(date.getDay()); // 3 (Wednesday)
   * ```
   */
  getDay() {
    return this.zoned.dayOfWeek % 7;
  }

  /**
   * Gets the day of the week in UTC (0-6, 0 = Sunday).
   *
   * @returns The day of the week in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCDay());
   * ```
   */
  getUTCDay() {
    return this.utc.dayOfWeek % 7;
  }

  /**
   * Gets the hours (0-23).
   *
   * @returns The hours.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5, 12);
   * console.log(date.getHours()); // 12
   * ```
   */
  getHours() {
    return this.zoned.hour;
  }

  /**
   * Sets the hours (local time).
   *
   * @param hour - The hours to set (0-23).
   * @param minute - Optional minutes to set (0-59).
   * @param second - Optional seconds to set (0-59).
   * @param millisecond - Optional milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setHours(12);
   * date.setHours(12, 30);
   * date.setHours(12, 30, 0);
   * date.setHours(12, 30, 0, 0);
   * ```
   */
  setHours(hour: number): number;
  setHours(hour: number, minute: number): number;
  setHours(hour: number, minute: number, second: number): number;
  setHours(
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
  ): number;
  setHours(
    hour: number,
    minute?: number,
    second?: number,
    millisecond?: number,
  ): number {
    return this.update({ hour, minute, second, millisecond });
  }

  /**
   * Gets the hours in UTC (0-23).
   *
   * @returns The hours in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCHours());
   * ```
   */
  getUTCHours() {
    return this.utc.hour;
  }

  /**
   * Sets the hours in UTC.
   *
   * @param hour - The hours to set (0-23).
   * @param minute - Optional minutes to set (0-59).
   * @param second - Optional seconds to set (0-59).
   * @param millisecond - Optional milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCHours(12);
   * ```
   */
  setUTCHours(hour: number): number;
  setUTCHours(hour: number, minute: number): number;
  setUTCHours(hour: number, minute: number, second: number): number;
  setUTCHours(
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
  ): number;
  setUTCHours(
    hour: number,
    minute?: number,
    second?: number,
    millisecond?: number,
  ): number {
    return this.updateFromUTC({ hour, minute, second, millisecond });
  }

  /**
   * Gets the minutes (0-59).
   *
   * @returns The minutes.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5, 12, 30);
   * console.log(date.getMinutes()); // 30
   * ```
   */
  getMinutes() {
    return this.zoned.minute;
  }

  /**
   * Sets the minutes (local time).
   *
   * @param minute - The minutes to set (0-59).
   * @param second - Optional seconds to set (0-59).
   * @param millisecond - Optional milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setMinutes(30);
   * date.setMinutes(30, 0);
   * date.setMinutes(30, 0, 0);
   * ```
   */
  setMinutes(minute: number): number;
  setMinutes(minute: number, second: number): number;
  setMinutes(minute: number, second: number, millisecond: number): number;
  setMinutes(minute: number, second?: number, millisecond?: number): number {
    return this.update({ minute, second, millisecond });
  }

  /**
   * Gets the minutes in UTC (0-59).
   *
   * @returns The minutes in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCMinutes());
   * ```
   */
  getUTCMinutes() {
    return this.utc.minute;
  }

  /**
   * Sets the minutes in UTC.
   *
   * @param minute - The minutes to set (0-59).
   * @param second - Optional seconds to set (0-59).
   * @param millisecond - Optional milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCMinutes(30);
   * ```
   */
  setUTCMinutes(minute: number): number;
  setUTCMinutes(minute: number, second: number): number;
  setUTCMinutes(minute: number, second: number, millisecond: number): number;
  setUTCMinutes(minute: number, second?: number, millisecond?: number): number {
    return this.updateFromUTC({ minute, second, millisecond });
  }

  /**
   * Gets the seconds (0-59).
   *
   * @returns The seconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5, 12, 30, 45);
   * console.log(date.getSeconds()); // 45
   * ```
   */
  getSeconds() {
    return this.zoned.second;
  }

  /**
   * Sets the seconds (local time).
   *
   * @param second - The seconds to set (0-59).
   * @param millisecond - Optional milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setSeconds(45);
   * date.setSeconds(45, 0);
   * ```
   */
  setSeconds(second: number): number;
  setSeconds(second: number, millisecond: number): number;
  setSeconds(second: number, millisecond?: number): number {
    return this.update({ second, millisecond });
  }

  /**
   * Gets the seconds in UTC (0-59).
   *
   * @returns The seconds in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCSeconds());
   * ```
   */
  getUTCSeconds() {
    return this.utc.second;
  }

  /**
   * Sets the seconds in UTC.
   *
   * @param second - The seconds to set (0-59).
   * @param millisecond - Optional milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCSeconds(45);
   * ```
   */
  setUTCSeconds(second: number): number;
  setUTCSeconds(second: number, millisecond: number): number;
  setUTCSeconds(second: number, millisecond?: number): number {
    return this.updateFromUTC({ second, millisecond });
  }

  /**
   * Gets the milliseconds (0-999).
   *
   * @returns The milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" }, 2023, 9, 5, 12, 30, 45, 500);
   * console.log(date.getMilliseconds()); // 500
   * ```
   */
  getMilliseconds() {
    return this.zoned.millisecond;
  }

  /**
   * Gets the milliseconds in UTC (0-999).
   *
   * @returns The milliseconds in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCMilliseconds());
   * ```
   */
  setMilliseconds(millisecond: number): number {
    return this.update({ millisecond });
  }

  /**
   * Gets the milliseconds in UTC (0-999).
   *
   * @returns The milliseconds in UTC.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getUTCMilliseconds());
   * ```
   */
  getUTCMilliseconds() {
    return this.utc.millisecond;
  }

  /**
   * Sets the milliseconds in UTC.
   *
   * @param millisecond - The milliseconds to set (0-999).
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```typescript
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * date.setUTCMilliseconds(500);
   * ```
   */
  setUTCMilliseconds(millisecond: number) {
    return this.updateFromUTC({ millisecond });
  }

  /**
   * Gets the epoch milliseconds.
   *
   * @returns The epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * console.log(date.getTime());
   * ```
   */
  getTime() {
    return this.zoned.epochMilliseconds;
  }

  /**
   * Sets the epoch milliseconds.
   *
   * @param value - The epoch milliseconds to set.
   * @returns The new epoch milliseconds.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "UTC" });
   * date.setTime(Date.now());
   * ```
   */
  setTime(value: number) {
    this.zoned = getZonedDateFromArgs(this.zoned.timeZoneId, [value]);
    return this.getTime();
  }

  /**
   * Gets the timezone offset in minutes.
   *
   * @returns The timezone offset in minutes.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.getTimezoneOffset());
   * ```
   */
  getTimezoneOffset() {
    return (this.zoned.offsetNanoseconds / 60_000_000_000)*-1;
  }

  /**
   * Returns a locale-specific string representation of the date.
   *
   * @param locale - The locale to use (defaults to instance locale).
   * @param options - Formatting options.
   * @returns The formatted date string.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris", locale: "fr-FR" });
   * console.log(date.toLocaleString());
   * console.log(date.toLocaleString("en-US", { dateStyle: "full" }));
   * ```
   */
  toLocaleString(locale: string | undefined = this.locale, options?: Intl.DateTimeFormatOptions) {
    return this.zoned.toLocaleString(locale, options);
  }

  /**
   * Returns the ISO string representation of the date (UTC).
   *
   * @returns The ISO string.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.toISOString());
   * ```
   */
  toISOString() {
    return this.utc.toInstant().toString();
  }

  /**
   * Returns the JSON string representation of the date (UTC).
   *
   * @returns The JSON string.
   *
   * @example
   * ```ts
   * const date = new TemporalDate({ timezone: "Europe/Paris" });
   * console.log(date.toJSON());
   * ```
   */
  toJSON() {
    return this.toISOString();
  }
}
