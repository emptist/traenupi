import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/order.{type Order, Lt, Gt, Eq}

pub type Month {
  January
  February
  March
  April
  May
  June
  July
  August
  September
  October
  November
  December
}

pub type Weekday {
  Monday
  Tuesday
  Wednesday
  Thursday
  Friday
  Saturday
  Sunday
}

pub type DateTime {
  DateTime(
    year: Int,
    month: Month,
    day: Int,
    hour: Int,
    minute: Int,
    second: Int,
  )
}

pub type Duration {
  Duration(
    milliseconds: Int,
  )
}

pub fn month_to_int(month: Month) -> Int {
  case month {
    January -> 1
    February -> 2
    March -> 3
    April -> 4
    May -> 5
    June -> 6
    July -> 7
    August -> 8
    September -> 9
    October -> 10
    November -> 11
    December -> 12
  }
}

pub fn int_to_month(n: Int) -> Option(Month) {
  case n {
    1 -> Some(January)
    2 -> Some(February)
    3 -> Some(March)
    4 -> Some(April)
    5 -> Some(May)
    6 -> Some(June)
    7 -> Some(July)
    8 -> Some(August)
    9 -> Some(September)
    10 -> Some(October)
    11 -> Some(November)
    12 -> Some(December)
    _ -> None
  }
}

pub fn weekday_to_int(weekday: Weekday) -> Int {
  case weekday {
    Monday -> 1
    Tuesday -> 2
    Wednesday -> 3
    Thursday -> 4
    Friday -> 5
    Saturday -> 6
    Sunday -> 7
  }
}

pub fn int_to_weekday(n: Int) -> Option(Weekday) {
  case n {
    1 -> Some(Monday)
    2 -> Some(Tuesday)
    3 -> Some(Wednesday)
    4 -> Some(Thursday)
    5 -> Some(Friday)
    6 -> Some(Saturday)
    7 -> Some(Sunday)
    _ -> None
  }
}

pub fn month_to_string(month: Month) -> String {
  case month {
    January -> "January"
    February -> "February"
    March -> "March"
    April -> "April"
    May -> "May"
    June -> "June"
    July -> "July"
    August -> "August"
    September -> "September"
    October -> "October"
    November -> "November"
    December -> "December"
  }
}

pub fn weekday_to_string(weekday: Weekday) -> String {
  case weekday {
    Monday -> "Monday"
    Tuesday -> "Tuesday"
    Wednesday -> "Wednesday"
    Thursday -> "Thursday"
    Friday -> "Friday"
    Saturday -> "Saturday"
    Sunday -> "Sunday"
  }
}

pub fn month_to_short(month: Month) -> String {
  case month {
    January -> "Jan"
    February -> "Feb"
    March -> "Mar"
    April -> "Apr"
    May -> "May"
    June -> "Jun"
    July -> "Jul"
    August -> "Aug"
    September -> "Sep"
    October -> "Oct"
    November -> "Nov"
    December -> "Dec"
  }
}

pub fn weekday_to_short(weekday: Weekday) -> String {
  case weekday {
    Monday -> "Mon"
    Tuesday -> "Tue"
    Wednesday -> "Wed"
    Thursday -> "Thu"
    Friday -> "Fri"
    Saturday -> "Sat"
    Sunday -> "Sun"
  }
}

pub fn is_leap_year(year: Int) -> Bool {
  case year % 4 {
    0 -> {
      case year % 100 {
        0 -> year % 400 == 0
        _ -> True
      }
    }
    _ -> False
  }
}

pub fn days_in_month(year: Int, month: Month) -> Int {
  case month {
    January -> 31
    February -> {
      case is_leap_year(year) {
        True -> 29
        False -> 28
      }
    }
    March -> 31
    April -> 30
    May -> 31
    June -> 30
    July -> 31
    August -> 31
    September -> 30
    October -> 31
    November -> 30
    December -> 31
  }
}

pub fn is_valid_date(year: Int, month: Month, day: Int) -> Bool {
  case day < 1 {
    True -> False
    False -> day <= days_in_month(year, month)
  }
}

pub fn is_valid_time(hour: Int, minute: Int, second: Int) -> Bool {
  hour >= 0 && hour < 24 && minute >= 0 && minute < 60 && second >= 0 && second < 60
}

pub fn is_valid_datetime(dt: DateTime) -> Bool {
  is_valid_date(dt.year, dt.month, dt.day) && is_valid_time(dt.hour, dt.minute, dt.second)
}

