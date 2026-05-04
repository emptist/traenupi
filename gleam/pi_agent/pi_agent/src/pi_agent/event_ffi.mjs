import { EventEmitter } from 'events'

export function newEmitter() {
  return new EventEmitter()
}

export function on(emitter, handler) {
  emitter.on('agent-event', handler)
  return emitter
}

export function emit(emitter, event) {
  emitter.emit('agent-event', event)
  return emitter
}

export function removeListener(emitter, handler) {
  emitter.removeListener('agent-event', handler)
  return emitter
}

export function removeAllListeners(emitter) {
  emitter.removeAllListeners('agent-event')
  return emitter
}
