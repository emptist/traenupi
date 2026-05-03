import gleam/option.{type Option, None, Some}
import gleam/list
import gleam/dict.{type Dict}
import gleam/string
import gleam/int
import gleam/result

pub type ReflectionType {
  TaskCompletion
  CodeReview
  LearningReflection
  IssueReflection
  Improvement
  Question
}

pub type Sentiment {
  Positive
  Negative
  Neutral
  Mixed
}

pub type Severity {
  Critical
  High
  Medium
  Low
}

pub type Learning {
  Learning(topic: String, reminder: String)
}

pub type IssueItem {
  IssueItem(severity: Severity, location: String, description: String)
}

pub type Suggestion {
  Suggestion(priority: Int, area: String, description: String)
}

pub type Praise {
  Praise(area: String, description: String)
}

pub type Reflection {
  Reflection(
    id: String,
    task_id: Option(String),
    summary: String,
    learnings: List(Learning),
    issues: List(IssueItem),
    suggestions: List(Suggestion),
    praise: List(Praise),
    overall_score: Option(Int),
    code_quality_score: Option(Int),
    test_coverage_score: Option(Int),
    documentation_score: Option(Int),
    agent_id: String,
    session_id: Option(String),
    task_title: Option(String),
    task_result: Option(String),
    raw_response: Option(String),
    reflection_type: ReflectionType,
    sentiment: Option(Sentiment),
    created_at: Int,
    updated_at: Int,
  )
}

pub type ReflectionError {
  ReflectionNotFound(String)
  InvalidScore(Int)
  DatabaseError(String)
  ValidationError(String)
}

pub fn new_reflection(summary: String, agent_id: String) -> Reflection {
  Reflection(
    id: generate_id(),
    task_id: None,
    summary: summary,
    learnings: [],
    issues: [],
    suggestions: [],
    praise: [],
    overall_score: None,
    code_quality_score: None,
    test_coverage_score: None,
    documentation_score: None,
    agent_id: agent_id,
    session_id: None,
    task_title: None,
    task_result: None,
    raw_response: None,
    reflection_type: TaskCompletion,
    sentiment: None,
    created_at: now(),
    updated_at: now(),
  )
}

pub fn with_task(reflection: Reflection, task_id: String, task_title: String) -> Reflection {
  Reflection(..reflection, task_id: Some(task_id), task_title: Some(task_title))
}

pub fn with_session(reflection: Reflection, session_id: String) -> Reflection {
  Reflection(..reflection, session_id: Some(session_id))
}

pub fn with_learning(reflection: Reflection, topic: String, reminder: String) -> Reflection {
  let learning = Learning(topic, reminder)
  Reflection(..reflection, learnings: [learning, ..reflection.learnings])
}

pub fn with_issue(reflection: Reflection, severity: Severity, location: String, description: String) -> Reflection {
  let issue = IssueItem(severity, location, description)
  Reflection(..reflection, issues: [issue, ..reflection.issues])
}

pub fn with_suggestion(reflection: Reflection, priority: Int, area: String, description: String) -> Reflection {
  let suggestion = Suggestion(priority, area, description)
  Reflection(..reflection, suggestions: [suggestion, ..reflection.suggestions])
}

pub fn with_praise(reflection: Reflection, area: String, description: String) -> Reflection {
  let praise_item = Praise(area, description)
  Reflection(..reflection, praise: [praise_item, ..reflection.praise])
}

pub fn with_scores(reflection: Reflection, overall: Int, code_quality: Int, test_coverage: Int, documentation: Int) -> Result(Reflection, ReflectionError) {
  case validate_score(overall), validate_score(code_quality), validate_score(test_coverage), validate_score(documentation) {
    Ok(_), Ok(_), Ok(_), Ok(_) -> Ok(Reflection(
      ..reflection,
      overall_score: Some(overall),
      code_quality_score: Some(code_quality),
      test_coverage_score: Some(test_coverage),
      documentation_score: Some(documentation),
    ))
    Error(e), _, _, _ -> Error(e)
    _, Error(e), _, _ -> Error(e)
    _, _, Error(e), _ -> Error(e)
    _, _, _, Error(e) -> Error(e)
  }
}

pub fn with_type(reflection: Reflection, type_: ReflectionType) -> Reflection {
  Reflection(..reflection, reflection_type: type_)
}

pub fn with_sentiment(reflection: Reflection, sentiment: Sentiment) -> Reflection {
  Reflection(..reflection, sentiment: Some(sentiment))
}

pub fn with_raw_response(reflection: Reflection, response: String) -> Reflection {
  Reflection(..reflection, raw_response: Some(response))
}

fn validate_score(score: Int) -> Result(Int, ReflectionError) {
  case score >= 0 && score <= 100 {
    True -> Ok(score)
    False -> Error(InvalidScore(score))
  }
}

pub type ReflectionStore {
  ReflectionStore(reflections: Dict(String, Reflection))
}

pub fn new_store() -> ReflectionStore {
  ReflectionStore(reflections: dict.new())
}

pub fn store_reflection(store: ReflectionStore, reflection: Reflection) -> ReflectionStore {
  ReflectionStore(reflections: dict.insert(store.reflections, reflection.id, reflection))
}

pub fn get_reflection(store: ReflectionStore, id: String) -> Option(Reflection) {
  case dict.get(store.reflections, id) {
    Ok(reflection) -> Some(reflection)
    Error(Nil) -> None
  }
}

