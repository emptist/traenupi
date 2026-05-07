import { resolveMeetingId } from "./db.js";
import { querySafeText, execSafe, queryOne } from "./db-safe.js";
import type { MeetingOpinion, Meeting } from "./types.js";

export async function getMeetingInfo(meetingId: string): Promise<Meeting | null> {
  const resolvedId = await resolveMeetingId(meetingId);
  if (!resolvedId) return null;

  const output = await querySafeText(
    "SELECT id, topic, status, created_by, created_at FROM meetings WHERE id = $1",
    [resolvedId]
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

export async function getActiveMeetings(): Promise<Meeting[]> {
  const output = await querySafeText(
    "SELECT id, topic, status, created_by, created_at FROM meetings WHERE status = 'active' ORDER BY created_at DESC"
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

export async function getMeetingOpinions(meetingId: string): Promise<MeetingOpinion[]> {
  const resolvedId = await resolveMeetingId(meetingId);
  if (!resolvedId) return [];

  const output = await querySafeText(
    "SELECT id, meeting_id, author, perspective, position, created_at FROM meeting_opinions WHERE meeting_id = $1 ORDER BY created_at ASC",
    [resolvedId]
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

export async function addOpinion(
  meetingId: string, 
  author: string, 
  message: string, 
  position: string = "support"
): Promise<boolean> {
  const resolvedId = await resolveMeetingId(meetingId);
  if (!resolvedId) return false;

  const validPosition = ["support", "oppose", "neutral"].includes(position) ? position : "support";
  
  return execSafe(
    "INSERT INTO meeting_opinions (meeting_id, author, perspective, position) VALUES ($1, $2, $3, $4)",
    [resolvedId, author, message, validPosition]
  );
}

export async function createMeeting(topic: string, author: string): Promise<string | null> {
  const row = await queryOne<{ id: string }>(
    "INSERT INTO meetings (topic, created_by, status) VALUES ($1, $2, 'active') RETURNING id",
    [topic, author]
  );
  return row?.id || null;
}

export async function closeMeeting(meetingId: string): Promise<boolean> {
  const resolvedId = await resolveMeetingId(meetingId);
  if (!resolvedId) return false;

  return execSafe(
    "UPDATE meetings SET status = 'closed', updated_at = NOW() WHERE id = $1",
    [resolvedId]
  );
}

export async function getMeetingStats(): Promise<{ total: number; active: number; opinions: number }> {
  const totalRow = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM meetings");
  const activeRow = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM meetings WHERE status = 'active'");
  const opinionsRow = await queryOne<{ count: string }>("SELECT COUNT(*) as count FROM meeting_opinions");

  return {
    total: parseInt(totalRow?.count || "0") || 0,
    active: parseInt(activeRow?.count || "0") || 0,
    opinions: parseInt(opinionsRow?.count || "0") || 0,
  };
}
