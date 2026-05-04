/// <reference types="./task.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $result from "../../gleam_stdlib/gleam/result.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, toList, CustomType as $CustomType } from "../gleam.mjs";
import { generate_id, now } from "./task_ffi.mjs";

export class Pending extends $CustomType {}
export const TaskStatus$Pending = () => new Pending();
export const TaskStatus$isPending = (value) => value instanceof Pending;

export class Running extends $CustomType {}
export const TaskStatus$Running = () => new Running();
export const TaskStatus$isRunning = (value) => value instanceof Running;

export class Completed extends $CustomType {}
export const TaskStatus$Completed = () => new Completed();
export const TaskStatus$isCompleted = (value) => value instanceof Completed;

export class Failed extends $CustomType {}
export const TaskStatus$Failed = () => new Failed();
export const TaskStatus$isFailed = (value) => value instanceof Failed;

export class Task extends $CustomType {
  constructor(id, title, description, status, priority, result, error, retry_count, created_at, updated_at, completed_at, depends_on, blocking) {
    super();
    this.id = id;
    this.title = title;
    this.description = description;
    this.status = status;
    this.priority = priority;
    this.result = result;
    this.error = error;
    this.retry_count = retry_count;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.completed_at = completed_at;
    this.depends_on = depends_on;
    this.blocking = blocking;
  }
}
export const Task$Task = (id, title, description, status, priority, result, error, retry_count, created_at, updated_at, completed_at, depends_on, blocking) =>
  new Task(id,
  title,
  description,
  status,
  priority,
  result,
  error,
  retry_count,
  created_at,
  updated_at,
  completed_at,
  depends_on,
  blocking);
export const Task$isTask = (value) => value instanceof Task;
export const Task$Task$id = (value) => value.id;
export const Task$Task$0 = (value) => value.id;
export const Task$Task$title = (value) => value.title;
export const Task$Task$1 = (value) => value.title;
export const Task$Task$description = (value) => value.description;
export const Task$Task$2 = (value) => value.description;
export const Task$Task$status = (value) => value.status;
export const Task$Task$3 = (value) => value.status;
export const Task$Task$priority = (value) => value.priority;
export const Task$Task$4 = (value) => value.priority;
export const Task$Task$result = (value) => value.result;
export const Task$Task$5 = (value) => value.result;
export const Task$Task$error = (value) => value.error;
export const Task$Task$6 = (value) => value.error;
export const Task$Task$retry_count = (value) => value.retry_count;
export const Task$Task$7 = (value) => value.retry_count;
export const Task$Task$created_at = (value) => value.created_at;
export const Task$Task$8 = (value) => value.created_at;
export const Task$Task$updated_at = (value) => value.updated_at;
export const Task$Task$9 = (value) => value.updated_at;
export const Task$Task$completed_at = (value) => value.completed_at;
export const Task$Task$10 = (value) => value.completed_at;
export const Task$Task$depends_on = (value) => value.depends_on;
export const Task$Task$11 = (value) => value.depends_on;
export const Task$Task$blocking = (value) => value.blocking;
export const Task$Task$12 = (value) => value.blocking;

export class TaskNotFound extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const TaskError$TaskNotFound = ($0) => new TaskNotFound($0);
export const TaskError$isTaskNotFound = (value) =>
  value instanceof TaskNotFound;
export const TaskError$TaskNotFound$0 = (value) => value[0];

export class InvalidStatus extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const TaskError$InvalidStatus = ($0) => new InvalidStatus($0);
export const TaskError$isInvalidStatus = (value) =>
  value instanceof InvalidStatus;
export const TaskError$InvalidStatus$0 = (value) => value[0];

export class DatabaseError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const TaskError$DatabaseError = ($0) => new DatabaseError($0);
export const TaskError$isDatabaseError = (value) =>
  value instanceof DatabaseError;
export const TaskError$DatabaseError$0 = (value) => value[0];

export class DependencyNotMet extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const TaskError$DependencyNotMet = ($0) => new DependencyNotMet($0);
export const TaskError$isDependencyNotMet = (value) =>
  value instanceof DependencyNotMet;
export const TaskError$DependencyNotMet$0 = (value) => value[0];

export class ValidationError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const TaskError$ValidationError = ($0) => new ValidationError($0);
export const TaskError$isValidationError = (value) =>
  value instanceof ValidationError;
export const TaskError$ValidationError$0 = (value) => value[0];

export function with_description(task, description) {
  return new Task(
    task.id,
    task.title,
    new Some(description),
    task.status,
    task.priority,
    task.result,
    task.error,
    task.retry_count,
    task.created_at,
    task.updated_at,
    task.completed_at,
    task.depends_on,
    task.blocking,
  );
}

export function with_dependencies(task, depends_on) {
  return new Task(
    task.id,
    task.title,
    task.description,
    task.status,
    task.priority,
    task.result,
    task.error,
    task.retry_count,
    task.created_at,
    task.updated_at,
    task.completed_at,
    depends_on,
    task.blocking,
  );
}

export function is_pending(task) {
  return task.status instanceof Pending;
}

export function is_running(task) {
  return task.status instanceof Running;
}

export function is_completed(task) {
  return task.status instanceof Completed;
}

export function is_failed(task) {
  return task.status instanceof Failed;
}

export function can_start(task) {
  return (task.status instanceof Pending) || (task.status instanceof Failed);
}

export function status_to_string(status) {
  if (status instanceof Pending) {
    return "PENDING";
  } else if (status instanceof Running) {
    return "RUNNING";
  } else if (status instanceof Completed) {
    return "COMPLETED";
  } else {
    return "FAILED";
  }
}

