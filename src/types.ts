export interface DaemonStatus {
  running: boolean;
  uptime: number;
  nupiPid: number | null;
  nupiConnected: boolean;
  nezhaConnected: boolean;
  lastActivity: string | null;
  restartCount: number;
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
  level: "info" | "warn" | "error" | "nupi";
  message: string;
  data?: unknown;
}

export interface DelegateResult {
  success: boolean;
  output?: string;
  error?: string;
}
