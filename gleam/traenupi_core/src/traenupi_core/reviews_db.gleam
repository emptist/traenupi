import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/list
import gleam/string
import gleam/dict
import gleam/result
import traenupi_core/db
import traenupi_core/db_types
import traenupi_core/db_connection

pub type ReviewError {
  ConnectionError(String)
  QueryError(String)
  NotFound(String)
}

pub type InterReview {
  InterReview(
    id: String,
    task_id: String,
    commit_hash: String,
    branch: String,
    requester_id: String,
    status: String,
    review_context: String,
    summary: String,
    requested_at: String,
  )
}

fn db_error_to_review_error(e: db_types.DbError) -> ReviewError {
  case e {
    db_types.ConnectionError(msg) -> ConnectionError(msg)
    db_types.QueryError(msg) -> QueryError(msg)
    db_types.TimeoutError -> ConnectionError("Connection timeout")
    db_types.PoolExhausted -> ConnectionError("Connection pool exhausted")
    db_types.InvalidConfig(msg) -> ConnectionError(msg)
    db_types.ClosedError -> ConnectionError("Connection closed")
  }
}

pub fn list_pending_reviews() -> Promise(Result(List(InterReview), ReviewError)) {
  db_connection.with_connection(fn(conn) {
    let sql =
      "SELECT id, task_id, commit_hash, branch, requester_id, status, review_context, summary, requested_at FROM inter_reviews WHERE status = 'pending' ORDER BY requested_at DESC LIMIT 20"
    let params = []

    use result <- await(db.query(conn, sql, params))

    case result {
      Ok(query_result) -> {
        let reviews =
          list.filter_map(query_result.rows, fn(row) {
            decode_inter_review(row)
          })
        resolve(Ok(reviews))
      }
      Error(e) -> resolve(Error(db_error_to_review_error(e)))
    }
  }, db_error_to_review_error)
}

pub fn get_review(review_id: String) -> Promise(Result(InterReview, ReviewError)) {
  db_connection.with_connection(fn(conn) {
    let sql =
      "SELECT id, task_id, commit_hash, branch, requester_id, status, review_context, summary, requested_at FROM inter_reviews WHERE id::text LIKE $1 || '%' LIMIT 1"
    let params = [review_id]

    use result <- await(db.query(conn, sql, params))

    case result {
      Ok(query_result) -> {
        case query_result.rows {
          [row, ..] -> {
            case decode_inter_review(row) {
              Ok(review) -> resolve(Ok(review))
              Error(_) -> resolve(Error(NotFound("Failed to decode review")))
            }
          }
          [] -> resolve(Error(NotFound("Review not found: " <> review_id)))
        }
      }
      Error(e) -> resolve(Error(db_error_to_review_error(e)))
    }
  }, db_error_to_review_error)
}

pub fn complete_review(
  review_id: String,
  summary: String,
  reviewer: String,
) -> Promise(Result(Nil, ReviewError)) {
  db_connection.with_connection(fn(conn) {
    let sql =
      "UPDATE inter_reviews SET status = 'completed', summary = $1, completed_at = NOW(), reviewed_by = $2 WHERE id::text LIKE $3 || '%'"
    let params = [summary, reviewer, review_id]

    use result <- await(db.execute(conn, sql, params))

    case result {
      Ok(n) -> {
        case n > 0 {
          True -> resolve(Ok(Nil))
          False -> resolve(Error(NotFound("Review not found: " <> review_id)))
        }
      }
      Error(e) -> resolve(Error(db_error_to_review_error(e)))
    }
  }, db_error_to_review_error)
}

fn decode_inter_review(row: dict.Dict(String, String)) -> Result(InterReview, Nil) {
  use id <- result.try(dict.get(row, "id") |> result.replace_error(Nil))
  use task_id <- result.try(dict.get(row, "task_id") |> result.replace_error(Nil))
  let commit_hash = dict.get(row, "commit_hash") |> result.unwrap("")
  let branch = dict.get(row, "branch") |> result.unwrap("")
  let requester_id = dict.get(row, "requester_id") |> result.unwrap("")
  use status <- result.try(dict.get(row, "status") |> result.replace_error(Nil))
  let review_context = dict.get(row, "review_context") |> result.unwrap("")
  let summary = dict.get(row, "summary") |> result.unwrap("")
  let requested_at = dict.get(row, "requested_at") |> result.unwrap("")

  Ok(InterReview(
    id: id,
    task_id: task_id,
    commit_hash: commit_hash,
    branch: branch,
    requester_id: requester_id,
    status: status,
    review_context: review_context,
    summary: summary,
    requested_at: requested_at,
  ))
}

pub fn review_to_short_string(review: InterReview) -> String {
  let short_id = case string.length(review.id) > 8 {
    True -> string.slice(review.id, 0, 8)
    False -> review.id
  }
  let short_task = case string.length(review.task_id) > 8 {
    True -> string.slice(review.task_id, 0, 8)
    False -> review.task_id
  }
  short_id <> "... | Task: " <> short_task <> "... | By: " <> review.requester_id
}

pub fn review_to_full_string(review: InterReview) -> String {
  let context_display = case review.review_context {
    "" -> "(none)"
    ctx -> ctx
  }
  let commit_display = case review.commit_hash {
    "" -> "(none)"
    h -> h
  }
  "Review ID: " <> review.id <> "\n"
  <> "Task ID: " <> review.task_id <> "\n"
  <> "Status: " <> review.status <> "\n"
  <> "Branch: " <> review.branch <> "\n"
  <> "Commit: " <> commit_display <> "\n"
  <> "Requester: " <> review.requester_id <> "\n"
  <> "Context: " <> context_display <> "\n"
  <> "Requested: " <> review.requested_at
}
