import type * as $dict from "../../gleam_stdlib/gleam/dict.d.mts";
import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class TaskCompletion extends _.CustomType {}
export function ReflectionType$TaskCompletion(): ReflectionType$;
export function ReflectionType$isTaskCompletion(
  value: ReflectionType$,
): boolean;

export class CodeReview extends _.CustomType {}
export function ReflectionType$CodeReview(): ReflectionType$;
export function ReflectionType$isCodeReview(value: ReflectionType$): boolean;

export class LearningReflection extends _.CustomType {}
export function ReflectionType$LearningReflection(): ReflectionType$;
export function ReflectionType$isLearningReflection(
  value: ReflectionType$,
): boolean;

export class IssueReflection extends _.CustomType {}
export function ReflectionType$IssueReflection(): ReflectionType$;
export function ReflectionType$isIssueReflection(
  value: ReflectionType$,
): boolean;

export class Improvement extends _.CustomType {}
export function ReflectionType$Improvement(): ReflectionType$;
export function ReflectionType$isImprovement(value: ReflectionType$): boolean;

export class Question extends _.CustomType {}
export function ReflectionType$Question(): ReflectionType$;
export function ReflectionType$isQuestion(value: ReflectionType$): boolean;

export type ReflectionType$ = TaskCompletion | CodeReview | LearningReflection | IssueReflection | Improvement | Question;

export class Positive extends _.CustomType {}
export function Sentiment$Positive(): Sentiment$;
export function Sentiment$isPositive(value: Sentiment$): boolean;

export class Negative extends _.CustomType {}
export function Sentiment$Negative(): Sentiment$;
export function Sentiment$isNegative(value: Sentiment$): boolean;

export class Neutral extends _.CustomType {}
export function Sentiment$Neutral(): Sentiment$;
export function Sentiment$isNeutral(value: Sentiment$): boolean;

export class Mixed extends _.CustomType {}
export function Sentiment$Mixed(): Sentiment$;
export function Sentiment$isMixed(value: Sentiment$): boolean;

export type Sentiment$ = Positive | Negative | Neutral | Mixed;

export class Critical extends _.CustomType {}
export function Severity$Critical(): Severity$;
export function Severity$isCritical(value: Severity$): boolean;

export class High extends _.CustomType {}
export function Severity$High(): Severity$;
export function Severity$isHigh(value: Severity$): boolean;

export class Medium extends _.CustomType {}
export function Severity$Medium(): Severity$;
export function Severity$isMedium(value: Severity$): boolean;

export class Low extends _.CustomType {}
export function Severity$Low(): Severity$;
export function Severity$isLow(value: Severity$): boolean;

export type Severity$ = Critical | High | Medium | Low;

export class Learning extends _.CustomType {
  /** @deprecated */
  constructor(topic: string, reminder: string);
  /** @deprecated */
  topic: string;
  /** @deprecated */
  reminder: string;
}
export function Learning$Learning(topic: string, reminder: string): Learning$;
export function Learning$isLearning(value: Learning$): boolean;
export function Learning$Learning$0(value: Learning$): string;
export function Learning$Learning$topic(value: Learning$): string;
export function Learning$Learning$1(value: Learning$): string;
export function Learning$Learning$reminder(value: Learning$): string;

export type Learning$ = Learning;

export class IssueItem extends _.CustomType {
  /** @deprecated */
  constructor(severity: Severity$, location: string, description: string);
  /** @deprecated */
  severity: Severity$;
  /** @deprecated */
  location: string;
  /** @deprecated */
  description: string;
}
export function IssueItem$IssueItem(
  severity: Severity$,
  location: string,
  description: string,
): IssueItem$;
export function IssueItem$isIssueItem(value: IssueItem$): boolean;
export function IssueItem$IssueItem$0(value: IssueItem$): Severity$;
export function IssueItem$IssueItem$severity(value: IssueItem$): Severity$;
export function IssueItem$IssueItem$1(value: IssueItem$): string;
export function IssueItem$IssueItem$location(value: IssueItem$): string;
export function IssueItem$IssueItem$2(value: IssueItem$): string;
export function IssueItem$IssueItem$description(value: IssueItem$): string;

