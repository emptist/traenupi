/// <reference types="./reflection.d.mts" />
import * as $dict from "../../gleam_stdlib/gleam/dict.mjs";
import * as $int from "../../gleam_stdlib/gleam/int.mjs";
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $result from "../../gleam_stdlib/gleam/result.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import {
  Ok,
  Error,
  toList,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideFloat,
} from "../gleam.mjs";
import { now, generate_uuid } from "./reflection_ffi.mjs";

export class TaskCompletion extends $CustomType {}
export const ReflectionType$TaskCompletion = () => new TaskCompletion();
export const ReflectionType$isTaskCompletion = (value) =>
  value instanceof TaskCompletion;

export class CodeReview extends $CustomType {}
export const ReflectionType$CodeReview = () => new CodeReview();
export const ReflectionType$isCodeReview = (value) =>
  value instanceof CodeReview;

export class LearningReflection extends $CustomType {}
export const ReflectionType$LearningReflection = () => new LearningReflection();
export const ReflectionType$isLearningReflection = (value) =>
  value instanceof LearningReflection;

export class IssueReflection extends $CustomType {}
export const ReflectionType$IssueReflection = () => new IssueReflection();
export const ReflectionType$isIssueReflection = (value) =>
  value instanceof IssueReflection;

export class Improvement extends $CustomType {}
export const ReflectionType$Improvement = () => new Improvement();
export const ReflectionType$isImprovement = (value) =>
  value instanceof Improvement;

export class Question extends $CustomType {}
export const ReflectionType$Question = () => new Question();
export const ReflectionType$isQuestion = (value) => value instanceof Question;

export class Positive extends $CustomType {}
export const Sentiment$Positive = () => new Positive();
export const Sentiment$isPositive = (value) => value instanceof Positive;

export class Negative extends $CustomType {}
export const Sentiment$Negative = () => new Negative();
export const Sentiment$isNegative = (value) => value instanceof Negative;

export class Neutral extends $CustomType {}
export const Sentiment$Neutral = () => new Neutral();
export const Sentiment$isNeutral = (value) => value instanceof Neutral;

export class Mixed extends $CustomType {}
export const Sentiment$Mixed = () => new Mixed();
export const Sentiment$isMixed = (value) => value instanceof Mixed;

export class Critical extends $CustomType {}
export const Severity$Critical = () => new Critical();
export const Severity$isCritical = (value) => value instanceof Critical;

export class High extends $CustomType {}
export const Severity$High = () => new High();
export const Severity$isHigh = (value) => value instanceof High;

export class Medium extends $CustomType {}
export const Severity$Medium = () => new Medium();
export const Severity$isMedium = (value) => value instanceof Medium;

export class Low extends $CustomType {}
export const Severity$Low = () => new Low();
export const Severity$isLow = (value) => value instanceof Low;

export class Learning extends $CustomType {
  constructor(topic, reminder) {
    super();
    this.topic = topic;
    this.reminder = reminder;
  }
}
export const Learning$Learning = (topic, reminder) =>
  new Learning(topic, reminder);
export const Learning$isLearning = (value) => value instanceof Learning;
export const Learning$Learning$topic = (value) => value.topic;
export const Learning$Learning$0 = (value) => value.topic;
export const Learning$Learning$reminder = (value) => value.reminder;
export const Learning$Learning$1 = (value) => value.reminder;

export class IssueItem extends $CustomType {
  constructor(severity, location, description) {
    super();
    this.severity = severity;
    this.location = location;
    this.description = description;
  }
}
export const IssueItem$IssueItem = (severity, location, description) =>
  new IssueItem(severity, location, description);
export const IssueItem$isIssueItem = (value) => value instanceof IssueItem;
export const IssueItem$IssueItem$severity = (value) => value.severity;
export const IssueItem$IssueItem$0 = (value) => value.severity;
export const IssueItem$IssueItem$location = (value) => value.location;
export const IssueItem$IssueItem$1 = (value) => value.location;
export const IssueItem$IssueItem$description = (value) => value.description;
export const IssueItem$IssueItem$2 = (value) => value.description;

export class Suggestion extends $CustomType {
  constructor(priority, area, description) {
    super();
    this.priority = priority;
    this.area = area;
    this.description = description;
  }
}
export const Suggestion$Suggestion = (priority, area, description) =>
  new Suggestion(priority, area, description);
