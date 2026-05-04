import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class Active extends _.CustomType {}
export function MeetingStatus$Active(): MeetingStatus$;
export function MeetingStatus$isActive(value: MeetingStatus$): boolean;

export class Completed extends _.CustomType {}
export function MeetingStatus$Completed(): MeetingStatus$;
export function MeetingStatus$isCompleted(value: MeetingStatus$): boolean;

export class Cancelled extends _.CustomType {}
export function MeetingStatus$Cancelled(): MeetingStatus$;
export function MeetingStatus$isCancelled(value: MeetingStatus$): boolean;

export type MeetingStatus$ = Active | Completed | Cancelled;

export class Support extends _.CustomType {}
export function Position$Support(): Position$;
export function Position$isSupport(value: Position$): boolean;

export class Oppose extends _.CustomType {}
export function Position$Oppose(): Position$;
export function Position$isOppose(value: Position$): boolean;

export class Neutral extends _.CustomType {}
export function Position$Neutral(): Position$;
export function Position$isNeutral(value: Position$): boolean;

export type Position$ = Support | Oppose | Neutral;

export class Meeting extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    topic: string,
    status: MeetingStatus$,
    created_by: string,
    created_at: number,
    consensus: $option.Option$<string>,
    consensus_at: $option.Option$<number>,
    metadata: $dict.Dict$<string, string>
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  topic: string;
  /** @deprecated */
  status: MeetingStatus$;
  /** @deprecated */
  created_by: string;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  consensus: $option.Option$<string>;
  /** @deprecated */
  consensus_at: $option.Option$<number>;
  /** @deprecated */
  metadata: $dict.Dict$<string, string>;
}
export function Meeting$Meeting(
  id: string,
  topic: string,
  status: MeetingStatus$,
  created_by: string,
  created_at: number,
  consensus: $option.Option$<string>,
  consensus_at: $option.Option$<number>,
  metadata: $dict.Dict$<string, string>,
): Meeting$;
export function Meeting$isMeeting(value: Meeting$): boolean;
export function Meeting$Meeting$0(value: Meeting$): string;
export function Meeting$Meeting$id(value: Meeting$): string;
export function Meeting$Meeting$1(value: Meeting$): string;
export function Meeting$Meeting$topic(value: Meeting$): string;
export function Meeting$Meeting$2(value: Meeting$): MeetingStatus$;
export function Meeting$Meeting$status(value: Meeting$): MeetingStatus$;
export function Meeting$Meeting$3(value: Meeting$): string;
export function Meeting$Meeting$created_by(value: Meeting$): string;
export function Meeting$Meeting$4(value: Meeting$): number;
export function Meeting$Meeting$created_at(value: Meeting$): number;
export function Meeting$Meeting$5(value: Meeting$): $option.Option$<string>;
export function Meeting$Meeting$consensus(value: Meeting$): $option.Option$<
  string
>;
export function Meeting$Meeting$6(value: Meeting$): $option.Option$<number>;
export function Meeting$Meeting$consensus_at(value: Meeting$): $option.Option$<
  number
>;
export function Meeting$Meeting$7(value: Meeting$): $dict.Dict$<string, string>;
export function Meeting$Meeting$metadata(value: Meeting$): $dict.Dict$<
  string,
  string
>;

export type Meeting$ = Meeting;

export class Opinion extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    meeting_id: string,
    author: string,
    perspective: string,
    reasoning: $option.Option$<string>,
    position: Position$,
    created_at: number,
    updated_at: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  meeting_id: string;
  /** @deprecated */
  author: string;
  /** @deprecated */
  perspective: string;
  /** @deprecated */
  reasoning: $option.Option$<string>;
  /** @deprecated */
  position: Position$;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  updated_at: number;
}
export function Opinion$Opinion(
  id: string,
  meeting_id: string,
  author: string,
  perspective: string,
  reasoning: $option.Option$<string>,
  position: Position$,
  created_at: number,
  updated_at: number,
): Opinion$;
export function Opinion$isOpinion(value: Opinion$): boolean;
export function Opinion$Opinion$0(value: Opinion$): string;
export function Opinion$Opinion$id(value: Opinion$): string;
export function Opinion$Opinion$1(value: Opinion$): string;
export function Opinion$Opinion$meeting_id(value: Opinion$): string;
export function Opinion$Opinion$2(value: Opinion$): string;
export function Opinion$Opinion$author(value: Opinion$): string;
export function Opinion$Opinion$3(value: Opinion$): string;
export function Opinion$Opinion$perspective(value: Opinion$): string;
export function Opinion$Opinion$4(value: Opinion$): $option.Option$<string>;
export function Opinion$Opinion$reasoning(value: Opinion$): $option.Option$<
  string
