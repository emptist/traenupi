import gleam/option.{type Option}

pub type PromptCategory {
  Action
  Verify
  Reflect
  AntiWeakness
  Checkpoint
  Completion
}

pub type WeaknessType {
  ContextLoss
  IncompleteFollowThrough
  PlanningDrift
  ErrorAmnesia
  VerificationNeglect
  EdgeCaseBlindness
  QualityDrift
  VerificationGap
  Overconfidence
  ScopeCreep
}

pub type Prompt {
  Prompt(
    id: String,
    category: PromptCategory,
    weakness: Option(WeaknessType),
    title: String,
    body: String,
    checklist: List(String),
  )
}

pub type TaskStep {
  TaskStep(
    index: Int,
    description: String,
    verification: List(String),
    edge_cases: List(String),
    completed: Bool,
  )
}

pub type Task {
  Task(
    id: String,
    description: String,
    goal: String,
    steps: List(TaskStep),
    created_at: Int,
    updated_at: Int,
  )
}

pub type KnowledgeEntry {
  KnowledgeEntry(
    key: String,
    value: String,
    category: String,
    time: Int,
  )
}

pub type MeetingStatus {
  MeetingActive
  MeetingClosed
  MeetingPending
}

pub type Meeting {
  Meeting(
    id: String,
    topic: String,
    status: MeetingStatus,
    created_by: String,
    created_at: Int,
  )
}

pub type MeetingOpinion {
  MeetingOpinion(
    id: String,
    meeting_id: String,
    author: String,
    perspective: String,
    position: String,
    created_at: Int,
  )
}

pub type Reminder {
  Reminder(
    id: String,
    message: String,
    trigger_at: Int,
    triggered: Bool,
  )
}

pub type Bookmark {
  Bookmark(
    id: String,
    meeting_id: String,
    opinion_id: String,
    author: String,
    perspective: String,
    note: String,
    created_at: Int,
  )
}

pub type MoodEntry {
  MoodEntry(
    agent_id: String,
    mood: String,
    timestamp: Int,
    context: String,
  )
}

pub type AIPresence {
  AIPresence(
    agent_id: String,
    last_seen: Int,
    status: String,
    focus: String,
    project: String,
  )
}

pub type ActivityStats {
  ActivityStats(
    questions_today: Int,
    knowledge_stored: Int,
    meeting_opinions: Int,
    baby_ai_contributions: Int,
    reminders_triggered: Int,
  )
}

pub type ConversationItem {
  ConversationItem(
    question: String,
    answer: String,
    time: Int,
  )
}

pub type DriverPhase {
  Planning
  Executing
  Paused
  Completed
}

pub type DriverState {
  DriverState(
    task: Option(Task),
    current_step_index: Int,
    prompts_emitted: Int,
    last_prompt_time: Int,
    phase: DriverPhase,
  )
}
