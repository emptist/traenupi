/// <reference types="./datetime.d.mts" />
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $order from "../../gleam_stdlib/gleam/order.mjs";
import { Lt, Gt, Eq } from "../../gleam_stdlib/gleam/order.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { CustomType as $CustomType, isEqual } from "../gleam.mjs";

export class January extends $CustomType {}
export const Month$January = () => new January();
export const Month$isJanuary = (value) => value instanceof January;

export class February extends $CustomType {}
export const Month$February = () => new February();
export const Month$isFebruary = (value) => value instanceof February;

export class March extends $CustomType {}
export const Month$March = () => new March();
export const Month$isMarch = (value) => value instanceof March;

export class April extends $CustomType {}
export const Month$April = () => new April();
export const Month$isApril = (value) => value instanceof April;

export class May extends $CustomType {}
export const Month$May = () => new May();
export const Month$isMay = (value) => value instanceof May;

export class June extends $CustomType {}
export const Month$June = () => new June();
export const Month$isJune = (value) => value instanceof June;

export class July extends $CustomType {}
export const Month$July = () => new July();
export const Month$isJuly = (value) => value instanceof July;

export class August extends $CustomType {}
export const Month$August = () => new August();
export const Month$isAugust = (value) => value instanceof August;

export class September extends $CustomType {}
export const Month$September = () => new September();
export const Month$isSeptember = (value) => value instanceof September;

export class October extends $CustomType {}
export const Month$October = () => new October();
export const Month$isOctober = (value) => value instanceof October;

export class November extends $CustomType {}
export const Month$November = () => new November();
export const Month$isNovember = (value) => value instanceof November;

export class December extends $CustomType {}
export const Month$December = () => new December();
export const Month$isDecember = (value) => value instanceof December;

export class Monday extends $CustomType {}
export const Weekday$Monday = () => new Monday();
export const Weekday$isMonday = (value) => value instanceof Monday;

export class Tuesday extends $CustomType {}
export const Weekday$Tuesday = () => new Tuesday();
export const Weekday$isTuesday = (value) => value instanceof Tuesday;

export class Wednesday extends $CustomType {}
export const Weekday$Wednesday = () => new Wednesday();
export const Weekday$isWednesday = (value) => value instanceof Wednesday;

export class Thursday extends $CustomType {}
export const Weekday$Thursday = () => new Thursday();
export const Weekday$isThursday = (value) => value instanceof Thursday;

export class Friday extends $CustomType {}
export const Weekday$Friday = () => new Friday();
export const Weekday$isFriday = (value) => value instanceof Friday;

export class Saturday extends $CustomType {}
export const Weekday$Saturday = () => new Saturday();
export const Weekday$isSaturday = (value) => value instanceof Saturday;

export class Sunday extends $CustomType {}
export const Weekday$Sunday = () => new Sunday();
export const Weekday$isSunday = (value) => value instanceof Sunday;

export class DateTime extends $CustomType {
  constructor(year, month, day, hour, minute, second) {
    super();
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.second = second;
  }
}
export const DateTime$DateTime = (year, month, day, hour, minute, second) =>
  new DateTime(year, month, day, hour, minute, second);
export const DateTime$isDateTime = (value) => value instanceof DateTime;
export const DateTime$DateTime$year = (value) => value.year;
export const DateTime$DateTime$0 = (value) => value.year;
export const DateTime$DateTime$month = (value) => value.month;
export const DateTime$DateTime$1 = (value) => value.month;
export const DateTime$DateTime$day = (value) => value.day;
export const DateTime$DateTime$2 = (value) => value.day;
export const DateTime$DateTime$hour = (value) => value.hour;
export const DateTime$DateTime$3 = (value) => value.hour;
export const DateTime$DateTime$minute = (value) => value.minute;
export const DateTime$DateTime$4 = (value) => value.minute;
export const DateTime$DateTime$second = (value) => value.second;
export const DateTime$DateTime$5 = (value) => value.second;

export class Duration extends $CustomType {
  constructor(milliseconds) {
    super();
    this.milliseconds = milliseconds;
  }
}
export const Duration$Duration = (milliseconds) => new Duration(milliseconds);
export const Duration$isDuration = (value) => value instanceof Duration;
export const Duration$Duration$milliseconds = (value) => value.milliseconds;
export const Duration$Duration$0 = (value) => value.milliseconds;

