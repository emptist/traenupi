/// <reference types="./event_bus.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, toList, prepend as listPrepend, CustomType as $CustomType } from "../gleam.mjs";
import { now } from "./event_bus_ffi.mjs";

export class TaskStarted extends $CustomType {}
export const EventType$TaskStarted = () => new TaskStarted();
export const EventType$isTaskStarted = (value) => value instanceof TaskStarted;

export class TaskCompleted extends $CustomType {}
export const EventType$TaskCompleted = () => new TaskCompleted();
export const EventType$isTaskCompleted = (value) =>
  value instanceof TaskCompleted;

export class TaskFailed extends $CustomType {}
export const EventType$TaskFailed = () => new TaskFailed();
export const EventType$isTaskFailed = (value) => value instanceof TaskFailed;

export class TaskRetry extends $CustomType {}
export const EventType$TaskRetry = () => new TaskRetry();
export const EventType$isTaskRetry = (value) => value instanceof TaskRetry;

export class SchedulerHeartbeat extends $CustomType {}
export const EventType$SchedulerHeartbeat = () => new SchedulerHeartbeat();
export const EventType$isSchedulerHeartbeat = (value) =>
  value instanceof SchedulerHeartbeat;

export class SchedulerPaused extends $CustomType {}
export const EventType$SchedulerPaused = () => new SchedulerPaused();
export const EventType$isSchedulerPaused = (value) =>
  value instanceof SchedulerPaused;

export class SchedulerResumed extends $CustomType {}
export const EventType$SchedulerResumed = () => new SchedulerResumed();
export const EventType$isSchedulerResumed = (value) =>
  value instanceof SchedulerResumed;

export class AgentRegistered extends $CustomType {}
export const EventType$AgentRegistered = () => new AgentRegistered();
export const EventType$isAgentRegistered = (value) =>
  value instanceof AgentRegistered;

export class AgentUnregistered extends $CustomType {}
export const EventType$AgentUnregistered = () => new AgentUnregistered();
export const EventType$isAgentUnregistered = (value) =>
  value instanceof AgentUnregistered;

export class AgentError extends $CustomType {}
export const EventType$AgentError = () => new AgentError();
export const EventType$isAgentError = (value) => value instanceof AgentError;

export class SystemStarted extends $CustomType {}
export const EventType$SystemStarted = () => new SystemStarted();
export const EventType$isSystemStarted = (value) =>
  value instanceof SystemStarted;

export class SystemStopped extends $CustomType {}
export const EventType$SystemStopped = () => new SystemStopped();
export const EventType$isSystemStopped = (value) =>
  value instanceof SystemStopped;

export class HealthCheck extends $CustomType {}
export const EventType$HealthCheck = () => new HealthCheck();
export const EventType$isHealthCheck = (value) => value instanceof HealthCheck;

export class CustomEvent extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const EventType$CustomEvent = ($0) => new CustomEvent($0);
export const EventType$isCustomEvent = (value) => value instanceof CustomEvent;
export const EventType$CustomEvent$0 = (value) => value[0];

export class Event extends $CustomType {
  constructor(id, event_type, data, timestamp) {
    super();
    this.id = id;
    this.event_type = event_type;
    this.data = data;
    this.timestamp = timestamp;
  }
}
export const Event$Event = (id, event_type, data, timestamp) =>
  new Event(id, event_type, data, timestamp);
export const Event$isEvent = (value) => value instanceof Event;
export const Event$Event$id = (value) => value.id;
export const Event$Event$0 = (value) => value.id;
export const Event$Event$event_type = (value) => value.event_type;
export const Event$Event$1 = (value) => value.event_type;
export const Event$Event$data = (value) => value.data;
export const Event$Event$2 = (value) => value.data;
export const Event$Event$timestamp = (value) => value.timestamp;
export const Event$Event$3 = (value) => value.timestamp;

export class Subscription extends $CustomType {
  constructor(id, event_type, created_at) {
    super();
    this.id = id;
    this.event_type = event_type;
    this.created_at = created_at;
  }
}
export const Subscription$Subscription = (id, event_type, created_at) =>
  new Subscription(id, event_type, created_at);