pub fn format_datetime(dt: DateTime, format: String) -> String {
  format
  |> string.replace("%Y", int_to_padded(dt.year, 4))
  |> string.replace("%m", int_to_padded(month_to_int(dt.month), 2))
  |> string.replace("%d", int_to_padded(dt.day, 2))
  |> string.replace("%H", int_to_padded(dt.hour, 2))
  |> string.replace("%M", int_to_padded(dt.minute, 2))
  |> string.replace("%S", int_to_padded(dt.second, 2))
  |> string.replace("%B", month_to_string(dt.month))
  |> string.replace("%b", month_to_short(dt.month))
}

pub fn to_iso8601(dt: DateTime) -> String {
  format_datetime(dt, "%Y-%m-%dT%H:%M:%S")
}

pub fn to_date_string(dt: DateTime) -> String {
  format_datetime(dt, "%Y-%m-%d")
}

pub fn to_time_string(dt: DateTime) -> String {
  format_datetime(dt, "%H:%M:%S")
}

fn int_to_padded(n: Int, width: Int) -> String {
  let str = int_to_string(n)
  let len = string.length(str)
  case len >= width {
    True -> str
    False -> {
      let zeros = width - len
      string.repeat("0", zeros) <> str
    }
  }
}

fn int_to_string(n: Int) -> String {
  case n {
    0 -> "0"
    1 -> "1"
    2 -> "2"
    3 -> "3"
    4 -> "4"
    5 -> "5"
    6 -> "6"
    7 -> "7"
    8 -> "8"
    9 -> "9"
    10 -> "10"
    100 -> "100"
    1000 -> "1000"
    2000 -> "2000"
    2024 -> "2024"
    2025 -> "2025"
    _ -> {
      case n < 0 {
        True -> "-" <> int_to_string(0 - n)
        False -> {
          let tens = n / 10
          let ones = n - tens * 10
          int_to_string(tens) <> int_to_string(ones)
        }
      }
    }
  }
}

pub fn create(year: Int, month: Month, day: Int) -> DateTime {
  DateTime(year: year, month: month, day: day, hour: 0, minute: 0, second: 0)
}

pub fn create_full(
  year: Int,
  month: Month,
  day: Int,
  hour: Int,
  minute: Int,
  second: Int,
) -> DateTime {
  DateTime(year: year, month: month, day: day, hour: hour, minute: minute, second: second)
}

pub fn add_days(dt: DateTime, days: Int) -> DateTime {
  let total_days = date_to_days(dt.year, dt.month, dt.day) + days
  days_to_date(total_days)
  |> set_time(dt.hour, dt.minute, dt.second)
}

fn date_to_days(year: Int, month: Month, day: Int) -> Int {
  let y = year - 1
  let leap_years = y / 4 - y / 100 + y / 400
  let base_days = y * 365 + leap_years
  let month_days = month_to_day_of_year(month, is_leap_year(year))
  base_days + month_days + day - 1
}

fn days_to_date(days: Int) -> DateTime {
  let year = estimate_year(days)
  let remaining = days - date_to_days(year, January, 1)
  let month = find_month(year, remaining)
  let day = remaining - month_to_day_of_year(month, is_leap_year(year)) + 1
  DateTime(year: year, month: month, day: day, hour: 0, minute: 0, second: 0)
}

fn estimate_year(days: Int) -> Int {
  let approx = days / 365
  case date_to_days(approx, January, 1) > days {
    True -> estimate_year(approx - 1)
    False -> {
      case date_to_days(approx + 1, January, 1) <= days {
        True -> estimate_year(approx + 1)
        False -> approx
      }
    }
  }
}

fn find_month(year: Int, day_of_year: Int) -> Month {
  find_month_helper(year, day_of_year, January)
}

fn find_month_helper(year: Int, day_of_year: Int, month: Month) -> Month {
  let month_days = days_in_month(year, month)
  let day_in_month = day_of_year - month_to_day_of_year(month, is_leap_year(year))
  case day_in_month < month_days {
    True -> month
    False -> {
      case month {
        January -> find_month_helper(year, day_of_year, February)
        February -> find_month_helper(year, day_of_year, March)
        March -> find_month_helper(year, day_of_year, April)
        April -> find_month_helper(year, day_of_year, May)
        May -> find_month_helper(year, day_of_year, June)
        June -> find_month_helper(year, day_of_year, July)
        July -> find_month_helper(year, day_of_year, August)
        August -> find_month_helper(year, day_of_year, September)
        September -> find_month_helper(year, day_of_year, October)
        October -> find_month_helper(year, day_of_year, November)
        November -> find_month_helper(year, day_of_year, December)
        December -> December
      }
    }
  }
}

fn month_to_day_of_year(month: Month, is_leap: Bool) -> Int {
  let base = case month {
    January -> 0
    February -> 31
    March -> 59
    April -> 90
    May -> 120
    June -> 151
    July -> 181
    August -> 212
    September -> 243
    October -> 273
    November -> 304
    December -> 334
  }
  case is_leap && month != January && month != February {
    True -> base + 1
    False -> base
  }
}