export function status_from_string(s) {
  if (s === "PENDING") {
    return new Ok(new Pending());
  } else if (s === "RUNNING") {
    return new Ok(new Running());
  } else if (s === "COMPLETED") {
    return new Ok(new Completed());
  } else if (s === "FAILED") {
    return new Ok(new Failed());
  } else {
    return new Error(new InvalidStatus("Unknown status: " + s));
  }
}

export function encode_task(task) {
  return $dict.from_list(
    toList([
      ["id", task.id],
      ["title", task.title],
      ["description", $option.unwrap(task.description, "")],
      ["status", status_to_string(task.status)],
      ["priority", $int.to_string(task.priority)],
      ["result", $option.unwrap(task.result, "")],
      ["error", $option.unwrap(task.error, "")],
      ["retry_count", $int.to_string(task.retry_count)],
      ["created_at", $int.to_string(task.created_at)],
      ["updated_at", $int.to_string(task.updated_at)],
      [
        "completed_at",
        $option.unwrap($option.map(task.completed_at, $int.to_string), ""),
      ],
      ["depends_on", $string.join(task.depends_on, ",")],
      ["blocking", $string.join(task.blocking, ",")],
    ]),
  );
}

function dict_get(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      return $;
    } else {
      return new Error(new ValidationError("Missing field: " + key));
    }
  } else {
    return new Error(new ValidationError("Missing field: " + key));
  }
}

function dict_get_opt(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      return new Some(value);
    } else {
      return new None();
    }
  } else {
    return new None();
  }
}

function dict_get_int(dict, key, default$) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    let $1 = $int.parse(value);
    if ($1 instanceof Ok) {
      let n = $1[0];
      return n;
    } else {
      return default$;
    }
  } else {
    return default$;
  }
}

function dict_get_int_opt(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      let $1 = $int.parse(value);
      if ($1 instanceof Ok) {
        let n = $1[0];
        return new Some(n);
      } else {
        return new None();
      }
    } else {
      return new None();
    }
  } else {
    return new None();
  }
}

function dict_get_list(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      return $string.split(value, ",");
    } else {
      return toList([]);
    }
  } else {
    return toList([]);
  }
}

function parse_int(s) {
  let $ = $int.parse(s);
  if ($ instanceof Ok) {
    return $;
  } else {
    return new Error(new ValidationError("Invalid integer: " + s));
  }
}

export function new_task(title, priority) {
  return new Task(
    generate_id(),
    title,
    new None(),
    new Pending(),
    priority,
    new None(),
    new None(),
    0,
    now(),
    now(),
    new None(),
    toList([]),
    toList([]),
  );
}

export function start(task) {
  let $ = task.status;
  if ($ instanceof Pending) {
    return new Ok(
      new Task(
        task.id,
        task.title,
        task.description,
        new Running(),
        task.priority,
        task.result,
        task.error,
        task.retry_count,
        task.created_at,
        now(),
        task.completed_at,
        task.depends_on,
        task.blocking,
      ),
    );
  } else if ($ instanceof Running) {
    return new Error(new InvalidStatus("Task is already running"));
  } else if ($ instanceof Completed) {
    return new Error(new InvalidStatus("Task is already completed"));
  } else {
    return new Ok(
      new Task(
        task.id,
        task.title,
        task.description,
        new Running(),
        task.priority,
        task.result,
        task.error,
        task.retry_count + 1,
        task.created_at,
        now(),
        task.completed_at,
        task.depends_on,
        task.blocking,
      ),
    );
  }
}

export function complete(task, result) {
  return new Task(
    task.id,
    task.title,
    task.description,
    new Completed(),
    task.priority,
    new Some(result),
    task.error,
    task.retry_count,
    task.created_at,
    now(),
    new Some(now()),
    task.depends_on,
    task.blocking,
  );
}

export function fail(task, error) {
  return new Task(
    task.id,
    task.title,
    task.description,
    new Failed(),
    task.priority,
    task.result,
    new Some(error),
    task.retry_count,
    task.created_at,
    now(),
    task.completed_at,
    task.depends_on,
    task.blocking,
  );
}

export function decode_task(row) {
  return $result.try$(
    dict_get(row, "id"),
    (id) => {
      return $result.try$(
        dict_get(row, "title"),
        (title) => {
          return $result.try$(
            dict_get(row, "status"),
            (status_str) => {
              return $result.try$(
                status_from_string(status_str),
                (status) => {
                  return $result.try$(
                    dict_get(row, "priority"),
                    (priority_str) => {
                      return $result.try$(
                        parse_int(priority_str),
                        (priority) => {
                          let description = dict_get_opt(row, "description");
                          let result_val = dict_get_opt(row, "result");
                          let error = dict_get_opt(row, "error");
                          let retry_count = dict_get_int(row, "retry_count", 0);
                          let created_at = dict_get_int(
                            row,
                            "created_at",
                            now(),
                          );
                          let updated_at = dict_get_int(
                            row,
                            "updated_at",
                            now(),
                          );
                          let completed_at = dict_get_int_opt(
                            row,
                            "completed_at",
                          );
                          let depends_on = dict_get_list(row, "depends_on");
                          let blocking = dict_get_list(row, "blocking");
                          return new Ok(
                            new Task(
                              id,
                              title,
                              description,
                              status,
                              priority,
                              result_val,
                              error,
                              retry_count,
                              created_at,
                              updated_at,
                              completed_at,
                              depends_on,
                              blocking,
                            ),
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
}
