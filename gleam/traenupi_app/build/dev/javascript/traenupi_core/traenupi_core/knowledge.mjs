/// <reference types="./knowledge.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $float from "../../gleam_stdlib/gleam/float.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $result from "../../gleam_stdlib/gleam/result.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import {
  Ok,
  Error,
  toList,
  prepend as listPrepend,
  CustomType as $CustomType,
  makeError,
  divideFloat,
} from "../gleam.mjs";
import { now } from "./knowledge_ffi.mjs";

const FILEPATH = "src/traenupi_core/knowledge.gleam";

export class KnowledgeEntry extends $CustomType {
  constructor(id, key, value, category, tags, created_at, updated_at, embedding) {
    super();
    this.id = id;
    this.key = key;
    this.value = value;
    this.category = category;
    this.tags = tags;
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.embedding = embedding;
  }
}
export const KnowledgeEntry$KnowledgeEntry = (id, key, value, category, tags, created_at, updated_at, embedding) =>
  new KnowledgeEntry(id,
  key,
  value,
  category,
  tags,
  created_at,
  updated_at,
  embedding);
export const KnowledgeEntry$isKnowledgeEntry = (value) =>
  value instanceof KnowledgeEntry;
export const KnowledgeEntry$KnowledgeEntry$id = (value) => value.id;
export const KnowledgeEntry$KnowledgeEntry$0 = (value) => value.id;
export const KnowledgeEntry$KnowledgeEntry$key = (value) => value.key;
export const KnowledgeEntry$KnowledgeEntry$1 = (value) => value.key;
export const KnowledgeEntry$KnowledgeEntry$value = (value) => value.value;
export const KnowledgeEntry$KnowledgeEntry$2 = (value) => value.value;
export const KnowledgeEntry$KnowledgeEntry$category = (value) => value.category;
export const KnowledgeEntry$KnowledgeEntry$3 = (value) => value.category;
export const KnowledgeEntry$KnowledgeEntry$tags = (value) => value.tags;
export const KnowledgeEntry$KnowledgeEntry$4 = (value) => value.tags;
export const KnowledgeEntry$KnowledgeEntry$created_at = (value) =>
  value.created_at;
export const KnowledgeEntry$KnowledgeEntry$5 = (value) => value.created_at;
export const KnowledgeEntry$KnowledgeEntry$updated_at = (value) =>
  value.updated_at;
export const KnowledgeEntry$KnowledgeEntry$6 = (value) => value.updated_at;
export const KnowledgeEntry$KnowledgeEntry$embedding = (value) =>
  value.embedding;
export const KnowledgeEntry$KnowledgeEntry$7 = (value) => value.embedding;

export class KnowledgeGraph extends $CustomType {
  constructor(entries, key_index, tag_index, category_index) {
    super();
    this.entries = entries;
    this.key_index = key_index;
    this.tag_index = tag_index;
    this.category_index = category_index;
  }
}
export const KnowledgeGraph$KnowledgeGraph = (entries, key_index, tag_index, category_index) =>
  new KnowledgeGraph(entries, key_index, tag_index, category_index);
export const KnowledgeGraph$isKnowledgeGraph = (value) =>
  value instanceof KnowledgeGraph;
export const KnowledgeGraph$KnowledgeGraph$entries = (value) => value.entries;
export const KnowledgeGraph$KnowledgeGraph$0 = (value) => value.entries;
export const KnowledgeGraph$KnowledgeGraph$key_index = (value) =>
  value.key_index;
export const KnowledgeGraph$KnowledgeGraph$1 = (value) => value.key_index;
export const KnowledgeGraph$KnowledgeGraph$tag_index = (value) =>
  value.tag_index;
export const KnowledgeGraph$KnowledgeGraph$2 = (value) => value.tag_index;
export const KnowledgeGraph$KnowledgeGraph$category_index = (value) =>
  value.category_index;
export const KnowledgeGraph$KnowledgeGraph$3 = (value) => value.category_index;

