import pi_agent/types

pub type EventEmitter

pub type EventHandler =
  fn(types.AgentEvent) -> Nil

@external(javascript, "./event_ffi.mjs", "newEmitter")
pub fn new_emitter() -> EventEmitter

@external(javascript, "./event_ffi.mjs", "on")
pub fn on(emitter: EventEmitter, handler: EventHandler) -> EventEmitter

@external(javascript, "./event_ffi.mjs", "emit")
pub fn emit(emitter: EventEmitter, event: types.AgentEvent) -> EventEmitter

@external(javascript, "./event_ffi.mjs", "removeListener")
pub fn remove_listener(
  emitter: EventEmitter,
  handler: EventHandler,
) -> EventEmitter

@external(javascript, "./event_ffi.mjs", "removeAllListeners")
pub fn remove_all_listeners(emitter: EventEmitter) -> EventEmitter