export const Subscription$isSubscription = (value) =>
  value instanceof Subscription;
export const Subscription$Subscription$id = (value) => value.id;
export const Subscription$Subscription$0 = (value) => value.id;
export const Subscription$Subscription$event_type = (value) => value.event_type;
export const Subscription$Subscription$1 = (value) => value.event_type;
export const Subscription$Subscription$created_at = (value) => value.created_at;
export const Subscription$Subscription$2 = (value) => value.created_at;

export class EventBus extends $CustomType {
  constructor(handlers, subscriptions, history, max_history_size) {
    super();
    this.handlers = handlers;
    this.subscriptions = subscriptions;
    this.history = history;
    this.max_history_size = max_history_size;
  }
}
export const EventBus$EventBus = (handlers, subscriptions, history, max_history_size) =>
  new EventBus(handlers, subscriptions, history, max_history_size);
export const EventBus$isEventBus = (value) => value instanceof EventBus;
export const EventBus$EventBus$handlers = (value) => value.handlers;
export const EventBus$EventBus$0 = (value) => value.handlers;
export const EventBus$EventBus$subscriptions = (value) => value.subscriptions;
export const EventBus$EventBus$1 = (value) => value.subscriptions;
export const EventBus$EventBus$history = (value) => value.history;
export const EventBus$EventBus$2 = (value) => value.history;
export const EventBus$EventBus$max_history_size = (value) =>
  value.max_history_size;
export const EventBus$EventBus$3 = (value) => value.max_history_size;

export function new_bus() {
  return new EventBus($dict.new$(), $dict.new$(), toList([]), 100);
}

export function with_max_history(bus, size) {
  return new EventBus(bus.handlers, bus.subscriptions, bus.history, size);
}

function add_to_history(history, event, max_size) {
  let new_history = listPrepend(event, history);
  let $ = $list.length(new_history) > max_size;
  if ($) {
    return $list.take(new_history, max_size);
  } else {
    return new_history;
  }
}

export function get_subscriptions(bus) {
  return $dict.values(bus.subscriptions);
}

export function get_subscription_count(bus) {
  return $dict.size(bus.subscriptions);
}

export function clear(bus) {
  return new EventBus(
    $dict.new$(),
    $dict.new$(),
    bus.history,
    bus.max_history_size,
  );
}

export function clear_history(bus) {
  return new EventBus(
    bus.handlers,
    bus.subscriptions,
    toList([]),
    bus.max_history_size,
  );
}

export function event_type_to_string(type_) {
  if (type_ instanceof TaskStarted) {
    return "task:started";
  } else if (type_ instanceof TaskCompleted) {
    return "task:completed";
  } else if (type_ instanceof TaskFailed) {
    return "task:failed";
  } else if (type_ instanceof TaskRetry) {
    return "task:retry";
  } else if (type_ instanceof SchedulerHeartbeat) {
    return "scheduler:heartbeat";
  } else if (type_ instanceof SchedulerPaused) {
    return "scheduler:paused";
  } else if (type_ instanceof SchedulerResumed) {
    return "scheduler:resumed";
  } else if (type_ instanceof AgentRegistered) {
    return "agent:registered";
  } else if (type_ instanceof AgentUnregistered) {
    return "agent:unregistered";
  } else if (type_ instanceof AgentError) {
    return "agent:error";
  } else if (type_ instanceof SystemStarted) {
    return "system:started";
  } else if (type_ instanceof SystemStopped) {
    return "system:stopped";
  } else if (type_ instanceof HealthCheck) {
    return "system:health:check";
  } else {
    let name = type_[0];
    return name;
  }
}

