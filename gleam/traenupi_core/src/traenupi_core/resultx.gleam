import gleam/option.{type Option, None, Some}
import gleam/list

pub fn option_to_result(opt: Option(a), err: e) -> Result(a, e) {
  case opt {
    Some(v) -> Ok(v)
    None -> Error(err)
  }
}

pub fn result_to_option(res: Result(a, e)) -> Option(a) {
  case res {
    Ok(v) -> Some(v)
    Error(_) -> None
  }
}

pub fn is_ok(res: Result(a, e)) -> Bool {
  case res {
    Ok(_) -> True
    Error(_) -> False
  }
}

pub fn is_error(res: Result(a, e)) -> Bool {
  case res {
    Ok(_) -> False
    Error(_) -> True
  }
}

pub fn is_some(opt: Option(a)) -> Bool {
  case opt {
    Some(_) -> True
    None -> False
  }
}

pub fn is_none(opt: Option(a)) -> Bool {
  case opt {
    Some(_) -> False
    None -> True
  }
}

pub fn get_or_else(opt: Option(a), default: fn() -> a) -> a {
  case opt {
    Some(v) -> v
    None -> default()
  }
}

pub fn get_or_default(opt: Option(a), default: a) -> a {
  case opt {
    Some(v) -> v
    None -> default
  }
}

pub fn unwrap_or_else(res: Result(a, e), or_else: fn(e) -> a) -> a {
  case res {
    Ok(v) -> v
    Error(e) -> or_else(e)
  }
}

pub fn unwrap_or_default(res: Result(a, e), default: a) -> a {
  case res {
    Ok(v) -> v
    Error(_) -> default
  }
}

pub fn map_both(
  res: Result(a, e),
  on_ok: fn(a) -> b,
  on_error: fn(e) -> f,
) -> Result(b, f) {
  case res {
    Ok(v) -> Ok(on_ok(v))
    Error(e) -> Error(on_error(e))
  }
}

pub fn map_option(opt: Option(a), f: fn(a) -> b) -> Option(b) {
  case opt {
    Some(v) -> Some(f(v))
    None -> None
  }
}

pub fn filter_option(opt: Option(a), predicate: fn(a) -> Bool) -> Option(a) {
  case opt {
    Some(v) -> {
      case predicate(v) {
        True -> Some(v)
        False -> None
      }
    }
    None -> None
  }
}

pub fn filter_result(res: Result(a, e), predicate: fn(a) -> Bool, err: e) -> Result(a, e) {
  case res {
    Ok(v) -> {
      case predicate(v) {
        True -> Ok(v)
        False -> Error(err)
      }
    }
    Error(e) -> Error(e)
  }
}

pub fn flatten_option(opt: Option(Option(a))) -> Option(a) {
  case opt {
    Some(inner) -> inner
    None -> None
  }
}

pub fn flatten_result(res: Result(Result(a, e), e)) -> Result(a, e) {
  case res {
    Ok(inner) -> inner
    Error(e) -> Error(e)
  }
}

pub fn partition_results(results: List(Result(a, e))) -> #(List(a), List(e)) {
  let oks = 
    results
    |> list.filter_map(fn(r) {
      case r {
        Ok(v) -> Ok(v)
        Error(_) -> Error(Nil)
      }
    })
  
  let errs = 
    results
    |> list.filter_map(fn(r) {
      case r {
        Ok(_) -> Error(Nil)
        Error(e) -> Ok(e)
      }
    })
  
  #(oks, errs)
}

pub fn partition_options(opts: List(Option(a))) -> #(List(a), Int) {
  let values = 
    opts
    |> list.filter_map(fn(opt) {
      case opt {
        Some(v) -> Ok(v)
        None -> Error(Nil)
      }
    })
  
  let none_count = list.length(opts) - list.length(values)
  #(values, none_count)
}

pub fn first_ok(results: List(Result(a, e))) -> Option(a) {
  results
  |> list.find_map(fn(r) {
    case r {
      Ok(v) -> Ok(v)
      Error(_) -> Error(Nil)
    }
  })
  |> result_to_option()
}

pub fn first_some(opts: List(Option(a))) -> Option(a) {
  opts
  |> list.find_map(fn(opt) {
    case opt {
      Some(v) -> Ok(v)
      None -> Error(Nil)
    }
  })
  |> result_to_option()
}

pub fn all_ok(results: List(Result(a, e))) -> Result(List(a), e) {
  results
  |> list.try_map(fn(r) { r })
}

pub fn all_some(opts: List(Option(a))) -> Option(List(a)) {
  let values = 
    opts
    |> list.filter_map(fn(opt) {
      case opt {
        Some(v) -> Ok(v)
        None -> Error(Nil)
      }
    })
  
  case list.length(values) == list.length(opts) {
    True -> Some(values)
    False -> None
  }
}

pub fn or_else(opt: Option(a), alternative: fn() -> Option(a)) -> Option(a) {
  case opt {
    Some(v) -> Some(v)
    None -> alternative()
  }
}

pub fn or_else_result(res: Result(a, e), alternative: fn() -> Result(a, e)) -> Result(a, e) {
  case res {
    Ok(v) -> Ok(v)
    Error(_) -> alternative()
  }
}

pub fn and_then(opt: Option(a), then_fn: fn(a) -> Option(b)) -> Option(b) {
  case opt {
    Some(v) -> then_fn(v)
    None -> None
  }
}

pub fn zip(opt1: Option(a), opt2: Option(b)) -> Option(#(a, b)) {
  case opt1, opt2 {
    Some(v1), Some(v2) -> Some(#(v1, v2))
    _, _ -> None
  }
}

pub fn zip_result(res1: Result(a, e), res2: Result(b, e)) -> Result(#(a, b), e) {
  case res1, res2 {
    Ok(v1), Ok(v2) -> Ok(#(v1, v2))
    Error(e), _ -> Error(e)
    _, Error(e) -> Error(e)
  }
}

pub fn contains(opt: Option(a), value: a) -> Bool {
  case opt {
    Some(v) -> v == value
    None -> False
  }
}

pub fn contains_ok(res: Result(a, e), value: a) -> Bool {
  case res {
    Ok(v) -> v == value
    Error(_) -> False
  }
}

pub fn contains_error(res: Result(a, e), err: e) -> Bool {
  case res {
    Ok(_) -> False
    Error(e) -> e == err
  }
}

pub fn ok(res: Result(a, e)) -> Option(a) {
  result_to_option(res)
}

pub fn err(res: Result(a, e)) -> Option(e) {
  case res {
    Ok(_) -> None
    Error(e) -> Some(e)
  }
}

pub fn transpose_option_result(opt: Option(Result(a, e))) -> Result(Option(a), e) {
  case opt {
    None -> Ok(None)
    Some(Ok(v)) -> Ok(Some(v))
    Some(Error(e)) -> Error(e)
  }
}

pub fn transpose_result_option(res: Result(Option(a), e)) -> Option(Result(a, e)) {
  case res {
    Ok(None) -> None
    Ok(Some(v)) -> Some(Ok(v))
    Error(e) -> Some(Error(e))
  }
}

pub fn fold_ok(res: Result(a, e), default: b, f: fn(a, b) -> b) -> b {
  case res {
    Ok(v) -> f(v, default)
    Error(_) -> default
  }
}

pub fn fold_option(opt: Option(a), default: b, f: fn(a, b) -> b) -> b {
  case opt {
    Some(v) -> f(v, default)
    None -> default
  }
}
