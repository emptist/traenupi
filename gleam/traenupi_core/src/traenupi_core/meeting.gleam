import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/int
import gleam/string
import gleam/result

pub type MeetingStatus {
  Active
  Completed
  Cancelled
}

pub type Position {
  Support
  Oppose
  Neutral
}

pub type Meeting {
  Meeting(
    id: String,
    topic: String,
    status: MeetingStatus,
    created_by: String,
    created_at: Int,
    consensus: Option(String),
    consensus_at: Option(Int),
    metadata: Dict(String, String),
  )
}

pub type Opinion {
  Opinion(
    id: String,
    meeting_id: String,
    author: String,
    perspective: String,
    reasoning: Option(String),
    position: Position,
    created_at: Int,
    updated_at: Int,
  )
}

pub type MeetingError {
  MeetingNotFound(String)
  InvalidStatus(String)
  InvalidPosition(String)
  DatabaseError(String)
  ValidationError(String)
  ConsensusNotReached
}

pub fn new_meeting(topic: String, created_by: String) -> Meeting {
  Meeting(
    id: generate_id(),
    topic: topic,
    status: Active,
    created_by: created_by,
    created_at: now(),
    consensus: None,
    consensus_at: None,
    metadata: dict.new(),
  )
}

pub fn with_metadata(meeting: Meeting, key: String, value: String) -> Meeting {
  Meeting(..meeting, metadata: dict.insert(meeting.metadata, key, value))
}

pub fn complete_meeting(meeting: Meeting, consensus: String) -> Meeting {
  Meeting(
    ..meeting,
    status: Completed,
    consensus: Some(consensus),
    consensus_at: Some(now()),
  )
}

pub fn cancel_meeting(meeting: Meeting) -> Meeting {
  Meeting(..meeting, status: Cancelled)
}

pub fn is_active(meeting: Meeting) -> Bool {
  meeting.status == Active
}

pub fn is_completed(meeting: Meeting) -> Bool {
  meeting.status == Completed
}

pub fn has_consensus(meeting: Meeting) -> Bool {
  case meeting.consensus {
    Some(_) -> True
    None -> False
  }
}

pub fn new_opinion(
  meeting_id: String,
  author: String,
  perspective: String,
  position: Position,
) -> Opinion {
  Opinion(
    id: generate_id(),
    meeting_id: meeting_id,
    author: author,
    perspective: perspective,
    reasoning: None,
    position: position,
    created_at: now(),
    updated_at: now(),
  )
}

pub fn with_reasoning(opinion: Opinion, reasoning: String) -> Opinion {
  Opinion(..opinion, reasoning: Some(reasoning), updated_at: now())
}

pub fn support() -> Position {
  Support
}

pub fn oppose() -> Position {
  Oppose
}

pub fn neutral() -> Position {
  Neutral
}

pub fn position_to_string(position: Position) -> String {
  case position {
    Support -> "support"
    Oppose -> "oppose"
    Neutral -> "neutral"
  }
}

pub fn position_from_string(s: String) -> Result(Position, MeetingError) {
  case string.lowercase(s) {
    "support" -> Ok(Support)
    "oppose" -> Ok(Oppose)
    "neutral" -> Ok(Neutral)
    _ -> Error(InvalidPosition("Unknown position: " <> s))
  }
}

pub fn status_to_string(status: MeetingStatus) -> String {
  case status {
    Active -> "active"
    Completed -> "completed"
    Cancelled -> "cancelled"
  }
}

pub fn status_from_string(s: String) -> Result(MeetingStatus, MeetingError) {
  case string.lowercase(s) {
    "active" -> Ok(Active)
    "completed" -> Ok(Completed)
    "cancelled" -> Ok(Cancelled)
    _ -> Error(InvalidStatus("Unknown status: " <> s))
  }
}

pub fn count_positions(opinions: List(Opinion)) -> #(Int, Int, Int) {
  let supports = 
    opinions
    |> list.filter(fn(o) { o.position == Support })
    |> list.length()
  
  let opposes = 
    opinions
    |> list.filter(fn(o) { o.position == Oppose })
    |> list.length()
  
  let neutrals = 
    opinions
    |> list.filter(fn(o) { o.position == Neutral })
    |> list.length()
  
  #(supports, opposes, neutrals)
}