export type IssueItem$ = IssueItem;

export class Suggestion extends _.CustomType {
  /** @deprecated */
  constructor(priority: number, area: string, description: string);
  /** @deprecated */
  priority: number;
  /** @deprecated */
  area: string;
  /** @deprecated */
  description: string;
}
export function Suggestion$Suggestion(
  priority: number,
  area: string,
  description: string,
): Suggestion$;
export function Suggestion$isSuggestion(value: Suggestion$): boolean;
export function Suggestion$Suggestion$0(value: Suggestion$): number;
export function Suggestion$Suggestion$priority(value: Suggestion$): number;
export function Suggestion$Suggestion$1(value: Suggestion$): string;
export function Suggestion$Suggestion$area(value: Suggestion$): string;
export function Suggestion$Suggestion$2(value: Suggestion$): string;
export function Suggestion$Suggestion$description(value: Suggestion$): string;

export type Suggestion$ = Suggestion;

export class Praise extends _.CustomType {
  /** @deprecated */
  constructor(area: string, description: string);
  /** @deprecated */
  area: string;
  /** @deprecated */
  description: string;
}
export function Praise$Praise(area: string, description: string): Praise$;
export function Praise$isPraise(value: Praise$): boolean;
export function Praise$Praise$0(value: Praise$): string;
export function Praise$Praise$area(value: Praise$): string;
export function Praise$Praise$1(value: Praise$): string;
export function Praise$Praise$description(value: Praise$): string;

export type Praise$ = Praise;