export const Suggestion$isSuggestion = (value) => value instanceof Suggestion;
export const Suggestion$Suggestion$priority = (value) => value.priority;
export const Suggestion$Suggestion$0 = (value) => value.priority;
export const Suggestion$Suggestion$area = (value) => value.area;
export const Suggestion$Suggestion$1 = (value) => value.area;
export const Suggestion$Suggestion$description = (value) => value.description;
export const Suggestion$Suggestion$2 = (value) => value.description;

export class Praise extends $CustomType {
  constructor(area, description) {
    super();
    this.area = area;
    this.description = description;
  }
}
export const Praise$Praise = (area, description) =>
  new Praise(area, description);
export const Praise$isPraise = (value) => value instanceof Praise;
export const Praise$Praise$area = (value) => value.area;
export const Praise$Praise$0 = (value) => value.area;
export const Praise$Praise$description = (value) => value.description;
export const Praise$Praise$1 = (value) => value.description;

export class Reflection extends $CustomType {
  constructor(id, task_id, summary, learnings, issues, suggestions, praise, overall_score, code_quality_score, test_coverage_score, documentation_score, agent_id, session_id, task_title, task_result, raw_response, reflection_type, sentiment, created_at, updated_at) {
    super();
    this.id = id;
    this.task_id = task_id;
    this.summary = summary;
    this.learnings = learnings;
    this.issues = issues;
    this.suggestions = suggestions;
    this.praise = praise;
    this.overall_score = overall_score;
    this.code_quality_score = code_quality_score;
    this.test_coverage_score = test_coverage_score;
    this.documentation_score = documentation_score;
    this.agent_id = agent_id;
    this.session_id = session_id;
    this.task_title = task_title;
    this.task_result = task_result;
    this.raw_response = raw_response;
    this.reflection_type = reflection_type;
    this.sentiment = sentiment;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}
export const Reflection$Reflection = (id, task_id, summary, learnings, issues, suggestions, praise, overall_score, code_quality_score, test_coverage_score, documentation_score, agent_id, session_id, task_title, task_result, raw_response, reflection_type, sentiment, created_at, updated_at) =>
  new Reflection(id,
  task_id,
  summary,
  learnings,
  issues,
  suggestions,
  praise,
  overall_score,
  code_quality_score,
  test_coverage_score,
  documentation_score,
  agent_id,
  session_id,
  task_title,
  task_result,
  raw_response,
  reflection_type,
  sentiment,
  created_at,
  updated_at);
export const Reflection$isReflection = (value) => value instanceof Reflection;
export const Reflection$Reflection$id = (value) => value.id;
export const Reflection$Reflection$0 = (value) => value.id;
export const Reflection$Reflection$task_id = (value) => value.task_id;
export const Reflection$Reflection$1 = (value) => value.task_id;
export const Reflection$Reflection$summary = (value) => value.summary;
export const Reflection$Reflection$2 = (value) => value.summary;
export const Reflection$Reflection$learnings = (value) => value.learnings;
export const Reflection$Reflection$3 = (value) => value.learnings;
export const Reflection$Reflection$issues = (value) => value.issues;
export const Reflection$Reflection$4 = (value) => value.issues;
export const Reflection$Reflection$suggestions = (value) => value.suggestions;
export const Reflection$Reflection$5 = (value) => value.suggestions;
export const Reflection$Reflection$praise = (value) => value.praise;
export const Reflection$Reflection$6 = (value) => value.praise;
export const Reflection$Reflection$overall_score = (value) =>
  value.overall_score;
export const Reflection$Reflection$7 = (value) => value.overall_score;
export const Reflection$Reflection$code_quality_score = (value) =>
  value.code_quality_score;
export const Reflection$Reflection$8 = (value) => value.code_quality_score;
export const Reflection$Reflection$test_coverage_score = (value) =>
  value.test_coverage_score;
export const Reflection$Reflection$9 = (value) => value.test_coverage_score;
export const Reflection$Reflection$documentation_score = (value) =>
  value.documentation_score;
export const Reflection$Reflection$10 = (value) => value.documentation_score;
export const Reflection$Reflection$agent_id = (value) => value.agent_id;
export const Reflection$Reflection$11 = (value) => value.agent_id;
export const Reflection$Reflection$session_id = (value) => value.session_id;
export const Reflection$Reflection$12 = (value) => value.session_id;
export const Reflection$Reflection$task_title = (value) => value.task_title;
export const Reflection$Reflection$13 = (value) => value.task_title;
export const Reflection$Reflection$task_result = (value) => value.task_result;
export const Reflection$Reflection$14 = (value) => value.task_result;
export const Reflection$Reflection$raw_response = (value) => value.raw_response;
export const Reflection$Reflection$15 = (value) => value.raw_response;
export const Reflection$Reflection$reflection_type = (value) =>
  value.reflection_type;
export const Reflection$Reflection$16 = (value) => value.reflection_type;
export const Reflection$Reflection$sentiment = (value) => value.sentiment;
export const Reflection$Reflection$17 = (value) => value.sentiment;
export const Reflection$Reflection$created_at = (value) => value.created_at;
export const Reflection$Reflection$18 = (value) => value.created_at;
export const Reflection$Reflection$updated_at = (value) => value.updated_at;
export const Reflection$Reflection$19 = (value) => value.updated_at;

export class ReflectionNotFound extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const ReflectionError$ReflectionNotFound = ($0) =>
  new ReflectionNotFound($0);
export const ReflectionError$isReflectionNotFound = (value) =>
  value instanceof ReflectionNotFound;
export const ReflectionError$ReflectionNotFound$0 = (value) => value[0];

export class InvalidScore extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const ReflectionError$InvalidScore = ($0) => new InvalidScore($0);
export const ReflectionError$isInvalidScore = (value) =>
  value instanceof InvalidScore;
export const ReflectionError$InvalidScore$0 = (value) => value[0];

export class DatabaseError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const ReflectionError$DatabaseError = ($0) => new DatabaseError($0);
export const ReflectionError$isDatabaseError = (value) =>
  value instanceof DatabaseError;
export const ReflectionError$DatabaseError$0 = (value) => value[0];

export class ValidationError extends $CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
}
export const ReflectionError$ValidationError = ($0) => new ValidationError($0);
export const ReflectionError$isValidationError = (value) =>
  value instanceof ValidationError;
