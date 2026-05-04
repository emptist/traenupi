import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class CacheEntry<FPL> extends _.CustomType {
  /** @deprecated */
  constructor(value: FPL, created_at: number, expires_at: number);
  /** @deprecated */
  value: FPL;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  expires_at: number;
}
export function CacheEntry$CacheEntry<FPL>(
  value: FPL,
  created_at: number,
  expires_at: number,
): CacheEntry$<FPL>;
export function CacheEntry$isCacheEntry<FPL>(value: CacheEntry$<FPL>): boolean;
export function CacheEntry$CacheEntry$0<FPL>(value: CacheEntry$<FPL>): FPL;
export function CacheEntry$CacheEntry$value<FPL>(value: CacheEntry$<FPL>): FPL;
export function CacheEntry$CacheEntry$1<FPL>(value: CacheEntry$<FPL>): number;
export function CacheEntry$CacheEntry$created_at<FPL>(value: CacheEntry$<FPL>): number;
export function CacheEntry$CacheEntry$2<FPL>(
  value: CacheEntry$<FPL>,
): number;
export function CacheEntry$CacheEntry$expires_at<FPL>(value: CacheEntry$<FPL>): number;

export type CacheEntry$<FPL> = CacheEntry<FPL>;

export class Cache<FPM> extends _.CustomType {
  /** @deprecated */
  constructor(
    entries: $dict.Dict$<string, CacheEntry$<any>>,
    max_size: number,
    default_ttl: number
  );
  /** @deprecated */
  entries: $dict.Dict$<string, CacheEntry$<any>>;
  /** @deprecated */
  max_size: number;
  /** @deprecated */
  default_ttl: number;
}
export function Cache$Cache<FPM>(
  entries: $dict.Dict$<string, CacheEntry$<any>>,
  max_size: number,
  default_ttl: number,
): Cache$<FPM>;
export function Cache$isCache<FPM>(value: Cache$<FPM>): boolean;
export function Cache$Cache$0<FPM>(value: Cache$<FPM>): $dict.Dict$<
  string,
  CacheEntry$<any>
>;
export function Cache$Cache$entries<FPM>(value: Cache$<FPM>): $dict.Dict$<
  string,
  CacheEntry$<any>
>;
export function Cache$Cache$1<FPM>(value: Cache$<FPM>): number;
export function Cache$Cache$max_size<FPM>(value: Cache$<FPM>): number;
export function Cache$Cache$2<FPM>(value: Cache$<FPM>): number;
export function Cache$Cache$default_ttl<FPM>(value: Cache$<FPM>): number;

export type Cache$<FPM> = Cache<FPM>;

export class LRUCache<FPN> extends _.CustomType {
  /** @deprecated */
  constructor(
    entries: $dict.Dict$<string, [any, number]>,
    access_order: _.List<string>,
    max_size: number
  );
  /** @deprecated */
  entries: $dict.Dict$<string, [any, number]>;
  /** @deprecated */
  access_order: _.List<string>;
  /** @deprecated */
  max_size: number;
}
export function LRUCache$LRUCache<FPN>(
  entries: $dict.Dict$<string, [any, number]>,
  access_order: _.List<string>,
  max_size: number,
): LRUCache$<FPN>;
export function LRUCache$isLRUCache<FPN>(value: LRUCache$<FPN>): boolean;
export function LRUCache$LRUCache$0<FPN>(value: LRUCache$<FPN>): $dict.Dict$<
  string,
  [any, number]
>;
export function LRUCache$LRUCache$entries<FPN>(value: LRUCache$<FPN>): $dict.Dict$<
  string,
  [any, number]
>;
export function LRUCache$LRUCache$1<FPN>(value: LRUCache$<FPN>): _.List<string>;
export function LRUCache$LRUCache$access_order<FPN>(value: LRUCache$<FPN>): _.List<
  string
>;
export function LRUCache$LRUCache$2<FPN>(value: LRUCache$<FPN>): number;
export function LRUCache$LRUCache$max_size<FPN>(value: LRUCache$<FPN>): number;

export type LRUCache$<FPN> = LRUCache<FPN>;

export function new_cache(max_size: number, default_ttl: number): Cache$<any>;

export function cache_get<FPQ>(
  cache: Cache$<FPQ>,
  key: string,
  current_time: number
): [$option.Option$<FPQ>, Cache$<FPQ>];

export function cache_set<FPZ>(
  cache: Cache$<FPZ>,
  key: string,
  value: FPZ,
  current_time: number
): Cache$<FPZ>;

export function cache_set_with_ttl<FQC>(
  cache: Cache$<FQC>,
  key: string,
  value: FQC,
  current_time: number,
  ttl: number
): Cache$<FQC>;

export function cache_delete<FQF>(cache: Cache$<FQF>, key: string): Cache$<FQF>;

export function cache_clear<FQI>(cache: Cache$<FQI>): Cache$<FQI>;

export function cache_size(cache: Cache$<any>): number;

export function cache_has(cache: Cache$<any>, key: string, current_time: number): boolean;

export function cache_keys(cache: Cache$<any>): _.List<string>;

export function cache_cleanup<FQS>(cache: Cache$<FQS>, current_time: number): Cache$<
  FQS
>;

export function cache_to_list<FQV>(cache: Cache$<FQV>): _.List<[string, FQV]>;

export function new_lru_cache(max_size: number): LRUCache$<any>;

export function lru_delete<FRH>(cache: LRUCache$<FRH>, key: string): LRUCache$<
  FRH
>;

export function lru_clear<FRK>(cache: LRUCache$<FRK>): LRUCache$<FRK>;

export function lru_size(cache: LRUCache$<any>): number;

export function lru_has(cache: LRUCache$<any>, key: string): boolean;

export function lru_keys(cache: LRUCache$<any>): _.List<string>;

export function lru_get<FRA>(cache: LRUCache$<FRA>, key: string): [
  $option.Option$<FRA>,
  LRUCache$<FRA>
];

export function lru_set<FRE>(cache: LRUCache$<FRE>, key: string, value: FRE): LRUCache$<
  FRE
>;
