import gleam/io
import gleam/option.{type Option, None, Some}

pub type LogLevel {
  Debug
  Info
  Warn
  Error
}

pub type Logger {
  Logger(
    level: LogLevel,
    prefix: Option(String),
    use_colors: Bool,
  )
}

pub fn new() -> Logger {
  Logger(
    level: Info,
    prefix: None,
    use_colors: True,
  )
}

pub fn with_level(logger: Logger, level: LogLevel) -> Logger {
  Logger(..logger, level: level)
}

pub fn with_prefix(logger: Logger, prefix: String) -> Logger {
  Logger(..logger, prefix: Some(prefix))
}

pub fn with_colors(logger: Logger, use_colors: Bool) -> Logger {
  Logger(..logger, use_colors: use_colors)
}

pub fn level_to_string(level: LogLevel) -> String {
  case level {
    Debug -> "DEBUG"
    Info -> "INFO"
    Warn -> "WARN"
    Error -> "ERROR"
  }
}

pub fn level_to_priority(level: LogLevel) -> Int {
  case level {
    Debug -> 0
    Info -> 1
    Warn -> 2
    Error -> 3
  }
}

fn should_log(logger: Logger, level: LogLevel) -> Bool {
  level_to_priority(level) >= level_to_priority(logger.level)
}

fn format_message(logger: Logger, level: LogLevel, message: String) -> String {
  let level_str = level_to_string(level)
  let prefix_str = case logger.prefix {
    Some(p) -> "[" <> p <> "] "
    None -> ""
  }
  
  case logger.use_colors {
    True -> {
      let colored_level = colorize_level(level, level_str)
      prefix_str <> colored_level <> " " <> message
    }
    False -> prefix_str <> level_str <> " " <> message
  }
}

fn colorize_level(level: LogLevel, text: String) -> String {
  let color = case level {
    Debug -> "\\x1b[36m"
    Info -> "\\x1b[32m"
    Warn -> "\\x1b[33m"
    Error -> "\\x1b[31m"
  }
  let reset = "\\x1b[0m"
  color <> text <> reset
}

pub fn debug(logger: Logger, message: String) -> Logger {
  case should_log(logger, Debug) {
    True -> {
      io.println(format_message(logger, Debug, message))
      logger
    }
    False -> logger
  }
}

pub fn info(logger: Logger, message: String) -> Logger {
  case should_log(logger, Info) {
    True -> {
      io.println(format_message(logger, Info, message))
      logger
    }
    False -> logger
  }
}

pub fn warn(logger: Logger, message: String) -> Logger {
  case should_log(logger, Warn) {
    True -> {
      io.println(format_message(logger, Warn, message))
      logger
    }
    False -> logger
  }
}

pub fn error(logger: Logger, message: String) -> Logger {
  case should_log(logger, Error) {
    True -> {
      io.println(format_message(logger, Error, message))
      logger
    }
    False -> logger
  }
}

pub fn log(logger: Logger, level: LogLevel, message: String) -> Logger {
  case level {
    Debug -> debug(logger, message)
    Info -> info(logger, message)
    Warn -> warn(logger, message)
    Error -> error(logger, message)
  }
}

pub fn debug_fn(logger: Logger, message_fn: fn() -> String) -> Logger {
  case should_log(logger, Debug) {
    True -> debug(logger, message_fn())
    False -> logger
  }
}

pub fn info_fn(logger: Logger, message_fn: fn() -> String) -> Logger {
  case should_log(logger, Info) {
    True -> info(logger, message_fn())
    False -> logger
  }
}

pub fn with_context(logger: Logger, context: String) -> Logger {
  case logger.prefix {
    Some(p) -> with_prefix(logger, p <> ":" <> context)
    None -> with_prefix(logger, context)
  }
}

pub fn format_key_value(key: String, value: String) -> String {
  key <> "=" <> value
}

pub fn format_error(error_type: String, details: String) -> String {
  error_type <> ": " <> details
}

pub fn format_success(operation: String, result: String) -> String {
  operation <> " succeeded: " <> result
}

pub fn global_logger() -> Logger {
  new()
}

pub fn log_debug(message: String) -> Nil {
  let _ = debug(global_logger(), message)
  Nil
}

pub fn log_info(message: String) -> Nil {
  let _ = info(global_logger(), message)
  Nil
}

pub fn log_warn(message: String) -> Nil {
  let _ = warn(global_logger(), message)
  Nil
}

pub fn log_error(message: String) -> Nil {
  let _ = error(global_logger(), message)
  Nil
}
