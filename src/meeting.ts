import { execSync } from "node:child_process";
import { psqlQuery } from "./db.js";

const PSQL = "psql -h localhost -U postgres -d nezha";

export interface MeetingOpinion {
  id: string;
  meetingId: string;
  author: string;
  perspective: string;
  position: string;
  createdAt: Date;
}

export function resolveMeetingId(meetingId: string): string | null {
  if (meetingId.length >= 36) return meetingId;
  try {
    const result = psqlQuery(`"SELECT id FROM meetings WHERE id::text LIKE '${meetingId}%';"`);
    return result || null;
  } catch {
    return null;
  }
}

export function addOpinion(meetingId: string, author: string, message: string): boolean {
  const safeMessage = message.replace(/'/g, "''");
  try {
    execSync(
      `${PSQL} -c "INSERT INTO meeting_opinions (meeting_id, author, perspective, position) VALUES ('${meetingId}', '${author}', '${safeMessage}', 'support');"`,
      { encoding: "utf-8", timeout: 5000 }
    );
    return true;
  } catch {
    return false;
  }
}

export function getMeetingOpinions(meetingId: string): MeetingOpinion[] {
  try {
    const output = psqlQuery(
      `"SELECT id, author, perspective, position, created_at FROM meeting_opinions WHERE meeting_id = '${meetingId}' ORDER BY created_at ASC;"`
    );
    if (!output) return [];
    
    return output.split("\n").map(line => {
      const parts = line.split("|");
      return {
        id: parts[0] || "",
        meetingId,
        author: parts[1] || "",
        perspective: parts[2] || "",
        position: parts[3] || "",
        createdAt: new Date(parts[4] || ""),
      };
    });
  } catch {
    return [];
  }
}

export function getMeetingInfo(meetingId: string): { topic: string; status: string } | null {
  try {
    const output = psqlQuery(`"SELECT topic, status FROM meetings WHERE id = '${meetingId}';"`);
    if (!output) return null;
    
    const parts = output.split("|");
    return {
      topic: parts[0] || "",
      status: parts[1] || "",
    };
  } catch {
    return null;
  }
}

export function getActiveMeetings(): { id: string; topic: string }[] {
  try {
    const output = psqlQuery(`"SELECT id, topic FROM meetings WHERE status = 'active' ORDER BY created_at DESC;"`);
    if (!output) return [];
    
    return output.split("\n").map(line => {
      const parts = line.split("|");
      return {
        id: parts[0] || "",
        topic: parts[1] || "",
      };
    });
  } catch {
    return [];
  }
}
