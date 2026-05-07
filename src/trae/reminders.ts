import type { Reminder } from "../common/types.js";
import { loadReminders, saveReminders, ensureDir } from "../common/storage.js";
import { execSafe } from "../common/db-safe.js";

export function addReminder(minutes: number, message: string): void {
  ensureDir();
  const reminders = loadReminders();
  const id = Date.now().toString(36);
  const triggerAt = Date.now() + minutes * 60 * 1000;

  reminders.push({ id, message, triggerAt, triggered: false });
  saveReminders(reminders);

  const triggerTime = new Date(triggerAt).toLocaleTimeString();
  console.log(`[TRAENUPI] Reminder set for ${triggerTime}: "${message}"`);
}

export async function checkReminders(): Promise<void> {
  const reminders = loadReminders();
  const now = Date.now();

  for (const reminder of reminders) {
    if (!reminder.triggered && now >= reminder.triggerAt) {
      console.log(`\n⏰ REMINDER: ${reminder.message}`);
      reminder.triggered = true;

      try {
        await execSafe(
          `INSERT INTO memory (content, source, tags) VALUES ($1, 'traenupi', '{reminder,triggered}');`,
          [`Reminder triggered: ${reminder.message}`]
        );
      } catch {}
    }
  }

  saveReminders(reminders);
}

export function listReminders(): void {
  const reminders = loadReminders();
  const pending = reminders.filter(r => !r.triggered);

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Pending Reminders                      ║");
  console.log("╚════════════════════════════════════════════╝\n");

  if (pending.length === 0) {
    console.log("  No pending reminders.\n");
  } else {
    pending.forEach((r, i) => {
      const timeLeft = Math.max(0, Math.floor((r.triggerAt - Date.now()) / 60000));
      console.log(`  ${i + 1}. "${r.message}"`);
      console.log(`     Triggers in: ${timeLeft} minutes\n`);
    });
  }

  console.log("──────────────────────────────────────────────────\n");
}

export function clearTriggeredReminders(): void {
  const reminders = loadReminders();
  const pending = reminders.filter(r => !r.triggered);
  const cleared = reminders.length - pending.length;

  saveReminders(pending);

  console.log(`[TRAENUPI] Cleared ${cleared} triggered reminder(s).`);
}
