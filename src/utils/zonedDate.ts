import type { ZonedDateTimeModifications } from "../types.ts";
import { managerConstructorRollover, manageRollover } from "./rollover.ts";

export function fillZonedDateTimeModifications(
  modifications: ZonedDateTimeModifications,
  zonedDateTime: Temporal.ZonedDateTime,
): Required<ZonedDateTimeModifications> {
  return {
    year: modifications.year ?? zonedDateTime.year,
    month: modifications.month !== undefined
      ? modifications.month + 1
      : zonedDateTime.month,
    day: modifications.day ?? zonedDateTime.day,
    hour: modifications.hour ?? zonedDateTime.hour,
    minute: modifications.minute ?? zonedDateTime.minute,
    second: modifications.second ?? zonedDateTime.second,
    millisecond: modifications.millisecond ?? zonedDateTime.millisecond,
  };
}

export function alterZonedDateTime(
  zoneDateTime: Temporal.ZonedDateTime,
  modifications: ZonedDateTimeModifications,
): Temporal.ZonedDateTime {
  const { year, month, day, hour, minute, second, millisecond } =
    manageRollover(fillZonedDateTimeModifications(modifications, zoneDateTime));

  const plainDate = new Temporal.PlainDateTime(
    year,
    month,
    day,
    hour,
    minute,
    second,
    millisecond,
  );

  return plainDate.toZonedDateTime(zoneDateTime.timeZoneId);
}

export function getZonedDateFromArgs(
  timezone: string,
  args: (string | number | Date)[],
): Temporal.ZonedDateTime {
  if (args.length === 0) {
    return Temporal.Now.zonedDateTimeISO(timezone);
  }
  if (args.length === 1) {
    const arg = args[0];

    switch (typeof arg) {
      case "string":
        return Temporal.Instant.fromEpochMilliseconds(new Date(arg).getTime())
          .toZonedDateTimeISO(timezone);
      case "number":
        return Temporal.Instant.fromEpochMilliseconds(arg).toZonedDateTimeISO(
          timezone,
        );
      case "object":
        return Temporal.Instant.fromEpochMilliseconds(arg.getTime())
          .toZonedDateTimeISO(timezone);
    }
  } else if (args.length > 1 && args.length < 8) {
    const {
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
     } = managerConstructorRollover(args as [number,number,number,number,number,number,number]);

    const plainDate = new Temporal.PlainDateTime(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond
    );

    return plainDate.toZonedDateTime(timezone);
  }
  throw new TypeError("Incorrect arguments");
}

export function convertToAnotherTimezone(
  timezone: string,
  zoneDateTime: Temporal.ZonedDateTime,
): Temporal.ZonedDateTime {
  const instant = zoneDateTime.toInstant();

  return instant.toZonedDateTimeISO(timezone);
}
