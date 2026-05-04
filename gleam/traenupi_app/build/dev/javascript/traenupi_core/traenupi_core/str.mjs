/// <reference types="./str.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, Empty as $Empty } from "../gleam.mjs";

export function is_empty(s) {
  return $string.length(s) === 0;
}

export function is_blank(s) {
  return (() => {
    let _pipe = s;
    let _pipe$1 = $string.trim(_pipe);
    return $string.length(_pipe$1);
  })() === 0;
}

export function is_not_empty(s) {
  return !is_empty(s);
}

export function is_not_blank(s) {
  return !is_blank(s);
}

export function trim_to_option(s) {
  let trimmed = $string.trim(s);
  let $ = is_empty(trimmed);
  if ($) {
    return new None();
  } else {
    return new Some(trimmed);
  }
}

export function default_if_empty(s, default$) {
  let $ = is_empty(s);
  if ($) {
    return default$;
  } else {
    return s;
  }
}

export function default_if_blank(s, default$) {
  let $ = is_blank(s);
  if ($) {
    return default$;
  } else {
    return s;
  }
}

export function truncate(s, max_length) {
  let $ = $string.length(s) <= max_length;
  if ($) {
    return s;
  } else {
    let $1 = max_length < 3;
    if ($1) {
      return $string.slice(s, 0, max_length);
    } else {
      return $string.slice(s, 0, max_length - 3) + "...";
    }
  }
}

export function truncate_with(s, max_length, suffix) {
  let $ = $string.length(s) <= max_length;
  if ($) {
    return s;
  } else {
    let suffix_len = $string.length(suffix);
    let $1 = max_length <= suffix_len;
    if ($1) {
      return suffix;
    } else {
      return $string.slice(s, 0, max_length - suffix_len) + suffix;
    }
  }
}

export function capitalize(s) {
  let $ = $string.length(s);
  if ($ === 0) {
    return s;
  } else {
    let first = $string.slice(s, 0, 1);
    let rest = $string.slice(s, 1, $string.length(s) - 1);
    return $string.uppercase(first) + rest;
  }
}

export function title_case(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, " ");
  let _pipe$2 = $list.map(_pipe$1, capitalize);
  return $string.join(_pipe$2, " ");
}

export function camel_case(s) {
  let _block;
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, "_");
  _block = $list.map(_pipe$1, capitalize);
  let words = _block;
  if (words instanceof $Empty) {
    return "";
  } else {
    let first = words.head;
    let rest = words.tail;
    return $string.lowercase(first) + $string.join(rest, "");
  }
}

export function snake_case(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, " ");
  let _pipe$2 = $list.map(_pipe$1, $string.lowercase);
  return $string.join(_pipe$2, "_");
}

export function kebab_case(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, " ");
  let _pipe$2 = $list.map(_pipe$1, $string.lowercase);
  return $string.join(_pipe$2, "-");
}

export function reverse(s) {
  let _pipe = s;
  let _pipe$1 = $string.to_graphemes(_pipe);
  let _pipe$2 = $list.reverse(_pipe$1);
  return $string.join(_pipe$2, "");
}

export function repeat(s, n) {
  return $string.repeat(s, n);
}

export function starts_with_any(s, prefixes) {
  return $list.any(
    prefixes,
    (prefix) => { return $string.starts_with(s, prefix); },
  );
}

export function ends_with_any(s, suffixes) {
  return $list.any(
    suffixes,
    (suffix) => { return $string.ends_with(s, suffix); },
  );
}

export function remove_prefix(s, prefix) {
  let $ = $string.starts_with(s, prefix);
  if ($) {
    let len = $string.length(prefix);
    return $string.slice(s, len, $string.length(s) - len);
  } else {
    return s;
  }
}

export function remove_suffix(s, suffix) {
  let $ = $string.ends_with(s, suffix);
  if ($) {
    let len = $string.length(s) - $string.length(suffix);
    return $string.slice(s, 0, len);
  } else {
    return s;
  }
}

export function ensure_prefix(s, prefix) {
  let $ = $string.starts_with(s, prefix);
  if ($) {
    return s;
  } else {
    return prefix + s;
  }
}

