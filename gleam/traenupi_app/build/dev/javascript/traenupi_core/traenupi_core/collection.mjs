/// <reference types="./collection.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import {
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
  isEqual,
} from "../gleam.mjs";

export class Queue extends $CustomType {
  constructor(in$, out) {
    super();
    this.in = in$;
    this.out = out;
  }
}
export const Queue$Queue = (in$, out) => new Queue(in$, out);
export const Queue$isQueue = (value) => value instanceof Queue;
export const Queue$Queue$in = (value) => value.in;
export const Queue$Queue$0 = (value) => value.in;
export const Queue$Queue$out = (value) => value.out;
export const Queue$Queue$1 = (value) => value.out;

export class Stack extends $CustomType {
  constructor(items) {
    super();
    this.items = items;
  }
}
export const Stack$Stack = (items) => new Stack(items);
export const Stack$isStack = (value) => value instanceof Stack;
export const Stack$Stack$items = (value) => value.items;
export const Stack$Stack$0 = (value) => value.items;

export class Deque extends $CustomType {
  constructor(front, back) {
    super();
    this.front = front;
    this.back = back;
  }
}
export const Deque$Deque = (front, back) => new Deque(front, back);
export const Deque$isDeque = (value) => value instanceof Deque;
export const Deque$Deque$front = (value) => value.front;
export const Deque$Deque$0 = (value) => value.front;
export const Deque$Deque$back = (value) => value.back;
export const Deque$Deque$1 = (value) => value.back;

export function new_queue() {
  return new Queue(toList([]), toList([]));
}

export function queue_from_list(lst) {
  return new Queue(toList([]), lst);
}

export function queue_to_list(queue) {
  return $list.append(queue.out, $list.reverse(queue.in));
}

export function enqueue(queue, item) {
  return new Queue(listPrepend(item, queue.in), queue.out);
}

export function dequeue(queue) {
  let $ = queue.out;
  if ($ instanceof $Empty) {
    let $1 = queue.in;
    if ($1 instanceof $Empty) {
      return [new None(), queue];
    } else {
      let in$ = $1;
      let reversed = $list.reverse(in$);
      if (reversed instanceof $Empty) {
        return [new None(), new Queue(toList([]), toList([]))];
      } else {
        let first = reversed.head;
        let rest = reversed.tail;
        return [new Some(first), new Queue(toList([]), rest)];
      }
    }
  } else {
    let in$ = queue.in;
    let first = $.head;
    let rest = $.tail;
    return [new Some(first), new Queue(in$, rest)];
  }
}

export function queue_peek(queue) {
  let $ = queue.out;
  if ($ instanceof $Empty) {
    let $1 = queue.in;
    if ($1 instanceof $Empty) {
      return new None();
    } else {
      let in$ = $1;
      let $2 = $list.reverse(in$);
      if ($2 instanceof $Empty) {
        return new None();
      } else {
        let first = $2.head;
        return new Some(first);
      }
    }
  } else {
    let first = $.head;
    return new Some(first);
  }
}

export function queue_length(queue) {
  return $list.length(queue.in) + $list.length(queue.out);
}

export function queue_is_empty(queue) {
  return (isEqual(queue.in, toList([]))) && (isEqual(queue.out, toList([])));
}

export function queue_map(queue, f) {
  return new Queue($list.map(queue.in, f), $list.map(queue.out, f));
}

export function queue_filter(queue, predicate) {
  return new Queue(
    $list.filter(queue.in, predicate),
    $list.filter(queue.out, predicate),
  );
}

export function queue_fold(queue, acc, f) {
  let acc$1 = $list.fold(
    queue.out,
    acc,
    (acc, item) => { return f(item, acc); },
  );
  return $list.fold(
    $list.reverse(queue.in),
    acc$1,
    (acc, item) => { return f(item, acc); },
  );
}

export function new_stack() {
  return new Stack(toList([]));
}

export function stack_from_list(lst) {
  return new Stack(lst);
}

export function stack_to_list(stack) {
  return stack.items;
}

export function push(stack, item) {
  return new Stack(listPrepend(item, stack.items));
}

export function pop(stack) {
  let $ = stack.items;
  if ($ instanceof $Empty) {
    return [new None(), stack];
  } else {
    let first = $.head;
    let rest = $.tail;
    return [new Some(first), new Stack(rest)];
  }
}

