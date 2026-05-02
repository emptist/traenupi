import gleam/list
import gleam/option.{type Option, None, Some}

pub type Promise(a) {
  Promise(
    state: PromiseState(a),
  )
}

pub type PromiseState(a) {
  Pending
  Fulfilled(value: a)
  Rejected(error: String)
}

pub fn pending() -> Promise(a) {
  Promise(state: Pending)
}

pub fn fulfilled(value: a) -> Promise(a) {
  Promise(state: Fulfilled(value: value))
}

pub fn rejected(error: String) -> Promise(a) {
  Promise(state: Rejected(error: error))
}

pub fn is_pending(promise: Promise(a)) -> Bool {
  case promise.state {
    Pending -> True
    _ -> False
  }
}

pub fn is_fulfilled(promise: Promise(a)) -> Bool {
  case promise.state {
    Fulfilled(_) -> True
    _ -> False
  }
}

pub fn is_rejected(promise: Promise(a)) -> Bool {
  case promise.state {
    Rejected(_) -> True
    _ -> False
  }
}

pub fn is_settled(promise: Promise(a)) -> Bool {
  is_fulfilled(promise) || is_rejected(promise)
}

pub fn map(promise: Promise(a), f: fn(a) -> b) -> Promise(b) {
  case promise.state {
    Pending -> Promise(state: Pending)
    Fulfilled(value: v) -> Promise(state: Fulfilled(value: f(v)))
    Rejected(error: e) -> Promise(state: Rejected(error: e))
  }
}

pub fn map_error(promise: Promise(a), f: fn(String) -> String) -> Promise(a) {
  case promise.state {
    Pending -> Promise(state: Pending)
    Fulfilled(value: v) -> Promise(state: Fulfilled(value: v))
    Rejected(error: e) -> Promise(state: Rejected(error: f(e)))
  }
}

pub fn then(promise: Promise(a), f: fn(a) -> Promise(b)) -> Promise(b) {
  case promise.state {
    Pending -> Promise(state: Pending)
    Fulfilled(value: v) -> f(v)
    Rejected(error: e) -> Promise(state: Rejected(error: e))
  }
}

pub fn recover(promise: Promise(a), f: fn(String) -> Promise(a)) -> Promise(a) {
  case promise.state {
    Pending -> Promise(state: Pending)
    Fulfilled(value: v) -> Promise(state: Fulfilled(value: v))
    Rejected(error: e) -> f(e)
  }
}

pub fn get(promise: Promise(a)) -> Option(a) {
  case promise.state {
    Fulfilled(value: v) -> Some(v)
    _ -> None
  }
}

pub fn get_error(promise: Promise(a)) -> Option(String) {
  case promise.state {
    Rejected(error: e) -> Some(e)
    _ -> None
  }
}

pub fn get_or_default(promise: Promise(a), default: a) -> a {
  case promise.state {
    Fulfilled(value: v) -> v
    _ -> default
  }
}

pub fn all(promises: List(Promise(a))) -> Promise(List(a)) {
  let fulfilled_values = 
    promises
    |> list.filter_map(fn(p) {
      case p.state {
        Fulfilled(value: v) -> Ok(v)
        _ -> Error(Nil)
      }
    })
  
  case list.length(fulfilled_values) == list.length(promises) {
    True -> Promise(state: Fulfilled(value: fulfilled_values))
    False -> {
      let first_error = 
        promises
        |> list.find_map(fn(p) {
          case p.state {
            Rejected(error: e) -> Ok(e)
            _ -> Error(Nil)
          }
        })
      
      case first_error {
        Ok(e) -> Promise(state: Rejected(error: e))
        Error(_) -> Promise(state: Pending)
      }
    }
  }
}

pub fn race(promises: List(Promise(a))) -> Promise(a) {
  let first_fulfilled = 
    promises
    |> list.find_map(fn(p) {
      case p.state {
        Fulfilled(value: v) -> Ok(Promise(state: Fulfilled(value: v)))
        _ -> Error(Nil)
      }
    })
  
  case first_fulfilled {
    Ok(p) -> p
    Error(_) -> {
      let first_rejected = 
        promises
        |> list.find_map(fn(p) {
          case p.state {
            Rejected(error: e) -> Ok(Promise(state: Rejected(error: e)))
            _ -> Error(Nil)
          }
        })
      
      case first_rejected {
        Ok(p) -> p
        Error(_) -> Promise(state: Pending)
      }
    }
  }
}

pub fn resolve(value: a) -> Promise(a) {
  fulfilled(value)
}

pub fn reject(error: String) -> Promise(a) {
  rejected(error)
}

pub fn from_result(result: Result(a, String)) -> Promise(a) {
  case result {
    Ok(v) -> fulfilled(v)
    Error(e) -> rejected(e)
  }
}

pub fn to_result(promise: Promise(a)) -> Result(a, String) {
  case promise.state {
    Fulfilled(value: v) -> Ok(v)
    Rejected(error: e) -> Error(e)
    Pending -> Error("Promise is still pending")
  }
}

pub fn state_to_string(promise: Promise(a)) -> String {
  case promise.state {
    Pending -> "pending"
    Fulfilled(_) -> "fulfilled"
    Rejected(_) -> "rejected"
  }
}

pub type Task(a) {
  Task(run: fn() -> Promise(a))
}

pub fn task(run: fn() -> Promise(a)) -> Task(a) {
  Task(run: run)
}

pub fn run_task(t: Task(a)) -> Promise(a) {
  t.run()
}

pub fn map_task(t: Task(a), f: fn(a) -> b) -> Task(b) {
  Task(run: fn() { map(run_task(t), f) })
}

pub fn then_task(t: Task(a), f: fn(a) -> Task(b)) -> Task(b) {
  Task(run: fn() {
    let promise = run_task(t)
    then(promise, fn(v) { run_task(f(v)) })
  })
}

pub fn sequence(tasks: List(Task(a))) -> Task(List(a)) {
  Task(run: fn() {
    let promises = list.map(tasks, fn(t) { run_task(t) })
    all(promises)
  })
}
