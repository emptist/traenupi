import { getNuPIClient, isSelfModelStrong } from "@nezha/nupi";
import { getNezhaApi } from "./config.js";
import { logger } from "./logger.js";

let running = false;
let startTime = 0;
let lastActivity: string | null = null;
let pollTimer: ReturnType<typeof setInterval> | null = null;
let remindTimer: ReturnType<typeof setInterval> | null = null;
let pollInterval = 120000;
let remindInterval = 30000;
let lastRemindOutput = "";
let lastWorkTime = 0;
let idleReminderCount = 0;

export async function getStatus() {
  const client = getNuPIClient();
  let nezhaConnected = false;
  try {
    nezhaConnected = await client.isHealthy();
  } catch { /* ignore */ }

  return {
    running,
    uptime: running ? Date.now() - startTime : 0,
    nezhaConnected,
    modelStrong: isSelfModelStrong(),
    lastActivity,
  };
}

async function workCycle(): Promise<void> {
  const client = getNuPIClient();

  try {
    if (!await client.isHealthy()) {
      logger.warn("Nezha not healthy");
      return;
    }
  } catch {
    logger.warn("Nezha API not reachable");
    return;
  }

  try {
    const task = await client.getPendingTask();
    if (task) {
      logger.info(`[WORK] Task [P${task.priority}]: ${task.title} (id: ${task.id})`);
      if (task.description) logger.info(`[WORK] ${task.description.slice(0, 200)}`);
      lastActivity = new Date().toISOString();
      lastWorkTime = Date.now();
      return;
    }
  } catch (e) {
    logger.warn(`Tasks check failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  try {
    const issues = await client.getIssues(5);
    if (Array.isArray(issues) && issues.length > 0) {
      const i = issues[0] as any;
      logger.info(`[WORK] Issue [${i.severity || "?"}]: ${i.title} (id: ${i.id})`);
      lastActivity = new Date().toISOString();
      lastWorkTime = Date.now();
      return;
    }
  } catch (e) {
    logger.warn(`Issues check failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  logger.info("No pending work");
}

async function remindCycle(): Promise<void> {
  const client = getNuPIClient();

  try {
    if (!await client.isHealthy()) return;
  } catch { return; }

  try {
    const sysStatus = await client.getSystemStatus();
    const task = await client.getPendingTask();
    const broadcasts = await client.getBroadcasts(3);
    const idleMs = lastWorkTime > 0 ? Date.now() - lastWorkTime : 0;
    const idleMin = Math.floor(idleMs / 60000);

    let lines: string[] = [];
    lines.push("─── TraeNuPI ───");

    if (task) {
      lines.push(`Next: [P${task.priority}] ${task.title}`);
      lines.push(`  id: ${task.id}`);
      if (task.description) {
        lines.push(`  → ${task.description.slice(0, 120)}`);
      }
    } else {
      lines.push("No pending tasks.");
    }

    lines.push(`Queue: ${sysStatus.pendingTasks} tasks | ${sysStatus.openIssues} issues`);

    if (Array.isArray(broadcasts) && broadcasts.length > 0) {
      const recent = broadcasts.slice(0, 2).map((b: any) => {
        const msg = b.message || b.content || "";
        return msg.slice(0, 80);
      }).filter(Boolean);
      if (recent.length > 0) {
        lines.push(`Broadcasts: ${recent.join(" | ")}`);
      }
    }

    if (idleMs > 300000) {
      idleReminderCount++;
      lines.push(`⚠ Idle ${idleMin}min — pick a task and start working`);
      if (idleReminderCount % 3 === 0) {
        lines.push("→ curl http://localhost:5222/tasks to see what's available");
      }
    } else if (idleMs > 120000) {
      lines.push(`Idle ${idleMin}min`);
    }

    const output = lines.join("\n");
    if (output !== lastRemindOutput) {
      logger.info(output);
      lastRemindOutput = output;
    }
  } catch {
    // silent
  }
}

export async function start(): Promise<void> {
  if (running) {
    logger.warn("Already running");
    return;
  }

  running = true;
  startTime = Date.now();
  lastWorkTime = Date.now();
  logger.info("TraeNuPI daemon started");

  const status = await getStatus();
  logger.info(`Nezha: ${status.nezhaConnected ? "connected" : "not reachable"}`);
  logger.info(`Model: ${status.modelStrong ? "strong" : "weak"}`);

  await workCycle();
  await remindCycle();

  pollTimer = setInterval(workCycle, pollInterval);
  remindTimer = setInterval(remindCycle, remindInterval);
  logger.info(`Polling every ${pollInterval / 1000}s, reminding every ${remindInterval / 1000}s`);
}

export function stop(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (remindTimer) {
    clearInterval(remindTimer);
    remindTimer = null;
  }
  running = false;
  logger.info("TraeNuPI daemon stopped");
}

export async function forceWork(): Promise<void> {
  await workCycle();
}

export async function checkTasks(): Promise<string> {
  const client = getNuPIClient();
  try {
    const result = await client.getTasks({ status: "PENDING", limit: 10 });
    if (!result.rows || result.rows.length === 0) return "No pending tasks.";
    return result.rows.map((t, i) => `${i + 1}. [P${t.priority}] ${t.title} (id: ${t.id})`).join("\n");
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function checkIssues(): Promise<string> {
  const client = getNuPIClient();
  try {
    const issues = await client.getIssues(10);
    if (!Array.isArray(issues) || issues.length === 0) return "No open issues.";
    return issues.map((t: any, i: number) => `${i + 1}. [${t.severity || "?"}] ${t.title} (id: ${t.id})`).join("\n");
  } catch (e) {
    return `Error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

async function nezhaPut(path: string, body: unknown): Promise<any> {
  const res = await fetch(`${getNezhaApi()}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
  return res.json();
}

export async function completeTask(taskId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await nezhaPut(`/tasks/${taskId}/status`, { status: "COMPLETED" });
    logger.info(`[DONE] Task ${taskId.slice(0, 8)} completed`);
    lastActivity = new Date().toISOString();
    lastWorkTime = Date.now();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function failTask(taskId: string, error: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await nezhaPut(`/tasks/${taskId}/status`, { status: "FAILED", error });
    logger.info(`[FAIL] Task ${taskId.slice(0, 8)} failed: ${error}`);
    lastActivity = new Date().toISOString();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function broadcast(message: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const client = getNuPIClient();
  try {
    const result = await client.sendBroadcast(message);
    logger.info(`[BROADCAST] Sent: ${message.slice(0, 60)}`);
    return { ok: true, id: result.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function saveLearning(content: string, tags?: string[]): Promise<{ ok: boolean; error?: string }> {
  const client = getNuPIClient();
  try {
    await client.saveMemory(content, tags);
    logger.info(`[LEARN] Saved: ${content.slice(0, 60)}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function generatePrompt(): Promise<string> {
  const client = getNuPIClient();
  const lines: string[] = [];

  try {
    if (!await client.isHealthy()) {
      return "Nezha is not reachable. Check the connection.";
    }
  } catch {
    return "Nezha is not reachable. Check the connection.";
  }

  try {
    const sysStatus = await client.getSystemStatus();
    const task = await client.getPendingTask();
    const tasks = await client.getTasks({ status: "PENDING", limit: 5 });
    const issues = await client.getIssues(3);
    const broadcasts = await client.getBroadcasts(5);
    const idleMs = lastWorkTime > 0 ? Date.now() - lastWorkTime : 0;
    const idleMin = Math.floor(idleMs / 60000);

    lines.push("## Current Context");
    lines.push(`- ${sysStatus.pendingTasks} pending tasks, ${sysStatus.openIssues} open issues`);
    lines.push(`- Model: ${isSelfModelStrong() ? "strong" : "weak"}`);
    if (idleMin > 2) {
      lines.push(`- Idle for ${idleMin} minutes`);
    }

    if (task) {
      lines.push("");
      lines.push("## Next Task");
      lines.push(`**${task.title}** [P${task.priority}]`);
      lines.push(`ID: ${task.id}`);
      if (task.description) {
        lines.push(`Description: ${task.description.slice(0, 300)}`);
      }
      lines.push("");
      lines.push("Close task: `curl -X POST http://localhost:5222/tasks/" + task.id + "/done`");
    }

    if (tasks.rows && tasks.rows.length > 1) {
      lines.push("");
      lines.push("## Task Queue");
      for (const t of tasks.rows.slice(0, 5)) {
        lines.push(`- [P${t.priority}] ${t.title}`);
      }
    }

    if (Array.isArray(issues) && issues.length > 0) {
      lines.push("");
      lines.push("## Active Issues");
      for (const i of issues.slice(0, 3)) {
        const issue = i as any;
        lines.push(`- [${issue.severity || "?"}] ${issue.title}`);
      }
    }

    if (Array.isArray(broadcasts) && broadcasts.length > 0) {
      lines.push("");
      lines.push("## Recent Broadcasts");
      for (const b of broadcasts.slice(0, 3)) {
        const bc = b as any;
        const msg = bc.message || bc.content || "";
        if (msg) lines.push(`- ${msg.slice(0, 120)}`);
      }
    }

    if (idleMs > 300000) {
      lines.push("");
      lines.push("## ⚠ You've been idle for " + idleMin + " minutes");
      lines.push("Pick a task and start working. Use `curl http://localhost:5222/tasks` to see all available tasks.");
      lines.push("After completing work, save what you learned: `curl -X POST http://localhost:5222/learn -H 'Content-Type: application/json' -d '{\"content\":\"...\"}'`");
    }

    lines.push("");
    lines.push("## Reminders");
    lines.push("- End with learning and thinking, not conclusions");
    lines.push("- Save lessons with /learn after each task");
    lines.push("- Close tasks with /tasks/:id/done when addressed");
    lines.push("- Check broadcasts for cross-AI coordination");
    lines.push("- Move files to deprecated/ instead of deleting");
  } catch (e) {
    lines.push(`Error generating prompt: ${e instanceof Error ? e.message : String(e)}`);
  }

  return lines.join("\n");
}