pub fn get_all_reflections(store: ReflectionStore) -> List(Reflection) {
  dict.values(store.reflections)
}

pub fn get_reflections_by_agent(store: ReflectionStore, agent_id: String) -> List(Reflection) {
  store.reflections
  |> dict.values()
  |> list.filter(fn(reflection) { reflection.agent_id == agent_id })
}

pub fn get_reflections_by_type(store: ReflectionStore, type_: ReflectionType) -> List(Reflection) {
  store.reflections
  |> dict.values()
  |> list.filter(fn(reflection) { 
    reflection_type_to_string(reflection.reflection_type) == reflection_type_to_string(type_)
  })
}

pub fn get_reflections_by_task(store: ReflectionStore, task_id: String) -> List(Reflection) {
  store.reflections
  |> dict.values()
  |> list.filter(fn(reflection) {
    case reflection.task_id {
      Some(id) -> id == task_id
      None -> False
    }
  })
}

pub fn get_recent_reflections(store: ReflectionStore, since: Int) -> List(Reflection) {
  store.reflections
  |> dict.values()
  |> list.filter(fn(reflection) { reflection.created_at >= since })
}

pub fn get_high_priority_issues(store: ReflectionStore) -> List(IssueItem) {
  store.reflections
  |> dict.values()
  |> list.flat_map(fn(reflection) { reflection.issues })
  |> list.filter(fn(issue) {
    case issue.severity {
      Critical -> True
      High -> True
      _ -> False
    }
  })
}

pub fn get_all_learnings(store: ReflectionStore) -> List(Learning) {
  store.reflections
  |> dict.values()
  |> list.flat_map(fn(reflection) { reflection.learnings })
}

pub fn count_reflections(store: ReflectionStore) -> Int {
  dict.size(store.reflections)
}

pub fn get_average_score(store: ReflectionStore) -> Float {
  let reflections = dict.values(store.reflections)
  let scored = list.filter_map(reflections, fn(reflection) {
    case reflection.overall_score {
      Some(score) -> Ok(score)
      None -> Error(Nil)
    }
  })
  
  case list.length(scored) {
    0 -> 0.0
    len -> {
      let total = list.fold(scored, 0, fn(acc, score) { acc + score })
      int.to_float(total) /. int.to_float(len)
    }
  }
}

pub fn reflection_type_to_string(type_: ReflectionType) -> String {
  case type_ {
    TaskCompletion -> "task_completion"
    CodeReview -> "code_review"
    LearningReflection -> "learning"
    IssueReflection -> "issue"
    Improvement -> "improvement"
    Question -> "question"
  }
}

pub fn reflection_type_from_string(str: String) -> Option(ReflectionType) {
  case str {
    "task_completion" -> Some(TaskCompletion)
    "code_review" -> Some(CodeReview)
    "learning" -> Some(LearningReflection)
    "issue" -> Some(IssueReflection)
    "improvement" -> Some(Improvement)
    "question" -> Some(Question)
    _ -> None
  }
}

pub fn sentiment_to_string(sentiment: Sentiment) -> String {
  case sentiment {
    Positive -> "positive"
    Negative -> "negative"
    Neutral -> "neutral"
    Mixed -> "mixed"
  }
}

pub fn sentiment_from_string(str: String) -> Option(Sentiment) {
  case str {
    "positive" -> Some(Positive)
    "negative" -> Some(Negative)
    "neutral" -> Some(Neutral)
    "mixed" -> Some(Mixed)
    _ -> None
  }
}

pub fn severity_to_string(severity: Severity) -> String {
  case severity {
    Critical -> "critical"
    High -> "high"
    Medium -> "medium"
    Low -> "low"
  }
}

pub fn severity_from_string(str: String) -> Option(Severity) {
  case str {
    "critical" -> Some(Critical)
    "high" -> Some(High)
    "medium" -> Some(Medium)
    "low" -> Some(Low)
    _ -> None
  }
}

pub fn analyze_patterns(store: ReflectionStore) -> Dict(String, Int) {
  let all_issues = store.reflections
    |> dict.values()
    |> list.flat_map(fn(reflection) { reflection.issues })
  
  all_issues
  |> list.fold(dict.new(), fn(acc, issue) {
    let key = severity_to_string(issue.severity)
    case dict.get(acc, key) {
      Ok(count) -> dict.insert(acc, key, count + 1)
      Error(Nil) -> dict.insert(acc, key, 1)
    }
  })
}

pub fn export_to_json(reflection: Reflection) -> String {
  let learnings_json = reflection.learnings
    |> list.map(fn(l) {
      let Learning(topic, reminder) = l
      "{\"topic\":\"" <> topic <> "\",\"reminder\":\"" <> reminder <> "\"}"
    })
    |> string.join(",")
  
  let issues_json = reflection.issues
    |> list.map(fn(i) {
      let IssueItem(severity, location, description) = i
      "{\"severity\":\"" <> severity_to_string(severity) <> "\",\"location\":\"" <> location <> "\",\"description\":\"" <> description <> "\"}"
    })
    |> string.join(",")
  
  "{\"id\":\"" <> reflection.id <> "\",\"summary\":\"" <> reflection.summary <> "\",\"learnings\":[" <> learnings_json <> "],\"issues\":[" <> issues_json <> "]}"
}

fn generate_id() -> String {
  generate_uuid()
}

@external(javascript, "./reflection_ffi.mjs", "now")
fn now() -> Int

@external(javascript, "./reflection_ffi.mjs", "generate_uuid")
fn generate_uuid() -> String
