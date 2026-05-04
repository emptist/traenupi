import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as $order from "../../gleam_stdlib/gleam/order.d.mts";
import type * as _ from "../gleam.d.mts";

export class January extends _.CustomType {}
export function Month$January(): Month$;
export function Month$isJanuary(value: Month$): boolean;

export class February extends _.CustomType {}
export function Month$February(): Month$;
export function Month$isFebruary(value: Month$): boolean;

export class March extends _.CustomType {}
export function Month$March(): Month$;
export function Month$isMarch(value: Month$): boolean;

export class April extends _.CustomType {}
export function Month$April(): Month$;
export function Month$isApril(value: Month$): boolean;

export class May extends _.CustomType {}
export function Month$May(): Month$;
export function Month$isMay(value: Month$): boolean;

export class June extends _.CustomType {}
export function Month$June(): Month$;
export function Month$isJune(value: Month$): boolean;

export class July extends _.CustomType {}
export function Month$July(): Month$;
export function Month$isJuly(value: Month$): boolean;

export class August extends _.CustomType {}
export function Month$August(): Month$;
export function Month$isAugust(value: Month$): boolean;

export class September extends _.CustomType {}
export function Month$September(): Month$;
export function Month$isSeptember(value: Month$): boolean;

export class October extends _.CustomType {}
export function Month$October(): Month$;
export function Month$isOctober(value: Month$): boolean;

export class November extends _.CustomType {}
export function Month$November(): Month$;
export function Month$isNovember(value: Month$): boolean;

export class December extends _.CustomType {}
export function Month$December(): Month$;
export function Month$isDecember(value: Month$): boolean;

export type Month$ = January | February | March | April | May | June | July | August | September | October | November | December;

export class Monday extends _.CustomType {}
export function Weekday$Monday(): Weekday$;
export function Weekday$isMonday(value: Weekday$): boolean;

export class Tuesday extends _.CustomType {}
export function Weekday$Tuesday(): Weekday$;
export function Weekday$isTuesday(value: Weekday$): boolean;

export class Wednesday extends _.CustomType {}
export function Weekday$Wednesday(): Weekday$;
export function Weekday$isWednesday(value: Weekday$): boolean;

export class Thursday extends _.CustomType {}
export function Weekday$Thursday(): Weekday$;
export function Weekday$isThursday(value: Weekday$): boolean;

export class Friday extends _.CustomType {}
export function Weekday$Friday(): Weekday$;
export function Weekday$isFriday(value: Weekday$): boolean;

export class Saturday extends _.CustomType {}
export function Weekday$Saturday(): Weekday$;
export function Weekday$isSaturday(value: Weekday$): boolean;

export class Sunday extends _.CustomType {}
export function Weekday$Sunday(): Weekday$;
export function Weekday$isSunday(value: Weekday$): boolean;

export type Weekday$ = Monday | Tuesday | Wednesday | Thursday | Friday | Saturday | Sunday;

export class DateTime extends _.CustomType {
  /** @deprecated */
  constructor(
    year: number,
    month: Month$,
    day: number,
    hour: number,
    minute: number,
    second: number
  );
  /** @deprecated */
  year: number;
  /** @deprecated */
  month: Month$;
  /** @deprecated */
  day: number;
  /** @deprecated */
  hour: number;
  /** @deprecated */
  minute: number;
  /** @deprecated */
  second: number;
}
export function DateTime$DateTime(
  year: number,
  month: Month$,
  day: number,
  hour: number,
  minute: number,
  second: number,
): DateTime$;
export function DateTime$isDateTime(value: DateTime$): boolean;
export function DateTime$DateTime$0(value: DateTime$): number;
export function DateTime$DateTime$year(value: DateTime$): number;
export function DateTime$DateTime$1(value: DateTime$): Month$;
export function DateTime$DateTime$month(value: DateTime$): Month$;
export function DateTime$DateTime$2(value: DateTime$): number;
export function DateTime$DateTime$day(value: DateTime$): number;
export function DateTime$DateTime$3(value: DateTime$): number;
export function DateTime$DateTime$hour(value: DateTime$): number;
export function DateTime$DateTime$4(value: DateTime$): number;
export function DateTime$DateTime$minute(value: DateTime$): number;
export function DateTime$DateTime$5(value: DateTime$): number;
export function DateTime$DateTime$second(value: DateTime$): number;

export type DateTime$ = DateTime;

export class Duration extends _.CustomType {
  /** @deprecated */
  constructor(milliseconds: number);
  /** @deprecated */
  milliseconds: number;
}
export function Duration$Duration(milliseconds: number): Duration$;
export function Duration$isDuration(value: Duration$): boolean;
export function Duration$Duration$0(value: Duration$): number;
export function Duration$Duration$milliseconds(value: Duration$): number;

export type Duration$ = Duration;

export function month_to_int(month: Month$): number;

export function int_to_month(n: number): $option.Option$<Month$>;

export function weekday_to_int(weekday: Weekday$): number;

export function int_to_weekday(n: number): $option.Option$<Weekday$>;

export function month_to_string(month: Month$): string;

export function weekday_to_string(weekday: Weekday$): string;

export function month_to_short(month: Month$): string;

export function weekday_to_short(weekday: Weekday$): string;

export function is_leap_year(year: number): boolean;

export function days_in_month(year: number, month: Month$): number;

export function is_valid_date(year: number, month: Month$, day: number): boolean;

export function is_valid_time(hour: number, minute: number, second: number): boolean;

export function is_valid_datetime(dt: DateTime$): boolean;

export function format_datetime(dt: DateTime$, format: string): string;

export function to_iso8601(dt: DateTime$): string;

export function to_date_string(dt: DateTime$): string;

export function to_time_string(dt: DateTime$): string;

export function create(year: number, month: Month$, day: number): DateTime$;

export function create_full(
  year: number,
  month: Month$,
  day: number,
  hour: number,
  minute: number,
  second: number
): DateTime$;

export function set_time(
  dt: DateTime$,
  hour: number,
  minute: number,
  second: number
): DateTime$;

export function add_days(dt: DateTime$, days: number): DateTime$;

export function add_hours(dt: DateTime$, hours: number): DateTime$;

export function add_minutes(dt: DateTime$, minutes: number): DateTime$;

export function add_seconds(dt: DateTime$, seconds: number): DateTime$;

export function duration_ms(ms: number): Duration$;

export function duration_seconds(seconds: number): Duration$;

export function duration_minutes(minutes: number): Duration$;

export function duration_hours(hours: number): Duration$;

export function duration_days(days: number): Duration$;

export function add_duration(dt: DateTime$, duration: Duration$): DateTime$;

export function compare(dt1: DateTime$, dt2: DateTime$): $order.Order$;

export function is_before(dt1: DateTime$, dt2: DateTime$): boolean;

export function is_after(dt1: DateTime$, dt2: DateTime$): boolean;

export function is_same_day(dt1: DateTime$, dt2: DateTime$): boolean;

export function start_of_day(dt: DateTime$): DateTime$;

export function end_of_day(dt: DateTime$): DateTime$;
