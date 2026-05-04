import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class KnowledgeEntry extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    key: string,
    value: string,
    category: string,
    tags: _.List<string>,
    created_at: number,
    updated_at: number,
    embedding: $option.Option$<_.List<number>>
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  key: string;
  /** @deprecated */
  value: string;
  /** @deprecated */
  category: string;
  /** @deprecated */
  tags: _.List<string>;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  updated_at: number;
  /** @deprecated */
  embedding: $option.Option$<_.List<number>>;
}
export function KnowledgeEntry$KnowledgeEntry(
  id: string,
  key: string,
  value: string,
  category: string,
  tags: _.List<string>,
  created_at: number,
  updated_at: number,
  embedding: $option.Option$<_.List<number>>,
): KnowledgeEntry$;
export function KnowledgeEntry$isKnowledgeEntry(
  value: KnowledgeEntry$,
): boolean;
export function KnowledgeEntry$KnowledgeEntry$0(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$id(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$1(
  value: KnowledgeEntry$,
): string;
export function KnowledgeEntry$KnowledgeEntry$key(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$2(
  value: KnowledgeEntry$,
): string;
export function KnowledgeEntry$KnowledgeEntry$value(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$3(
  value: KnowledgeEntry$,
): string;
export function KnowledgeEntry$KnowledgeEntry$category(value: KnowledgeEntry$): string;
export function KnowledgeEntry$KnowledgeEntry$4(
  value: KnowledgeEntry$,
): _.List<string>;
export function KnowledgeEntry$KnowledgeEntry$tags(value: KnowledgeEntry$): _.List<
  string
>;
export function KnowledgeEntry$KnowledgeEntry$5(value: KnowledgeEntry$): number;
export function KnowledgeEntry$KnowledgeEntry$created_at(value: KnowledgeEntry$): number;
export function KnowledgeEntry$KnowledgeEntry$6(
  value: KnowledgeEntry$,
): number;
export function KnowledgeEntry$KnowledgeEntry$updated_at(value: KnowledgeEntry$): number;
export function KnowledgeEntry$KnowledgeEntry$7(
  value: KnowledgeEntry$,
): $option.Option$<_.List<number>>;
export function KnowledgeEntry$KnowledgeEntry$embedding(value: KnowledgeEntry$): $option.Option$<
  _.List<number>
>;

export type KnowledgeEntry$ = KnowledgeEntry;

export class KnowledgeGraph extends _.CustomType {
  /** @deprecated */
  constructor(
    entries: $dict.Dict$<string, KnowledgeEntry$>,
    key_index: $dict.Dict$<string, _.List<string>>,
    tag_index: $dict.Dict$<string, _.List<string>>,
    category_index: $dict.Dict$<string, _.List<string>>
  );
  /** @deprecated */
  entries: $dict.Dict$<string, KnowledgeEntry$>;
  /** @deprecated */
  key_index: $dict.Dict$<string, _.List<string>>;
  /** @deprecated */
  tag_index: $dict.Dict$<string, _.List<string>>;
  /** @deprecated */
  category_index: $dict.Dict$<string, _.List<string>>;
}
export function KnowledgeGraph$KnowledgeGraph(
  entries: $dict.Dict$<string, KnowledgeEntry$>,
  key_index: $dict.Dict$<string, _.List<string>>,
  tag_index: $dict.Dict$<string, _.List<string>>,
  category_index: $dict.Dict$<string, _.List<string>>,
): KnowledgeGraph$;
export function KnowledgeGraph$isKnowledgeGraph(
  value: KnowledgeGraph$,
): boolean;
export function KnowledgeGraph$KnowledgeGraph$0(value: KnowledgeGraph$): $dict.Dict$<
  string,
  KnowledgeEntry$
>;
export function KnowledgeGraph$KnowledgeGraph$entries(value: KnowledgeGraph$): $dict.Dict$<
  string,
  KnowledgeEntry$
>;
export function KnowledgeGraph$KnowledgeGraph$1(value: KnowledgeGraph$): $dict.Dict$<
  string,
  _.List<string>
>;
export function KnowledgeGraph$KnowledgeGraph$key_index(value: KnowledgeGraph$): $dict.Dict$<
  string,
  _.List<string>
>;
export function KnowledgeGraph$KnowledgeGraph$2(value: KnowledgeGraph$): $dict.Dict$<
  string,
  _.List<string>
>;
export function KnowledgeGraph$KnowledgeGraph$tag_index(value: KnowledgeGraph$): $dict.Dict$<
  string,
  _.List<string>
>;
export function KnowledgeGraph$KnowledgeGraph$3(value: KnowledgeGraph$): $dict.Dict$<
  string,
  _.List<string>
>;
export function KnowledgeGraph$KnowledgeGraph$category_index(value: KnowledgeGraph$): $dict.Dict$<
  string,
  _.List<string>
>;

export type KnowledgeGraph$ = KnowledgeGraph;

export class EntryNotFound extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function KnowledgeError$EntryNotFound($0: string): KnowledgeError$;
export function KnowledgeError$isEntryNotFound(value: KnowledgeError$): boolean;
export function KnowledgeError$EntryNotFound$0(value: KnowledgeError$): string;

export class InvalidKey extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function KnowledgeError$InvalidKey($0: string): KnowledgeError$;
export function KnowledgeError$isInvalidKey(value: KnowledgeError$): boolean;
export function KnowledgeError$InvalidKey$0(value: KnowledgeError$): string;

export class InvalidValue extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function KnowledgeError$InvalidValue($0: string): KnowledgeError$;
export function KnowledgeError$isInvalidValue(value: KnowledgeError$): boolean;
export function KnowledgeError$InvalidValue$0(value: KnowledgeError$): string;

export class DuplicateKey extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function KnowledgeError$DuplicateKey($0: string): KnowledgeError$;
export function KnowledgeError$isDuplicateKey(value: KnowledgeError$): boolean;
export function KnowledgeError$DuplicateKey$0(value: KnowledgeError$): string;

export class DatabaseError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function KnowledgeError$DatabaseError($0: string): KnowledgeError$;
export function KnowledgeError$isDatabaseError(value: KnowledgeError$): boolean;
export function KnowledgeError$DatabaseError$0(value: KnowledgeError$): string;

export type KnowledgeError$ = EntryNotFound | InvalidKey | InvalidValue | DuplicateKey | DatabaseError;

export function new_graph(): KnowledgeGraph$;

export function with_tags(entry: KnowledgeEntry$, tags: _.List<string>): KnowledgeEntry$;

export function with_embedding(
  entry: KnowledgeEntry$,
  embedding: _.List<number>
): KnowledgeEntry$;

export function add_entry(graph: KnowledgeGraph$, entry: KnowledgeEntry$): KnowledgeGraph$;

export function remove_entry(graph: KnowledgeGraph$, id: string): _.Result<
  KnowledgeGraph$,
  KnowledgeError$
>;

export function get_entry(graph: KnowledgeGraph$, id: string): $option.Option$<
  KnowledgeEntry$
>;

export function find_by_key(graph: KnowledgeGraph$, key: string): _.List<
  KnowledgeEntry$
>;

export function find_by_tag(graph: KnowledgeGraph$, tag: string): _.List<
  KnowledgeEntry$
>;

export function find_by_category(graph: KnowledgeGraph$, category: string): _.List<
  KnowledgeEntry$
>;

export function search(graph: KnowledgeGraph$, query: string): _.List<
  KnowledgeEntry$
>;

export function semantic_search(
  graph: KnowledgeGraph$,
  embedding: _.List<number>,
  top_k: number
): _.List<KnowledgeEntry$>;

export function get_all_entries(graph: KnowledgeGraph$): _.List<KnowledgeEntry$>;

export function count_entries(graph: KnowledgeGraph$): number;

export function get_all_tags(graph: KnowledgeGraph$): _.List<string>;

export function get_all_categories(graph: KnowledgeGraph$): _.List<string>;

export function merge_graphs(graph1: KnowledgeGraph$, graph2: KnowledgeGraph$): KnowledgeGraph$;

export function filter_entries(
  graph: KnowledgeGraph$,
  predicate: (x0: KnowledgeEntry$) => boolean
): KnowledgeGraph$;

export function export_to_json(graph: KnowledgeGraph$): string;

export function import_from_json(x0: string): _.Result<KnowledgeGraph$, string>;

export function update_entry(
  graph: KnowledgeGraph$,
  id: string,
  updates: (x0: KnowledgeEntry$) => KnowledgeEntry$
): _.Result<KnowledgeGraph$, KnowledgeError$>;

export function new_entry(key: string, value: string, category: string): KnowledgeEntry$;