export class EntryNotFound extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const KnowledgeError$EntryNotFound = ($0) => new EntryNotFound($0);
export const KnowledgeError$isEntryNotFound = (value) =>
  value instanceof EntryNotFound;
export const KnowledgeError$EntryNotFound$0 = (value) => value[0];

export class InvalidKey extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const KnowledgeError$InvalidKey = ($0) => new InvalidKey($0);
export const KnowledgeError$isInvalidKey = (value) =>
  value instanceof InvalidKey;
export const KnowledgeError$InvalidKey$0 = (value) => value[0];

export class InvalidValue extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const KnowledgeError$InvalidValue = ($0) => new InvalidValue($0);
export const KnowledgeError$isInvalidValue = (value) =>
  value instanceof InvalidValue;
export const KnowledgeError$InvalidValue$0 = (value) => value[0];

export class DuplicateKey extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const KnowledgeError$DuplicateKey = ($0) => new DuplicateKey($0);
export const KnowledgeError$isDuplicateKey = (value) =>
  value instanceof DuplicateKey;
export const KnowledgeError$DuplicateKey$0 = (value) => value[0];

export class DatabaseError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const KnowledgeError$DatabaseError = ($0) => new DatabaseError($0);
export const KnowledgeError$isDatabaseError = (value) =>
  value instanceof DatabaseError;
export const KnowledgeError$DatabaseError$0 = (value) => value[0];

export function new_graph() {
  return new KnowledgeGraph(
    $dict.new$(),
    $dict.new$(),
    $dict.new$(),
    $dict.new$(),
  );
}

export function with_tags(entry, tags) {
  return new KnowledgeEntry(
    entry.id,
    entry.key,
    entry.value,
    entry.category,
    tags,
    entry.created_at,
    entry.updated_at,
    entry.embedding,
  );
}

export function with_embedding(entry, embedding) {
  return new KnowledgeEntry(
    entry.id,
    entry.key,
    entry.value,
    entry.category,
    entry.tags,
    entry.created_at,
    entry.updated_at,
    new Some(embedding),
  );
}

export function add_entry(graph, entry) {
  let entries = $dict.insert(graph.entries, entry.id, entry);
  let key_index = $dict.upsert(
    graph.key_index,
    entry.key,
    (maybe_ids) => {
      if (maybe_ids instanceof Some) {
        let ids = maybe_ids[0];
        return listPrepend(entry.id, ids);
      } else {
        return toList([entry.id]);
      }
    },
  );
  let _block;
  let _pipe = entry.tags;
  _block = $list.fold(
    _pipe,
    graph.tag_index,
    (index, tag) => {
      return $dict.upsert(
        index,
        tag,
        (maybe_ids) => {
          if (maybe_ids instanceof Some) {
            let ids = maybe_ids[0];
            return listPrepend(entry.id, ids);
          } else {
            return toList([entry.id]);
          }
        },
      );
    },
  );
  let tag_index = _block;
  let category_index = $dict.upsert(
    graph.category_index,
    entry.category,
    (maybe_ids) => {
      if (maybe_ids instanceof Some) {
        let ids = maybe_ids[0];
        return listPrepend(entry.id, ids);
      } else {
        return toList([entry.id]);
      }
    },
  );
  return new KnowledgeGraph(entries, key_index, tag_index, category_index);
}

