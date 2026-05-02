import gleam/dict.{type Dict}
import gleam/option.{type Option, None, Some}
import gleam/list

pub type CacheEntry(a) {
  CacheEntry(value: a, created_at: Int, expires_at: Int)
}

pub type Cache(a) {
  Cache(
    entries: Dict(String, CacheEntry(a)),
    max_size: Int,
    default_ttl: Int,
  )
}

pub fn new_cache(max_size: Int, default_ttl: Int) -> Cache(a) {
  Cache(entries: dict.new(), max_size: max_size, default_ttl: default_ttl)
}

pub fn cache_get(cache: Cache(a), key: String, current_time: Int) -> #(Option(a), Cache(a)) {
  case dict.get(cache.entries, key) {
    Ok(entry) -> {
      case current_time < entry.expires_at {
        True -> #(Some(entry.value), cache)
        False -> {
          let entries = dict.delete(cache.entries, key)
          #(None, Cache(..cache, entries: entries))
        }
      }
    }
    Error(_) -> #(None, cache)
  }
}

fn find_oldest_key(entries: Dict(String, CacheEntry(a))) -> Option(String) {
  entries
  |> dict.to_list()
  |> list.fold(None, fn(acc, pair) {
    let #(key, entry) = pair
    case acc {
      None -> Some(#(key, entry.created_at))
      Some(#(_, oldest_time)) -> {
        case entry.created_at < oldest_time {
          True -> Some(#(key, entry.created_at))
          False -> acc
        }
      }
    }
  })
  |> option.map(fn(pair) {
    let #(key, _) = pair
    key
  })
}

pub fn cache_set(cache: Cache(a), key: String, value: a, current_time: Int) -> Cache(a) {
  let expires_at = current_time + cache.default_ttl
  let entry = CacheEntry(value: value, created_at: current_time, expires_at: expires_at)
  
  let entries = case dict.size(cache.entries) >= cache.max_size {
    True -> {
      case find_oldest_key(cache.entries) {
        Some(oldest_key) -> {
          let entries = dict.delete(cache.entries, oldest_key)
          dict.insert(entries, key, entry)
        }
        None -> dict.insert(cache.entries, key, entry)
      }
    }
    False -> dict.insert(cache.entries, key, entry)
  }
  
  Cache(..cache, entries: entries)
}

pub fn cache_set_with_ttl(
  cache: Cache(a),
  key: String,
  value: a,
  current_time: Int,
  ttl: Int,
) -> Cache(a) {
  let expires_at = current_time + ttl
  let entry = CacheEntry(value: value, created_at: current_time, expires_at: expires_at)
  
  let entries = case dict.size(cache.entries) >= cache.max_size {
    True -> {
      case find_oldest_key(cache.entries) {
        Some(oldest_key) -> {
          let entries = dict.delete(cache.entries, oldest_key)
          dict.insert(entries, key, entry)
        }
        None -> dict.insert(cache.entries, key, entry)
      }
    }
    False -> dict.insert(cache.entries, key, entry)
  }
  
  Cache(..cache, entries: entries)
}

pub fn cache_delete(cache: Cache(a), key: String) -> Cache(a) {
  Cache(..cache, entries: dict.delete(cache.entries, key))
}

pub fn cache_clear(cache: Cache(a)) -> Cache(a) {
  Cache(..cache, entries: dict.new())
}

pub fn cache_size(cache: Cache(a)) -> Int {
  dict.size(cache.entries)
}

pub fn cache_has(cache: Cache(a), key: String, current_time: Int) -> Bool {
  case dict.get(cache.entries, key) {
    Ok(entry) -> current_time < entry.expires_at
    Error(_) -> False
  }
}

pub fn cache_keys(cache: Cache(a)) -> List(String) {
  dict.keys(cache.entries)
}

pub fn cache_cleanup(cache: Cache(a), current_time: Int) -> Cache(a) {
  let entries = 
    cache.entries
    |> dict.to_list()
    |> list.filter(fn(pair) {
      let #(_, entry) = pair
      current_time < entry.expires_at
    })
    |> dict.from_list()
  
  Cache(..cache, entries: entries)
}

pub fn cache_to_list(cache: Cache(a)) -> List(#(String, a)) {
  cache.entries
  |> dict.to_list()
  |> list.map(fn(pair) {
    let #(key, entry) = pair
    #(key, entry.value)
  })
}

pub type LRUCache(a) {
  LRUCache(
    entries: Dict(String, #(a, Int)),
    access_order: List(String),
    max_size: Int,
  )
}

pub fn new_lru_cache(max_size: Int) -> LRUCache(a) {
  LRUCache(entries: dict.new(), access_order: [], max_size: max_size)
}

pub fn lru_get(cache: LRUCache(a), key: String) -> #(Option(a), LRUCache(a)) {
  case dict.get(cache.entries, key) {
    Ok(#(value, _)) -> {
      let access_order = move_to_front(cache.access_order, key)
      let updated = #(value, list.length(access_order))
      let entries = dict.insert(cache.entries, key, updated)
      #(Some(value), LRUCache(..cache, entries: entries, access_order: access_order))
    }
    Error(_) -> #(None, cache)
  }
}

pub fn lru_set(cache: LRUCache(a), key: String, value: a) -> LRUCache(a) {
  let access_order = move_to_front(cache.access_order, key)
  let entries = dict.insert(cache.entries, key, #(value, list.length(access_order)))
  
  let entries = case dict.size(entries) > cache.max_size {
    True -> {
      case list.reverse(access_order) {
        [] -> entries
        [oldest, .._] -> dict.delete(entries, oldest)
      }
    }
    False -> entries
  }
  
  LRUCache(..cache, entries: entries, access_order: access_order)
}

pub fn lru_delete(cache: LRUCache(a), key: String) -> LRUCache(a) {
  let entries = dict.delete(cache.entries, key)
  let access_order = list.filter(cache.access_order, fn(k) { k != key })
  LRUCache(..cache, entries: entries, access_order: access_order)
}

pub fn lru_clear(cache: LRUCache(a)) -> LRUCache(a) {
  LRUCache(..cache, entries: dict.new(), access_order: [])
}

pub fn lru_size(cache: LRUCache(a)) -> Int {
  dict.size(cache.entries)
}

pub fn lru_has(cache: LRUCache(a), key: String) -> Bool {
  dict.has_key(cache.entries, key)
}

pub fn lru_keys(cache: LRUCache(a)) -> List(String) {
  dict.keys(cache.entries)
}

fn move_to_front(lst: List(String), item: String) -> List(String) {
  let filtered = list.filter(lst, fn(k) { k != item })
  [item, ..filtered]
}
