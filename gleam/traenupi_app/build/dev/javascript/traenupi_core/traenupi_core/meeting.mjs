/// <reference types="./meeting.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $result from "../../gleam_stdlib/gleam/result.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import { Ok, Error, toList, CustomType as $CustomType, divideFloat } from "../gleam.mjs";
import { generate_id, now } from "./meeting_ffi.mjs";

export class Active extends $CustomType {}
export const MeetingStatus$Active = () => new Active();
export const MeetingStatus$isActive = (value) => value instanceof Active;

export class Completed extends $CustomType {}
export const MeetingStatus$Completed = () => new Completed();
export const MeetingStatus$isCompleted = (value) => value instanceof Completed;

export class Cancelled extends $CustomType {}
export const MeetingStatus$Cancelled = () => new Cancelled();
export const MeetingStatus$isCancelled = (value) => value instanceof Cancelled;

export class Support extends $CustomType {}
export const Position$Support = () => new Support();
export const Position$isSupport = (value) => value instanceof Support;

export class Oppose extends $CustomType {}
export const Position$Oppose = () => new Oppose();
export const Position$isOppose = (value) => value instanceof Oppose;

export class Neutral extends $CustomType {}
export const Position$Neutral = () => new Neutral();
export const Position$isNeutral = (value) => value instanceof Neutral;

export class Meeting extends $CustomType {
  constructor(id, topic, status, created_by, created_at, consensus, consensus_at, metadata) {
    super();
    this.id = id;
    this.topic = topic;
    this.status = status;
    this.created_by = created_by;
    this.created_at = created_at;
    this.consensus = consensus;
    this.consensus_at = consensus_at;
    this.metadata = metadata;
  }
}
export const Meeting$Meeting = (id, topic, status, created_by, created_at, consensus, consensus_at, metadata) =>
  new Meeting(id,
  topic,
  status,
  created_by,
  created_at,
  consensus,
  consensus_at,
  metadata);
export const Meeting$isMeeting = (value) => value instanceof Meeting;
export const Meeting$Meeting$id = (value) => value.id;
export const Meeting$Meeting$0 = (value) => value.id;
export const Meeting$Meeting$topic = (value) => value.topic;
export const Meeting$Meeting$1 = (value) => value.topic;
export const Meeting$Meeting$status = (value) => value.status;
export const Meeting$Meeting$2 = (value) => value.status;
export const Meeting$Meeting$created_by = (value) => value.created_by;
export const Meeting$Meeting$3 = (value) => value.created_by;
export const Meeting$Meeting$created_at = (value) => value.created_at;
export const Meeting$Meeting$4 = (value) => value.created_at;
export const Meeting$Meeting$consensus = (value) => value.consensus;
export const Meeting$Meeting$5 = (value) => value.consensus;
export const Meeting$Meeting$consensus_at = (value) => value.consensus_at;
export const Meeting$Meeting$6 = (value) => value.consensus_at;
export const Meeting$Meeting$metadata = (value) => value.metadata;
export const Meeting$Meeting$7 = (value) => value.metadata;