export function remove_entry(graph, id) {
  let $ = $dict.get(graph.entries, id);
  if ($ instanceof Ok) {
    let entry = $[0];
    let entries = $dict.delete$(graph.entries, id);
    let key_index = $dict.upsert(
      graph.key_index,
      entry.key,
      (maybe_ids) => {
        if (maybe_ids instanceof Some) {
          let ids = maybe_ids[0];
          return $list.filter(ids, (id_) => { return id_ !== id; });
        } else {
          return toList([]);
        }
      },
    );
    let _block;
    let _pipe = entry.tags;
    _block = $list.fold(
      _pipe,
      graph.tag_index,
      (index, tag) => {
        return $dict.upsert(
          index,
          tag,
          (maybe_ids) => {
            if (maybe_ids instanceof Some) {
              let ids = maybe_ids[0];
              return $list.filter(ids, (id_) => { return id_ !== id; });
            } else {
              return toList([]);
            }
          },
        );
      },
    );
    let tag_index = _block;
    let category_index = $dict.upsert(
      graph.category_index,
      entry.category,
      (maybe_ids) => {
        if (maybe_ids instanceof Some) {
          let ids = maybe_ids[0];
          return $list.filter(ids, (id_) => { return id_ !== id; });
        } else {
          return toList([]);
        }
      },
    );
    return new Ok(
      new KnowledgeGraph(entries, key_index, tag_index, category_index),
    );
  } else {
    return new Error(new EntryNotFound(id));
  }
}

export function get_entry(graph, id) {
  let $ = $dict.get(graph.entries, id);
  if ($ instanceof Ok) {
    let entry = $[0];
    return new Some(entry);
  } else {
    return new None();
  }
}

export function find_by_key(graph, key) {
  let $ = $dict.get(graph.key_index, key);
  if ($ instanceof Ok) {
    let ids = $[0];
    let _pipe = ids;
    return $list.filter_map(
      _pipe,
      (id) => {
        let $1 = $dict.get(graph.entries, id);
        if ($1 instanceof Ok) {
          return $1;
        } else {
          return $1;
        }
      },
    );
  } else {
    return toList([]);
  }
}

export function find_by_tag(graph, tag) {
  let $ = $dict.get(graph.tag_index, tag);
  if ($ instanceof Ok) {
    let ids = $[0];
    let _pipe = ids;
    return $list.filter_map(
      _pipe,
      (id) => {
        let $1 = $dict.get(graph.entries, id);
        if ($1 instanceof Ok) {
          return $1;
        } else {
          return $1;
        }
      },
    );
  } else {
    return toList([]);
  }
}

export function find_by_category(graph, category) {
  let $ = $dict.get(graph.category_index, category);
  if ($ instanceof Ok) {
    let ids = $[0];
    let _pipe = ids;
    return $list.filter_map(
      _pipe,
      (id) => {
        let $1 = $dict.get(graph.entries, id);
        if ($1 instanceof Ok) {
          return $1;
        } else {
          return $1;
        }
      },
    );
  } else {
    return toList([]);
  }
}

export function search(graph, query) {
  let query_lower = $string.lowercase(query);
  let _pipe = graph.entries;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (entry) => {
      return ($string.contains($string.lowercase(entry.key), query_lower) || $string.contains(
        $string.lowercase(entry.value),
        query_lower,
      )) || $string.contains($string.lowercase(entry.category), query_lower);
    },
  );
}

function cosine_similarity(a, b) {
  let _block;
  let _pipe = $list.zip(a, b);
  _block = $list.fold(
    _pipe,
    0.0,
    (acc, pair) => {
      let x;
      let y;
      x = pair[0];
      y = pair[1];
      return acc + (x * y);
    },
  );
  let dot_product = _block;
  let _block$1;
  let _pipe$1 = $list.fold(a, 0.0, (acc, x) => { return acc + (x * x); });
  let _pipe$2 = $float.square_root(_pipe$1);
  _block$1 = $result.unwrap(_pipe$2, 0.0);
  let magnitude_a = _block$1;
  let _block$2;
  let _pipe$3 = $list.fold(b, 0.0, (acc, x) => { return acc + (x * x); });
  let _pipe$4 = $float.square_root(_pipe$3);
  _block$2 = $result.unwrap(_pipe$4, 0.0);
  let magnitude_b = _block$2;
  let $ = (magnitude_a === 0.0) || (magnitude_b === 0.0);
  if ($) {
    return 0.0;
  } else {
    return divideFloat(dot_product, (magnitude_a * magnitude_b));
  }
}

