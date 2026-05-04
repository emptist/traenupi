import gleeunit
import pi_agent/event
import pi_agent/types.{AgentStart, AgentEnd, TurnStart}

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn event_new_emitter_test() {
  let _emitter = event.new_emitter()
  Nil
}

pub fn event_emit_test() {
  let emitter = event.new_emitter()
  let handler = fn(_event) { Nil }
  let _ = event.on(emitter, handler)
  let _ = event.emit(emitter, AgentStart)
  Nil
}

pub fn event_multiple_handlers_test() {
  let emitter = event.new_emitter()
  let handler1 = fn(_event) { Nil }
  let handler2 = fn(_event) { Nil }
  let _ = event.on(emitter, handler1)
  let _ = event.on(emitter, handler2)
  let _ = event.emit(emitter, AgentStart)
  Nil
}

pub fn event_remove_listener_test() {
  let emitter = event.new_emitter()
  let handler = fn(_event) { Nil }
  let _ = event.on(emitter, handler)
  let _ = event.emit(emitter, AgentStart)
  let _ = event.remove_listener(emitter, handler)
  let _ = event.emit(emitter, AgentStart)
  Nil
}

pub fn event_remove_all_listeners_test() {
  let emitter = event.new_emitter()
  let handler = fn(_event) { Nil }
  let _ = event.on(emitter, handler)
  let _ = event.emit(emitter, AgentStart)
  let _ = event.remove_all_listeners(emitter)
  let _ = event.emit(emitter, AgentStart)
  Nil
}

pub fn event_emit_different_event_types_test() {
  let emitter = event.new_emitter()
  let handler = fn(_event) { Nil }
  let _ = event.on(emitter, handler)
  let _ = event.emit(emitter, AgentStart)
  let _ = event.emit(emitter, TurnStart)
  let _ = event.emit(emitter, AgentEnd([]))
  Nil
}
