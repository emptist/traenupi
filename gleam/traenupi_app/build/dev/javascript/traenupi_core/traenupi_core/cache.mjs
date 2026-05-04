/// <reference types="./cache.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import {
  Ok,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
} from "../gleam.mjs";

export class CacheEntry extends $CustomType {
  constructor(value, created_at, expires_at) {
    super();
    this.value = value;
    this.created_at = created_at;
    this.expires_at = expires_at;
  }
}
export const CacheEntry$CacheEntry = (value, created_at, expires_at) =>
  new CacheEntry(value, created_at, expires_at);
export const CacheEntry$isCacheEntry = (value) => value instanceof CacheEntry;
export const CacheEntry$CacheEntry$value = (value) => value.value;
export const CacheEntry$CacheEntry$0 = (value) => value.value;
export const CacheEntry$CacheEntry$created_at = (value) => value.created_at;
export const CacheEntry$CacheEntry$1 = (value) => value.created_at;
export const CacheEntry$CacheEntry$expires_at = (value) => value.expires_at;
export const CacheEntry$CacheEntry$2 = (value) => value.expires_at;

export class Cache extends $CustomType {
  constructor(entries, max_size, default_ttl) {
    super();
    this.entries = entries;
    this.max_size = max_size;
    this.default_ttl = default_ttl;
  }
}
export const Cache$Cache = (entries, max_size, default_ttl) =>
  new Cache(entries, max_size, default_ttl);
export const Cache$isCache = (value) => value instanceof Cache;
export const Cache$Cache$entries = (value) => value.entries;
export const Cache$Cache$0 = (value) => value.entries;
export const Cache$Cache$max_size = (value) => value.max_size;
export const Cache$Cache$1 = (value) => value.max_size;
export const Cache$Cache$default_ttl = (value) => value.default_ttl;
export const Cache$Cache$2 = (value) => value.default_ttl;

export class LRUCache extends $CustomType {
  constructor(entries, access_order, max_size) {
    super();
    this.entries = entries;
    this.access_order = access_order;
    this.max_size = max_size;
  }
}
export const LRUCache$LRUCache = (entries, access_order, max_size) =>
  new LRUCache(entries, access_order, max_size);
export const LRUCache$isLRUCache = (value) => value instanceof LRUCache;
export const LRUCache$LRUCache$entries = (value) => value.entries;
export const LRUCache$LRUCache$0 = (value) => value.entries;
export const LRUCache$LRUCache$access_order = (value) => value.access_order;
export const LRUCache$LRUCache$1 = (value) => value.access_order;
export const LRUCache$LRUCache$max_size = (value) => value.max_size;
export const LRUCache$LRUCache$2 = (value) => value.max_size;

export function new_cache(max_size, default_ttl) {
  return new Cache($dict.new$(), max_size, default_ttl);
}

export function cache_get(cache, key, current_time) {
  let $ = $dict.get(cache.entries, key);
  if ($ instanceof Ok) {
    let entry = $[0];
    let $1 = current_time < entry.expires_at;
    if ($1) {
      return [new Some(entry.value), cache];
    } else {
      let entries = $dict.delete$(cache.entries, key);
      return [new None(), new Cache(entries, cache.max_size, cache.default_ttl)];
    }
  } else {
    return [new None(), cache];
  }
}

function find_oldest_key(entries) {
  let _pipe = entries;
  let _pipe$1 = $dict.to_list(_pipe);
  let _pipe$2 = $list.fold(
    _pipe$1,
    new None(),
    (acc, pair) => {
      let key;
      let entry;
      key = pair[0];
      entry = pair[1];
      if (acc instanceof Some) {
        let oldest_time = acc[0][1];
        let $ = entry.created_at < oldest_time;
        if ($) {
          return new Some([key, entry.created_at]);
        } else {
          return acc;
        }
      } else {
        return new Some([key, entry.created_at]);
      }
    },
  );
  return $option.map(
    _pipe$2,
    (pair) => {
      let key;
      key = pair[0];
      return key;
    },
  );
}

export function cache_set(cache, key, value, current_time) {
  let expires_at = current_time + cache.default_ttl;
  let entry = new CacheEntry(value, current_time, expires_at);
  let _block;
  let $ = $dict.size(cache.entries) >= cache.max_size;
  if ($) {
    let $1 = find_oldest_key(cache.entries);
    if ($1 instanceof Some) {
      let oldest_key = $1[0];
      let entries = $dict.delete$(cache.entries, oldest_key);
      _block = $dict.insert(entries, key, entry);
    } else {
      _block = $dict.insert(cache.entries, key, entry);
    }
  } else {
    _block = $dict.insert(cache.entries, key, entry);
  }
  let entries = _block;
  return new Cache(entries, cache.max_size, cache.default_ttl);
}

