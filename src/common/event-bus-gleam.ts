import {
  new_bus,
  subscribe,
  unsubscribe,
  publish,
  get_history,
  get_subscriptions,
  get_subscription_count,
  clear,
  clear_history,
  event_type_to_string,
  event_type_from_string,
  event_to_json,
  GleamEvent,
  type EventBus$,
  type Event$,
  type EventType$,
  listToArray,
  None,
} from "./gleam-bridge.js";

export type EventType = 
  | "task:started"
  | "task:completed"
  | "task:failed"
  | "task:retry"
  | "scheduler:heartbeat"
  | "scheduler:paused"
  | "scheduler:resumed"
  | "agent:registered"
  | "agent:unregistered"
  | "agent:error"
  | "system:started"
  | "system:stopped"
  | "system:health:check"
  | string;

export interface Event {
  id: string;
  type: EventType;
  data: string;
  timestamp: number;
}

export interface Subscription {
  id: string;
  eventType: EventType;
  createdAt: number;
}

export type EventHandler = (data: string) => void;

let eventBus: EventBus$ = new_bus();
const handlerMap: Map<string, EventHandler> = new Map();

export function subscribeToEvent(eventType: EventType, handler: EventHandler): string {
  const gleamEventType = event_type_from_string(eventType);
  const [newBus, subscriptionId] = subscribe(eventBus, gleamEventType, (data: string) => {
    const h = handlerMap.get(subscriptionId);
    if (h) {
      h(data);
    }
    return undefined;
  });
  
  eventBus = newBus;
  handlerMap.set(subscriptionId, handler);
  
  return subscriptionId;
}

export function unsubscribeFromEvent(subscriptionId: string): boolean {
  const handler = handlerMap.get(subscriptionId);
  if (!handler) {
    return false;
  }
  
  eventBus = unsubscribe(eventBus, subscriptionId);
  handlerMap.delete(subscriptionId);
  
  return true;
}

export function publishEvent(eventType: EventType, data: string): void {
  const gleamEventType = event_type_from_string(eventType);
  eventBus = publish(eventBus, gleamEventType, data);
}

export function getEventHistory(eventType?: EventType, limit: number = 50): Event[] {
  const gleamEventType = eventType ? event_type_from_string(eventType) : new None();
  const events = listToArray(get_history(eventBus, gleamEventType, limit));
  
  return events.map(e => ({
    id: e.id,
    type: event_type_to_string(e.event_type) as EventType,
    data: e.data,
    timestamp: e.timestamp,
  }));
}

export function getActiveSubscriptions(): Subscription[] {
  const subscriptions = listToArray(get_subscriptions(eventBus));
  
  return subscriptions.map(s => ({
    id: s.id,
    eventType: event_type_to_string(s.event_type) as EventType,
    createdAt: s.created_at,
  }));
}

export function getSubscriptionCount(): number {
  return get_subscription_count(eventBus);
}

export function clearAllSubscriptions(): void {
  eventBus = clear(eventBus);
  handlerMap.clear();
}

export function clearEventHistory(): void {
  eventBus = clear_history(eventBus);
}

export function eventToJson(event: Event): string {
  const gleamEvent = new GleamEvent(
    event.id,
    event_type_from_string(event.type),
    event.data,
    event.timestamp
  );
  
  return event_to_json(gleamEvent);
}

export const NEZHA_EVENTS = {
  TASK_STARTED: "task:started" as EventType,
  TASK_COMPLETED: "task:completed" as EventType,
  TASK_FAILED: "task:failed" as EventType,
  TASK_RETRY: "task:retry" as EventType,
  SCHEDULER_HEARTBEAT: "scheduler:heartbeat" as EventType,
  SCHEDULER_PAUSED: "scheduler:paused" as EventType,
  SCHEDULER_RESUMED: "scheduler:resumed" as EventType,
  AGENT_REGISTERED: "agent:registered" as EventType,
  AGENT_UNREGISTERED: "agent:unregistered" as EventType,
  AGENT_ERROR: "agent:error" as EventType,
  SYSTEM_STARTED: "system:started" as EventType,
  SYSTEM_STOPPED: "system:stopped" as EventType,
  HEALTH_CHECK: "system:health:check" as EventType,
};

export function createEventBus(): EventBus {
  return new EventBus();
}

export class EventBus {
  private bus: EventBus$;
  private handlers: Map<string, EventHandler>;
  
  constructor() {
    this.bus = new_bus();
    this.handlers = new Map();
  }
  
  subscribe(eventType: EventType, handler: EventHandler): string {
    const gleamEventType = event_type_from_string(eventType);
    const [newBus, subscriptionId] = subscribe(this.bus, gleamEventType, (data: string) => {
      const h = this.handlers.get(subscriptionId);
      if (h) {
        h(data);
      }
      return undefined;
    });
    
    this.bus = newBus;
    this.handlers.set(subscriptionId, handler);
    
    return subscriptionId;
  }
  
  unsubscribe(subscriptionId: string): boolean {
    const handler = this.handlers.get(subscriptionId);
    if (!handler) {
      return false;
    }
    
    this.bus = unsubscribe(this.bus, subscriptionId);
    this.handlers.delete(subscriptionId);
    
    return true;
  }
  
  publish(eventType: EventType, data: string): void {
    const gleamEventType = event_type_from_string(eventType);
    this.bus = publish(this.bus, gleamEventType, data);
  }
  
  getHistory(eventType?: EventType, limit: number = 50): Event[] {
    const gleamEventType = eventType ? event_type_from_string(eventType) : new None();
    const events = listToArray(get_history(this.bus, gleamEventType, limit));
    
    return events.map(e => ({
      id: e.id,
      type: event_type_to_string(e.event_type) as EventType,
      data: e.data,
      timestamp: e.timestamp,
    }));
  }
  
  getSubscriptions(): Subscription[] {
    const subscriptions = listToArray(get_subscriptions(this.bus));
    
    return subscriptions.map(s => ({
      id: s.id,
      eventType: event_type_to_string(s.event_type) as EventType,
      createdAt: s.created_at,
    }));
  }
  
  getSubscriptionCount(): number {
    return get_subscription_count(this.bus);
  }
  
  clear(): void {
    this.bus = clear(this.bus);
    this.handlers.clear();
  }
  
  clearHistory(): void {
    this.bus = clear_history(this.bus);
  }
}
