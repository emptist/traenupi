import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class TaskStarted extends _.CustomType {}
export function EventType$TaskStarted(): EventType$;
export function EventType$isTaskStarted(value: EventType$): boolean;

export class TaskCompleted extends _.CustomType {}
export function EventType$TaskCompleted(): EventType$;
export function EventType$isTaskCompleted(value: EventType$): boolean;

export class TaskFailed extends _.CustomType {}
export function EventType$TaskFailed(): EventType$;
export function EventType$isTaskFailed(value: EventType$): boolean;

export class TaskRetry extends _.CustomType {}
export function EventType$TaskRetry(): EventType$;
export function EventType$isTaskRetry(value: EventType$): boolean;

export class SchedulerHeartbeat extends _.CustomType {}
export function EventType$SchedulerHeartbeat(): EventType$;
export function EventType$isSchedulerHeartbeat(value: EventType$): boolean;

export class SchedulerPaused extends _.CustomType {}
export function EventType$SchedulerPaused(): EventType$;
export function EventType$isSchedulerPaused(value: EventType$): boolean;

export class SchedulerResumed extends _.CustomType {}
export function EventType$SchedulerResumed(): EventType$;
export function EventType$isSchedulerResumed(value: EventType$): boolean;

export class AgentRegistered extends _.CustomType {}
export function EventType$AgentRegistered(): EventType$;
export function EventType$isAgentRegistered(value: EventType$): boolean;

export class AgentUnregistered extends _.CustomType {}
export function EventType$AgentUnregistered(): EventType$;
export function EventType$isAgentUnregistered(value: EventType$): boolean;

export class AgentError extends _.CustomType {}
export function EventType$AgentError(): EventType$;
export function EventType$isAgentError(value: EventType$): boolean;

export class SystemStarted extends _.CustomType {}
export function EventType$SystemStarted(): EventType$;
export function EventType$isSystemStarted(value: EventType$): boolean;

export class SystemStopped extends _.CustomType {}
export function EventType$SystemStopped(): EventType$;
export function EventType$isSystemStopped(value: EventType$): boolean;

export class HealthCheck extends _.CustomType {}
export function EventType$HealthCheck(): EventType$;
export function EventType$isHealthCheck(value: EventType$): boolean;

export class CustomEvent extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function EventType$CustomEvent($0: string): EventType$;
export function EventType$isCustomEvent(value: EventType$): boolean;
export function EventType$CustomEvent$0(value: EventType$): string;

export type EventType$ = TaskStarted | TaskCompleted | TaskFailed | TaskRetry | SchedulerHeartbeat | SchedulerPaused | SchedulerResumed | AgentRegistered | AgentUnregistered | AgentError | SystemStarted | SystemStopped | HealthCheck | CustomEvent;

export class Event extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    event_type: EventType$,
    data: string,
    timestamp: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  event_type: EventType$;
  /** @deprecated */
  data: string;
  /** @deprecated */
  timestamp: number;
}
export function Event$Event(
  id: string,
  event_type: EventType$,
  data: string,
  timestamp: number,
): Event$;
export function Event$isEvent(value: Event$): boolean;
export function Event$Event$0(value: Event$): string;
export function Event$Event$id(value: Event$): string;
export function Event$Event$1(value: Event$): EventType$;
export function Event$Event$event_type(value: Event$): EventType$;
export function Event$Event$2(value: Event$): string;
export function Event$Event$data(value: Event$): string;
export function Event$Event$3(value: Event$): number;
export function Event$Event$timestamp(value: Event$): number;

export type Event$ = Event;

export class Subscription extends _.CustomType {
  /** @deprecated */
  constructor(id: string, event_type: EventType$, created_at: number);
  /** @deprecated */
  id: string;
  /** @deprecated */
  event_type: EventType$;
  /** @deprecated */
  created_at: number;
}
export function Subscription$Subscription(
  id: string,
  event_type: EventType$,
  created_at: number,
): Subscription$;
export function Subscription$isSubscription(value: Subscription$): boolean;
export function Subscription$Subscription$0(value: Subscription$): string;
export function Subscription$Subscription$id(value: Subscription$): string;
export function Subscription$Subscription$1(value: Subscription$): EventType$;
export function Subscription$Subscription$event_type(value: Subscription$): EventType$;
export function Subscription$Subscription$2(
  value: Subscription$,
): number;
export function Subscription$Subscription$created_at(value: Subscription$): number;

export type Subscription$ = Subscription;

export class EventBus extends _.CustomType {
  /** @deprecated */
  constructor(
    handlers: $dict.Dict$<string, _.List<(x0: string) => undefined>>,
    subscriptions: $dict.Dict$<string, Subscription$>,
    history: _.List<Event$>,
    max_history_size: number
  );
  /** @deprecated */
  handlers: $dict.Dict$<string, _.List<(x0: string) => undefined>>;
  /** @deprecated */
  subscriptions: $dict.Dict$<string, Subscription$>;
  /** @deprecated */
  history: _.List<Event$>;
  /** @deprecated */
  max_history_size: number;
}
export function EventBus$EventBus(
  handlers: $dict.Dict$<string, _.List<(x0: string) => undefined>>,
  subscriptions: $dict.Dict$<string, Subscription$>,
  history: _.List<Event$>,
  max_history_size: number,
): EventBus$;
export function EventBus$isEventBus(value: EventBus$): boolean;
export function EventBus$EventBus$0(value: EventBus$): $dict.Dict$<
  string,
  _.List<(x0: string) => undefined>
>;
export function EventBus$EventBus$handlers(value: EventBus$): $dict.Dict$<
  string,
  _.List<(x0: string) => undefined>
>;
export function EventBus$EventBus$1(value: EventBus$): $dict.Dict$<
  string,
  Subscription$
>;
export function EventBus$EventBus$subscriptions(value: EventBus$): $dict.Dict$<
  string,
  Subscription$
>;
export function EventBus$EventBus$2(value: EventBus$): _.List<Event$>;
export function EventBus$EventBus$history(value: EventBus$): _.List<Event$>;
export function EventBus$EventBus$3(value: EventBus$): number;
export function EventBus$EventBus$max_history_size(value: EventBus$): number;

export type EventBus$ = EventBus;

export type Handler = (x0: string) => undefined;

export function new_bus(): EventBus$;

export function with_max_history(bus: EventBus$, size: number): EventBus$;

export function get_subscriptions(bus: EventBus$): _.List<Subscription$>;

export function get_subscription_count(bus: EventBus$): number;

export function clear(bus: EventBus$): EventBus$;

export function clear_history(bus: EventBus$): EventBus$;

export function event_type_to_string(type_: EventType$): string;

export function unsubscribe(bus: EventBus$, subscription_id: string): EventBus$;

export function get_history(
  bus: EventBus$,
  event_type: $option.Option$<EventType$>,
  limit: number
): _.List<Event$>;

export function event_type_from_string(str: string): EventType$;

export function event_to_json(event: Event$): string;

export function subscribe(
  bus: EventBus$,
  event_type: EventType$,
  handler: (x0: string) => undefined
): [EventBus$, string];

export function publish(bus: EventBus$, event_type: EventType$, data: string): EventBus$;