export class Opinion extends $CustomType {
  constructor(id, meeting_id, author, perspective, reasoning, position, created_at, updated_at) {
    super();
    this.id = id;
    this.meeting_id = meeting_id;
    this.author = author;
    this.perspective = perspective;
    this.reasoning = reasoning;
    this.position = position;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export const Opinion$Opinion = (id, meeting_id, author, perspective, reasoning, position, created_at, updated_at) =>
  new Opinion(id,
  meeting_id,
  author,
  perspective,
  reasoning,
  position,
  created_at,
  updated_at);
export const Opinion$isOpinion = (value) => value instanceof Opinion;
export const Opinion$Opinion$id = (value) => value.id;
export const Opinion$Opinion$0 = (value) => value.id;
export const Opinion$Opinion$meeting_id = (value) => value.meeting_id;
export const Opinion$Opinion$1 = (value) => value.meeting_id;
export const Opinion$Opinion$author = (value) => value.author;
export const Opinion$Opinion$2 = (value) => value.author;
export const Opinion$Opinion$perspective = (value) => value.perspective;
export const Opinion$Opinion$3 = (value) => value.perspective;
export const Opinion$Opinion$reasoning = (value) => value.reasoning;
export const Opinion$Opinion$4 = (value) => value.reasoning;
export const Opinion$Opinion$position = (value) => value.position;
export const Opinion$Opinion$5 = (value) => value.position;
export const Opinion$Opinion$created_at = (value) => value.created_at;
export const Opinion$Opinion$6 = (value) => value.created_at;
export const Opinion$Opinion$updated_at = (value) => value.updated_at;
export const Opinion$Opinion$7 = (value) => value.updated_at;

export class MeetingNotFound extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const MeetingError$MeetingNotFound = ($0) => new MeetingNotFound($0);
export const MeetingError$isMeetingNotFound = (value) =>
  value instanceof MeetingNotFound;
export const MeetingError$MeetingNotFound$0 = (value) => value[0];

export class InvalidStatus extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const MeetingError$InvalidStatus = ($0) => new InvalidStatus($0);
export const MeetingError$isInvalidStatus = (value) =>
  value instanceof InvalidStatus;
export const MeetingError$InvalidStatus$0 = (value) => value[0];

export class InvalidPosition extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const MeetingError$InvalidPosition = ($0) => new InvalidPosition($0);
export const MeetingError$isInvalidPosition = (value) =>
  value instanceof InvalidPosition;
export const MeetingError$InvalidPosition$0 = (value) => value[0];

export class DatabaseError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const MeetingError$DatabaseError = ($0) => new DatabaseError($0);
export const MeetingError$isDatabaseError = (value) =>
  value instanceof DatabaseError;
export const MeetingError$DatabaseError$0 = (value) => value[0];

export class ValidationError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const MeetingError$ValidationError = ($0) => new ValidationError($0);
export const MeetingError$isValidationError = (value) =>
  value instanceof ValidationError;
export const MeetingError$ValidationError$0 = (value) => value[0];

export class ConsensusNotReached extends $CustomType {}
export const MeetingError$ConsensusNotReached = () => new ConsensusNotReached();
export const MeetingError$isConsensusNotReached = (value) =>
  value instanceof ConsensusNotReached;

export function with_metadata(meeting, key, value) {
  return new Meeting(
    meeting.id,
    meeting.topic,
    meeting.status,
    meeting.created_by,
    meeting.created_at,
    meeting.consensus,
    meeting.consensus_at,
    $dict.insert(meeting.metadata, key, value),
  );
}

export function cancel_meeting(meeting) {
  return new Meeting(
    meeting.id,
    meeting.topic,
    new Cancelled(),
    meeting.created_by,
    meeting.created_at,
    meeting.consensus,
    meeting.consensus_at,
    meeting.metadata,
  );
}

export function is_active(meeting) {
  return meeting.status instanceof Active;
}

export function is_completed(meeting) {
  return meeting.status instanceof Completed;
}

export function has_consensus(meeting) {
  let $ = meeting.consensus;
  if ($ instanceof Some) {
    return true;
  } else {
    return false;
  }
}

export function support() {
  return new Support();
}

export function oppose() {
  return new Oppose();
}

export function neutral() {
  return new Neutral();
}

export function position_to_string(position) {
  if (position instanceof Support) {
    return "support";
  } else if (position instanceof Oppose) {
    return "oppose";
  } else {
    return "neutral";
  }
}

export function position_from_string(s) {
  let $ = $string.lowercase(s);
  if ($ === "support") {
    return new Ok(new Support());
  } else if ($ === "oppose") {
    return new Ok(new Oppose());
  } else if ($ === "neutral") {
    return new Ok(new Neutral());
  } else {
    return new Error(new InvalidPosition("Unknown position: " + s));
  }
}

export function status_to_string(status) {
  if (status instanceof Active) {
    return "active";
  } else if (status instanceof Completed) {
    return "completed";
  } else {
    return "cancelled";
  }
}

export function status_from_string(s) {
  let $ = $string.lowercase(s);
  if ($ === "active") {
    return new Ok(new Active());
  } else if ($ === "completed") {
    return new Ok(new Completed());
  } else if ($ === "cancelled") {
    return new Ok(new Cancelled());
  } else {
    return new Error(new InvalidStatus("Unknown status: " + s));
  }
}

export function count_positions(opinions) {
  let _block;
  let _pipe = opinions;
  let _pipe$1 = $list.filter(
    _pipe,
    (o) => { return o.position instanceof Support; },
  );
  _block = $list.length(_pipe$1);
  let supports = _block;
  let _block$1;
  let _pipe$2 = opinions;
  let _pipe$3 = $list.filter(
    _pipe$2,
    (o) => { return o.position instanceof Oppose; },
  );
  _block$1 = $list.length(_pipe$3);
  let opposes = _block$1;
  let _block$2;
  let _pipe$4 = opinions;
  let _pipe$5 = $list.filter(
    _pipe$4,
    (o) => { return o.position instanceof Neutral; },
  );
  _block$2 = $list.length(_pipe$5);
  let neutrals = _block$2;
  return [supports, opposes, neutrals];
}

export function check_consensus(opinions, threshold) {
  let total = $list.length(opinions);
  if (total === 0) {
    return new None();
  } else {
    let $ = count_positions(opinions);
    let supports;
    let opposes;
    supports = $[0];
    opposes = $[1];
    let support_ratio = divideFloat(
      $int.to_float(supports),
      $int.to_float(total)
    );
    let oppose_ratio = divideFloat($int.to_float(opposes), $int.to_float(total));
    let $1 = support_ratio >= threshold;
    if ($1) {
      return new Some(new Support());
    } else {
      let $2 = oppose_ratio >= threshold;
      if ($2) {
        return new Some(new Oppose());
      } else {
        return new None();
      }
    }
  }
}

export function encode_meeting(meeting) {
  return $dict.from_list(
    toList([
      ["id", meeting.id],
      ["topic", meeting.topic],
      ["status", status_to_string(meeting.status)],
      ["created_by", meeting.created_by],
      ["created_at", $int.to_string(meeting.created_at)],
      ["consensus", $option.unwrap(meeting.consensus, "")],
      [
        "consensus_at",
        $option.unwrap($option.map(meeting.consensus_at, $int.to_string), ""),
      ],
    ]),
  );
}

export function encode_opinion(opinion) {
  return $dict.from_list(
    toList([
      ["id", opinion.id],
      ["meeting_id", opinion.meeting_id],
      ["author", opinion.author],
      ["perspective", opinion.perspective],
      ["reasoning", $option.unwrap(opinion.reasoning, "")],
      ["position", position_to_string(opinion.position)],
      ["created_at", $int.to_string(opinion.created_at)],
      ["updated_at", $int.to_string(opinion.updated_at)],
    ]),
  );
}

function dict_get(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      return $;
    } else {
      return new Error(new ValidationError("Missing field: " + key));
    }
  } else {
    return new Error(new ValidationError("Missing field: " + key));
  }
}