export function month_to_int(month) {
  if (month instanceof January) {
    return 1;
  } else if (month instanceof February) {
    return 2;
  } else if (month instanceof March) {
    return 3;
  } else if (month instanceof April) {
    return 4;
  } else if (month instanceof May) {
    return 5;
  } else if (month instanceof June) {
    return 6;
  } else if (month instanceof July) {
    return 7;
  } else if (month instanceof August) {
    return 8;
  } else if (month instanceof September) {
    return 9;
  } else if (month instanceof October) {
    return 10;
  } else if (month instanceof November) {
    return 11;
  } else {
    return 12;
  }
}

export function int_to_month(n) {
  if (n === 1) {
    return new Some(new January());
  } else if (n === 2) {
    return new Some(new February());
  } else if (n === 3) {
    return new Some(new March());
  } else if (n === 4) {
    return new Some(new April());
  } else if (n === 5) {
    return new Some(new May());
  } else if (n === 6) {
    return new Some(new June());
  } else if (n === 7) {
    return new Some(new July());
  } else if (n === 8) {
    return new Some(new August());
  } else if (n === 9) {
    return new Some(new September());
  } else if (n === 10) {
    return new Some(new October());
  } else if (n === 11) {
    return new Some(new November());
  } else if (n === 12) {
    return new Some(new December());
  } else {
    return new None();
  }
}

export function weekday_to_int(weekday) {
  if (weekday instanceof Monday) {
    return 1;
  } else if (weekday instanceof Tuesday) {
    return 2;
  } else if (weekday instanceof Wednesday) {
    return 3;
  } else if (weekday instanceof Thursday) {
    return 4;
  } else if (weekday instanceof Friday) {
    return 5;
  } else if (weekday instanceof Saturday) {
    return 6;
  } else {
    return 7;
  }
}

export function int_to_weekday(n) {
  if (n === 1) {
    return new Some(new Monday());
  } else if (n === 2) {
    return new Some(new Tuesday());
  } else if (n === 3) {
    return new Some(new Wednesday());
  } else if (n === 4) {
    return new Some(new Thursday());
  } else if (n === 5) {
    return new Some(new Friday());
  } else if (n === 6) {
    return new Some(new Saturday());
  } else if (n === 7) {
    return new Some(new Sunday());
  } else {
    return new None();
  }
}

export function month_to_string(month) {
  if (month instanceof January) {
    return "January";
  } else if (month instanceof February) {
    return "February";
  } else if (month instanceof March) {
    return "March";
  } else if (month instanceof April) {
    return "April";
  } else if (month instanceof May) {
    return "May";
  } else if (month instanceof June) {
    return "June";
  } else if (month instanceof July) {
    return "July";
  } else if (month instanceof August) {
    return "August";
  } else if (month instanceof September) {
    return "September";
  } else if (month instanceof October) {
    return "October";
  } else if (month instanceof November) {
    return "November";
  } else {
    return "December";
  }
}

export function weekday_to_string(weekday) {
  if (weekday instanceof Monday) {
    return "Monday";
  } else if (weekday instanceof Tuesday) {
    return "Tuesday";
  } else if (weekday instanceof Wednesday) {
    return "Wednesday";
  } else if (weekday instanceof Thursday) {
    return "Thursday";
  } else if (weekday instanceof Friday) {
    return "Friday";
  } else if (weekday instanceof Saturday) {
    return "Saturday";
  } else {
    return "Sunday";
  }
}

export function month_to_short(month) {
  if (month instanceof January) {
    return "Jan";
  } else if (month instanceof February) {
    return "Feb";
  } else if (month instanceof March) {
    return "Mar";
  } else if (month instanceof April) {
    return "Apr";
  } else if (month instanceof May) {
    return "May";
  } else if (month instanceof June) {
    return "Jun";
  } else if (month instanceof July) {
    return "Jul";
  } else if (month instanceof August) {
    return "Aug";
  } else if (month instanceof September) {
    return "Sep";
  } else if (month instanceof October) {
    return "Oct";
  } else if (month instanceof November) {
    return "Nov";
  } else {
    return "Dec";
  }
}