export function stack_peek(stack) {
  let $ = stack.items;
  if ($ instanceof $Empty) {
    return new None();
  } else {
    let first = $.head;
    return new Some(first);
  }
}

export function stack_length(stack) {
  return $list.length(stack.items);
}

export function stack_is_empty(stack) {
  return isEqual(stack.items, toList([]));
}

export function stack_map(stack, f) {
  return new Stack($list.map(stack.items, f));
}

export function stack_filter(stack, predicate) {
  return new Stack($list.filter(stack.items, predicate));
}

export function stack_fold(stack, acc, f) {
  return $list.fold(stack.items, acc, (acc, item) => { return f(item, acc); });
}

export function stack_reverse(stack) {
  return new Stack($list.reverse(stack.items));
}

export function new_deque() {
  return new Deque(toList([]), toList([]));
}

export function deque_from_list(lst) {
  return new Deque(lst, toList([]));
}

export function deque_to_list(deque) {
  return $list.append(deque.front, $list.reverse(deque.back));
}

export function push_front(deque, item) {
  return new Deque(listPrepend(item, deque.front), deque.back);
}

export function push_back(deque, item) {
  return new Deque(deque.front, listPrepend(item, deque.back));
}

export function pop_front(deque) {
  let $ = deque.front;
  if ($ instanceof $Empty) {
    let $1 = deque.back;
    if ($1 instanceof $Empty) {
      return [new None(), deque];
    } else {
      let back = $1;
      let $2 = $list.reverse(back);
      if ($2 instanceof $Empty) {
        return [new None(), new Deque(toList([]), toList([]))];
      } else {
        let first = $2.head;
        let rest = $2.tail;
        return [new Some(first), new Deque(rest, toList([]))];
      }
    }
  } else {
    let back = deque.back;
    let first = $.head;
    let rest = $.tail;
    return [new Some(first), new Deque(rest, back)];
  }
}

export function pop_back(deque) {
  let $ = deque.back;
  if ($ instanceof $Empty) {
    let $1 = deque.front;
    if ($1 instanceof $Empty) {
      return [new None(), deque];
    } else {
      let front = $1;
      let $2 = $list.reverse(front);
      if ($2 instanceof $Empty) {
        return [new None(), new Deque(toList([]), toList([]))];
      } else {
        let first = $2.head;
        let rest = $2.tail;
        return [new Some(first), new Deque(toList([]), rest)];
      }
    }
  } else {
    let front = deque.front;
    let first = $.head;
    let rest = $.tail;
    return [new Some(first), new Deque(front, rest)];
  }
}

export function deque_peek_front(deque) {
  let $ = deque.front;
  if ($ instanceof $Empty) {
    let $1 = deque.back;
    if ($1 instanceof $Empty) {
      return new None();
    } else {
      let back = $1;
      let $2 = $list.reverse(back);
      if ($2 instanceof $Empty) {
        return new None();
      } else {
        let first = $2.head;
        return new Some(first);
      }
    }
  } else {
    let first = $.head;
    return new Some(first);
  }
}

export function deque_peek_back(deque) {
  let $ = deque.back;
  if ($ instanceof $Empty) {
    let $1 = deque.front;
    if ($1 instanceof $Empty) {
      return new None();
    } else {
      let front = $1;
      let $2 = $list.reverse(front);
      if ($2 instanceof $Empty) {
        return new None();
      } else {
        let first = $2.head;
        return new Some(first);
      }
    }
  } else {
    let first = $.head;
    return new Some(first);
  }
}

export function deque_length(deque) {
  return $list.length(deque.front) + $list.length(deque.back);
}

export function deque_is_empty(deque) {
  return (isEqual(deque.front, toList([]))) && (isEqual(deque.back, toList([])));
}

export function deque_map(deque, f) {
  return new Deque($list.map(deque.front, f), $list.map(deque.back, f));
}

export function deque_filter(deque, predicate) {
  return new Deque(
    $list.filter(deque.front, predicate),
    $list.filter(deque.back, predicate),
  );
}

export function deque_fold(deque, acc, f) {
  let acc$1 = $list.fold(
    deque.front,
    acc,
    (acc, item) => { return f(item, acc); },
  );
  return $list.fold(
    $list.reverse(deque.back),
    acc$1,
    (acc, item) => { return f(item, acc); },
  );
}