pub fn set_time(dt: DateTime, hour: Int, minute: Int, second: Int) -> DateTime {
  DateTime(year: dt.year, month: dt.month, day: dt.day, hour: hour, minute: minute, second: second)
}

pub fn add_hours(dt: DateTime, hours: Int) -> DateTime {
  let total_seconds = dt.hour * 3600 + dt.minute * 60 + dt.second + hours * 3600
  let days_to_add = total_seconds / 86400
  let remaining_seconds = total_seconds % 86400
  let new_hour = remaining_seconds / 3600
  let minute_base = remaining_seconds % 3600
  let new_minute = minute_base / 60
  let new_second = minute_base % 60
  
  add_days(dt, days_to_add)
  |> set_time(new_hour, new_minute, new_second)
}

pub fn add_minutes(dt: DateTime, minutes: Int) -> DateTime {
  let total_seconds = dt.hour * 3600 + dt.minute * 60 + dt.second + minutes * 60
  let days_to_add = total_seconds / 86400
  let remaining_seconds = total_seconds % 86400
  let new_hour = remaining_seconds / 3600
  let minute_base = remaining_seconds % 3600
  let new_minute = minute_base / 60
  let new_second = minute_base % 60
  
  add_days(dt, days_to_add)
  |> set_time(new_hour, new_minute, new_second)
}

pub fn add_seconds(dt: DateTime, seconds: Int) -> DateTime {
  let total_seconds = dt.hour * 3600 + dt.minute * 60 + dt.second + seconds
  let days_to_add = total_seconds / 86400
  let remaining_seconds = total_seconds % 86400
  let new_hour = remaining_seconds / 3600
  let minute_base = remaining_seconds % 3600
  let new_minute = minute_base / 60
  let new_second = minute_base % 60
  
  add_days(dt, days_to_add)
  |> set_time(new_hour, new_minute, new_second)
}

pub fn duration_ms(ms: Int) -> Duration {
  Duration(milliseconds: ms)
}

pub fn duration_seconds(seconds: Int) -> Duration {
  Duration(milliseconds: seconds * 1000)
}

pub fn duration_minutes(minutes: Int) -> Duration {
  Duration(milliseconds: minutes * 60 * 1000)
}

pub fn duration_hours(hours: Int) -> Duration {
  Duration(milliseconds: hours * 60 * 60 * 1000)
}

pub fn duration_days(days: Int) -> Duration {
  Duration(milliseconds: days * 24 * 60 * 60 * 1000)
}

pub fn add_duration(dt: DateTime, duration: Duration) -> DateTime {
  let total_seconds = duration.milliseconds / 1000
  add_seconds(dt, total_seconds)
}

pub fn compare(dt1: DateTime, dt2: DateTime) -> Order {
  case dt1.year != dt2.year {
    True -> {
      case dt1.year < dt2.year {
        True -> Lt
        False -> Gt
      }
    }
    False -> {
      case month_to_int(dt1.month) != month_to_int(dt2.month) {
        True -> {
          case month_to_int(dt1.month) < month_to_int(dt2.month) {
            True -> Lt
            False -> Gt
          }
        }
        False -> {
          case dt1.day != dt2.day {
            True -> {
              case dt1.day < dt2.day {
                True -> Lt
                False -> Gt
              }
            }
            False -> {
              case dt1.hour != dt2.hour {
                True -> {
                  case dt1.hour < dt2.hour {
                    True -> Lt
                    False -> Gt
                  }
                }
                False -> {
                  case dt1.minute != dt2.minute {
                    True -> {
                      case dt1.minute < dt2.minute {
                        True -> Lt
                        False -> Gt
                      }
                    }
                    False -> {
                      case dt1.second != dt2.second {
                        True -> {
                          case dt1.second < dt2.second {
                            True -> Lt
                            False -> Gt
                          }
                        }
                        False -> Eq
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

pub fn is_before(dt1: DateTime, dt2: DateTime) -> Bool {
  compare(dt1, dt2) == Lt
}

pub fn is_after(dt1: DateTime, dt2: DateTime) -> Bool {
  compare(dt1, dt2) == Gt
}

pub fn is_same_day(dt1: DateTime, dt2: DateTime) -> Bool {
  dt1.year == dt2.year && dt1.month == dt2.month && dt1.day == dt2.day
}

pub fn start_of_day(dt: DateTime) -> DateTime {
  set_time(dt, 0, 0, 0)
}

pub fn end_of_day(dt: DateTime) -> DateTime {
  set_time(dt, 23, 59, 59)
}