export function ensure_suffix(s, suffix) {
  let $ = $string.ends_with(s, suffix);
  if ($) {
    return s;
  } else {
    return s + suffix;
  }
}

export function surround(s, wrapper) {
  return (wrapper + s) + wrapper;
}

export function quote(s) {
  return surround(s, "\"");
}

export function single_quote(s) {
  return surround(s, "'");
}

export function unquote(s) {
  let _pipe = s;
  let _pipe$1 = remove_prefix(_pipe, "\"");
  let _pipe$2 = remove_suffix(_pipe$1, "\"");
  let _pipe$3 = remove_prefix(_pipe$2, "'");
  return remove_suffix(_pipe$3, "'");
}

export function is_numeric(s) {
  let $ = $string.length(s);
  if ($ === 0) {
    return false;
  } else {
    let _pipe = s;
    let _pipe$1 = $string.to_graphemes(_pipe);
    return $list.all(
      _pipe$1,
      (c) => {
        if (c === "0") {
          return true;
        } else if (c === "1") {
          return true;
        } else if (c === "2") {
          return true;
        } else if (c === "3") {
          return true;
        } else if (c === "4") {
          return true;
        } else if (c === "5") {
          return true;
        } else if (c === "6") {
          return true;
        } else if (c === "7") {
          return true;
        } else if (c === "8") {
          return true;
        } else if (c === "9") {
          return true;
        } else {
          return false;
        }
      },
    );
  }
}

export function is_alpha(s) {
  let $ = $string.length(s);
  if ($ === 0) {
    return false;
  } else {
    let _pipe = s;
    let _pipe$1 = $string.to_graphemes(_pipe);
    return $list.all(
      _pipe$1,
      (c) => {
        if (c === "a") {
          return true;
        } else if (c === "b") {
          return true;
        } else if (c === "c") {
          return true;
        } else if (c === "d") {
          return true;
        } else if (c === "e") {
          return true;
        } else if (c === "f") {
          return true;
        } else if (c === "g") {
          return true;
        } else if (c === "h") {
          return true;
        } else if (c === "i") {
          return true;
        } else if (c === "j") {
          return true;
        } else if (c === "k") {
          return true;
        } else if (c === "l") {
          return true;
        } else if (c === "m") {
          return true;
        } else if (c === "n") {
          return true;
        } else if (c === "o") {
          return true;
        } else if (c === "p") {
          return true;
        } else if (c === "q") {
          return true;
        } else if (c === "r") {
          return true;
        } else if (c === "s") {
          return true;
        } else if (c === "t") {
          return true;
        } else if (c === "u") {
          return true;
        } else if (c === "v") {
          return true;
        } else if (c === "w") {
          return true;
        } else if (c === "x") {
          return true;
        } else if (c === "y") {
          return true;
        } else if (c === "z") {
          return true;
        } else if (c === "A") {
          return true;
        } else if (c === "B") {
          return true;
        } else if (c === "C") {
          return true;
        } else if (c === "D") {
          return true;
        } else if (c === "E") {
          return true;
        } else if (c === "F") {
          return true;
        } else if (c === "G") {
          return true;
        } else if (c === "H") {
          return true;
        } else if (c === "I") {
          return true;
        } else if (c === "J") {
          return true;
        } else if (c === "K") {
          return true;
        } else if (c === "L") {
          return true;
        } else if (c === "M") {
          return true;
        } else if (c === "N") {
          return true;
        } else if (c === "O") {
          return true;
        } else if (c === "P") {
          return true;
        } else if (c === "Q") {
          return true;
        } else if (c === "R") {
          return true;
        } else if (c === "S") {
          return true;
        } else if (c === "T") {
          return true;
        } else if (c === "U") {
          return true;
        } else if (c === "V") {
          return true;
        } else if (c === "W") {
          return true;
        } else if (c === "X") {
          return true;
        } else if (c === "Y") {
          return true;
        } else if (c === "Z") {
          return true;
        } else {
          return false;
        }
      },
    );
  }
}

