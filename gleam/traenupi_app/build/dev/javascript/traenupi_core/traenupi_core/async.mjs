/// <reference types="./async.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import { Ok, Error, CustomType as $CustomType } from "../gleam.mjs";

export class Promise extends $CustomType {
  constructor(state) {
    super();
    this.state = state;
  }
}
export const Promise$Promise = (state) => new Promise(state);
export const Promise$isPromise = (value) => value instanceof Promise;
export const Promise$Promise$state = (value) => value.state;
export const Promise$Promise$0 = (value) => value.state;

export class Pending extends $CustomType {}
export const PromiseState$Pending = () => new Pending();
export const PromiseState$isPending = (value) => value instanceof Pending;

export class Fulfilled extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const PromiseState$Fulfilled = (value) => new Fulfilled(value);
export const PromiseState$isFulfilled = (value) => value instanceof Fulfilled;
export const PromiseState$Fulfilled$value = (value) => value.value;
export const PromiseState$Fulfilled$0 = (value) => value.value;

export class Rejected extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const PromiseState$Rejected = (error) => new Rejected(error);
export const PromiseState$isRejected = (value) => value instanceof Rejected;
export const PromiseState$Rejected$error = (value) => value.error;
export const PromiseState$Rejected$0 = (value) => value.error;

export class Task extends $CustomType {
  constructor(run) {
    super();
    this.run = run;
  }
}
export const Task$Task = (run) => new Task(run);
export const Task$isTask = (value) => value instanceof Task;
export const Task$Task$run = (value) => value.run;
export const Task$Task$0 = (value) => value.run;

export function pending() {
  return new Promise(new Pending());
}

export function fulfilled(value) {
  return new Promise(new Fulfilled(value));
}

export function rejected(error) {
  return new Promise(new Rejected(error));
}

export function is_pending(promise) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return true;
  } else {
    return false;
  }
}

export function is_fulfilled(promise) {
  let $ = promise.state;
  if ($ instanceof Fulfilled) {
    return true;
  } else {
    return false;
  }
}

export function is_rejected(promise) {
  let $ = promise.state;
  if ($ instanceof Rejected) {
    return true;
  } else {
    return false;
  }
}

export function is_settled(promise) {
  return is_fulfilled(promise) || is_rejected(promise);
}

export function map(promise, f) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return new Promise(new Pending());
  } else if ($ instanceof Fulfilled) {
    let v = $.value;
    return new Promise(new Fulfilled(f(v)));
  } else {
    let e = $.error;
    return new Promise(new Rejected(e));
  }
}

export function map_error(promise, f) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return new Promise(new Pending());
  } else if ($ instanceof Fulfilled) {
    let v = $.value;
    return new Promise(new Fulfilled(v));
  } else {
    let e = $.error;
    return new Promise(new Rejected(f(e)));
  }
}

export function then$(promise, f) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return new Promise(new Pending());
  } else if ($ instanceof Fulfilled) {
    let v = $.value;
    return f(v);
  } else {
    let e = $.error;
    return new Promise(new Rejected(e));
  }
}

export function recover(promise, f) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return new Promise(new Pending());
  } else if ($ instanceof Fulfilled) {
    let v = $.value;
    return new Promise(new Fulfilled(v));
  } else {
    let e = $.error;
    return f(e);
  }
}

export function get(promise) {
  let $ = promise.state;
  if ($ instanceof Fulfilled) {
    let v = $.value;
    return new Some(v);
  } else {
    return new None();
  }
}

export function get_error(promise) {
  let $ = promise.state;
  if ($ instanceof Rejected) {
    let e = $.error;
    return new Some(e);
  } else {
    return new None();
  }
}

export function get_or_default(promise, default$) {
  let $ = promise.state;
  if ($ instanceof Fulfilled) {
    let v = $.value;
    return v;
  } else {
    return default$;
  }
}

export function all(promises) {
  let _block;
  let _pipe = promises;
  _block = $list.filter_map(
    _pipe,
    (p) => {
      let $ = p.state;
      if ($ instanceof Fulfilled) {
        let v = $.value;
        return new Ok(v);
      } else {
        return new Error(undefined);
      }
    },
  );
  let fulfilled_values = _block;
  let $ = $list.length(fulfilled_values) === $list.length(promises);
  if ($) {
    return new Promise(new Fulfilled(fulfilled_values));
  } else {
    let _block$1;
    let _pipe$1 = promises;
    _block$1 = $list.find_map(
      _pipe$1,
      (p) => {
        let $1 = p.state;
        if ($1 instanceof Rejected) {
          let e = $1.error;
          return new Ok(e);
        } else {
          return new Error(undefined);
        }
      },
    );
    let first_error = _block$1;
    if (first_error instanceof Ok) {
      let e = first_error[0];
      return new Promise(new Rejected(e));
    } else {
      return new Promise(new Pending());
    }
  }
}

export function race(promises) {
  let _block;
  let _pipe = promises;
  _block = $list.find_map(
    _pipe,
    (p) => {
      let $ = p.state;
      if ($ instanceof Fulfilled) {
        let v = $.value;
        return new Ok(new Promise(new Fulfilled(v)));
      } else {
        return new Error(undefined);
      }
    },
  );
  let first_fulfilled = _block;
  if (first_fulfilled instanceof Ok) {
    let p = first_fulfilled[0];
    return p;
  } else {
    let _block$1;
    let _pipe$1 = promises;
    _block$1 = $list.find_map(
      _pipe$1,
      (p) => {
        let $ = p.state;
        if ($ instanceof Rejected) {
          let e = $.error;
          return new Ok(new Promise(new Rejected(e)));
        } else {
          return new Error(undefined);
        }
      },
    );
    let first_rejected = _block$1;
    if (first_rejected instanceof Ok) {
      let p = first_rejected[0];
      return p;
    } else {
      return new Promise(new Pending());
    }
  }
}

export function resolve(value) {
  return fulfilled(value);
}

export function reject(error) {
  return rejected(error);
}

export function from_result(result) {
  if (result instanceof Ok) {
    let v = result[0];
    return fulfilled(v);
  } else {
    let e = result[0];
    return rejected(e);
  }
}

export function to_result(promise) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return new Error("Promise is still pending");
  } else if ($ instanceof Fulfilled) {
    let v = $.value;
    return new Ok(v);
  } else {
    let e = $.error;
    return new Error(e);
  }
}

export function state_to_string(promise) {
  let $ = promise.state;
  if ($ instanceof Pending) {
    return "pending";
  } else if ($ instanceof Fulfilled) {
    return "fulfilled";
  } else {
    return "rejected";
  }
}

export function task(run) {
  return new Task(run);
}

export function run_task(t) {
  return t.run();
}

export function map_task(t, f) {
  return new Task(() => { return map(run_task(t), f); });
}

export function then_task(t, f) {
  return new Task(
    () => {
      let promise = run_task(t);
      return then$(promise, (v) => { return run_task(f(v)); });
    },
  );
}

export function sequence(tasks) {
  return new Task(
    () => {
      let promises = $list.map(tasks, (t) => { return run_task(t); });
      return all(promises);
    },
  );
}