export class Reflection extends _.CustomType {
  /** @deprecated */
  constructor(
    id: string,
    task_id: $option.Option$<string>,
    summary: string,
    learnings: _.List<Learning$>,
    issues: _.List<IssueItem$>,
    suggestions: _.List<Suggestion$>,
    praise: _.List<Praise$>,
    overall_score: $option.Option$<number>,
    code_quality_score: $option.Option$<number>,
    test_coverage_score: $option.Option$<number>,
    documentation_score: $option.Option$<number>,
    agent_id: string,
    session_id: $option.Option$<string>,
    task_title: $option.Option$<string>,
    task_result: $option.Option$<string>,
    raw_response: $option.Option$<string>,
    reflection_type: ReflectionType$,
    sentiment: $option.Option$<Sentiment$>,
    created_at: number,
    updated_at: number
  );
  /** @deprecated */
  id: string;
  /** @deprecated */
  task_id: $option.Option$<string>;
  /** @deprecated */
  summary: string;
  /** @deprecated */
  learnings: _.List<Learning$>;
  /** @deprecated */
  issues: _.List<IssueItem$>;
  /** @deprecated */
  suggestions: _.List<Suggestion$>;
  /** @deprecated */
  praise: _.List<Praise$>;
  /** @deprecated */
  overall_score: $option.Option$<number>;
  /** @deprecated */
  code_quality_score: $option.Option$<number>;
  /** @deprecated */
  test_coverage_score: $option.Option$<number>;
  /** @deprecated */
  documentation_score: $option.Option$<number>;
  /** @deprecated */
  agent_id: string;
  /** @deprecated */
  session_id: $option.Option$<string>;
  /** @deprecated */
  task_title: $option.Option$<string>;
  /** @deprecated */
  task_result: $option.Option$<string>;
  /** @deprecated */
  raw_response: $option.Option$<string>;
  /** @deprecated */
  reflection_type: ReflectionType$;
  /** @deprecated */
  sentiment: $option.Option$<Sentiment$>;
  /** @deprecated */
  created_at: number;
  /** @deprecated */
  updated_at: number;
}
export function Reflection$Reflection(
  id: string,
  task_id: $option.Option$<string>,
  summary: string,
  learnings: _.List<Learning$>,
  issues: _.List<IssueItem$>,
  suggestions: _.List<Suggestion$>,
  praise: _.List<Praise$>,
  overall_score: $option.Option$<number>,
  code_quality_score: $option.Option$<number>,
  test_coverage_score: $option.Option$<number>,
  documentation_score: $option.Option$<number>,
  agent_id: string,
  session_id: $option.Option$<string>,
  task_title: $option.Option$<string>,
  task_result: $option.Option$<string>,
  raw_response: $option.Option$<string>,
  reflection_type: ReflectionType$,
  sentiment: $option.Option$<Sentiment$>,
  created_at: number,
  updated_at: number,
): Reflection$;
export function Reflection$isReflection(value: Reflection$): boolean;
export function Reflection$Reflection$0(value: Reflection$): string;
export function Reflection$Reflection$id(value: Reflection$): string;
export function Reflection$Reflection$1(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$task_id(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$2(value: Reflection$): string;
export function Reflection$Reflection$summary(value: Reflection$): string;
export function Reflection$Reflection$3(value: Reflection$): _.List<Learning$>;
export function Reflection$Reflection$learnings(value: Reflection$): _.List<
  Learning$
>;
export function Reflection$Reflection$4(value: Reflection$): _.List<IssueItem$>;
export function Reflection$Reflection$issues(value: Reflection$): _.List<
  IssueItem$
>;
export function Reflection$Reflection$5(value: Reflection$): _.List<Suggestion$>;
export function Reflection$Reflection$suggestions(
  value: Reflection$,
): _.List<Suggestion$>;
export function Reflection$Reflection$6(value: Reflection$): _.List<Praise$>;
export function Reflection$Reflection$praise(value: Reflection$): _.List<
  Praise$
>;
export function Reflection$Reflection$7(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$overall_score(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$8(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$code_quality_score(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$9(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$test_coverage_score(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$10(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$documentation_score(value: Reflection$): $option.Option$<
  number
>;
export function Reflection$Reflection$11(value: Reflection$): string;
export function Reflection$Reflection$agent_id(value: Reflection$): string;
export function Reflection$Reflection$12(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$session_id(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$13(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$task_title(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$14(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$task_result(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$15(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$raw_response(value: Reflection$): $option.Option$<
  string
>;
export function Reflection$Reflection$16(value: Reflection$): ReflectionType$;
export function Reflection$Reflection$reflection_type(value: Reflection$): ReflectionType$;
export function Reflection$Reflection$17(
  value: Reflection$,
): $option.Option$<Sentiment$>;
export function Reflection$Reflection$sentiment(value: Reflection$): $option.Option$<
  Sentiment$
>;
export function Reflection$Reflection$18(value: Reflection$): number;
export function Reflection$Reflection$created_at(value: Reflection$): number;
export function Reflection$Reflection$19(value: Reflection$): number;
export function Reflection$Reflection$updated_at(value: Reflection$): number;

export type Reflection$ = Reflection;

export class ReflectionNotFound extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function ReflectionError$ReflectionNotFound(
  $0: string,
): ReflectionError$;
export function ReflectionError$isReflectionNotFound(
  value: ReflectionError$,
): boolean;
export function ReflectionError$ReflectionNotFound$0(value: ReflectionError$): string;

export class InvalidScore extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: number);
  /** @deprecated */
  0: number;
}
export function ReflectionError$InvalidScore($0: number): ReflectionError$;
export function ReflectionError$isInvalidScore(
  value: ReflectionError$,
): boolean;
export function ReflectionError$InvalidScore$0(value: ReflectionError$): number;

export class DatabaseError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function ReflectionError$DatabaseError($0: string): ReflectionError$;
export function ReflectionError$isDatabaseError(
  value: ReflectionError$,
): boolean;
export function ReflectionError$DatabaseError$0(value: ReflectionError$): string;

export class ValidationError extends _.CustomType {
  /** @deprecated */
  constructor(argument$0: string);
  /** @deprecated */
  0: string;
}
export function ReflectionError$ValidationError($0: string): ReflectionError$;
export function ReflectionError$isValidationError(
  value: ReflectionError$,
): boolean;
export function ReflectionError$ValidationError$0(value: ReflectionError$): string;

export type ReflectionError$ = ReflectionNotFound | InvalidScore | DatabaseError | ValidationError;

export class ReflectionStore extends _.CustomType {
  /** @deprecated */
  constructor(reflections: $dict.Dict$<string, Reflection$>);
  /** @deprecated */
  reflections: $dict.Dict$<string, Reflection$>;
}
export function ReflectionStore$ReflectionStore(
  reflections: $dict.Dict$<string, Reflection$>,
): ReflectionStore$;
export function ReflectionStore$isReflectionStore(
  value: ReflectionStore$,
): boolean;
export function ReflectionStore$ReflectionStore$0(value: ReflectionStore$): $dict.Dict$<
  string,
  Reflection$
>;
export function ReflectionStore$ReflectionStore$reflections(value: ReflectionStore$): $dict.Dict$<
  string,
  Reflection$
>;

export type ReflectionStore$ = ReflectionStore;

export function with_task(
  reflection: Reflection$,
  task_id: string,
  task_title: string
): Reflection$;

export function with_session(reflection: Reflection$, session_id: string): Reflection$;

export function with_learning(
  reflection: Reflection$,
  topic: string,
  reminder: string
): Reflection$;

export function with_issue(
  reflection: Reflection$,
  severity: Severity$,
  location: string,
  description: string
): Reflection$;

export function with_suggestion(
  reflection: Reflection$,
  priority: number,
  area: string,
  description: string
): Reflection$;

export function with_praise(
  reflection: Reflection$,
  area: string,
  description: string
): Reflection$;

export function with_type(reflection: Reflection$, type_: ReflectionType$): Reflection$;

export function with_sentiment(reflection: Reflection$, sentiment: Sentiment$): Reflection$;

export function with_raw_response(reflection: Reflection$, response: string): Reflection$;

export function with_scores(
  reflection: Reflection$,
  overall: number,
  code_quality: number,
  test_coverage: number,
  documentation: number
): _.Result<Reflection$, ReflectionError$>;

export function new_store(): ReflectionStore$;

export function store_reflection(
  store: ReflectionStore$,
  reflection: Reflection$
): ReflectionStore$;

export function get_reflection(store: ReflectionStore$, id: string): $option.Option$<
  Reflection$
>;

export function get_all_reflections(store: ReflectionStore$): _.List<
  Reflection$
>;

export function get_reflections_by_agent(
  store: ReflectionStore$,
  agent_id: string
): _.List<Reflection$>;

export function get_reflections_by_task(
  store: ReflectionStore$,
  task_id: string
): _.List<Reflection$>;

export function get_recent_reflections(store: ReflectionStore$, since: number): _.List<
  Reflection$
>;

export function get_high_priority_issues(store: ReflectionStore$): _.List<
  IssueItem$
>;

export function get_all_learnings(store: ReflectionStore$): _.List<Learning$>;

export function count_reflections(store: ReflectionStore$): number;

export function get_average_score(store: ReflectionStore$): number;

export function reflection_type_to_string(type_: ReflectionType$): string;

export function get_reflections_by_type(
  store: ReflectionStore$,
  type_: ReflectionType$
): _.List<Reflection$>;

export function reflection_type_from_string(str: string): $option.Option$<
  ReflectionType$
>;

export function sentiment_to_string(sentiment: Sentiment$): string;

export function sentiment_from_string(str: string): $option.Option$<Sentiment$>;

export function severity_to_string(severity: Severity$): string;

export function severity_from_string(str: string): $option.Option$<Severity$>;

export function analyze_patterns(store: ReflectionStore$): $dict.Dict$<
  string,
  number
>;

export function export_to_json(reflection: Reflection$): string;

export function new_reflection(summary: string, agent_id: string): Reflection$;