>;
export function Opinion$Opinion$5(value: Opinion$): Position$;
export function Opinion$Opinion$position(value: Opinion$): Position$;
export function Opinion$Opinion$6(value: Opinion$): number;
export function Opinion$Opinion$created_at(value: Opinion$): number;
export function Opinion$Opinion$7(value: Opinion$): number;
export function Opinion$Opinion$updated_at(value: Opinion$): number;

export type Opinion$ = Opinion;

export class MeetingNotFound extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function MeetingError$MeetingNotFound($0: string): MeetingError$;
export function MeetingError$isMeetingNotFound(value: MeetingError$): boolean;
export function MeetingError$MeetingNotFound$0(value: MeetingError$): string;

export class InvalidStatus extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function MeetingError$InvalidStatus($0: string): MeetingError$;
export function MeetingError$isInvalidStatus(value: MeetingError$): boolean;
export function MeetingError$InvalidStatus$0(value: MeetingError$): string;

export class InvalidPosition extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function MeetingError$InvalidPosition($0: string): MeetingError$;
export function MeetingError$isInvalidPosition(value: MeetingError$): boolean;
export function MeetingError$InvalidPosition$0(value: MeetingError$): string;

export class DatabaseError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function MeetingError$DatabaseError($0: string): MeetingError$;
export function MeetingError$isDatabaseError(value: MeetingError$): boolean;
export function MeetingError$DatabaseError$0(value: MeetingError$): string;

export class ValidationError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function MeetingError$ValidationError($0: string): MeetingError$;
export function MeetingError$isValidationError(value: MeetingError$): boolean;
export function MeetingError$ValidationError$0(value: MeetingError$): string;

export class ConsensusNotReached extends _.CustomType {}
export function MeetingError$ConsensusNotReached(): MeetingError$;
export function MeetingError$isConsensusNotReached(
  value: MeetingError$,
): boolean;

export type MeetingError$ = MeetingNotFound | InvalidStatus | InvalidPosition | DatabaseError | ValidationError | ConsensusNotReached;

export function with_metadata(meeting: Meeting$, key: string, value: string): Meeting$;

export function cancel_meeting(meeting: Meeting$): Meeting$;

export function is_active(meeting: Meeting$): boolean;

export function is_completed(meeting: Meeting$): boolean;

export function has_consensus(meeting: Meeting$): boolean;

export function support(): Position$;

export function oppose(): Position$;

export function neutral(): Position$;

export function position_to_string(position: Position$): string;

export function position_from_string(s: string): _.Result<
  Position$,
  MeetingError$
>;

export function status_to_string(status: MeetingStatus$): string;

export function status_from_string(s: string): _.Result<
  MeetingStatus$,
  MeetingError$
>;

export function count_positions(opinions: _.List<Opinion$>): [
  number,
  number,
  number
];

export function check_consensus(opinions: _.List<Opinion$>, threshold: number): $option.Option$<
  Position$
>;

export function encode_meeting(meeting: Meeting$): $dict.Dict$<string, string>;

export function encode_opinion(opinion: Opinion$): $dict.Dict$<string, string>;

export function decode_meeting(row: $dict.Dict$<string, string>): _.Result<
  Meeting$,
  MeetingError$
>;

export function decode_opinion(row: $dict.Dict$<string, string>): _.Result<
  Opinion$,
  MeetingError$
>;

export function new_meeting(topic: string, created_by: string): Meeting$;

export function complete_meeting(meeting: Meeting$, consensus: string): Meeting$;

export function new_opinion(
  meeting_id: string,
  author: string,
  perspective: string,
  position: Position$
): Opinion$;

export function with_reasoning(opinion: Opinion$, reasoning: string): Opinion$;
