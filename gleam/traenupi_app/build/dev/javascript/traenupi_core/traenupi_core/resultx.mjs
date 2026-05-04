/// <reference types="./resultx.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import { Ok, Error, isEqual } from "../gleam.mjs";

export function option_to_result(opt, err) {
  if (opt instanceof Some) {
    let v = opt[0];
    return new Ok(v);
  } else {
    return new Error(err);
  }
}

export function result_to_option(res) {
  if (res instanceof Ok) {
    let v = res[0];
    return new Some(v);
  } else {
    return new None();
  }
}

export function is_ok(res) {
  if (res instanceof Ok) {
    return true;
  } else {
    return false;
  }
}

export function is_error(res) {
  if (res instanceof Ok) {
    return false;
  } else {
    return true;
  }
}

export function is_some(opt) {
  if (opt instanceof Some) {
    return true;
  } else {
    return false;
  }
}

export function is_none(opt) {
  if (opt instanceof Some) {
    return false;
  } else {
    return true;
  }
}

export function get_or_else(opt, default$) {
  if (opt instanceof Some) {
    let v = opt[0];
    return v;
  } else {
    return default$();
  }
}

export function get_or_default(opt, default$) {
  if (opt instanceof Some) {
    let v = opt[0];
    return v;
  } else {
    return default$;
  }
}

export function unwrap_or_else(res, or_else) {
  if (res instanceof Ok) {
    let v = res[0];
    return v;
  } else {
    let e = res[0];
    return or_else(e);
  }
}

export function unwrap_or_default(res, default$) {
  if (res instanceof Ok) {
    let v = res[0];
    return v;
  } else {
    return default$;
  }
}

export function map_both(res, on_ok, on_error) {
  if (res instanceof Ok) {
    let v = res[0];
    return new Ok(on_ok(v));
  } else {
    let e = res[0];
    return new Error(on_error(e));
  }
}

export function map_option(opt, f) {
  if (opt instanceof Some) {
    let v = opt[0];
    return new Some(f(v));
  } else {
    return opt;
  }
}

export function filter_option(opt, predicate) {
  if (opt instanceof Some) {
    let v = opt[0];
    let $ = predicate(v);
    if ($) {
      return new Some(v);
    } else {
      return new None();
    }
  } else {
    return opt;
  }
}

export function filter_result(res, predicate, err) {
  if (res instanceof Ok) {
    let v = res[0];
    let $ = predicate(v);
    if ($) {
      return new Ok(v);
    } else {
      return new Error(err);
    }
  } else {
    return res;
  }
}

export function flatten_option(opt) {
  if (opt instanceof Some) {
    let inner = opt[0];
    return inner;
  } else {
    return opt;
  }
}

export function flatten_result(res) {
  if (res instanceof Ok) {
    let inner = res[0];
    return inner;
  } else {
    return res;
  }
}

export function partition_results(results) {
  let _block;
  let _pipe = results;
  _block = $list.filter_map(
    _pipe,
    (r) => {
      if (r instanceof Ok) {
        return r;
      } else {
        return new Error(undefined);
      }
    },
  );
  let oks = _block;
  let _block$1;
  let _pipe$1 = results;
  _block$1 = $list.filter_map(
    _pipe$1,
    (r) => {
      if (r instanceof Ok) {
        return new Error(undefined);
      } else {
        let e = r[0];
        return new Ok(e);
      }
    },
  );
  let errs = _block$1;
  return [oks, errs];
}

export function partition_options(opts) {
  let _block;
  let _pipe = opts;
  _block = $list.filter_map(
    _pipe,
    (opt) => {
      if (opt instanceof Some) {
        let v = opt[0];
        return new Ok(v);
      } else {
        return new Error(undefined);
      }
    },
  );
  let values = _block;
  let none_count = $list.length(opts) - $list.length(values);
  return [values, none_count];
}

export function first_ok(results) {
  let _pipe = results;
  let _pipe$1 = $list.find_map(
    _pipe,
    (r) => {
      if (r instanceof Ok) {
        return r;
      } else {
        return new Error(undefined);
      }
    },
  );
  return result_to_option(_pipe$1);
}

export function first_some(opts) {
  let _pipe = opts;
  let _pipe$1 = $list.find_map(
    _pipe,
    (opt) => {
      if (opt instanceof Some) {
        let v = opt[0];
        return new Ok(v);
      } else {
        return new Error(undefined);
      }
    },
  );
  return result_to_option(_pipe$1);
}

export function all_ok(results) {
  let _pipe = results;
  return $list.try_map(_pipe, (r) => { return r; });
}

export function all_some(opts) {
  let _block;
  let _pipe = opts;
  _block = $list.filter_map(
    _pipe,
    (opt) => {
      if (opt instanceof Some) {
        let v = opt[0];
        return new Ok(v);
      } else {
        return new Error(undefined);
      }
    },
  );
  let values = _block;
  let $ = $list.length(values) === $list.length(opts);
  if ($) {
    return new Some(values);
  } else {
    return new None();
  }
}

export function or_else(opt, alternative) {
  if (opt instanceof Some) {
    return opt;
  } else {
    return alternative();
  }
}

export function or_else_result(res, alternative) {
  if (res instanceof Ok) {
    return res;
  } else {
    return alternative();
  }
}

export function and_then(opt, then_fn) {
  if (opt instanceof Some) {
    let v = opt[0];
    return then_fn(v);
  } else {
    return opt;
  }
}

export function zip(opt1, opt2) {
  if (opt1 instanceof Some && opt2 instanceof Some) {
    let v1 = opt1[0];
    let v2 = opt2[0];
    return new Some([v1, v2]);
  } else {
    return new None();
  }
}

export function zip_result(res1, res2) {
  if (res1 instanceof Ok) {
    if (res2 instanceof Ok) {
      let v1 = res1[0];
      let v2 = res2[0];
      return new Ok([v1, v2]);
    } else {
      return res2;
    }
  } else {
    return res1;
  }
}

export function contains(opt, value) {
  if (opt instanceof Some) {
    let v = opt[0];
    return isEqual(v, value);
  } else {
    return false;
  }
}

export function contains_ok(res, value) {
  if (res instanceof Ok) {
    let v = res[0];
    return isEqual(v, value);
  } else {
    return false;
  }
}

export function contains_error(res, err) {
  if (res instanceof Ok) {
    return false;
  } else {
    let e = res[0];
    return isEqual(e, err);
  }
}

export function ok(res) {
  return result_to_option(res);
}

export function err(res) {
  if (res instanceof Ok) {
    return new None();
  } else {
    let e = res[0];
    return new Some(e);
  }
}

export function transpose_option_result(opt) {
  if (opt instanceof Some) {
    let $ = opt[0];
    if ($ instanceof Ok) {
      let v = $[0];
      return new Ok(new Some(v));
    } else {
      let e = $[0];
      return new Error(e);
    }
  } else {
    return new Ok(new None());
  }
}

export function transpose_result_option(res) {
  if (res instanceof Ok) {
    let $ = res[0];
    if ($ instanceof Some) {
      let v = $[0];
      return new Some(new Ok(v));
    } else {
      return new None();
    }
  } else {
    let e = res[0];
    return new Some(new Error(e));
  }
}

export function fold_ok(res, default$, f) {
  if (res instanceof Ok) {
    let v = res[0];
    return f(v, default$);
  } else {
    return default$;
  }
}

export function fold_option(opt, default$, f) {
  if (opt instanceof Some) {
    let v = opt[0];
    return f(v, default$);
  } else {
    return default$;
  }
}