export function weekday_to_short(weekday) {
  if (weekday instanceof Monday) {
    return "Mon";
  } else if (weekday instanceof Tuesday) {
    return "Tue";
  } else if (weekday instanceof Wednesday) {
    return "Wed";
  } else if (weekday instanceof Thursday) {
    return "Thu";
  } else if (weekday instanceof Friday) {
    return "Fri";
  } else if (weekday instanceof Saturday) {
    return "Sat";
  } else {
    return "Sun";
  }
}

export function is_leap_year(year) {
  let $ = year % 4;
  if ($ === 0) {
    let $1 = year % 100;
    if ($1 === 0) {
      return (year % 400) === 0;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

export function days_in_month(year, month) {
  if (month instanceof January) {
    return 31;
  } else if (month instanceof February) {
    let $ = is_leap_year(year);
    if ($) {
      return 29;
    } else {
      return 28;
    }
  } else if (month instanceof March) {
    return 31;
  } else if (month instanceof April) {
    return 30;
  } else if (month instanceof May) {
    return 31;
  } else if (month instanceof June) {
    return 30;
  } else if (month instanceof July) {
    return 31;
  } else if (month instanceof August) {
    return 31;
  } else if (month instanceof September) {
    return 30;
  } else if (month instanceof October) {
    return 31;
  } else if (month instanceof November) {
    return 30;
  } else {
    return 31;
  }
}

export function is_valid_date(year, month, day) {
  let $ = day < 1;
  if ($) {
    return false;
  } else {
    return day <= days_in_month(year, month);
  }
}

export function is_valid_time(hour, minute, second) {
  return (((((hour >= 0) && (hour < 24)) && (minute >= 0)) && (minute < 60)) && (second >= 0)) && (second < 60);
}

export function is_valid_datetime(dt) {
  return is_valid_date(dt.year, dt.month, dt.day) && is_valid_time(
    dt.hour,
    dt.minute,
    dt.second,
  );
}

function int_to_string(n) {
  if (n === 0) {
    return "0";
  } else if (n === 1) {
    return "1";
  } else if (n === 2) {
    return "2";
  } else if (n === 3) {
    return "3";
  } else if (n === 4) {
    return "4";
  } else if (n === 5) {
    return "5";
  } else if (n === 6) {
    return "6";
  } else if (n === 7) {
    return "7";
  } else if (n === 8) {
    return "8";
  } else if (n === 9) {
    return "9";
  } else if (n === 10) {
    return "10";
  } else if (n === 100) {
    return "100";
  } else if (n === 1000) {
    return "1000";
  } else if (n === 2000) {
    return "2000";
  } else if (n === 2024) {
    return "2024";
  } else if (n === 2025) {
    return "2025";
  } else {
    let $ = n < 0;
    if ($) {
      return "-" + int_to_string(0 - n);
    } else {
      let tens = globalThis.Math.trunc(n / 10);
      let ones = n - tens * 10;
      return int_to_string(tens) + int_to_string(ones);
    }
  }
}

function int_to_padded(n, width) {
  let str = int_to_string(n);
  let len = $string.length(str);
  let $ = len >= width;
  if ($) {
    return str;
  } else {
    let zeros = width - len;
    return $string.repeat("0", zeros) + str;
  }
}

export function format_datetime(dt, format) {
  let _pipe = format;
  let _pipe$1 = $string.replace(_pipe, "%Y", int_to_padded(dt.year, 4));
  let _pipe$2 = $string.replace(
    _pipe$1,
    "%m",
    int_to_padded(month_to_int(dt.month), 2),
  );
  let _pipe$3 = $string.replace(_pipe$2, "%d", int_to_padded(dt.day, 2));
  let _pipe$4 = $string.replace(_pipe$3, "%H", int_to_padded(dt.hour, 2));
  let _pipe$5 = $string.replace(_pipe$4, "%M", int_to_padded(dt.minute, 2));
  let _pipe$6 = $string.replace(_pipe$5, "%S", int_to_padded(dt.second, 2));
  let _pipe$7 = $string.replace(_pipe$6, "%B", month_to_string(dt.month));
  return $string.replace(_pipe$7, "%b", month_to_short(dt.month));
}

export function to_iso8601(dt) {
  return format_datetime(dt, "%Y-%m-%dT%H:%M:%S");
}

export function to_date_string(dt) {
  return format_datetime(dt, "%Y-%m-%d");
}

export function to_time_string(dt) {
  return format_datetime(dt, "%H:%M:%S");
}

export function create(year, month, day) {
  return new DateTime(year, month, day, 0, 0, 0);
}

export function create_full(year, month, day, hour, minute, second) {
  return new DateTime(year, month, day, hour, minute, second);
}

function month_to_day_of_year(month, is_leap) {
  let _block;
  if (month instanceof January) {
    _block = 0;
  } else if (month instanceof February) {
    _block = 31;
  } else if (month instanceof March) {
    _block = 59;
  } else if (month instanceof April) {
    _block = 90;
  } else if (month instanceof May) {
    _block = 120;
  } else if (month instanceof June) {
    _block = 151;
  } else if (month instanceof July) {
    _block = 181;
  } else if (month instanceof August) {
    _block = 212;
  } else if (month instanceof September) {
    _block = 243;
  } else if (month instanceof October) {
    _block = 273;
  } else if (month instanceof November) {
    _block = 304;
  } else {
    _block = 334;
  }
  let base = _block;
  let $ = (is_leap && (!(month instanceof January))) && (!(month instanceof February));
  if ($) {
    return base + 1;
  } else {
    return base;
  }
}

function date_to_days(year, month, day) {
  let y = year - 1;
  let leap_years = ((globalThis.Math.trunc(y / 4)) - (globalThis.Math.trunc(
    y / 100
  ))) + (globalThis.Math.trunc(y / 400));
  let base_days = y * 365 + leap_years;
  let month_days = month_to_day_of_year(month, is_leap_year(year));
  return ((base_days + month_days) + day) - 1;
}

function estimate_year(loop$days) {
  while (true) {
    let days = loop$days;
    let approx = globalThis.Math.trunc(days / 365);
    let $ = date_to_days(approx, new January(), 1) > days;
    if ($) {
      loop$days = approx - 1;
    } else {
      let $1 = date_to_days(approx + 1, new January(), 1) <= days;
      if ($1) {
        loop$days = approx + 1;
      } else {
        return approx;
      }
    }
  }
}

function find_month_helper(loop$year, loop$day_of_year, loop$month) {
  while (true) {
    let year = loop$year;
    let day_of_year = loop$day_of_year;
    let month = loop$month;
    let month_days = days_in_month(year, month);
    let day_in_month = day_of_year - month_to_day_of_year(
      month,
      is_leap_year(year),
    );
    let $ = day_in_month < month_days;
    if ($) {
      return month;
    } else {
      if (month instanceof January) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new February();
      } else if (month instanceof February) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new March();
      } else if (month instanceof March) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new April();
      } else if (month instanceof April) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new May();
      } else if (month instanceof May) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new June();
      } else if (month instanceof June) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new July();
      } else if (month instanceof July) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new August();
      } else if (month instanceof August) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new September();
      } else if (month instanceof September) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new October();
      } else if (month instanceof October) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new November();
      } else if (month instanceof November) {
        loop$year = year;
        loop$day_of_year = day_of_year;
        loop$month = new December();
      } else {
        return month;
      }
    }
  }
}

