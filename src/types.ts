export interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: number;
  status: "pending" | "running" | "done" | "failed";
  result?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DelegateResult {
  success: boolean;
  output?: string;
  error?: string;
}

export interface DaemonStatus {
  running: boolean;
  uptime: number;
  tasksCompleted: number;
  tasksFailed: number;
  nezhaConnected: boolean;
  opencodeConnected: boolean;
  activeDelegations: number;
  lastActivity: string | null;
}

export interface NezhaWorkItem {
  type: "task" | "issue" | "broadcast";
  id: string;
  title: string;
  description?: string;
  priority?: number;
  severity?: string;
}

export interface LogEntry {
  timestamp: string;
  level: "info" | "warn" | "error" | "delegate";
  message: string;
  data?: unknown;
}
