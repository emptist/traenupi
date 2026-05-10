import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/option.{None}
import gleam/list
import gleam/string
import gleam/int
import gleam/result
import gleam/dict
import traenupi_core/db
import traenupi_core/db_types
import traenupi_core/db_connection
import traenupi_core/knowledge.{type KnowledgeEntry, KnowledgeEntry}

pub type KnowledgeDbError {
  ConnectionError(String)
  QueryError(String)
  NotFound(String)
  DecodeError(String)
}

fn db_error_to_knowledge_error(e: db_types.DbError) -> KnowledgeDbError {
  case e {
    db_types.ConnectionError(msg) -> ConnectionError(msg)
    db_types.QueryError(msg) -> QueryError(msg)
    db_types.TimeoutError -> ConnectionError("Connection timeout")
    db_types.PoolExhausted -> ConnectionError("Connection pool exhausted")
    db_types.InvalidConfig(msg) -> ConnectionError(msg)
    db_types.ClosedError -> ConnectionError("Connection closed")
  }
}

pub fn load_knowledge(source: String) -> Promise(Result(List(KnowledgeEntry), KnowledgeDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT content, source, tags, created_at FROM memory WHERE source = $1 ORDER BY created_at DESC LIMIT 50"
    let params = [source]
    
    use result <- await(db.query(conn, sql, params))
    
    case result {
      Ok(query_result) -> {
        let entries = list.filter_map(query_result.rows, fn(row) {
          decode_knowledge_entry(row)
        })
        resolve(Ok(entries))
      }
      Error(e) -> resolve(Error(db_error_to_knowledge_error(e)))
    }
  }, db_error_to_knowledge_error)
}

pub fn add_knowledge(
  key: String,
  value: String,
  category: String,
  source: String,
  tags: List(String),
  importance: Int,
) -> Promise(Result(Nil, KnowledgeDbError)) {
  db_connection.with_connection(fn(conn) {
    let content = key <> ": " <> value
    let all_tags = [source, category, ..tags]
    let tags_str = "{" <> string.join(all_tags, ",") <> "}"
    
    let sql = "INSERT INTO memory (content, source, tags, importance) VALUES ($1, $2, $3, $4)"
    let params = [content, source, tags_str, int.to_string(importance)]
    
    use result <- await(db.execute(conn, sql, params))
    
    case result {
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_knowledge_error(e)))
    }
  }, db_error_to_knowledge_error)
}

pub fn search_knowledge(
  query: String,
  source: String,
) -> Promise(Result(List(KnowledgeEntry), KnowledgeDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT content, source, tags, created_at FROM memory WHERE source = $1 AND content ILIKE $2 ORDER BY created_at DESC LIMIT 20"
    let search_pattern = "%" <> query <> "%"
    let params = [source, search_pattern]
    
    use result <- await(db.query(conn, sql, params))
    
    case result {
      Ok(query_result) -> {
        let entries = list.filter_map(query_result.rows, fn(row) {
          decode_knowledge_entry(row)
        })
        resolve(Ok(entries))
      }
      Error(e) -> resolve(Error(db_error_to_knowledge_error(e)))
    }
  }, db_error_to_knowledge_error)
}

pub fn get_knowledge_by_category(
  category: String,
  source: String,
) -> Promise(Result(List(KnowledgeEntry), KnowledgeDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT content, source, tags, created_at FROM memory WHERE source = $1 AND $2 = ANY(tags) ORDER BY created_at DESC LIMIT 20"
    let params = [source, category]
    
    use result <- await(db.query(conn, sql, params))
    
    case result {
      Ok(query_result) -> {
        let entries = list.filter_map(query_result.rows, fn(row) {
          decode_knowledge_entry(row)
        })
        resolve(Ok(entries))
      }
      Error(e) -> resolve(Error(db_error_to_knowledge_error(e)))
    }
  }, db_error_to_knowledge_error)
}

fn decode_knowledge_entry(row: dict.Dict(String, String)) -> Result(KnowledgeEntry, Nil) {
  use content <- result.try(dict.get(row, "content") |> result.replace_error(Nil))
  use _source <- result.try(dict.get(row, "source") |> result.replace_error(Nil))
  use tags_str <- result.try(dict.get(row, "tags") |> result.replace_error(Nil))
  use created_at_str <- result.try(dict.get(row, "created_at") |> result.replace_error(Nil))
  
  use created_at <- result.try(
    int.parse(created_at_str) |> result.replace_error(Nil)
  )
  
  let parts = string.split(content, ": ")
  case parts {
    [key, ..rest] -> {
      let value = string.join(rest, ": ")
      let tags = parse_postgres_array(tags_str)
      let category = case tags {
        [_, cat, ..] -> cat
        _ -> "general"
      }
      
      Ok(KnowledgeEntry(
        id: "",
        key: key,
        value: value,
        category: category,
        tags: tags,
        created_at: created_at,
        updated_at: created_at,
        embedding: None,
      ))
    }
    _ -> Error(Nil)
  }
}

fn parse_postgres_array(array_str: String) -> List(String) {
  array_str
  |> string.replace("{", "")
  |> string.replace("}", "")
  |> string.replace("\"", "")
  |> string.split(",")
  |> list.filter(fn(s) { s != "" })
}
