import gleam/list
import gleam/option.{type Option, None, Some}

pub type Queue(a) {
  Queue(in: List(a), out: List(a))
}

pub fn new_queue() -> Queue(a) {
  Queue(in: [], out: [])
}

pub fn queue_from_list(lst: List(a)) -> Queue(a) {
  Queue(in: [], out: lst)
}

pub fn queue_to_list(queue: Queue(a)) -> List(a) {
  list.append(queue.out, list.reverse(queue.in))
}

pub fn enqueue(queue: Queue(a), item: a) -> Queue(a) {
  Queue(in: [item, ..queue.in], out: queue.out)
}

pub fn dequeue(queue: Queue(a)) -> #(Option(a), Queue(a)) {
  case queue {
    Queue(in: [], out: []) -> #(None, queue)
    Queue(in: in, out: [first, ..rest]) -> #(Some(first), Queue(in: in, out: rest))
    Queue(in: in, out: []) -> {
      let reversed = list.reverse(in)
      case reversed {
        [] -> #(None, Queue(in: [], out: []))
        [first, ..rest] -> #(Some(first), Queue(in: [], out: rest))
      }
    }
  }
}

pub fn queue_peek(queue: Queue(a)) -> Option(a) {
  case queue {
    Queue(in: [], out: []) -> None
    Queue(in: _, out: [first, .._]) -> Some(first)
    Queue(in: in, out: []) -> {
      case list.reverse(in) {
        [] -> None
        [first, .._] -> Some(first)
      }
    }
  }
}

pub fn queue_length(queue: Queue(a)) -> Int {
  list.length(queue.in) + list.length(queue.out)
}

pub fn queue_is_empty(queue: Queue(a)) -> Bool {
  queue.in == [] && queue.out == []
}

pub fn queue_map(queue: Queue(a), f: fn(a) -> b) -> Queue(b) {
  Queue(in: list.map(queue.in, f), out: list.map(queue.out, f))
}

pub fn queue_filter(queue: Queue(a), predicate: fn(a) -> Bool) -> Queue(a) {
  Queue(in: list.filter(queue.in, predicate), out: list.filter(queue.out, predicate))
}

pub fn queue_fold(queue: Queue(a), acc: b, f: fn(a, b) -> b) -> b {
  let acc = list.fold(queue.out, acc, fn(acc, item) { f(item, acc) })
  list.fold(list.reverse(queue.in), acc, fn(acc, item) { f(item, acc) })
}

pub type Stack(a) {
  Stack(items: List(a))
}

pub fn new_stack() -> Stack(a) {
  Stack(items: [])
}

pub fn stack_from_list(lst: List(a)) -> Stack(a) {
  Stack(items: lst)
}

pub fn stack_to_list(stack: Stack(a)) -> List(a) {
  stack.items
}

pub fn push(stack: Stack(a), item: a) -> Stack(a) {
  Stack(items: [item, ..stack.items])
}

pub fn pop(stack: Stack(a)) -> #(Option(a), Stack(a)) {
  case stack.items {
    [] -> #(None, stack)
    [first, ..rest] -> #(Some(first), Stack(items: rest))
  }
}

pub fn stack_peek(stack: Stack(a)) -> Option(a) {
  case stack.items {
    [] -> None
    [first, .._] -> Some(first)
  }
}

pub fn stack_length(stack: Stack(a)) -> Int {
  list.length(stack.items)
}

pub fn stack_is_empty(stack: Stack(a)) -> Bool {
  stack.items == []
}

pub fn stack_map(stack: Stack(a), f: fn(a) -> b) -> Stack(b) {
  Stack(items: list.map(stack.items, f))
}

pub fn stack_filter(stack: Stack(a), predicate: fn(a) -> Bool) -> Stack(a) {
  Stack(items: list.filter(stack.items, predicate))
}

pub fn stack_fold(stack: Stack(a), acc: b, f: fn(a, b) -> b) -> b {
  list.fold(stack.items, acc, fn(acc, item) { f(item, acc) })
}

pub fn stack_reverse(stack: Stack(a)) -> Stack(a) {
  Stack(items: list.reverse(stack.items))
}

pub type Deque(a) {
  Deque(front: List(a), back: List(a))
}

pub fn new_deque() -> Deque(a) {
  Deque(front: [], back: [])
}

pub fn deque_from_list(lst: List(a)) -> Deque(a) {
  Deque(front: lst, back: [])
}

pub fn deque_to_list(deque: Deque(a)) -> List(a) {
  list.append(deque.front, list.reverse(deque.back))
}

pub fn push_front(deque: Deque(a), item: a) -> Deque(a) {
  Deque(front: [item, ..deque.front], back: deque.back)
}

pub fn push_back(deque: Deque(a), item: a) -> Deque(a) {
  Deque(front: deque.front, back: [item, ..deque.back])
}

pub fn pop_front(deque: Deque(a)) -> #(Option(a), Deque(a)) {
  case deque {
    Deque(front: [], back: []) -> #(None, deque)
    Deque(front: [first, ..rest], back: back) -> #(Some(first), Deque(front: rest, back: back))
    Deque(front: [], back: back) -> {
      case list.reverse(back) {
        [] -> #(None, Deque(front: [], back: []))
        [first, ..rest] -> #(Some(first), Deque(front: rest, back: []))
      }
    }
  }
}

pub fn pop_back(deque: Deque(a)) -> #(Option(a), Deque(a)) {
  case deque {
    Deque(front: [], back: []) -> #(None, deque)
    Deque(front: front, back: [first, ..rest]) -> #(Some(first), Deque(front: front, back: rest))
    Deque(front: front, back: []) -> {
      case list.reverse(front) {
        [] -> #(None, Deque(front: [], back: []))
        [first, ..rest] -> #(Some(first), Deque(front: [], back: rest))
      }
    }
  }
}

pub fn deque_peek_front(deque: Deque(a)) -> Option(a) {
  case deque {
    Deque(front: [], back: []) -> None
    Deque(front: [first, .._], back: _) -> Some(first)
    Deque(front: [], back: back) -> {
      case list.reverse(back) {
        [] -> None
        [first, .._] -> Some(first)
      }
    }
  }
}

pub fn deque_peek_back(deque: Deque(a)) -> Option(a) {
  case deque {
    Deque(front: [], back: []) -> None
    Deque(front: _, back: [first, .._]) -> Some(first)
    Deque(front: front, back: []) -> {
      case list.reverse(front) {
        [] -> None
        [first, .._] -> Some(first)
      }
    }
  }
}

pub fn deque_length(deque: Deque(a)) -> Int {
  list.length(deque.front) + list.length(deque.back)
}

pub fn deque_is_empty(deque: Deque(a)) -> Bool {
  deque.front == [] && deque.back == []
}

pub fn deque_map(deque: Deque(a), f: fn(a) -> b) -> Deque(b) {
  Deque(front: list.map(deque.front, f), back: list.map(deque.back, f))
}

pub fn deque_filter(deque: Deque(a), predicate: fn(a) -> Bool) -> Deque(a) {
  Deque(front: list.filter(deque.front, predicate), back: list.filter(deque.back, predicate))
}

pub fn deque_fold(deque: Deque(a), acc: b, f: fn(a, b) -> b) -> b {
  let acc = list.fold(deque.front, acc, fn(acc, item) { f(item, acc) })
  list.fold(list.reverse(deque.back), acc, fn(acc, item) { f(item, acc) })
}