pub fn check_consensus(opinions: List(Opinion), threshold: Float) -> Option(Position) {
  let total = list.length(opinions)
  
  case total {
    0 -> None
    _ -> {
      let #(supports, opposes, _neutrals) = count_positions(opinions)
      let support_ratio = int.to_float(supports) /. int.to_float(total)
      let oppose_ratio = int.to_float(opposes) /. int.to_float(total)
      
      case support_ratio >=. threshold {
        True -> Some(Support)
        False -> {
          case oppose_ratio >=. threshold {
            True -> Some(Oppose)
            False -> None
          }
        }
      }
    }
  }
}

pub fn encode_meeting(meeting: Meeting) -> Dict(String, String) {
  dict.from_list([
    #("id", meeting.id),
    #("topic", meeting.topic),
    #("status", status_to_string(meeting.status)),
    #("created_by", meeting.created_by),
    #("created_at", int.to_string(meeting.created_at)),
    #("consensus", option.unwrap(meeting.consensus, "")),
    #("consensus_at", option.unwrap(option.map(meeting.consensus_at, int.to_string), "")),
  ])
}

pub fn decode_meeting(row: Dict(String, String)) -> Result(Meeting, MeetingError) {
  use id <- result.try(dict_get(row, "id"))
  use topic <- result.try(dict_get(row, "topic"))
  use status_str <- result.try(dict_get(row, "status"))
  use status <- result.try(status_from_string(status_str))
  use created_by <- result.try(dict_get(row, "created_by"))
  use created_at_str <- result.try(dict_get(row, "created_at"))
  use created_at <- result.try(parse_int(created_at_str))
  
  let consensus = dict_get_opt(row, "consensus")
  let consensus_at = dict_get_int_opt(row, "consensus_at")
  
  Ok(Meeting(
    id: id,
    topic: topic,
    status: status,
    created_by: created_by,
    created_at: created_at,
    consensus: consensus,
    consensus_at: consensus_at,
    metadata: dict.new(),
  ))
}

pub fn encode_opinion(opinion: Opinion) -> Dict(String, String) {
  dict.from_list([
    #("id", opinion.id),
    #("meeting_id", opinion.meeting_id),
    #("author", opinion.author),
    #("perspective", opinion.perspective),
    #("reasoning", option.unwrap(opinion.reasoning, "")),
    #("position", position_to_string(opinion.position)),
    #("created_at", int.to_string(opinion.created_at)),
    #("updated_at", int.to_string(opinion.updated_at)),
  ])
}

pub fn decode_opinion(row: Dict(String, String)) -> Result(Opinion, MeetingError) {
  use id <- result.try(dict_get(row, "id"))
  use meeting_id <- result.try(dict_get(row, "meeting_id"))
  use author <- result.try(dict_get(row, "author"))
  use perspective <- result.try(dict_get(row, "perspective"))
  use position_str <- result.try(dict_get(row, "position"))
  use position <- result.try(position_from_string(position_str))
  use created_at_str <- result.try(dict_get(row, "created_at"))
  use created_at <- result.try(parse_int(created_at_str))
  use updated_at_str <- result.try(dict_get(row, "updated_at"))
  use updated_at <- result.try(parse_int(updated_at_str))
  
  let reasoning = dict_get_opt(row, "reasoning")
  
  Ok(Opinion(
    id: id,
    meeting_id: meeting_id,
    author: author,
    perspective: perspective,
    reasoning: reasoning,
    position: position,
    created_at: created_at,
    updated_at: updated_at,
  ))
}

fn dict_get(dict: Dict(String, String), key: String) -> Result(String, MeetingError) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> Ok(value)
    _ -> Error(ValidationError("Missing field: " <> key))
  }
}

fn dict_get_opt(dict: Dict(String, String), key: String) -> Option(String) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> Some(value)
    _ -> None
  }
}

fn dict_get_int_opt(dict: Dict(String, String), key: String) -> Option(Int) {
  case dict.get(dict, key) {
    Ok(value) if value != "" -> {
      case int.parse(value) {
        Ok(n) -> Some(n)
        Error(_) -> None
      }
    }
    _ -> None
  }
}

fn parse_int(s: String) -> Result(Int, MeetingError) {
  case int.parse(s) {
    Ok(n) -> Ok(n)
    Error(_) -> Error(ValidationError("Invalid integer: " <> s))
  }
}

@external(javascript, "./meeting_ffi.mjs", "generate_id")
fn generate_id() -> String

@external(javascript, "./meeting_ffi.mjs", "now")
fn now() -> Int
