import gleam/string

pub type PropertyResult {
  Passed
  Failed(counterexample: String)
}

pub fn for_all(
  generator: fn(Int) -> a,
  property: fn(a) -> Bool,
  num_tests: Int,
) -> PropertyResult {
  run_tests(generator, property, num_tests, 0)
}

fn run_tests(
  generator: fn(Int) -> a,
  property: fn(a) -> Bool,
  remaining: Int,
  seed: Int,
) -> PropertyResult {
  case remaining {
    0 -> Passed
    _ -> {
      let value = generator(seed)
      case property(value) {
        True -> run_tests(generator, property, remaining - 1, seed + 1)
        False -> Failed(counterexample: inspect(value))
      }
    }
  }
}

fn inspect(value: a) -> String {
  case value {
    v -> string.inspect(v)
  }
}

pub fn gen_int(seed: Int) -> Int {
  seed * 1103515245 + 12345
}

pub fn gen_positive_int(seed: Int) -> Int {
  gen_int(seed) % 10000 + 1
}

pub fn gen_negative_int(seed: Int) -> Int {
  0 - gen_positive_int(seed)
}

pub fn gen_non_negative_int(seed: Int) -> Int {
  gen_int(seed) % 10001
}

pub fn gen_string(seed: Int) -> String {
  let len = gen_int(seed) % 20 + 1
  gen_string_of_length(seed, len)
}

fn gen_string_of_length(seed: Int, len: Int) -> String {
  case len {
    0 -> ""
    _ -> {
      let char_code = gen_int(seed + len) % 26 + 97
      let char = case char_code {
        97 -> "a"
        98 -> "b"
        99 -> "c"
        100 -> "d"
        101 -> "e"
        102 -> "f"
        103 -> "g"
        104 -> "h"
        105 -> "i"
        106 -> "j"
        107 -> "k"
        108 -> "l"
        109 -> "m"
        110 -> "n"
        111 -> "o"
        112 -> "p"
        113 -> "q"
        114 -> "r"
        115 -> "s"
        116 -> "t"
        117 -> "u"
        118 -> "v"
        119 -> "w"
        120 -> "x"
        121 -> "y"
        122 -> "z"
        _ -> "a"
      }
      char <> gen_string_of_length(seed + 1, len - 1)
    }
  }
}

pub fn gen_non_empty_string(seed: Int) -> String {
  let len = gen_int(seed) % 19 + 2
  gen_string_of_length(seed, len)
}

pub fn gen_list(generator: fn(Int) -> a, seed: Int) -> List(a) {
  let len = gen_int(seed) % 10
  gen_list_of_length(generator, seed, len)
}

fn gen_list_of_length(generator: fn(Int) -> a, seed: Int, len: Int) -> List(a) {
  case len {
    0 -> []
    _ -> [generator(seed), ..gen_list_of_length(generator, seed + 1, len - 1)]
  }
}

pub fn gen_bool(seed: Int) -> Bool {
  gen_int(seed) % 2 == 0
}

pub fn check(result: PropertyResult) -> Bool {
  case result {
    Passed -> True
    Failed(_) -> False
  }
}

pub fn result_to_string(result: PropertyResult) -> String {
  case result {
    Passed -> "All tests passed"
    Failed(counterexample: ce) -> "Failed with counterexample: " <> ce
  }
}

pub const default_num_tests = 100
