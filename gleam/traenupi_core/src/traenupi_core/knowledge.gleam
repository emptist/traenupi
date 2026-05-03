import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/string
import gleam/int
import gleam/float
import gleam/result

pub type KnowledgeEntry {
  KnowledgeEntry(
    id: String,
    key: String,
    value: String,
    category: String,
    tags: List(String),
    created_at: Int,
    updated_at: Int,
    embedding: Option(List(Float)),
  )
}

pub type KnowledgeGraph {
  KnowledgeGraph(
    entries: Dict(String, KnowledgeEntry),
    key_index: Dict(String, List(String)),
    tag_index: Dict(String, List(String)),
    category_index: Dict(String, List(String)),
  )
}

pub type KnowledgeError {
  EntryNotFound(String)
  InvalidKey(String)
  InvalidValue(String)
  DuplicateKey(String)
  DatabaseError(String)
}

pub fn new_graph() -> KnowledgeGraph {
  KnowledgeGraph(
    entries: dict.new(),
    key_index: dict.new(),
    tag_index: dict.new(),
    category_index: dict.new(),
  )
}

pub fn new_entry(key: String, value: String, category: String) -> KnowledgeEntry {
  KnowledgeEntry(
    id: generate_id(),
    key: key,
    value: value,
    category: category,
    tags: [],
    created_at: now(),
    updated_at: now(),
    embedding: None,
  )
}

pub fn with_tags(entry: KnowledgeEntry, tags: List(String)) -> KnowledgeEntry {
  KnowledgeEntry(..entry, tags: tags)
}

pub fn with_embedding(entry: KnowledgeEntry, embedding: List(Float)) -> KnowledgeEntry {
  KnowledgeEntry(..entry, embedding: Some(embedding))
}

pub fn add_entry(graph: KnowledgeGraph, entry: KnowledgeEntry) -> KnowledgeGraph {
  let entries = dict.insert(graph.entries, entry.id, entry)
  
  let key_index = dict.upsert(graph.key_index, entry.key, fn(maybe_ids) {
    case maybe_ids {
      Some(ids) -> [entry.id, ..ids]
      None -> [entry.id]
    }
  })
  
  let tag_index = entry.tags
    |> list.fold(graph.tag_index, fn(index, tag) {
      dict.upsert(index, tag, fn(maybe_ids) {
        case maybe_ids {
          Some(ids) -> [entry.id, ..ids]
          None -> [entry.id]
        }
      })
    })
  
  let category_index = dict.upsert(graph.category_index, entry.category, fn(maybe_ids) {
    case maybe_ids {
      Some(ids) -> [entry.id, ..ids]
      None -> [entry.id]
    }
  })
  
  KnowledgeGraph(
    entries: entries,
    key_index: key_index,
    tag_index: tag_index,
    category_index: category_index,
  )
}

pub fn remove_entry(graph: KnowledgeGraph, id: String) -> Result(KnowledgeGraph, KnowledgeError) {
  case dict.get(graph.entries, id) {
    Ok(entry) -> {
      let entries = dict.delete(graph.entries, id)
      
      let key_index = dict.upsert(graph.key_index, entry.key, fn(maybe_ids) {
        case maybe_ids {
          Some(ids) -> list.filter(ids, fn(id_) { id_ != id })
          None -> []
        }
      })
      
      let tag_index = entry.tags
        |> list.fold(graph.tag_index, fn(index, tag) {
          dict.upsert(index, tag, fn(maybe_ids) {
            case maybe_ids {
              Some(ids) -> list.filter(ids, fn(id_) { id_ != id })
              None -> []
            }
          })
        })
      
      let category_index = dict.upsert(graph.category_index, entry.category, fn(maybe_ids) {
        case maybe_ids {
          Some(ids) -> list.filter(ids, fn(id_) { id_ != id })
          None -> []
        }
      })
      
      Ok(KnowledgeGraph(
        entries: entries,
        key_index: key_index,
        tag_index: tag_index,
        category_index: category_index,
      ))
    }
    Error(Nil) -> Error(EntryNotFound(id))
  }
}

pub fn update_entry(graph: KnowledgeGraph, id: String, updates: fn(KnowledgeEntry) -> KnowledgeEntry) -> Result(KnowledgeGraph, KnowledgeError) {
  case dict.get(graph.entries, id) {
    Ok(entry) -> {
      let updated = updates(entry)
      let updated = KnowledgeEntry(..updated, updated_at: now())
      
      use graph <- result.try(remove_entry(graph, id))
      Ok(add_entry(graph, updated))
    }
    Error(Nil) -> Error(EntryNotFound(id))
  }
}

pub fn get_entry(graph: KnowledgeGraph, id: String) -> Option(KnowledgeEntry) {
  case dict.get(graph.entries, id) {
    Ok(entry) -> Some(entry)
    Error(Nil) -> None
  }
}