export const ReflectionError$ValidationError$0 = (value) => value[0];

export class ReflectionStore extends $CustomType {
  constructor(reflections) {
    super();
    this.reflections = reflections;
  }
}
export const ReflectionStore$ReflectionStore = (reflections) =>
  new ReflectionStore(reflections);
export const ReflectionStore$isReflectionStore = (value) =>
  value instanceof ReflectionStore;
export const ReflectionStore$ReflectionStore$reflections = (value) =>
  value.reflections;
export const ReflectionStore$ReflectionStore$0 = (value) => value.reflections;

export function with_task(reflection, task_id, task_title) {
  return new Reflection(
    reflection.id,
    new Some(task_id),
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    new Some(task_title),
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_session(reflection, session_id) {
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    new Some(session_id),
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_learning(reflection, topic, reminder) {
  let learning = new Learning(topic, reminder);
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    listPrepend(learning, reflection.learnings),
    reflection.issues,
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_issue(reflection, severity, location, description) {
  let issue = new IssueItem(severity, location, description);
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    listPrepend(issue, reflection.issues),
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_suggestion(reflection, priority, area, description) {
  let suggestion = new Suggestion(priority, area, description);
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    listPrepend(suggestion, reflection.suggestions),
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_praise(reflection, area, description) {
  let praise_item = new Praise(area, description);
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    reflection.suggestions,
    listPrepend(praise_item, reflection.praise),
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_type(reflection, type_) {
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    type_,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_sentiment(reflection, sentiment) {
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    reflection.raw_response,
    reflection.reflection_type,
    new Some(sentiment),
    reflection.created_at,
    reflection.updated_at,
  );
}

export function with_raw_response(reflection, response) {
  return new Reflection(
    reflection.id,
    reflection.task_id,
    reflection.summary,
    reflection.learnings,
    reflection.issues,
    reflection.suggestions,
    reflection.praise,
    reflection.overall_score,
    reflection.code_quality_score,
    reflection.test_coverage_score,
    reflection.documentation_score,
    reflection.agent_id,
    reflection.session_id,
    reflection.task_title,
    reflection.task_result,
    new Some(response),
    reflection.reflection_type,
    reflection.sentiment,
    reflection.created_at,
    reflection.updated_at,
  );
}

function validate_score(score) {
  let $ = (score >= 0) && (score <= 100);
  if ($) {
    return new Ok(score);
  } else {
    return new Error(new InvalidScore(score));
  }
}

export function with_scores(
  reflection,
  overall,
  code_quality,
  test_coverage,
  documentation
) {
  let $ = validate_score(overall);
  let $1 = validate_score(code_quality);
  let $2 = validate_score(test_coverage);
  let $3 = validate_score(documentation);
  if ($ instanceof Ok) {
    if ($1 instanceof Ok) {
      if ($2 instanceof Ok) {
        if ($3 instanceof Ok) {
          return new Ok(
            new Reflection(
              reflection.id,
              reflection.task_id,
              reflection.summary,
              reflection.learnings,
              reflection.issues,
              reflection.suggestions,
              reflection.praise,
              new Some(overall),
              new Some(code_quality),
              new Some(test_coverage),
              new Some(documentation),
              reflection.agent_id,
              reflection.session_id,
              reflection.task_title,
              reflection.task_result,
              reflection.raw_response,
              reflection.reflection_type,
              reflection.sentiment,
              reflection.created_at,
              reflection.updated_at,
            ),
          );
        } else {
          return $3;
        }
      } else {
        return $2;
      }
    } else {
      return $1;
    }
  } else {
    return $;
  }
}

export function new_store() {
  return new ReflectionStore($dict.new$());
}

export function store_reflection(store, reflection) {
  return new ReflectionStore(
    $dict.insert(store.reflections, reflection.id, reflection),
  );
}

export function get_reflection(store, id) {
  let $ = $dict.get(store.reflections, id);
  if ($ instanceof Ok) {
    let reflection = $[0];
    return new Some(reflection);
  } else {
    return new None();
  }
}

export function get_all_reflections(store) {
  return $dict.values(store.reflections);
}

export function get_reflections_by_agent(store, agent_id) {
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (reflection) => { return reflection.agent_id === agent_id; },
  );
}

export function get_reflections_by_task(store, task_id) {
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (reflection) => {
      let $ = reflection.task_id;
      if ($ instanceof Some) {
        let id = $[0];
        return id === task_id;
      } else {
        return false;
      }
    },
  );
}

export function get_recent_reflections(store, since) {
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (reflection) => { return reflection.created_at >= since; },
  );
}

export function get_high_priority_issues(store) {
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  let _pipe$2 = $list.flat_map(
    _pipe$1,
    (reflection) => { return reflection.issues; },
  );
  return $list.filter(
    _pipe$2,
    (issue) => {
      let $ = issue.severity;
      if ($ instanceof Critical) {
        return true;
      } else if ($ instanceof High) {
        return true;
      } else {
        return false;
      }
    },
  );
}

export function get_all_learnings(store) {
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  return $list.flat_map(
    _pipe$1,
    (reflection) => { return reflection.learnings; },
  );
}

export function count_reflections(store) {
  return $dict.size(store.reflections);
}

export function get_average_score(store) {
  let reflections = $dict.values(store.reflections);
  let scored = $list.filter_map(
    reflections,
    (reflection) => {
      let $ = reflection.overall_score;
      if ($ instanceof Some) {
        let score = $[0];
        return new Ok(score);
      } else {
        return new Error(undefined);
      }
    },
  );
  let $ = $list.length(scored);
  if ($ === 0) {
    return 0.0;
  } else {
    let len = $;
    let total = $list.fold(scored, 0, (acc, score) => { return acc + score; });
    return divideFloat($int.to_float(total), $int.to_float(len));
  }
}

export function reflection_type_to_string(type_) {
  if (type_ instanceof TaskCompletion) {
    return "task_completion";
  } else if (type_ instanceof CodeReview) {
    return "code_review";
  } else if (type_ instanceof LearningReflection) {
    return "learning";
  } else if (type_ instanceof IssueReflection) {
    return "issue";
  } else if (type_ instanceof Improvement) {
    return "improvement";
  } else {
    return "question";
  }
}

export function get_reflections_by_type(store, type_) {
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  return $list.filter(
    _pipe$1,
    (reflection) => {
      return reflection_type_to_string(reflection.reflection_type) === reflection_type_to_string(
        type_,
      );
    },
  );
}

export function reflection_type_from_string(str) {
  if (str === "task_completion") {
    return new Some(new TaskCompletion());
  } else if (str === "code_review") {
    return new Some(new CodeReview());
  } else if (str === "learning") {
    return new Some(new LearningReflection());
  } else if (str === "issue") {
    return new Some(new IssueReflection());
  } else if (str === "improvement") {
    return new Some(new Improvement());
  } else if (str === "question") {
    return new Some(new Question());
  } else {
    return new None();
  }
}

export function sentiment_to_string(sentiment) {
  if (sentiment instanceof Positive) {
    return "positive";
  } else if (sentiment instanceof Negative) {
    return "negative";
  } else if (sentiment instanceof Neutral) {
    return "neutral";
  } else {
    return "mixed";
  }
}

export function sentiment_from_string(str) {
  if (str === "positive") {
    return new Some(new Positive());
  } else if (str === "negative") {
    return new Some(new Negative());
  } else if (str === "neutral") {
    return new Some(new Neutral());
  } else if (str === "mixed") {
    return new Some(new Mixed());
  } else {
    return new None();
  }
}

export function severity_to_string(severity) {
  if (severity instanceof Critical) {
    return "critical";
  } else if (severity instanceof High) {
    return "high";
  } else if (severity instanceof Medium) {
    return "medium";
  } else {
    return "low";
  }
}

export function severity_from_string(str) {
  if (str === "critical") {
    return new Some(new Critical());
  } else if (str === "high") {
    return new Some(new High());
  } else if (str === "medium") {
    return new Some(new Medium());
  } else if (str === "low") {
    return new Some(new Low());
  } else {
    return new None();
  }
}

export function analyze_patterns(store) {
  let _block;
  let _pipe = store.reflections;
  let _pipe$1 = $dict.values(_pipe);
  _block = $list.flat_map(
    _pipe$1,
    (reflection) => { return reflection.issues; },
  );
  let all_issues = _block;
  let _pipe$2 = all_issues;
  return $list.fold(
    _pipe$2,
    $dict.new$(),
    (acc, issue) => {
      let key = severity_to_string(issue.severity);
      let $ = $dict.get(acc, key);
      if ($ instanceof Ok) {
        let count = $[0];
        return $dict.insert(acc, key, count + 1);
      } else {
        return $dict.insert(acc, key, 1);
      }
    },
  );
}

export function export_to_json(reflection) {
  let _block;
  let _pipe = reflection.learnings;
  let _pipe$1 = $list.map(
    _pipe,
    (l) => {
      let topic;
      let reminder;
      topic = l.topic;
      reminder = l.reminder;
      return ((("{\"topic\":\"" + topic) + "\",\"reminder\":\"") + reminder) + "\"}";
    },
  );
  _block = $string.join(_pipe$1, ",");
  let learnings_json = _block;
  let _block$1;
  let _pipe$2 = reflection.issues;
  let _pipe$3 = $list.map(
    _pipe$2,
    (i) => {
      let severity;
      let location;
      let description;
      severity = i.severity;
      location = i.location;
      description = i.description;
      return ((((("{\"severity\":\"" + severity_to_string(severity)) + "\",\"location\":\"") + location) + "\",\"description\":\"") + description) + "\"}";
    },
  );
  _block$1 = $string.join(_pipe$3, ",");
  let issues_json = _block$1;
  return ((((((("{\"id\":\"" + reflection.id) + "\",\"summary\":\"") + reflection.summary) + "\",\"learnings\":[") + learnings_json) + "],\"issues\":[") + issues_json) + "]}";
}

function generate_id() {
  return generate_uuid();
}

export function new_reflection(summary, agent_id) {
  return new Reflection(
    generate_id(),
    new None(),
    summary,
    toList([]),
    toList([]),
    toList([]),
    toList([]),
    new None(),
    new None(),
    new None(),
    new None(),
    agent_id,
    new None(),
    new None(),
    new None(),
    new None(),
    new TaskCompletion(),
    new None(),
    now(),
    now(),
  );
}
