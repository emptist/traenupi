import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Pending extends _.CustomType {}
export function TaskStatus$Pending(): TaskStatus$;
export function TaskStatus$isPending(value: TaskStatus$): boolean;

export class Running extends _.CustomType {}
export function TaskStatus$Running(): TaskStatus$;
export function TaskStatus$isRunning(value: TaskStatus$): boolean;

export class Completed extends _.CustomType {}
export function TaskStatus$Completed(): TaskStatus$;
export function TaskStatus$isCompleted(value: TaskStatus$): boolean;

export class Failed extends _.CustomType {}
export function TaskStatus$Failed(): TaskStatus$;
export function TaskStatus$isFailed(value: TaskStatus$): boolean;

export type TaskStatus$ = Pending | Running | Completed | Failed;

export class Task extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    title: string,
    description: $option.Option$<string>,
    status: TaskStatus$,
    priority: number,
    result: $option.Option$<string>,
    error: $option.Option$<string>,
    retry_count: number,
    created_at: number,
    updated_at: number,
    completed_at: $option.Option$<number>,
    depends_on: _.List<string>,
    blocking: _.List<string>
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  title: string;
  /** @deprecated */
  description: $option.Option$<string>;
  /** @deprecated */
  status: TaskStatus$;
  /** @deprecated */
  priority: number;
  /** @deprecated */
  result: $option.Option$<string>;
  /** @deprecated */
  error: $option.Option$<string>;
  /** @deprecated */
  retry_count: number;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  updated_at: number;
  /** @deprecated */
  completed_at: $option.Option$<number>;
  /** @deprecated */
  depends_on: _.List<string>;
  /** @deprecated */
  blocking: _.List<string>;
}
export function Task$Task(
  id: string,
  title: string,
  description: $option.Option$<string>,
  status: TaskStatus$,
  priority: number,
  result: $option.Option$<string>,
  error: $option.Option$<string>,
  retry_count: number,
  created_at: number,
  updated_at: number,
  completed_at: $option.Option$<number>,
  depends_on: _.List<string>,
  blocking: _.List<string>,
): Task$;
export function Task$isTask(value: Task$): boolean;
export function Task$Task$0(value: Task$): string;
export function Task$Task$id(value: Task$): string;
export function Task$Task$1(value: Task$): string;
export function Task$Task$title(value: Task$): string;
export function Task$Task$2(value: Task$): $option.Option$<string>;
export function Task$Task$description(value: Task$): $option.Option$<string>;
export function Task$Task$3(value: Task$): TaskStatus$;
export function Task$Task$status(value: Task$): TaskStatus$;
export function Task$Task$4(value: Task$): number;
export function Task$Task$priority(value: Task$): number;
export function Task$Task$5(value: Task$): $option.Option$<string>;
export function Task$Task$result(value: Task$): $option.Option$<string>;
export function Task$Task$6(value: Task$): $option.Option$<string>;
export function Task$Task$error(value: Task$): $option.Option$<string>;
export function Task$Task$7(value: Task$): number;
export function Task$Task$retry_count(value: Task$): number;
export function Task$Task$8(value: Task$): number;
export function Task$Task$created_at(value: Task$): number;
export function Task$Task$9(value: Task$): number;
export function Task$Task$updated_at(value: Task$): number;
export function Task$Task$10(value: Task$): $option.Option$<number>;
export function Task$Task$completed_at(value: Task$): $option.Option$<number>;
export function Task$Task$11(value: Task$): _.List<string>;
export function Task$Task$depends_on(value: Task$): _.List<string>;
export function Task$Task$12(value: Task$): _.List<string>;
export function Task$Task$blocking(value: Task$): _.List<string>;

export type Task$ = Task;

export class TaskNotFound extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function TaskError$TaskNotFound($0: string): TaskError$;
export function TaskError$isTaskNotFound(value: TaskError$): boolean;
export function TaskError$TaskNotFound$0(value: TaskError$): string;

export class InvalidStatus extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function TaskError$InvalidStatus($0: string): TaskError$;
export function TaskError$isInvalidStatus(value: TaskError$): boolean;
export function TaskError$InvalidStatus$0(value: TaskError$): string;

export class DatabaseError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function TaskError$DatabaseError($0: string): TaskError$;
export function TaskError$isDatabaseError(value: TaskError$): boolean;
export function TaskError$DatabaseError$0(value: TaskError$): string;

export class DependencyNotMet extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function TaskError$DependencyNotMet($0: string): TaskError$;
export function TaskError$isDependencyNotMet(value: TaskError$): boolean;
export function TaskError$DependencyNotMet$0(value: TaskError$): string;

export class ValidationError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function TaskError$ValidationError($0: string): TaskError$;
export function TaskError$isValidationError(value: TaskError$): boolean;
export function TaskError$ValidationError$0(value: TaskError$): string;

export type TaskError$ = TaskNotFound | InvalidStatus | DatabaseError | DependencyNotMet | ValidationError;

export function with_description(task: Task$, description: string): Task$;

export function with_dependencies(task: Task$, depends_on: _.List<string>): Task$;

export function is_pending(task: Task$): boolean;

export function is_running(task: Task$): boolean;

export function is_completed(task: Task$): boolean;

export function is_failed(task: Task$): boolean;

export function can_start(task: Task$): boolean;

export function status_to_string(status: TaskStatus$): string;

export function status_from_string(s: string): _.Result<TaskStatus$, TaskError$>;

export function encode_task(task: Task$): $dict.Dict$<string, string>;

export function new_task(title: string, priority: number): Task$;

export function start(task: Task$): _.Result<Task$, TaskError$>;

export function complete(task: Task$, result: string): Task$;

export function fail(task: Task$, error: string): Task$;

export function decode_task(row: $dict.Dict$<string, string>): _.Result<
  Task$,
  TaskError$
>;