pub fn find_by_key(graph: KnowledgeGraph, key: String) -> List(KnowledgeEntry) {
  case dict.get(graph.key_index, key) {
    Ok(ids) -> {
      ids
      |> list.filter_map(fn(id) { 
        case dict.get(graph.entries, id) {
          Ok(entry) -> Ok(entry)
          Error(Nil) -> Error(Nil)
        }
      })
    }
    Error(Nil) -> []
  }
}

pub fn find_by_tag(graph: KnowledgeGraph, tag: String) -> List(KnowledgeEntry) {
  case dict.get(graph.tag_index, tag) {
    Ok(ids) -> {
      ids
      |> list.filter_map(fn(id) { 
        case dict.get(graph.entries, id) {
          Ok(entry) -> Ok(entry)
          Error(Nil) -> Error(Nil)
        }
      })
    }
    Error(Nil) -> []
  }
}

pub fn find_by_category(graph: KnowledgeGraph, category: String) -> List(KnowledgeEntry) {
  case dict.get(graph.category_index, category) {
    Ok(ids) -> {
      ids
      |> list.filter_map(fn(id) { 
        case dict.get(graph.entries, id) {
          Ok(entry) -> Ok(entry)
          Error(Nil) -> Error(Nil)
        }
      })
    }
    Error(Nil) -> []
  }
}

pub fn search(graph: KnowledgeGraph, query: String) -> List(KnowledgeEntry) {
  let query_lower = string.lowercase(query)
  
  graph.entries
  |> dict.values()
  |> list.filter(fn(entry) {
    string.contains(string.lowercase(entry.key), query_lower)
    || string.contains(string.lowercase(entry.value), query_lower)
    || string.contains(string.lowercase(entry.category), query_lower)
  })
}

pub fn semantic_search(graph: KnowledgeGraph, embedding: List(Float), top_k: Int) -> List(KnowledgeEntry) {
  let scored = graph.entries
    |> dict.values()
    |> list.filter(fn(entry) {
      case entry.embedding {
        Some(_) -> True
        None -> False
      }
    })
    |> list.map(fn(entry) {
      let assert Some(entry_embedding) = entry.embedding
      let similarity = cosine_similarity(embedding, entry_embedding)
      #(entry, similarity)
    })
  
  scored
  |> list.sort(fn(a, b) {
    let #(_, sim_a) = a
    let #(_, sim_b) = b
    float.compare(sim_a, sim_b)
  })
  |> list.reverse()
  |> list.take(top_k)
  |> list.map(fn(pair) {
    let #(entry, _) = pair
    entry
  })
}

fn cosine_similarity(a: List(Float), b: List(Float)) -> Float {
  let dot_product = list.zip(a, b)
    |> list.fold(0.0, fn(acc, pair) {
      let #(x, y) = pair
      acc +. x *. y
    })
  
  let magnitude_a = list.fold(a, 0.0, fn(acc, x) { acc +. x *. x })
    |> float.square_root()
    |> result.unwrap(or: 0.0)
  
  let magnitude_b = list.fold(b, 0.0, fn(acc, x) { acc +. x *. x })
    |> float.square_root()
    |> result.unwrap(or: 0.0)
  
  case magnitude_a == 0.0 || magnitude_b == 0.0 {
    True -> 0.0
    False -> dot_product /. { magnitude_a *. magnitude_b }
  }
}

pub fn get_all_entries(graph: KnowledgeGraph) -> List(KnowledgeEntry) {
  dict.values(graph.entries)
}

pub fn count_entries(graph: KnowledgeGraph) -> Int {
  dict.size(graph.entries)
}

pub fn get_all_tags(graph: KnowledgeGraph) -> List(String) {
  dict.keys(graph.tag_index)
}

pub fn get_all_categories(graph: KnowledgeGraph) -> List(String) {
  dict.keys(graph.category_index)
}

pub fn merge_graphs(graph1: KnowledgeGraph, graph2: KnowledgeGraph) -> KnowledgeGraph {
  graph2.entries
  |> dict.values()
  |> list.fold(graph1, fn(graph, entry) {
    add_entry(graph, entry)
  })
}

pub fn filter_entries(graph: KnowledgeGraph, predicate: fn(KnowledgeEntry) -> Bool) -> KnowledgeGraph {
  graph.entries
  |> dict.values()
  |> list.filter(predicate)
  |> list.fold(new_graph(), fn(graph, entry) {
    add_entry(graph, entry)
  })
}

pub fn export_to_json(graph: KnowledgeGraph) -> String {
  let entries = graph.entries
    |> dict.values()
    |> list.map(fn(entry) {
      "{\"id\":\"" <> entry.id <> "\",\"key\":\"" <> entry.key <> "\",\"value\":\"" <> entry.value <> "\",\"category\":\"" <> entry.category <> "\"}"
    })
    |> string.join(",")
  
  "[" <> entries <> "]"
}

pub fn import_from_json(_json: String) -> Result(KnowledgeGraph, String) {
  Error("Not implemented - use json module for parsing")
}

fn generate_id() -> String {
  int.to_string(now()) <> "-" <> int.to_string(int.random(10000))
}

@external(javascript, "./knowledge_ffi.mjs", "now")
fn now() -> Int