export function semantic_search(graph, embedding, top_k) {
  let _block;
  let _pipe = graph.entries;
  let _pipe$1 = $dict.values(_pipe);
  let _pipe$2 = $list.filter(
    _pipe$1,
    (entry) => {
      let $ = entry.embedding;
      if ($ instanceof Some) {
        return true;
      } else {
        return false;
      }
    },
  );
  _block = $list.map(
    _pipe$2,
    (entry) => {
      let $ = entry.embedding;
      let entry_embedding;
      if ($ instanceof Some) {
        entry_embedding = $[0];
      } else {
        throw makeError(
          "let_assert",
          FILEPATH,
          "traenupi_core/knowledge",
          231,
          "semantic_search",
          "Pattern match failed, no pattern matched the value.",
          {
            value: $,
            start: 5944,
            end: 5994,
            pattern_start: 5955,
            pattern_end: 5976
          }
        )
      }
      let similarity = cosine_similarity(embedding, entry_embedding);
      return [entry, similarity];
    },
  );
  let scored = _block;
  let _pipe$3 = scored;
  let _pipe$4 = $list.sort(
    _pipe$3,
    (a, b) => {
      let sim_a;
      sim_a = a[1];
      let sim_b;
      sim_b = b[1];
      return $float.compare(sim_a, sim_b);
    },
  );
  let _pipe$5 = $list.reverse(_pipe$4);
  let _pipe$6 = $list.take(_pipe$5, top_k);
  return $list.map(
    _pipe$6,
    (pair) => {
      let entry;
      entry = pair[0];
      return entry;
    },
  );
}

export function get_all_entries(graph) {
  return $dict.values(graph.entries);
}

export function count_entries(graph) {
  return $dict.size(graph.entries);
}

export function get_all_tags(graph) {
  return $dict.keys(graph.tag_index);
}

export function get_all_categories(graph) {
  return $dict.keys(graph.category_index);
}

export function merge_graphs(graph1, graph2) {
  let _pipe = graph2.entries;
  let _pipe$1 = $dict.values(_pipe);
  return $list.fold(
    _pipe$1,
    graph1,
    (graph, entry) => { return add_entry(graph, entry); },
  );
}

export function filter_entries(graph, predicate) {
  let _pipe = graph.entries;
  let _pipe$1 = $dict.values(_pipe);
  let _pipe$2 = $list.filter(_pipe$1, predicate);
  return $list.fold(
    _pipe$2,
    new_graph(),
    (graph, entry) => { return add_entry(graph, entry); },
  );
}

export function export_to_json(graph) {
  let _block;
  let _pipe = graph.entries;
  let _pipe$1 = $dict.values(_pipe);
  let _pipe$2 = $list.map(
    _pipe$1,
    (entry) => {
      return ((((((("{\"id\":\"" + entry.id) + "\",\"key\":\"") + entry.key) + "\",\"value\":\"") + entry.value) + "\",\"category\":\"") + entry.category) + "\"}";
    },
  );
  _block = $string.join(_pipe$2, ",");
  let entries = _block;
  return ("[" + entries) + "]";
}

export function import_from_json(_) {
  return new Error("Not implemented - use json module for parsing");
}

export function update_entry(graph, id, updates) {
  let $ = $dict.get(graph.entries, id);
  if ($ instanceof Ok) {
    let entry = $[0];
    let updated = updates(entry);
    let updated$1 = new KnowledgeEntry(
      updated.id,
      updated.key,
      updated.value,
      updated.category,
      updated.tags,
      updated.created_at,
      now(),
      updated.embedding,
    );
    return $result.try$(
      remove_entry(graph, id),
      (graph) => { return new Ok(add_entry(graph, updated$1)); },
    );
  } else {
    return new Error(new EntryNotFound(id));
  }
}

function generate_id() {
  return ($int.to_string(now()) + "-") + $int.to_string($int.random(10000));
}

export function new_entry(key, value, category) {
  return new KnowledgeEntry(
    generate_id(),
    key,
    value,
    category,
    toList([]),
    now(),
    now(),
    new None(),
  );
}
