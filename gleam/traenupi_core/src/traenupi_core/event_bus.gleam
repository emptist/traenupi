import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/int
import traenupi_core/time_utils

pub type EventType {
  TaskStarted
  TaskCompleted
  TaskFailed
  TaskRetry
  SchedulerHeartbeat
  SchedulerPaused
  SchedulerResumed
  AgentRegistered
  AgentUnregistered
  AgentError
  SystemStarted
  SystemStopped
  HealthCheck
  CustomEvent(String)
}

pub type Event {
  Event(
    id: String,
    event_type: EventType,
    data: String,
    timestamp: Int,
  )
}

pub type Subscription {
  Subscription(
    id: String,
    event_type: EventType,
    created_at: Int,
  )
}

pub type Handler = fn(String) -> Nil

pub type EventBus {
  EventBus(
    handlers: Dict(String, List(Handler)),
    subscriptions: Dict(String, Subscription),
    history: List(Event),
    max_history_size: Int,
  )
}

pub fn new_bus() -> EventBus {
  EventBus(
    handlers: dict.new(),
    subscriptions: dict.new(),
    history: [],
    max_history_size: 100,
  )
}

pub fn with_max_history(bus: EventBus, size: Int) -> EventBus {
  EventBus(..bus, max_history_size: size)
}

pub fn subscribe(bus: EventBus, event_type: EventType, handler: Handler) -> #(EventBus, String) {
  let event_key = event_type_to_string(event_type)
  let subscription_id = event_key <> "-" <> int.to_string(now()) <> "-" <> int.to_string(int.random(10000))
  
  let current_handlers = case dict.get(bus.handlers, event_key) {
    Ok(handlers) -> handlers
    Error(Nil) -> []
  }
  
  let handlers = dict.insert(bus.handlers, event_key, [handler, ..current_handlers])
  
  let subscription = Subscription(
    id: subscription_id,
    event_type: event_type,
    created_at: now(),
  )
  let subscriptions = dict.insert(bus.subscriptions, subscription_id, subscription)
  
  #(EventBus(..bus, handlers: handlers, subscriptions: subscriptions), subscription_id)
}

pub fn unsubscribe(bus: EventBus, subscription_id: String) -> EventBus {
  case dict.get(bus.subscriptions, subscription_id) {
    Ok(subscription) -> {
      let event_key = event_type_to_string(subscription.event_type)
      let subscriptions = dict.delete(bus.subscriptions, subscription_id)
      
      let handlers = case dict.get(bus.handlers, event_key) {
        Ok(current_handlers) -> {
          let filtered = list.filter(current_handlers, fn(_) { True })
          case list.length(filtered) {
            0 -> dict.delete(bus.handlers, event_key)
            _ -> dict.insert(bus.handlers, event_key, filtered)
          }
        }
        Error(Nil) -> bus.handlers
      }
      
      EventBus(..bus, handlers: handlers, subscriptions: subscriptions)
    }
    Error(Nil) -> bus
  }
}

pub fn publish(bus: EventBus, event_type: EventType, data: String) -> EventBus {
  let event = Event(
    id: generate_id(),
    event_type: event_type,
    data: data,
    timestamp: now(),
  )
  
  let event_key = event_type_to_string(event_type)
  
  case dict.get(bus.handlers, event_key) {
    Ok(handlers) -> {
      list.each(handlers, fn(handler) {
        handler(data)
      })
    }
    Error(Nil) -> Nil
  }
  
  let history = add_to_history(bus.history, event, bus.max_history_size)
  EventBus(..bus, history: history)
}

fn add_to_history(history: List(Event), event: Event, max_size: Int) -> List(Event) {
  let new_history = [event, ..history]
  case list.length(new_history) > max_size {
    True -> list.take(new_history, max_size)
    False -> new_history
  }
}

pub fn get_history(bus: EventBus, event_type: Option(EventType), limit: Int) -> List(Event) {
  case event_type {
    Some(type_) -> {
      let event_key = event_type_to_string(type_)
      bus.history
      |> list.filter(fn(event) { event_type_to_string(event.event_type) == event_key })
      |> list.take(limit)
    }
    None -> list.take(bus.history, limit)
  }
}

pub fn get_subscriptions(bus: EventBus) -> List(Subscription) {
  dict.values(bus.subscriptions)
}

pub fn get_subscription_count(bus: EventBus) -> Int {
  dict.size(bus.subscriptions)
}

pub fn clear(bus: EventBus) -> EventBus {
  EventBus(
    handlers: dict.new(),
    subscriptions: dict.new(),
    history: bus.history,
    max_history_size: bus.max_history_size,
  )
}

pub fn clear_history(bus: EventBus) -> EventBus {
  EventBus(..bus, history: [])
}

pub fn event_type_to_string(type_: EventType) -> String {
  case type_ {
    TaskStarted -> "task:started"
    TaskCompleted -> "task:completed"
    TaskFailed -> "task:failed"
    TaskRetry -> "task:retry"
    SchedulerHeartbeat -> "scheduler:heartbeat"
    SchedulerPaused -> "scheduler:paused"
    SchedulerResumed -> "scheduler:resumed"
    AgentRegistered -> "agent:registered"
    AgentUnregistered -> "agent:unregistered"
    AgentError -> "agent:error"
    SystemStarted -> "system:started"
    SystemStopped -> "system:stopped"
    HealthCheck -> "system:health:check"
    CustomEvent(name) -> name
  }
}

pub fn event_type_from_string(str: String) -> EventType {
  case str {
    "task:started" -> TaskStarted
    "task:completed" -> TaskCompleted
    "task:failed" -> TaskFailed
    "task:retry" -> TaskRetry
    "scheduler:heartbeat" -> SchedulerHeartbeat
    "scheduler:paused" -> SchedulerPaused
    "scheduler:resumed" -> SchedulerResumed
    "agent:registered" -> AgentRegistered
    "agent:unregistered" -> AgentUnregistered
    "agent:error" -> AgentError
    "system:started" -> SystemStarted
    "system:stopped" -> SystemStopped
    "system:health:check" -> HealthCheck
    _ -> CustomEvent(str)
  }
}

pub fn event_to_json(event: Event) -> String {
  "{\"id\":\"" <> event.id <> "\",\"type\":\"" <> event_type_to_string(event.event_type) <> "\",\"timestamp\":" <> int.to_string(event.timestamp) <> "}"
}

fn generate_id() -> String {
  int.to_string(now()) <> "-" <> int.to_string(int.random(10000))
}

fn now() -> Int {
  time_utils.now()
}
