import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/option.{None, Some}
import gleam/list
import gleam/int
import traenupi_core/db
import traenupi_core/db_types
import traenupi_core/db_connection
import traenupi_core/meeting.{type Meeting, type Opinion, type MeetingStatus}

pub type MeetingDbError {
  ConnectionError(String)
  QueryError(String)
  NotFound(String)
  DecodeError(String)
}

fn db_error_to_meeting_error(e: db_types.DbError) -> MeetingDbError {
  case e {
    db_types.ConnectionError(msg) -> ConnectionError(msg)
    db_types.QueryError(msg) -> QueryError(msg)
    db_types.TimeoutError -> ConnectionError("Connection timeout")
    db_types.PoolExhausted -> ConnectionError("Connection pool exhausted")
    db_types.InvalidConfig(msg) -> ConnectionError(msg)
    db_types.ClosedError -> ConnectionError("Connection closed")
  }
}

pub fn get_meeting_by_id(meeting_id: String) -> Promise(Result(Meeting, MeetingDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT * FROM meetings WHERE id = $1"
    let params = [meeting_id]
    
    use result <- await(db.query_one(conn, sql, params))
    
    case result {
      Ok(Some(row)) -> {
        case meeting.decode_meeting(row) {
          Ok(m) -> resolve(Ok(m))
          Error(e) -> resolve(Error(DecodeError("Failed to decode meeting: " <> meeting_error_to_string(e))))
        }
      }
      Ok(None) -> resolve(Error(NotFound("Meeting not found: " <> meeting_id)))
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn get_active_meetings() -> Promise(Result(List(Meeting), MeetingDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT * FROM meetings WHERE status = 'active' ORDER BY created_at DESC"
    let params = []
    
    use result <- await(db.query(conn, sql, params))
    
    case result {
      Ok(query_result) -> {
        let decoded_meetings = list.filter_map(query_result.rows, fn(row) {
          meeting.decode_meeting(row)
        })
        resolve(Ok(decoded_meetings))
      }
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn create_meeting(new_meeting: Meeting) -> Promise(Result(Nil, MeetingDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "
      INSERT INTO meetings (id, topic, status, created_by, created_at, consensus, consensus_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    "
    let params = [
      new_meeting.id,
      new_meeting.topic,
      meeting.status_to_string(new_meeting.status),
      new_meeting.created_by,
      int.to_string(new_meeting.created_at),
      option.unwrap(new_meeting.consensus, ""),
      option.unwrap(option.map(new_meeting.consensus_at, int.to_string), ""),
    ]
    
    use result <- await(db.execute(conn, sql, params))
    
    case result {
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn update_meeting_status(meeting_id: String, new_status: MeetingStatus, timestamp: Int) -> Promise(Result(Nil, MeetingDbError)) {
  db_connection.with_connection(fn(conn) {
    let status_str = meeting.status_to_string(new_status)
    let sql = "UPDATE meetings SET status = $1, updated_at = $2 WHERE id = $3"
    let params = [status_str, int.to_string(timestamp), meeting_id]
    
    use result <- await(db.execute(conn, sql, params))
    
    case result {
      Ok(0) -> resolve(Error(NotFound("Meeting not found: " <> meeting_id)))
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn add_opinion_to_meeting(opinion: Opinion) -> Promise(Result(Nil, MeetingDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "
      INSERT INTO opinions (id, meeting_id, author, perspective, reasoning, position, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    "
    let params = [
      opinion.id,
      opinion.meeting_id,
      opinion.author,
      opinion.perspective,
      option.unwrap(opinion.reasoning, ""),
      meeting.position_to_string(opinion.position),
      int.to_string(opinion.created_at),
      int.to_string(opinion.updated_at),
    ]
    
    use result <- await(db.execute(conn, sql, params))
    
    case result {
      Ok(_) -> resolve(Ok(Nil))
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

pub fn get_meeting_opinions(meeting_id: String) -> Promise(Result(List(Opinion), MeetingDbError)) {
  db_connection.with_connection(fn(conn) {
    let sql = "SELECT * FROM opinions WHERE meeting_id = $1 ORDER BY created_at ASC"
    let params = [meeting_id]
    
    use result <- await(db.query(conn, sql, params))
    
    case result {
      Ok(query_result) -> {
        let decoded_opinions = list.filter_map(query_result.rows, fn(row) {
          meeting.decode_opinion(row)
        })
        resolve(Ok(decoded_opinions))
      }
      Error(e) -> resolve(Error(db_error_to_meeting_error(e)))
    }
  }, db_error_to_meeting_error)
}

fn meeting_error_to_string(e: meeting.MeetingError) -> String {
  case e {
    meeting.MeetingNotFound(id) -> "Meeting not found: " <> id
    meeting.InvalidStatus(s) -> "Invalid status: " <> s
    meeting.InvalidPosition(s) -> "Invalid position: " <> s
    meeting.DatabaseError(s) -> "Database error: " <> s
    meeting.ValidationError(s) -> "Validation error: " <> s
    meeting.ConsensusNotReached -> "Consensus not reached"
  }
}
