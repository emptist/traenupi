import gleeunit
import gleeunit/should
import gleam/option.{Some, None}
import traenupi_core/meeting.{Active, Completed, Cancelled, Support, Oppose, Neutral}
import gleam/dict

pub fn main() {
  gleeunit.main()
}

pub fn meeting_decode_valid_test() {
  let row = dict.from_list([
    #("id", "meeting-123"),
    #("topic", "Test Meeting"),
    #("status", "active"),
    #("created_by", "agent-1"),
    #("created_at", "1000000"),
    #("consensus", ""),
    #("consensus_at", ""),
  ])
  
  case meeting.decode_meeting(row) {
    Ok(m) -> {
      should.equal(m.id, "meeting-123")
      should.equal(m.topic, "Test Meeting")
      should.equal(m.status, Active)
      should.equal(m.created_by, "agent-1")
    }
    Error(_) -> should.fail()
  }
}

pub fn meeting_decode_completed_status_test() {
  let row = dict.from_list([
    #("id", "meeting-456"),
    #("topic", "Completed Meeting"),
    #("status", "completed"),
    #("created_by", "agent-2"),
    #("created_at", "1000000"),
    #("consensus", "Agreed on approach"),
    #("consensus_at", "2000000"),
  ])
  
  case meeting.decode_meeting(row) {
    Ok(m) -> {
      should.equal(m.status, Completed)
      should.equal(m.consensus, Some("Agreed on approach"))
    }
    Error(_) -> should.fail()
  }
}

pub fn meeting_decode_cancelled_status_test() {
  let row = dict.from_list([
    #("id", "meeting-789"),
    #("topic", "Cancelled Meeting"),
    #("status", "cancelled"),
    #("created_by", "agent-3"),
    #("created_at", "1000000"),
    #("consensus", ""),
    #("consensus_at", ""),
  ])
  
  case meeting.decode_meeting(row) {
    Ok(m) -> should.equal(m.status, Cancelled)
    Error(_) -> should.fail()
  }
}

pub fn meeting_decode_missing_id_test() {
  let row = dict.from_list([
    #("topic", "No ID"),
    #("status", "active"),
  ])
  
  case meeting.decode_meeting(row) {
    Ok(_) -> should.fail()
    Error(_) -> should.equal(True, True)
  }
}

pub fn meeting_decode_invalid_status_test() {
  let row = dict.from_list([
    #("id", "meeting-bad"),
    #("topic", "Bad Status"),
    #("status", "invalid_status"),
    #("created_by", "agent-1"),
    #("created_at", "1000000"),
    #("consensus", ""),
    #("consensus_at", ""),
  ])
  
  case meeting.decode_meeting(row) {
    Ok(_) -> should.fail()
    Error(_) -> should.equal(True, True)
  }
}

pub fn opinion_decode_valid_test() {
  let row = dict.from_list([
    #("id", "opinion-123"),
    #("meeting_id", "meeting-123"),
    #("author", "agent-1"),
    #("perspective", "I support this approach"),
    #("reasoning", "It's the best option"),
    #("position", "support"),
    #("created_at", "1000000"),
    #("updated_at", "1000000"),
  ])
  
  case meeting.decode_opinion(row) {
    Ok(o) -> {
      should.equal(o.id, "opinion-123")
      should.equal(o.meeting_id, "meeting-123")
      should.equal(o.author, "agent-1")
      should.equal(o.position, Support)
    }
    Error(_) -> should.fail()
  }
}

pub fn opinion_decode_oppose_test() {
  let row = dict.from_list([
    #("id", "opinion-456"),
    #("meeting_id", "meeting-123"),
    #("author", "agent-2"),
    #("perspective", "I oppose this approach"),
    #("reasoning", "It has issues"),
    #("position", "oppose"),
    #("created_at", "1000000"),
    #("updated_at", "1000000"),
  ])
  
  case meeting.decode_opinion(row) {
    Ok(o) -> should.equal(o.position, Oppose)
    Error(_) -> should.fail()
  }
}

