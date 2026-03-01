export type ZonedDateTimeModifications = {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  millisecond?: number;
};

export type DateOptions = {
  timezone: string,
  locale?: string
};