function dict_get_opt(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      return new Some(value);
    } else {
      return new None();
    }
  } else {
    return new None();
  }
}

function dict_get_int_opt(dict, key) {
  let $ = $dict.get(dict, key);
  if ($ instanceof Ok) {
    let value = $[0];
    if (value !== "") {
      let $1 = $int.parse(value);
      if ($1 instanceof Ok) {
        let n = $1[0];
        return new Some(n);
      } else {
        return new None();
      }
    } else {
      return new None();
    }
  } else {
    return new None();
  }
}

function parse_int(s) {
  let $ = $int.parse(s);
  if ($ instanceof Ok) {
    return $;
  } else {
    return new Error(new ValidationError("Invalid integer: " + s));
  }
}

export function decode_meeting(row) {
  return $result.try$(
    dict_get(row, "id"),
    (id) => {
      return $result.try$(
        dict_get(row, "topic"),
        (topic) => {
          return $result.try$(
            dict_get(row, "status"),
            (status_str) => {
              return $result.try$(
                status_from_string(status_str),
                (status) => {
                  return $result.try$(
                    dict_get(row, "created_by"),
                    (created_by) => {
                      return $result.try$(
                        dict_get(row, "created_at"),
                        (created_at_str) => {
                          return $result.try$(
                            parse_int(created_at_str),
                            (created_at) => {
                              let consensus = dict_get_opt(row, "consensus");
                              let consensus_at = dict_get_int_opt(
                                row,
                                "consensus_at",
                              );
                              return new Ok(
                                new Meeting(
                                  id,
                                  topic,
                                  status,
                                  created_by,
                                  created_at,
                                  consensus,
                                  consensus_at,
                                  $dict.new$(),
                                ),
                              );
                            },
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
}

export function decode_opinion(row) {
  return $result.try$(
    dict_get(row, "id"),
    (id) => {
      return $result.try$(
        dict_get(row, "meeting_id"),
        (meeting_id) => {
          return $result.try$(
            dict_get(row, "author"),
            (author) => {
              return $result.try$(
                dict_get(row, "perspective"),
                (perspective) => {
                  return $result.try$(
                    dict_get(row, "position"),
                    (position_str) => {
                      return $result.try$(
                        position_from_string(position_str),
                        (position) => {
                          return $result.try$(
                            dict_get(row, "created_at"),
                            (created_at_str) => {
                              return $result.try$(
                                parse_int(created_at_str),
                                (created_at) => {
                                  return $result.try$(
                                    dict_get(row, "updated_at"),
                                    (updated_at_str) => {
                                      return $result.try$(
                                        parse_int(updated_at_str),
                                        (updated_at) => {
                                          let reasoning = dict_get_opt(
                                            row,
                                            "reasoning",
                                          );
                                          return new Ok(
                                            new Opinion(
                                              id,
                                              meeting_id,
                                              author,
                                              perspective,
                                              reasoning,
                                              position,
                                              created_at,
                                              updated_at,
                                            ),
                                          );
                                        },
                                      );
                                    },
                                  );
                                },
                              );
                            },
                          );
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    },
  );
}

export function new_meeting(topic, created_by) {
  return new Meeting(
    generate_id(),
    topic,
    new Active(),
    created_by,
    now(),
    new None(),
    new None(),
    $dict.new$(),
  );
}

export function complete_meeting(meeting, consensus) {
  return new Meeting(
    meeting.id,
    meeting.topic,
    new Completed(),
    meeting.created_by,
    meeting.created_at,
    new Some(consensus),
    new Some(now()),
    meeting.metadata,
  );
}

export function new_opinion(meeting_id, author, perspective, position) {
  return new Opinion(
    generate_id(),
    meeting_id,
    author,
    perspective,
    new None(),
    position,
    now(),
    now(),
  );
}

export function with_reasoning(opinion, reasoning) {
  return new Opinion(
    opinion.id,
    opinion.meeting_id,
    opinion.author,
    opinion.perspective,
    new Some(reasoning),
    opinion.position,
    opinion.created_at,
    now(),
  );
}
