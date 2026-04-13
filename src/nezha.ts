import type { NezhaWorkItem } from "./types.js";

const NEZHA_API = process.env.NEZHA_API || "http://127.0.0.1:5999";

export async function isNezhaRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${NEZHA_API}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchWork(): Promise<NezhaWorkItem | null> {
  try {
    const taskRes = await fetch(`${NEZHA_API}/tasks?status=PENDING&limit=1`, {
      signal: AbortSignal.timeout(5000),
    });
    if (taskRes.ok) {
      const data = (await taskRes.json()) as { rows?: NezhaWorkItem[] };
      if (data.rows && data.rows.length > 0) {
        return { ...data.rows[0], type: "task" };
      }
    }

    const issueRes = await fetch(`${NEZHA_API}/issues?limit=3`, {
      signal: AbortSignal.timeout(5000),
    });
    if (issueRes.ok) {
      const data = (await issueRes.json()) as { rows?: NezhaWorkItem[] };
      if (data.rows && data.rows.length > 0) {
        const critical = data.rows.find(
          (i) => i.severity === "high" || i.severity === "critical",
        );
        return critical
          ? { ...critical, type: "issue" }
          : { ...data.rows[0], type: "issue" };
      }
    }

    const broadcastRes = await fetch(`${NEZHA_API}/broadcast/5`, {
      signal: AbortSignal.timeout(5000),
    });
    if (broadcastRes.ok) {
      const data = (await broadcastRes.json()) as { rows?: NezhaWorkItem[] };
      if (data.rows && data.rows.length > 0) {
        return { ...data.rows[0], type: "broadcast" };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function takeTask(taskId: string): Promise<boolean> {
  try {
    const res = await fetch(`${NEZHA_API}/tasks/${taskId}/take`, {
      method: "POST",
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function completeTask(
  taskId: string,
  result: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${NEZHA_API}/tasks/${taskId}/done`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function failTask(
  taskId: string,
  error: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${NEZHA_API}/tasks/${taskId}/fail`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function sendBroadcast(message: string): Promise<boolean> {
  try {
    const res = await fetch(`${NEZHA_API}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch {
    return false;
  }
}
