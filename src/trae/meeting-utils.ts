import { querySafeText, execSafe } from "../common/db-safe.js";
import { resolveMeetingId, getAgentId } from "../common/db.js";

export async function crossMeetingSearch(term: string): Promise<void> {
  console.log(`🔍 Searching for "${term}" across all meetings...\n`);

  try {
    const output = await querySafeText(
      `SELECT m.id, m.topic, o.author, o.perspective, o.created_at
       FROM meetings m
       JOIN meeting_opinions o ON m.id = o.meeting_id
       WHERE o.perspective ILIKE $1
       ORDER BY o.created_at DESC
       LIMIT 30`,
      [`%${term}%`]
    );

    if (!output.trim()) {
      console.log("No results found.");
      return;
    }

    const results: { meetingId: string; topic: string; author: string; perspective: string; date: string }[] = [];

    for (const line of output.trim().split("\n")) {
      const parts = line.split("|");
      if (parts.length >= 5) {
        results.push({
          meetingId: parts[0] || "",
          topic: parts[1] || "",
          author: parts[2] || "",
          perspective: parts[3] || "",
          date: parts[4] ? new Date(parts[4]).toLocaleDateString() : "",
        });
      }
    }

    if (results.length === 0) {
      console.log("No matching opinions found.");
      return;
    }

    console.log(`Found ${results.length} matching opinion(s):\n`);

    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.topic.substring(0, 40)}${r.topic.length > 40 ? "..." : ""}`);
      console.log(`   Meeting ID: ${r.meetingId.substring(0, 8)}`);
      console.log(`   Author: ${r.author}`);
      console.log(`   Date: ${r.date}`);
      console.log(`   Opinion: "${r.perspective.substring(0, 80)}${r.perspective.length > 80 ? "..." : ""}"\n`);
    });
  } catch (e) {
    console.log("[ERROR] Search failed:", e);
  }
}

export async function recommendMeetings(meetingId: string): Promise<void> {
  const resolvedId = await resolveMeetingId(meetingId);
  if (!resolvedId) {
    console.log("Meeting not found.");
    return;
  }

  try {
    const currentPerspectives = await querySafeText(
      `SELECT perspective FROM meeting_opinions WHERE meeting_id = $1;`,
      [resolvedId]
    );
    const currentKeywords = new Set(
      currentPerspectives
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 4)
    );

    const allMeetings = await querySafeText(
      `SELECT id, topic FROM meetings WHERE id != $1 AND status = 'active';`,
      [resolvedId]
    );

    if (!allMeetings.trim()) {
      console.log("No other meetings to compare.");
      return;
    }

    const recommendations: { id: string; topic: string; score: number; commonKeywords: string[] }[] = [];

    for (const line of allMeetings.trim().split("\n")) {
      const parts = line.split("|");
      const id = parts[0];
      const topic = parts[1];

      if (id && topic) {
        const otherPerspectives = await querySafeText(
          `SELECT perspective FROM meeting_opinions WHERE meeting_id = $1;`,
          [id]
        );
        const otherKeywords = new Set(
          otherPerspectives
            .toLowerCase()
            .split(/\s+/)
            .filter(w => w.length > 4)
        );

        const common = [...currentKeywords].filter(k => otherKeywords.has(k));
        const score = common.length;

        if (score > 0) {
          recommendations.push({ id, topic, score, commonKeywords: common.slice(0, 5) });
        }
      }
    }

    recommendations.sort((a, b) => b.score - a.score);

    if (recommendations.length === 0) {
      console.log("No related meetings found.");
      return;
    }

    console.log(`🔗 Related Meetings:\n`);

    for (const rec of recommendations.slice(0, 5)) {
      console.log(`   📌 ${rec.id.substring(0, 8)} - "${rec.topic.substring(0, 40)}..."`);
      console.log(`      Similarity: ${rec.score} keywords`);
      console.log(`      Common: ${rec.commonKeywords.join(", ")}\n`);
    }
  } catch (e) {
    console.log("Error finding recommendations.");
  }
}

export async function autoSummarizeMeeting(meetingId: string): Promise<void> {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Auto Meeting Summary                   ║");
  console.log("╚════════════════════════════════════════════╝\n");

  try {
    const topic = (await querySafeText(`SELECT topic FROM meetings WHERE id = $1;`, [meetingId])).trim();
    const opinions = (await querySafeText(
      `SELECT author, perspective, position
       FROM meeting_opinions
       WHERE meeting_id = $1
       ORDER BY created_at;`,
      [meetingId]
    )).trim();

    if (!opinions) {
      console.log("No opinions to summarize.");
      return;
    }

    const lines = opinions.split("\n");
    const totalOpinions = lines.length;

    const authors: { [key: string]: number } = {};
    const positions: { [key: string]: number } = { support: 0, oppose: 0, neutral: 0 };
    const keywords: { [key: string]: number } = {};

    for (const line of lines) {
      const parts = line.split("|");
      const author = parts[0] || "";
      const perspective = parts[1] || "";
      const position = parts[2] || "neutral";

      authors[author] = (authors[author] || 0) + 1;
      positions[position] = (positions[position] || 0) + 1;

      const words = perspective.toLowerCase().split(/\s+/);
      for (const word of words) {
        if (word.length > 4 && !["about", "their", "would", "could", "should", "there", "these", "those", "which", "where", "when", "what", "this"].includes(word)) {
          keywords[word] = (keywords[word] || 0) + 1;
        }
      }
    }

    console.log(`📋 Topic: ${topic}`);
    console.log(`📊 Total Opinions: ${totalOpinions}`);
    console.log(`👥 Participants: ${Object.keys(authors).length}\n`);

    console.log("📈 Position Distribution:");
    for (const [pos, count] of Object.entries(positions)) {
      const pct = Math.round((count / totalOpinions) * 100);
      const bar = "█".repeat(Math.min(Math.floor(pct / 5), 20));
      console.log(`   ${pos}: ${bar} ${count} (${pct}%)`);
    }

    console.log("\n🔑 Top Keywords:");
    const topKeywords = Object.entries(keywords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    for (const [word, count] of topKeywords) {
      console.log(`   ${word}: ${count}`);
    }

    console.log("\n🏆 Top Contributors:");
    const topAuthors = Object.entries(authors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    for (const [author, count] of topAuthors) {
      const shortAuthor = author.substring(0, 25);
      console.log(`   ${shortAuthor}: ${count} opinions`);
    }

    console.log("\n──────────────────────────────────────────────────\n");
  } catch (e) {
    console.log("Error generating summary.");
  }
}

export async function showAllAIs(): Promise<void> {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     All AI Agents                          ║");
  console.log("╚════════════════════════════════════════════╝\n");

  try {
    const output = await querySafeText(
      `SELECT DISTINCT author, COUNT(*) as opinions, MAX(created_at) as last_active
       FROM meeting_opinions
       GROUP BY author
       ORDER BY opinions DESC
       LIMIT 20;`
    );

    if (!output.trim()) {
      console.log("  No AI agents found.\n");
      return;
    }

    output.split("\n").forEach((line, i) => {
      const parts = line.split("|");
      const author = parts[0] || "";
      const opinions = parts[1] || "0";
      const lastActive = parts[2] ? new Date(parts[2]).toLocaleDateString() : "unknown";

      let displayName = author;
      if (author.startsWith("S-TRAE-")) {
        displayName = author.replace("S-TRAE-", "");
      } else if (author.startsWith("bot_")) {
        displayName = `bot_${author.substring(4, 12)}`;
      }

      console.log(`  ${i + 1}. ${displayName.substring(0, 35)}`);
      console.log(`     Opinions: ${opinions} | Last active: ${lastActive}`);
    });

    console.log("\n──────────────────────────────────────────────────\n");
  } catch {
    console.log("  Unable to load AI agents.\n");
  }
}

export function showMeetingTemplates(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Meeting Templates                      ║");
  console.log("╚════════════════════════════════════════════╝\n");
  
  const templates = [
    {
      name: "brainstorm",
      description: "Brainstorming session",
      structure: ["Problem Statement", "Ideas Generation", "Discussion", "Action Items"]
    },
    {
      name: "decision",
      description: "Decision making meeting",
      structure: ["Context", "Options", "Pros/Cons", "Vote", "Decision"]
    },
    {
      name: "standup",
      description: "Daily standup",
      structure: ["What I did", "What I'm doing", "Blockers"]
    },
    {
      name: "retro",
      description: "Sprint retrospective",
      structure: ["What went well", "What didn't", "Action items"]
    },
    {
      name: "planning",
      description: "Sprint planning",
      structure: ["Goals", "Tasks", "Assignments", "Timeline"]
    }
  ];
  
  console.log("Available templates:\n");
  
  for (const t of templates) {
    console.log(`📌 ${t.name} - ${t.description}`);
    console.log(`   Structure: ${t.structure.join(" → ")}`);
    console.log("");
  }
  
  console.log("──────────────────────────────────────────────────");
  console.log("Usage: traenupi meeting create <topic> --template <name>");
}

export async function createMeetingFromTemplate(topic: string, templateName: string): Promise<void> {
  const templates: { [key: string]: string[] } = {
    brainstorm: ["Problem Statement", "Ideas Generation", "Discussion", "Action Items"],
    decision: ["Context", "Options", "Pros/Cons", "Vote", "Decision"],
    standup: ["What I did", "What I'm doing", "Blockers"],
    retro: ["What went well", "What didn't", "Action items"],
    planning: ["Goals", "Tasks", "Assignments", "Timeline"]
  };
  
  const structure = templates[templateName];
  if (!structure) {
    console.log(`[ERROR] Unknown template: ${templateName}`);
    console.log("Available: brainstorm, decision, standup, retro, planning");
    return;
  }
  
  try {
    const meetingId = (await querySafeText(
      `INSERT INTO meetings (topic, status, created_by) VALUES ($1, 'active', 'traenupi') RETURNING id;`,
      [topic]
    )).trim();
    
    console.log(`[TRAENUPI] Meeting created from template!`);
    console.log(`   ID: ${meetingId}`);
    console.log(`   Topic: ${topic}`);
    console.log(`   Template: ${templateName}`);
    console.log(`\n📋 Agenda:`);
    
    for (let i = 0; i < structure.length; i++) {
      console.log(`   ${i + 1}. ${structure[i]}`);
    }
    
    console.log(`\n💡 Use 'traenupi meeting say ${meetingId.substring(0, 8)} <message>' to add opinions`);
  } catch (e) {
    console.log("[ERROR] Failed to create meeting.");
  }
}