export function unsubscribe(bus, subscription_id) {
  let $ = $dict.get(bus.subscriptions, subscription_id);
  if ($ instanceof Ok) {
    let subscription = $[0];
    let event_key = event_type_to_string(subscription.event_type);
    let subscriptions = $dict.delete$(bus.subscriptions, subscription_id);
    let _block;
    let $1 = $dict.get(bus.handlers, event_key);
    if ($1 instanceof Ok) {
      let current_handlers = $1[0];
      let filtered = $list.filter(current_handlers, (_) => { return true; });
      let $2 = $list.length(filtered);
      if ($2 === 0) {
        _block = $dict.delete$(bus.handlers, event_key);
      } else {
        _block = $dict.insert(bus.handlers, event_key, filtered);
      }
    } else {
      _block = bus.handlers;
    }
    let handlers = _block;
    return new EventBus(
      handlers,
      subscriptions,
      bus.history,
      bus.max_history_size,
    );
  } else {
    return bus;
  }
}

export function get_history(bus, event_type, limit) {
  if (event_type instanceof Some) {
    let type_ = event_type[0];
    let event_key = event_type_to_string(type_);
    let _pipe = bus.history;
    let _pipe$1 = $list.filter(
      _pipe,
      (event) => { return event_type_to_string(event.event_type) === event_key; },
    );
    return $list.take(_pipe$1, limit);
  } else {
    return $list.take(bus.history, limit);
  }
}

export function event_type_from_string(str) {
  if (str === "task:started") {
    return new TaskStarted();
  } else if (str === "task:completed") {
    return new TaskCompleted();
  } else if (str === "task:failed") {
    return new TaskFailed();
  } else if (str === "task:retry") {
    return new TaskRetry();
  } else if (str === "scheduler:heartbeat") {
    return new SchedulerHeartbeat();
  } else if (str === "scheduler:paused") {
    return new SchedulerPaused();
  } else if (str === "scheduler:resumed") {
    return new SchedulerResumed();
  } else if (str === "agent:registered") {
    return new AgentRegistered();
  } else if (str === "agent:unregistered") {
    return new AgentUnregistered();
  } else if (str === "agent:error") {
    return new AgentError();
  } else if (str === "system:started") {
    return new SystemStarted();
  } else if (str === "system:stopped") {
    return new SystemStopped();
  } else if (str === "system:health:check") {
    return new HealthCheck();
  } else {
    return new CustomEvent(str);
  }
}

export function event_to_json(event) {
  return ((((("{\"id\":\"" + event.id) + "\",\"type\":\"") + event_type_to_string(
    event.event_type,
  )) + "\",\"timestamp\":") + $int.to_string(event.timestamp)) + "}";
}

export function subscribe(bus, event_type, handler) {
  let event_key = event_type_to_string(event_type);
  let subscription_id = (((event_key + "-") + $int.to_string(now())) + "-") + $int.to_string(
    $int.random(10000),
  );
  let _block;
  let $ = $dict.get(bus.handlers, event_key);
  if ($ instanceof Ok) {
    let handlers = $[0];
    _block = handlers;
  } else {
    _block = toList([]);
  }
  let current_handlers = _block;
  let handlers = $dict.insert(
    bus.handlers,
    event_key,
    listPrepend(handler, current_handlers),
  );
  let subscription = new Subscription(subscription_id, event_type, now());
  let subscriptions = $dict.insert(
    bus.subscriptions,
    subscription_id,
    subscription,
  );
  return [
    new EventBus(handlers, subscriptions, bus.history, bus.max_history_size),
    subscription_id,
  ];
}

function generate_id() {
  return ($int.to_string(now()) + "-") + $int.to_string($int.random(10000));
}

export function publish(bus, event_type, data) {
  let event = new Event(generate_id(), event_type, data, now());
  let event_key = event_type_to_string(event_type);
  let $ = $dict.get(bus.handlers, event_key);
  if ($ instanceof Ok) {
    let handlers = $[0];
    $list.each(handlers, (handler) => { return handler(data); })
  } else {
    undefined
  }
  let history = add_to_history(bus.history, event, bus.max_history_size);
  return new EventBus(
    bus.handlers,
    bus.subscriptions,
    history,
    bus.max_history_size,
  );
}
