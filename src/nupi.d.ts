declare module "@nezha/nupi" {
  export function getNuPIClient(baseUrl?: string): NuPIClient;
  export function isSelfModelStrong(): boolean;
  export function isLocalTask(task: string): boolean;
  export function shouldUseExternal(task: string): boolean;
  export function getNuPIStatus(): { mode: string; selfModelStrong: boolean; hasExternal: boolean };

  interface TaskRow {
    id: string;
    title: string;
    description: string | null;
    priority: number;
    status: string;
    category: string | null;
    type: string | null;
    created_at: string;
  }

  class NuPIClient {
    health(): Promise<{ status: string; service: string }>;
    isHealthy(): Promise<boolean>;
    getTasks(options?: { status?: string; limit?: number }): Promise<{ rows: TaskRow[] }>;
    getPendingTask(limit?: number): Promise<TaskRow | null>;
    getIssues(limit?: number): Promise<unknown[]>;
    getBroadcasts(limit?: number): Promise<unknown[]>;
    sendBroadcast(message: string, options?: { to?: string; priority?: string }): Promise<{ id: string }>;
    createTask(data: { title: string; description?: string; priority?: number; category?: string }): Promise<{ id: string }>;
    getSystemStatus(): Promise<{ pendingTasks: number; openIssues: number; memoryCount: number }>;
  }
}