export function cache_set_with_ttl(cache, key, value, current_time, ttl) {
  let expires_at = current_time + ttl;
  let entry = new CacheEntry(value, current_time, expires_at);
  let _block;
  let $ = $dict.size(cache.entries) >= cache.max_size;
  if ($) {
    let $1 = find_oldest_key(cache.entries);
    if ($1 instanceof Some) {
      let oldest_key = $1[0];
      let entries = $dict.delete$(cache.entries, oldest_key);
      _block = $dict.insert(entries, key, entry);
    } else {
      _block = $dict.insert(cache.entries, key, entry);
    }
  } else {
    _block = $dict.insert(cache.entries, key, entry);
  }
  let entries = _block;
  return new Cache(entries, cache.max_size, cache.default_ttl);
}

export function cache_delete(cache, key) {
  return new Cache(
    $dict.delete$(cache.entries, key),
    cache.max_size,
    cache.default_ttl,
  );
}

export function cache_clear(cache) {
  return new Cache($dict.new$(), cache.max_size, cache.default_ttl);
}

export function cache_size(cache) {
  return $dict.size(cache.entries);
}

export function cache_has(cache, key, current_time) {
  let $ = $dict.get(cache.entries, key);
  if ($ instanceof Ok) {
    let entry = $[0];
    return current_time < entry.expires_at;
  } else {
    return false;
  }
}

export function cache_keys(cache) {
  return $dict.keys(cache.entries);
}

export function cache_cleanup(cache, current_time) {
  let _block;
  let _pipe = cache.entries;
  let _pipe$1 = $dict.to_list(_pipe);
  let _pipe$2 = $list.filter(
    _pipe$1,
    (pair) => {
      let entry;
      entry = pair[1];
      return current_time < entry.expires_at;
    },
  );
  _block = $dict.from_list(_pipe$2);
  let entries = _block;
  return new Cache(entries, cache.max_size, cache.default_ttl);
}

export function cache_to_list(cache) {
  let _pipe = cache.entries;
  let _pipe$1 = $dict.to_list(_pipe);
  return $list.map(
    _pipe$1,
    (pair) => {
      let key;
      let entry;
      key = pair[0];
      entry = pair[1];
      return [key, entry.value];
    },
  );
}

export function new_lru_cache(max_size) {
  return new LRUCache($dict.new$(), toList([]), max_size);
}

export function lru_delete(cache, key) {
  let entries = $dict.delete$(cache.entries, key);
  let access_order = $list.filter(
    cache.access_order,
    (k) => { return k !== key; },
  );
  return new LRUCache(entries, access_order, cache.max_size);
}

export function lru_clear(cache) {
  return new LRUCache($dict.new$(), toList([]), cache.max_size);
}

export function lru_size(cache) {
  return $dict.size(cache.entries);
}

export function lru_has(cache, key) {
  return $dict.has_key(cache.entries, key);
}

export function lru_keys(cache) {
  return $dict.keys(cache.entries);
}

function move_to_front(lst, item) {
  let filtered = $list.filter(lst, (k) => { return k !== item; });
  return listPrepend(item, filtered);
}

export function lru_get(cache, key) {
  let $ = $dict.get(cache.entries, key);
  if ($ instanceof Ok) {
    let value = $[0][0];
    let access_order = move_to_front(cache.access_order, key);
    let updated = [value, $list.length(access_order)];
    let entries = $dict.insert(cache.entries, key, updated);
    return [
      new Some(value),
      new LRUCache(entries, access_order, cache.max_size),
    ];
  } else {
    return [new None(), cache];
  }
}

export function lru_set(cache, key, value) {
  let access_order = move_to_front(cache.access_order, key);
  let entries = $dict.insert(
    cache.entries,
    key,
    [value, $list.length(access_order)],
  );
  let _block;
  let $ = $dict.size(entries) > cache.max_size;
  if ($) {
    let $1 = $list.reverse(access_order);
    if ($1 instanceof $Empty) {
      _block = entries;
    } else {
      let oldest = $1.head;
      _block = $dict.delete$(entries, oldest);
    }
  } else {
    _block = entries;
  }
  let entries$1 = _block;
  return new LRUCache(entries$1, access_order, cache.max_size);
}