function find_month(year, day_of_year) {
  return find_month_helper(year, day_of_year, new January());
}

function days_to_date(days) {
  let year = estimate_year(days);
  let remaining = days - date_to_days(year, new January(), 1);
  let month = find_month(year, remaining);
  let day = (remaining - month_to_day_of_year(month, is_leap_year(year))) + 1;
  return new DateTime(year, month, day, 0, 0, 0);
}

export function set_time(dt, hour, minute, second) {
  return new DateTime(dt.year, dt.month, dt.day, hour, minute, second);
}

export function add_days(dt, days) {
  let total_days = date_to_days(dt.year, dt.month, dt.day) + days;
  let _pipe = days_to_date(total_days);
  return set_time(_pipe, dt.hour, dt.minute, dt.second);
}

export function add_hours(dt, hours) {
  let total_seconds = ((dt.hour * 3600 + dt.minute * 60) + dt.second) + hours * 3600;
  let days_to_add = globalThis.Math.trunc(total_seconds / 86400);
  let remaining_seconds = total_seconds % 86400;
  let new_hour = globalThis.Math.trunc(remaining_seconds / 3600);
  let minute_base = remaining_seconds % 3600;
  let new_minute = globalThis.Math.trunc(minute_base / 60);
  let new_second = minute_base % 60;
  let _pipe = add_days(dt, days_to_add);
  return set_time(_pipe, new_hour, new_minute, new_second);
}

