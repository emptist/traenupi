/// <reference types="./property.d.mts" />
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { toList, prepend as listPrepend, CustomType as $CustomType } from "../gleam.mjs";

export class Passed extends $CustomType {}
export const PropertyResult$Passed = () => new Passed();
export const PropertyResult$isPassed = (value) => value instanceof Passed;

export class Failed extends $CustomType {
  constructor(counterexample) {
    super();
    this.counterexample = counterexample;
  }
}
export const PropertyResult$Failed = (counterexample) =>
  new Failed(counterexample);
export const PropertyResult$isFailed = (value) => value instanceof Failed;
export const PropertyResult$Failed$counterexample = (value) =>
  value.counterexample;
export const PropertyResult$Failed$0 = (value) => value.counterexample;

export const default_num_tests = 100;

function inspect(value) {
  let v = value;
  return $string.inspect(v);
}

function run_tests(loop$generator, loop$property, loop$remaining, loop$seed) {
  while (true) {
    let generator = loop$generator;
    let property = loop$property;
    let remaining = loop$remaining;
    let seed = loop$seed;
    if (remaining === 0) {
      return new Passed();
    } else {
      let value = generator(seed);
      let $ = property(value);
      if ($) {
        loop$generator = generator;
        loop$property = property;
        loop$remaining = remaining - 1;
        loop$seed = seed + 1;
      } else {
        return new Failed(inspect(value));
      }
    }
  }
}

export function for_all(generator, property, num_tests) {
  return run_tests(generator, property, num_tests, 0);
}

export function gen_int(seed) {
  return seed * 1103515245 + 12345;
}

export function gen_positive_int(seed) {
  return (gen_int(seed) % 10000) + 1;
}

export function gen_negative_int(seed) {
  return 0 - gen_positive_int(seed);
}

export function gen_non_negative_int(seed) {
  return gen_int(seed) % 10001;
}

function gen_string_of_length(seed, len) {
  if (len === 0) {
    return "";
  } else {
    let char_code = (gen_int(seed + len) % 26) + 97;
    let _block;
    if (char_code === 97) {
      _block = "a";
    } else if (char_code === 98) {
      _block = "b";
    } else if (char_code === 99) {
      _block = "c";
    } else if (char_code === 100) {
      _block = "d";
    } else if (char_code === 101) {
      _block = "e";
    } else if (char_code === 102) {
      _block = "f";
    } else if (char_code === 103) {
      _block = "g";
    } else if (char_code === 104) {
      _block = "h";
    } else if (char_code === 105) {
      _block = "i";
    } else if (char_code === 106) {
      _block = "j";
    } else if (char_code === 107) {
      _block = "k";
    } else if (char_code === 108) {
      _block = "l";
    } else if (char_code === 109) {
      _block = "m";
    } else if (char_code === 110) {
      _block = "n";
    } else if (char_code === 111) {
      _block = "o";
    } else if (char_code === 112) {
      _block = "p";
    } else if (char_code === 113) {
      _block = "q";
    } else if (char_code === 114) {
      _block = "r";
    } else if (char_code === 115) {
      _block = "s";
    } else if (char_code === 116) {
      _block = "t";
    } else if (char_code === 117) {
      _block = "u";
    } else if (char_code === 118) {
      _block = "v";
    } else if (char_code === 119) {
      _block = "w";
    } else if (char_code === 120) {
      _block = "x";
    } else if (char_code === 121) {
      _block = "y";
    } else if (char_code === 122) {
      _block = "z";
    } else {
      _block = "a";
    }
    let char = _block;
    return char + gen_string_of_length(seed + 1, len - 1);
  }
}

export function gen_string(seed) {
  let len = (gen_int(seed) % 20) + 1;
  return gen_string_of_length(seed, len);
}

export function gen_non_empty_string(seed) {
  let len = (gen_int(seed) % 19) + 2;
  return gen_string_of_length(seed, len);
}

function gen_list_of_length(generator, seed, len) {
  if (len === 0) {
    return toList([]);
  } else {
    return listPrepend(
      generator(seed),
      gen_list_of_length(generator, seed + 1, len - 1),
    );
  }
}

export function gen_list(generator, seed) {
  let len = gen_int(seed) % 10;
  return gen_list_of_length(generator, seed, len);
}

export function gen_bool(seed) {
  return (gen_int(seed) % 2) === 0;
}

export function check(result) {
  if (result instanceof Passed) {
    return true;
  } else {
    return false;
  }
}

export function result_to_string(result) {
  if (result instanceof Passed) {
    return "All tests passed";
  } else {
    let ce = result.counterexample;
    return "Failed with counterexample: " + ce;
  }
}