pub fn opinion_decode_neutral_test() {
  let row = dict.from_list([
    #("id", "opinion-789"),
    #("meeting_id", "meeting-123"),
    #("author", "agent-3"),
    #("perspective", "I'm neutral"),
    #("reasoning", ""),
    #("position", "neutral"),
    #("created_at", "1000000"),
    #("updated_at", "1000000"),
  ])
  
  case meeting.decode_opinion(row) {
    Ok(o) -> should.equal(o.position, Neutral)
    Error(_) -> should.fail()
  }
}

pub fn meeting_status_conversion_test() {
  should.equal(meeting.status_to_string(Active), "active")
  should.equal(meeting.status_to_string(Completed), "completed")
  should.equal(meeting.status_to_string(Cancelled), "cancelled")
  
  should.equal(meeting.status_from_string("active"), Ok(Active))
  should.equal(meeting.status_from_string("completed"), Ok(Completed))
  should.equal(meeting.status_from_string("cancelled"), Ok(Cancelled))
  should.equal(meeting.status_from_string("invalid"), Error(meeting.InvalidStatus("Unknown status: invalid")))
}

pub fn position_conversion_test() {
  should.equal(meeting.position_to_string(Support), "support")
  should.equal(meeting.position_to_string(Oppose), "oppose")
  should.equal(meeting.position_to_string(Neutral), "neutral")
  
  should.equal(meeting.position_from_string("support"), Ok(Support))
  should.equal(meeting.position_from_string("oppose"), Ok(Oppose))
  should.equal(meeting.position_from_string("neutral"), Ok(Neutral))
  should.equal(meeting.position_from_string("invalid"), Error(meeting.InvalidPosition("Unknown position: invalid")))
}

pub fn meeting_new_test() {
  let m = meeting.new_meeting("Test Topic", "agent-1")
  should.equal(m.topic, "Test Topic")
  should.equal(m.created_by, "agent-1")
  should.equal(m.status, Active)
}

pub fn meeting_complete_test() {
  let m = meeting.new_meeting("Topic", "agent-1")
  let completed = meeting.complete_meeting(m, "Consensus reached")
  
  should.equal(completed.status, Completed)
  should.equal(completed.consensus, Some("Consensus reached"))
}

pub fn meeting_cancel_test() {
  let m = meeting.new_meeting("Topic", "agent-1")
  let cancelled = meeting.cancel_meeting(m)
  
  should.equal(cancelled.status, Cancelled)
}

pub fn opinion_new_test() {
  let o = meeting.new_opinion("meeting-123", "agent-1", "I support this", Support)
  
  should.equal(o.meeting_id, "meeting-123")
  should.equal(o.author, "agent-1")
  should.equal(o.perspective, "I support this")
  should.equal(o.position, Support)
}

pub fn opinion_with_reasoning_test() {
  let o = meeting.new_opinion("meeting-123", "agent-1", "I support this", Support)
  let o = meeting.with_reasoning(o, "Because it's good")
  
  case o.reasoning {
    Some(r) -> should.equal(r, "Because it's good")
    None -> should.fail()
  }
}

pub fn meeting_count_positions_test() {
  let o1 = meeting.new_opinion("m1", "a1", "p1", Support)
  let o2 = meeting.new_opinion("m1", "a2", "p2", Support)
  let o3 = meeting.new_opinion("m1", "a3", "p3", Oppose)
  let o4 = meeting.new_opinion("m1", "a4", "p4", Neutral)
  
  let #(supports, opposes, neutrals) = meeting.count_positions([o1, o2, o3, o4])
  
  should.equal(supports, 2)
  should.equal(opposes, 1)
  should.equal(neutrals, 1)
}

pub fn meeting_check_consensus_test() {
  let o1 = meeting.new_opinion("m1", "a1", "p1", Support)
  let o2 = meeting.new_opinion("m1", "a2", "p2", Support)
  let o3 = meeting.new_opinion("m1", "a3", "p3", Support)
  
  case meeting.check_consensus([o1, o2, o3], 0.6) {
    Some(Support) -> should.equal(True, True)
    _ -> should.fail()
  }
}

pub fn meeting_check_no_consensus_test() {
  let o1 = meeting.new_opinion("m1", "a1", "p1", Support)
  let o2 = meeting.new_opinion("m1", "a2", "p2", Oppose)
  
  case meeting.check_consensus([o1, o2], 0.6) {
    None -> should.equal(True, True)
    _ -> should.fail()
  }
}
