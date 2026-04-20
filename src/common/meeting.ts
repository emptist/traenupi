import { psqlQuery, psqlExec, resolveMeetingId } from "./db.js";
import type { MeetingOpinion, Meeting } from "./types.js";

export function getMeetingInfo(meetingId: string): Meeting | null {
  const resolvedId = resolveMeetingId(meetingId);
  if (!resolvedId) return null;

  const output = psqlQuery(
    `SELECT id, topic, status, created_by, created_at FROM meetings WHERE id = '${resolvedId}';`
  );
  if (!output) return null;

  const parts = output.split("|");
  return {
    id: parts[0] || "",
    topic: parts[1] || "",
    status: parts[2] || "",
    createdBy: parts[3] || "",
    createdAt: new Date(parts[4] || ""),
  };
}

export function getActiveMeetings(): Meeting[] {
  const output = psqlQuery(
    "SELECT id, topic, status, created_by, created_at FROM meetings WHERE status = 'active' ORDER BY created_at DESC;"
  );
  if (!output) return [];

  return output.split("\n").map(line => {
    const parts = line.split("|");
    return {
      id: parts[0] || "",
      topic: parts[1] || "",
      status: parts[2] || "",
      createdBy: parts[3] || "",
      createdAt: new Date(parts[4] || ""),
    };
  });
}

export function getMeetingOpinions(meetingId: string): MeetingOpinion[] {
  const resolvedId = resolveMeetingId(meetingId);
  if (!resolvedId) return [];

  const output = psqlQuery(
    `SELECT id, meeting_id, author, perspective, position, created_at FROM meeting_opinions WHERE meeting_id = '${resolvedId}' ORDER BY created_at ASC;`
  );
  if (!output) return [];

  return output.split("\n").map(line => {
    const parts = line.split("|");
    return {
      id: parts[0] || "",
      meetingId: parts[1] || "",
      author: parts[2] || "",
      perspective: parts[3] || "",
      position: parts[4] || "",
      createdAt: new Date(parts[5] || ""),
    };
  });
}

export function addOpinion(meetingId: string, author: string, message: string): boolean {
  const resolvedId = resolveMeetingId(meetingId);
  if (!resolvedId) return false;

  const safeMessage = message.replace(/'/g, "''");
  return psqlExec(
    `INSERT INTO meeting_opinions (meeting_id, author, perspective, position) VALUES ('${resolvedId}', '${author}', '${safeMessage}', 'support');`
  );
}

export function createMeeting(topic: string, author: string): string | null {
  const safeTopic = topic.replace(/'/g, "''");
  const result = psqlQuery(
    `INSERT INTO meetings (topic, created_by, status) VALUES ('${safeTopic}', '${author}', 'active') RETURNING id;`
  );
  return result || null;
}

export function closeMeeting(meetingId: string): boolean {
  const resolvedId = resolveMeetingId(meetingId);
  if (!resolvedId) return false;

  return psqlExec(
    `UPDATE meetings SET status = 'closed', updated_at = NOW() WHERE id = '${resolvedId}';`
  );
}

export function getMeetingStats(): { total: number; active: number; opinions: number } {
  const totalResult = psqlQuery("SELECT COUNT(*) FROM meetings;");
  const activeResult = psqlQuery("SELECT COUNT(*) FROM meetings WHERE status = 'active';");
  const opinionsResult = psqlQuery("SELECT COUNT(*) FROM meeting_opinions;");

  return {
    total: parseInt(totalResult) || 0,
    active: parseInt(activeResult) || 0,
    opinions: parseInt(opinionsResult) || 0,
  };
}
