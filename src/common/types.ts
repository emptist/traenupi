export interface DbQueryOptions {
  timeout?: number;
  silent?: boolean;
}

export interface KnowledgeEntry {
  key: string;
  value: string;
  category: string;
  time: number;
}

export interface MeetingOpinion {
  id: string;
  meetingId: string;
  author: string;
  perspective: string;
  position: string;
  createdAt: Date;
}

export interface Meeting {
  id: string;
  topic: string;
  status: string;
  createdBy: string;
  createdAt: Date;
}

export interface ConversationItem {
  question: string;
  answer: string;
  time: number;
}

export interface Reminder {
  id: string;
  message: string;
  triggerAt: number;
  triggered: boolean;
}

export interface Bookmark {
  id: string;
  meetingId: string;
  opinionId: string;
  author: string;
  perspective: string;
  note: string;
  createdAt: number;
}

export interface MoodEntry {
  agentId: string;
  mood: string;
  timestamp: number;
  context: string;
}

export interface AIPresence {
  id: string;
  status: string;
  project: string;
  lastSeen: number;
  workingOn: string;
}

export interface ActivityStats {
  questionsToday: number;
  knowledgeStored: number;
  meetingOpinions: number;
  babyAiContributions: number;
  tweetsCreated: number;
  remindersTriggered: number;
}
