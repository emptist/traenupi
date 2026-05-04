/// <reference types="./logger.d.mts" />
import * as $io from "../../gleam_stdlib/gleam/io.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import { CustomType as $CustomType } from "../gleam.mjs";

export class Debug extends $CustomType {}
export const LogLevel$Debug = () => new Debug();
export const LogLevel$isDebug = (value) => value instanceof Debug;

export class Info extends $CustomType {}
export const LogLevel$Info = () => new Info();
export const LogLevel$isInfo = (value) => value instanceof Info;

export class Warn extends $CustomType {}
export const LogLevel$Warn = () => new Warn();
export const LogLevel$isWarn = (value) => value instanceof Warn;

export class Error extends $CustomType {}
export const LogLevel$Error = () => new Error();
export const LogLevel$isError = (value) => value instanceof Error;

export class Logger extends $CustomType {
  constructor(level, prefix, use_colors) {
    super();
    this.level = level;
    this.prefix = prefix;
    this.use_colors = use_colors;
  }
}
export const Logger$Logger = (level, prefix, use_colors) =>
  new Logger(level, prefix, use_colors);
export const Logger$isLogger = (value) => value instanceof Logger;
export const Logger$Logger$level = (value) => value.level;
export const Logger$Logger$0 = (value) => value.level;
export const Logger$Logger$prefix = (value) => value.prefix;
export const Logger$Logger$1 = (value) => value.prefix;
export const Logger$Logger$use_colors = (value) => value.use_colors;
export const Logger$Logger$2 = (value) => value.use_colors;

export function new$() {
  return new Logger(new Info(), new None(), true);
}

export function with_level(logger, level) {
  return new Logger(level, logger.prefix, logger.use_colors);
}

export function with_prefix(logger, prefix) {
  return new Logger(logger.level, new Some(prefix), logger.use_colors);
}

export function with_colors(logger, use_colors) {
  return new Logger(logger.level, logger.prefix, use_colors);
}

export function level_to_string(level) {
  if (level instanceof Debug) {
    return "DEBUG";
  } else if (level instanceof Info) {
    return "INFO";
  } else if (level instanceof Warn) {
    return "WARN";
  } else {
    return "ERROR";
  }
}

export function level_to_priority(level) {
  if (level instanceof Debug) {
    return 0;
  } else if (level instanceof Info) {
    return 1;
  } else if (level instanceof Warn) {
    return 2;
  } else {
    return 3;
  }
}

function should_log(logger, level) {
  return level_to_priority(level) >= level_to_priority(logger.level);
}

function colorize_level(level, text) {
  let _block;
  if (level instanceof Debug) {
    _block = "\\x1b[36m";
  } else if (level instanceof Info) {
    _block = "\\x1b[32m";
  } else if (level instanceof Warn) {
    _block = "\\x1b[33m";
  } else {
    _block = "\\x1b[31m";
  }
  let color = _block;
  let reset = "\\x1b[0m";
  return (color + text) + reset;
}

function format_message(logger, level, message) {
  let level_str = level_to_string(level);
  let _block;
  let $ = logger.prefix;
  if ($ instanceof Some) {
    let p = $[0];
    _block = ("[" + p) + "] ";
  } else {
    _block = "";
  }
  let prefix_str = _block;
  let $1 = logger.use_colors;
  if ($1) {
    let colored_level = colorize_level(level, level_str);
    return ((prefix_str + colored_level) + " ") + message;
  } else {
    return ((prefix_str + level_str) + " ") + message;
  }
}

export function debug(logger, message) {
  let $ = should_log(logger, new Debug());
  if ($) {
    $io.println(format_message(logger, new Debug(), message));
    return logger;
  } else {
    return logger;
  }
}

export function info(logger, message) {
  let $ = should_log(logger, new Info());
  if ($) {
    $io.println(format_message(logger, new Info(), message));
    return logger;
  } else {
    return logger;
  }
}

export function warn(logger, message) {
  let $ = should_log(logger, new Warn());
  if ($) {
    $io.println(format_message(logger, new Warn(), message));
    return logger;
  } else {
    return logger;
  }
}

export function error(logger, message) {
  let $ = should_log(logger, new Error());
  if ($) {
    $io.println(format_message(logger, new Error(), message));
    return logger;
  } else {
    return logger;
  }
}

export function log(logger, level, message) {
  if (level instanceof Debug) {
    return debug(logger, message);
  } else if (level instanceof Info) {
    return info(logger, message);
  } else if (level instanceof Warn) {
    return warn(logger, message);
  } else {
    return error(logger, message);
  }
}

export function debug_fn(logger, message_fn) {
  let $ = should_log(logger, new Debug());
  if ($) {
    return debug(logger, message_fn());
  } else {
    return logger;
  }
}

export function info_fn(logger, message_fn) {
  let $ = should_log(logger, new Info());
  if ($) {
    return info(logger, message_fn());
  } else {
    return logger;
  }
}

export function with_context(logger, context) {
  let $ = logger.prefix;
  if ($ instanceof Some) {
    let p = $[0];
    return with_prefix(logger, (p + ":") + context);
  } else {
    return with_prefix(logger, context);
  }
}

export function format_key_value(key, value) {
  return (key + "=") + value;
}

export function format_error(error_type, details) {
  return (error_type + ": ") + details;
}

export function format_success(operation, result) {
  return (operation + " succeeded: ") + result;
}

export function global_logger() {
  return new$();
}

export function log_debug(message) {
  let $ = debug(global_logger(), message);
  
  return undefined;
}

export function log_info(message) {
  let $ = info(global_logger(), message);
  
  return undefined;
}

export function log_warn(message) {
  let $ = warn(global_logger(), message);
  
  return undefined;
}

export function log_error(message) {
  let $ = error(global_logger(), message);
  
  return undefined;
}
