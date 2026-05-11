import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/list
import gleam/string
import gleam/dict
import gleam/result
import traenupi_core/db
import traenupi_core/db_types
import traenupi_core/db_connection

pub type MeetingError {
  ConnectionError(String)
  QueryError(String)
  NotFound(String)
}

pub type Meeting {
  Meeting(
    id: String,
    topic: String,
    status: String,
    created_by: String,
    created_at: String,
    consensus: String,
    opinion_count: Int,
  )
}

pub type MeetingOpinion {
  MeetingOpinion(
    id: String,
    author: String,
    perspective: String,
    position: String,
    created_at: String,
  )
}

fn db_error_to_meeting_error(e: db_types.DbError) -> MeetingError {
  case e {
    db_types.ConnectionError(msg) -> ConnectionError(msg)
    db_types.QueryError(msg) -> QueryError(msg)
    db_types.TimeoutError -> ConnectionError("Connection timeout")
    db_types.PoolExhausted -> ConnectionError("Connection pool exhausted")
    db_types.InvalidConfig(msg) -> ConnectionError(msg)
    db_types.ClosedError -> ConnectionError("Connection closed")
  }
}

pub fn list_active_meetings() -> Promise(Result(List(Meeting), MeetingError)) {
  db_connection.with_connection(fn(conn) {
    let sql =
      "SELECT m.id, m.topic, m.status, m.created_by, m.created_at, COALESCE(m.consensus, '') as consensus FROM meetings m WHERE m.status = 'active' ORDER BY m.created_at DESC LIMIT 20"
    let params = []

    use result <- await(db.query(conn, sql, params))

    case result {
      Ok(query_result) -> {
        let meetings =
          list.filter_map(query_result.rows, fn(row) {
            decode_meeting(row)
          })

        let meetings_with_counts =
          list.map(meetings, fn(meeting) {
            Meeting(
              ..meeting,
              opinion_count: 0,
            )
          })
        resolve(Ok(meetings_with_counts))
      }
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn get_meeting_opinions(
  meeting_id: String,
) -> Promise(Result(List(MeetingOpinion), MeetingError)) {
  db_connection.with_connection(fn(conn) {
    let sql =
      "SELECT id, author, perspective, COALESCE(position, '') as position, created_at FROM meeting_opinions WHERE meeting_id::text LIKE $1 || '%' ORDER BY created_at"
    let params = [meeting_id]

    use result <- await(db.query(conn, sql, params))

    case result {
      Ok(query_result) -> {
        let opinions =
          list.filter_map(query_result.rows, fn(row) {
            decode_meeting_opinion(row)
          })
        resolve(Ok(opinions))
      }
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn add_meeting_opinion(
  meeting_id: String,
  author: String,
  perspective: String,
  position: String,
) -> Promise(Result(Nil, MeetingError)) {
  db_connection.with_connection(fn(conn) {
    let sql =
      "INSERT INTO meeting_opinions (id, meeting_id, author, perspective, position, created_at, updated_at) VALUES (gen_random_uuid(), (SELECT id FROM meetings WHERE id::text LIKE $1 || '%' LIMIT 1), $2, $3, $4, NOW(), NOW())"
    let params = [meeting_id, author, perspective, position]

    use result <- await(db.execute(conn, sql, params))

    case result {
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

fn decode_meeting(row: dict.Dict(String, String)) -> Result(Meeting, Nil) {
  use id <- result.try(dict.get(row, "id") |> result.replace_error(Nil))
  use topic <- result.try(dict.get(row, "topic") |> result.replace_error(Nil))
  use status <- result.try(dict.get(row, "status") |> result.replace_error(Nil))
  let created_by = dict.get(row, "created_by") |> result.unwrap("")
  let created_at = dict.get(row, "created_at") |> result.unwrap("")
  let consensus = dict.get(row, "consensus") |> result.unwrap("")

  Ok(Meeting(
    id: id,
    topic: topic,
    status: status,
    created_by: created_by,
    created_at: created_at,
    consensus: consensus,
    opinion_count: 0,
  ))
}

fn decode_meeting_opinion(row: dict.Dict(String, String)) -> Result(MeetingOpinion, Nil) {
  use id <- result.try(dict.get(row, "id") |> result.replace_error(Nil))
  let author = dict.get(row, "author") |> result.unwrap("")
  use perspective <- result.try(
    dict.get(row, "perspective") |> result.replace_error(Nil),
  )
  let position = dict.get(row, "position") |> result.unwrap("")
  let created_at = dict.get(row, "created_at") |> result.unwrap("")

  Ok(MeetingOpinion(
    id: id,
    author: author,
    perspective: perspective,
    position: position,
    created_at: created_at,
  ))
}

pub fn meeting_to_short_string(meeting: Meeting) -> String {
  let short_id = case string.length(meeting.id) > 8 {
    True -> string.slice(meeting.id, 0, 8)
    False -> meeting.id
  }
  short_id <> " | " <> meeting.topic
}

pub fn opinion_to_string(opinion: MeetingOpinion) -> String {
  let pos = case opinion.position {
    "" -> ""
    p -> " [" <> p <> "]"
  }
  opinion.author <> pos <> ": " <> opinion.perspective
}