export function is_alphanumeric(s) {
  let $ = $string.length(s);
  if ($ === 0) {
    return false;
  } else {
    let _pipe = s;
    let _pipe$1 = $string.to_graphemes(_pipe);
    return $list.all(_pipe$1, (c) => { return is_numeric(c) || is_alpha(c); });
  }
}

export function take(s, n) {
  return $string.slice(s, 0, n);
}

export function drop(s, n) {
  return $string.slice(s, n, $string.length(s) - n);
}

export function take_right(s, n) {
  let len = $string.length(s);
  let $ = n >= len;
  if ($) {
    return s;
  } else {
    return $string.slice(s, len - n, n);
  }
}

export function drop_right(s, n) {
  let len = $string.length(s);
  let $ = n >= len;
  if ($) {
    return "";
  } else {
    return $string.slice(s, 0, len - n);
  }
}

export function first_char(s) {
  let $ = $string.length(s);
  if ($ === 0) {
    return new None();
  } else {
    return new Some($string.slice(s, 0, 1));
  }
}

export function last_char(s) {
  let len = $string.length(s);
  if (len === 0) {
    return new None();
  } else {
    return new Some($string.slice(s, len - 1, 1));
  }
}

export function initials(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, " ");
  let _pipe$2 = $list.filter_map(
    _pipe$1,
    (word) => {
      let $ = $string.length(word);
      if ($ === 0) {
        return new Error(undefined);
      } else {
        return new Ok($string.slice(word, 0, 1));
      }
    },
  );
  return $string.join(_pipe$2, "");
}

export function word_count(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, " ");
  let _pipe$2 = $list.filter(
    _pipe$1,
    (word) => { return $string.length(word) > 0; },
  );
  return $list.length(_pipe$2);
}

export function line_count(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, "\n");
  return $list.length(_pipe$1);
}

export function indent(s, spaces) {
  let indent_str = $string.repeat(" ", spaces);
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, "\n");
  let _pipe$2 = $list.map(_pipe$1, (line) => { return indent_str + line; });
  return $string.join(_pipe$2, "\n");
}

export function dedent(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, "\n");
  let _pipe$2 = $list.map(
    _pipe$1,
    (line) => {
      let trimmed = $string.trim(line);
      let $ = $string.length(trimmed) === $string.length(line);
      if ($) {
        return trimmed;
      } else {
        return line;
      }
    },
  );
  return $string.join(_pipe$2, "\n");
}

export function strip_margin(s) {
  let _pipe = s;
  let _pipe$1 = $string.split(_pipe, "\n");
  let _pipe$2 = $list.map(
    _pipe$1,
    (line) => {
      let $ = $string.contains(line, "|");
      if ($) {
        let parts = $string.split(line, "|");
        if (parts instanceof $Empty) {
          return line;
        } else {
          let $1 = parts.tail;
          if ($1 instanceof $Empty) {
            return line;
          } else {
            let $2 = $1.tail;
            if ($2 instanceof $Empty) {
              let rest = $1.head;
              return rest;
            } else {
              return line;
            }
          }
        }
      } else {
        return line;
      }
    },
  );
  return $string.join(_pipe$2, "\n");
}

export function ellipsize(s, max_length) {
  return truncate_with(s, max_length, "...");
}

export function humanize(s) {
  let _pipe = s;
  let _pipe$1 = $string.replace(_pipe, "_", " ");
  let _pipe$2 = $string.replace(_pipe$1, "-", " ");
  return $string.trim(_pipe$2);
}

export function slugify(s) {
  let _pipe = s;
  let _pipe$1 = $string.lowercase(_pipe);
  let _pipe$2 = $string.replace(_pipe$1, " ", "-");
  return $string.replace(_pipe$2, "_", "-");
}

export function template(template_str, values) {
  return $list.fold(
    values,
    template_str,
    (acc, pair) => {
      let key;
      let value;
      key = pair[0];
      value = pair[1];
      return $string.replace(acc, ("{{" + key) + "}}", value);
    },
  );
}

export function pluralize(count, singular, plural) {
  if (count === 1) {
    return singular;
  } else {
    return plural;
  }
}

export function possessive(s) {
  let $ = $string.ends_with(s, "s");
  if ($) {
    return s + "'";
  } else {
    return s + "'s";
  }
}
