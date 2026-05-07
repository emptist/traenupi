import type { Bookmark } from "../common/types.js";
import { loadBookmarks, saveBookmarks, ensureDir } from "../common/storage.js";
import { resolveMeetingId } from "../common/db.js";
import { querySafeText } from "../common/db-safe.js";

export async function addBookmark(meetingId: string, opinionId: string | undefined, note: string): Promise<void> {
  ensureDir();
  const resolvedId = await resolveMeetingId(meetingId);
  if (!resolvedId) {
    console.log("[TRAENUPI] Meeting not found.");
    return;
  }

  let opinionData = { author: "", perspective: "" };
  if (opinionId) {
    try {
      const output = await querySafeText(
        `SELECT author, perspective FROM meeting_opinions WHERE id = $1 AND meeting_id = $2;`,
        [opinionId, resolvedId]
      );
      if (output) {
        const parts = output.split("|");
        opinionData = { author: parts[0] || "", perspective: parts[1] || "" };
      }
    } catch {}
  } else {
    try {
      const output = await querySafeText(
        `SELECT id, author, perspective FROM meeting_opinions WHERE meeting_id = $1 ORDER BY created_at DESC LIMIT 1;`,
        [resolvedId]
      );
      if (output) {
        const parts = output.split("|");
        opinionId = parts[0];
        opinionData = { author: parts[1] || "", perspective: parts[2] || "" };
      }
    } catch {}
  }

  const bookmarks = loadBookmarks();
  const bookmark: Bookmark = {
    id: Date.now().toString(36),
    meetingId: resolvedId,
    opinionId: opinionId || "",
    author: opinionData.author,
    perspective: opinionData.perspective,
    note,
    createdAt: Date.now(),
  };

  bookmarks.push(bookmark);
  saveBookmarks(bookmarks);

  console.log(`[TRAENUPI] Bookmark added for meeting ${resolvedId.substring(0, 8)}`);
  if (opinionData.perspective) {
    console.log(`  Opinion: "${opinionData.perspective.substring(0, 60)}..."`);
  }
  console.log(`  Note: ${note}`);
}

export function listBookmarks(): void {
  const bookmarks = loadBookmarks();

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Bookmarks                              ║");
  console.log("╚════════════════════════════════════════════╝\n");

  if (bookmarks.length === 0) {
    console.log("  No bookmarks saved.\n");
  } else {
    bookmarks.forEach((b, i) => {
      const date = new Date(b.createdAt).toLocaleDateString();
      console.log(`  ${i + 1}. Meeting: ${b.meetingId.substring(0, 8)}`);
      console.log(`     Author: ${b.author}`);
      console.log(`     Opinion: "${b.perspective.substring(0, 50)}..."`);
      console.log(`     Note: ${b.note}`);
      console.log(`     Saved: ${date}\n`);
    });
  }

  console.log("──────────────────────────────────────────────────\n");
}
