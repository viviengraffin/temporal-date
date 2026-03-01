import { assertEquals, assertThrows } from "@std/assert";
import {
  alterZonedDateTime,
  convertToAnotherTimezone,
  getZonedDateFromArgs,
} from "./src/utils/zonedDate.ts"

import {
managerConstructorRollover,
  manageRollover
} from "./src/utils/rollover.ts"

Deno.test("getZonedDateFromArgs - timestamp", () => {
  const date = getZonedDateFromArgs("Europe/Paris", [1675238400000]);
  assertEquals(date.year, 2023);
  assertEquals(date.month, 2);
});

Deno.test("getZonedDateFromArgs - Date object", () => {
  const date = getZonedDateFromArgs("Europe/Paris", [new Date("2023-02-01")]);
  assertEquals(date.year, 2023);
  assertEquals(date.month, 2);
});

Deno.test("getZonedDateFromArgs - year, month, day", () => {
  const date = getZonedDateFromArgs("Europe/Paris", [2023, 1, 1]);
  assertEquals(date.year, 2023);
  assertEquals(date.month, 2);
});

Deno.test("getZonedDateFromArgs - invalid timezone", () => {
  assertThrows(() => getZonedDateFromArgs("Invalid/Timezone", [Date.now()]));
});

Deno.test("manageRollover - day overflow", () => {
  const result = manageRollover({
    year: 2023, month: 12, day: 32, hour: 0, minute: 0, second: 0, millisecond: 0
  });
  assertEquals(result, {
    year: 2024, month: 1, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0
  });
});

Deno.test("manageRollover - negative day", () => {
  const result = manageRollover({
    year: 2023, month: 1, day: -1, hour: 0, minute: 0, second: 0, millisecond: 0
  });
  assertEquals(result, {
    year: 2022, month: 12, day: 30, hour: 0, minute: 0, second: 0, millisecond: 0
  });
});

Deno.test("manageRollover - leap year", () => {
  const result = manageRollover({
    year: 2024, month: 2, day: 30, hour: 0, minute: 0, second: 0, millisecond: 0
  });
  assertEquals(result, {
    year: 2024, month: 3, day: 1, hour: 0, minute: 0, second: 0, millisecond: 0
  });
});

Deno.test("alterZonedDateTime - basic modification", () => {
  const zoned = Temporal.ZonedDateTime.from("2023-01-01T00:00:00[Europe/Paris]");
  const modified = alterZonedDateTime(zoned, { day: 2 });
  assertEquals(modified.day, 2);
});

Deno.test("convertToAnotherTimezone - basic conversion", () => {
  const zoned = Temporal.ZonedDateTime.from("2023-01-01T00:00:00[Europe/Paris]");
  const converted = convertToAnotherTimezone("UTC", zoned);
  assertEquals(converted.timeZoneId, "UTC");
});

Deno.test("managerConstructorRollover - normal values", () => {
  const result = managerConstructorRollover([2023, 11, 15, 12, 30, 45, 500]);
  assertEquals(result, {
    year: 2023,
    month: 12,
    day: 15,
    hour: 12,
    minute: 30,
    second: 45,
    millisecond: 500,
  });
});

Deno.test("managerConstructorRollover - two-digit year", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([99, 11, 15]);
  assertEquals(result, {
    year: 1999,
    month: 12,
    day: 15,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - millisecond overflow", () => {
  const result = managerConstructorRollover([2023, 11, 15, 0, 0, 0, 1500]);
  assertEquals(result, {
    year: 2023,
    month: 12,
    day: 15,
    hour: 0,
    minute: 0,
    second: 1,
    millisecond: 500,
  });
});

Deno.test("managerConstructorRollover - second overflow", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2023, 11, 15, 0, 0, 65]);
  assertEquals(result, {
    year: 2023,
    month: 12,
    day: 15,
    hour: 0,
    minute: 1,
    second: 5,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - minute overflow", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2023, 11, 15, 0, 65]);
  assertEquals(result, {
    year: 2023,
    month: 12,
    day: 15,
    hour: 1,
    minute: 5,
    second: 0,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - hour overflow", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2023, 11, 15, 25]);
  assertEquals(result, {
    year: 2023,
    month: 12,
    day: 16,
    hour: 1,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - month overflow", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2023, 13, 15]);
  assertEquals(result, {
    year: 2024,
    month: 2,
    day: 15,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - day overflow (end of month)", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2023, 10, 31]);
  assertEquals(result, {
    year: 2023,
    month: 12,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - negative day", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2023, 11, -1]);
  assertEquals(result, {
    year: 2023,
    month: 11,
    day: 29,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});

Deno.test("managerConstructorRollover - leap year", () => {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  const result = managerConstructorRollover([2024, 1, 30]);
  assertEquals(result, {
    year: 2024,
    month: 3,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
});
