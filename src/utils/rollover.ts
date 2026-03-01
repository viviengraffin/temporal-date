import type { ZonedDateTimeModifications } from "../types.ts";

export function getDaysOfMonth(year: number, month: number): number {
  return new Temporal.PlainDate(year, month, 1).daysInMonth;
}

export function manageRollover(
  dateObject: Required<ZonedDateTimeModifications>,
): Required<ZonedDateTimeModifications> {
  let { millisecond, second, minute, hour, day, month, year } = dateObject;

  if (millisecond < 0 || millisecond >= 1000) {
    const deltaSec = Math.floor(millisecond / 1000);
    millisecond = millisecond % 1000;
    if (millisecond < 0) {
      millisecond += 1000;
      second -= 1;
    }
    second += deltaSec;
  }

  if (second < 0 || second >= 60) {
    const deltaMin = Math.floor(second / 60);
    second = second % 60;
    if (second < 0) {
      second += 60;
      minute -= 1;
    }
    minute += deltaMin;
  }

  if (minute < 0 || minute >= 60) {
    const deltaHour = Math.floor(minute / 60);
    minute = minute % 60;
    if (minute < 0) {
      minute += 60;
      hour -= 1;
    }
    hour += deltaHour;
  }

  if (hour < 0 || hour >= 24) {
    const deltaDay = Math.floor(hour / 24);
    hour = hour % 24;
    if (hour < 0) {
      hour += 24;
      day -= 1;
    }
    day += deltaDay;
  }

  while (month < 1) {
    month += 12;
    year -= 1;
  }
  while (month > 12) {
    month -= 12;
    year += 1;
  }

  let daysInMonth: number;
  while (day < 1) {
    month -= 1;
    if (month < 1) {
      month = 12;
      year -= 1;
    }
    daysInMonth = getDaysOfMonth(year, month);
    day += daysInMonth;
  }
  while (day > (daysInMonth = getDaysOfMonth(year, month))) {
    day -= daysInMonth;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return { year, month, day, hour, minute, second, millisecond };
}

export function managerConstructorRollover([
  year,
  month,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
  millisecond = 0,
]: [number, number, number, number, number, number, number]): Required<ZonedDateTimeModifications> {

  if (year >= 0 && year < 100) year += 1900;

  month++;

  if (millisecond < 0 || millisecond >= 1000) {
    const secDelta = Math.floor(millisecond / 1000);
    millisecond %= 1000;
    if (millisecond < 0) {
      millisecond += 1000;
      second--;
    }
    second += secDelta;
  }

  if (second < 0 || second >= 60) {
    const minDelta = Math.floor(second / 60);
    second %= 60;
    if (second < 0) {
      second += 60;
      minute--;
    }
    minute += minDelta;
  }

  if (minute < 0 || minute >= 60) {
    const hourDelta = Math.floor(minute / 60);
    minute %= 60;
    if (minute < 0) {
      minute += 60;
      hour--;
    }
    hour += hourDelta;
  }

  if (hour < 0 || hour >= 24) {
    const dayDelta = Math.floor(hour / 24);
    hour %= 24;
    if (hour < 0) {
      hour += 24;
      day--;
    }
    day += dayDelta;
  }

  year += Math.floor(month / 12);
  month %= 12;
  if (month < 1) {
    month += 12;
    year--;
  }

  let daysInMonth: number;
  while (day < 1) {
    month--;
    if (month < 1) {
      month = 12;
      year--;
    }
    daysInMonth = getDaysOfMonth(year, month);
    day += daysInMonth;
  }
  daysInMonth=getDaysOfMonth(year,month);
  while (day > daysInMonth) {
    day -= daysInMonth;
    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
    daysInMonth = getDaysOfMonth(year, month);
  }

  return { year, month, day, hour, minute, second, millisecond };
}