export function add_minutes(dt, minutes) {
  let total_seconds = ((dt.hour * 3600 + dt.minute * 60) + dt.second) + minutes * 60;
  let days_to_add = globalThis.Math.trunc(total_seconds / 86400);
  let remaining_seconds = total_seconds % 86400;
  let new_hour = globalThis.Math.trunc(remaining_seconds / 3600);
  let minute_base = remaining_seconds % 3600;
  let new_minute = globalThis.Math.trunc(minute_base / 60);
  let new_second = minute_base % 60;
  let _pipe = add_days(dt, days_to_add);
  return set_time(_pipe, new_hour, new_minute, new_second);
}

export function add_seconds(dt, seconds) {
  let total_seconds = ((dt.hour * 3600 + dt.minute * 60) + dt.second) + seconds;
  let days_to_add = globalThis.Math.trunc(total_seconds / 86400);
  let remaining_seconds = total_seconds % 86400;
  let new_hour = globalThis.Math.trunc(remaining_seconds / 3600);
  let minute_base = remaining_seconds % 3600;
  let new_minute = globalThis.Math.trunc(minute_base / 60);
  let new_second = minute_base % 60;
  let _pipe = add_days(dt, days_to_add);
  return set_time(_pipe, new_hour, new_minute, new_second);
}

export function duration_ms(ms) {
  return new Duration(ms);
}

export function duration_seconds(seconds) {
  return new Duration(seconds * 1000);
}

export function duration_minutes(minutes) {
  return new Duration(minutes * 60 * 1000);
}

export function duration_hours(hours) {
  return new Duration(hours * 60 * 60 * 1000);
}

export function duration_days(days) {
  return new Duration(days * 24 * 60 * 60 * 1000);
}

export function add_duration(dt, duration) {
  let total_seconds = globalThis.Math.trunc(duration.milliseconds / 1000);
  return add_seconds(dt, total_seconds);
}

export function compare(dt1, dt2) {
  let $ = dt1.year !== dt2.year;
  if ($) {
    let $1 = dt1.year < dt2.year;
    if ($1) {
      return new Lt();
    } else {
      return new Gt();
    }
  } else {
    let $1 = month_to_int(dt1.month) !== month_to_int(dt2.month);
    if ($1) {
      let $2 = month_to_int(dt1.month) < month_to_int(dt2.month);
      if ($2) {
        return new Lt();
      } else {
        return new Gt();
      }
    } else {
      let $2 = dt1.day !== dt2.day;
      if ($2) {
        let $3 = dt1.day < dt2.day;
        if ($3) {
          return new Lt();
        } else {
          return new Gt();
        }
      } else {
        let $3 = dt1.hour !== dt2.hour;
        if ($3) {
          let $4 = dt1.hour < dt2.hour;
          if ($4) {
            return new Lt();
          } else {
            return new Gt();
          }
        } else {
          let $4 = dt1.minute !== dt2.minute;
          if ($4) {
            let $5 = dt1.minute < dt2.minute;
            if ($5) {
              return new Lt();
            } else {
              return new Gt();
            }
          } else {
            let $5 = dt1.second !== dt2.second;
            if ($5) {
              let $6 = dt1.second < dt2.second;
              if ($6) {
                return new Lt();
              } else {
                return new Gt();
              }
            } else {
              return new Eq();
            }
          }
        }
      }
    }
  }
}

export function is_before(dt1, dt2) {
  return compare(dt1, dt2) instanceof Lt;
}

export function is_after(dt1, dt2) {
  return compare(dt1, dt2) instanceof Gt;
}

export function is_same_day(dt1, dt2) {
  return ((dt1.year === dt2.year) && (isEqual(dt1.month, dt2.month))) && (dt1.day === dt2.day);
}

export function start_of_day(dt) {
  return set_time(dt, 0, 0, 0);
}

export function end_of_day(dt) {
  return set_time(dt, 23, 59, 59);
}
