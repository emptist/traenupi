import type { AIPresence } from "../common/types.js";
import { psqlQuery, psqlExec, getAgentId } from "../common/db.js";

export function loadPresence(): AIPresence[] {
  try {
    const output = psqlQuery("SELECT id, status, agent_type, last_heartbeat, working_on FROM agent_sessions ORDER BY last_heartbeat DESC;");
    if (!output.trim()) return [];

    return output.split("\n").map(line => {
      const parts = line.split("|");
      const lastHeartbeat = parts[3] ? new Date(parts[3]).getTime() : 0;
      return {
        agentId: parts[0] || "",
        status: parts[1] || "",
        project: parts[2] || "",
        lastSeen: lastHeartbeat,
        focus: parts[4] || "",
      };
    });
  } catch {
    return loadPresenceLocal();
  }
}

export function loadPresenceLocal(): AIPresence[] {
  return [];
}

export function savePresenceLocal(_presence: AIPresence[]): void {}

export function updatePresence(agentId: string, status: string, focus: string, _project: string): void {
  const safeStatus = status.replace(/'/g, "''");
  const safeFocus = focus.replace(/'/g, "''");

  psqlExec(`
    INSERT INTO agent_sessions (id, status, working_on, project, last_heartbeat, started_at)
    VALUES ('${agentId}', 'alive', '${safeStatus} - ${safeFocus}', 'traenupi', NOW(), COALESCE((SELECT started_at FROM agent_sessions WHERE id = '${agentId}'), NOW()))
    ON CONFLICT (id) DO UPDATE SET
      status = 'alive',
      working_on = '${safeStatus} - ${safeFocus}',
      last_heartbeat = NOW();
  `);
}

export function getOnlineAIs(): AIPresence[] {
  const presence = loadPresence();
  const tenMinutes = 10 * 60 * 1000;
  return presence.filter(p => Date.now() - p.lastSeen < tenMinutes);
}

export function showPresence(): void {
  const online = getOnlineAIs();

  console.log("╔════════════════════════════════════════════╗");
  console.log("║     AI Presence - Who's Online             ║");
  console.log("╚════════════════════════════════════════════╝\n");

  if (online.length === 0) {
    console.log("  No AIs currently online.\n");
  } else {
    console.log(`🌐 ${online.length} AI(s) online:\n`);

    online.forEach(ai => {
      const timeSince = Math.floor((Date.now() - ai.lastSeen) / 60000);
      const timeStr = timeSince < 1 ? "just now" : `${timeSince}m ago`;

      let displayName = ai.agentId;
      if (ai.agentId.startsWith("S-TRAE-")) {
        displayName = ai.agentId.replace("S-TRAE-", "");
      } else if (ai.agentId.startsWith("S-nezha-")) {
        displayName = ai.agentId.replace("S-nezha-", "nezha/");
      } else if (ai.agentId.startsWith("bot_")) {
        displayName = `bot_${ai.agentId.substring(4, 12)}`;
      } else if (ai.agentId.startsWith("baby-ai-")) {
        displayName = `baby-ai/${ai.agentId.substring(8, 16)}`;
      }

      console.log(`👤 ${displayName}`);
      console.log(`   Status: ${ai.status}`);
      console.log(`   Project: ${ai.project}`);
      console.log(`   Last seen: ${timeStr}`);
      console.log();
    });
  }

  console.log("──────────────────────────────────────────────────\n");
}

export function showActivityHeatmap(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     Activity Heatmap (Last 24 Hours)       ║");
  console.log("╚════════════════════════════════════════════╝\n");

  try {
    const output = psqlQuery(`
      SELECT 
        EXTRACT(HOUR FROM created_at) as hour,
        COUNT(*) as count
      FROM meeting_opinions
      WHERE created_at > NOW() - INTERVAL '24 hours'
      GROUP BY hour
      ORDER BY hour;
    `);

    if (!output.trim()) {
      console.log("  No activity in the last 24 hours.\n");
      return;
    }

    const hours: number[] = Array(24).fill(0);
    output.split("\n").forEach(line => {
      const parts = line.split("|");
      const hour = parseInt(parts[0]);
      const count = parseInt(parts[1]);
      if (!isNaN(hour) && !isNaN(count)) {
        hours[hour] = count;
      }
    });

    const maxCount = Math.max(...hours, 1);

    for (let i = 0; i < 24; i += 6) {
      const row: string[] = [];
      for (let j = 0; j < 6; j++) {
        const hour = i + j;
        const count = hours[hour];
        const intensity = Math.floor((count / maxCount) * 4);
        const blocks = ["░", "▒", "▓", "█"];
        const block = count === 0 ? "░" : blocks[Math.min(intensity, 3)];
        row.push(`${hour.toString().padStart(2, "0")}:${block}${count.toString().padStart(2, " ")}`);
      }
      console.log(`  ${row.join("  ")}`);
    }

    console.log("\n  Legend: ░=0  ▒=low  ▓=medium  █=high\n");
  } catch {
    console.log("  Unable to load activity data.\n");
  }

  console.log("──────────────────────────────────────────────────\n");
}

export function showCollaboration(): void {
  console.log("╔════════════════════════════════════════════╗");
  console.log("║     AI Collaboration Analytics             ║");
  console.log("╚════════════════════════════════════════════╝\n");

  try {
    const agentsOutput = psqlQuery(`
      SELECT author, COUNT(*) as opinion_count
      FROM meeting_opinions
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY author
      ORDER BY opinion_count DESC
      LIMIT 10;
    `);

    if (!agentsOutput.trim()) {
      console.log("  No collaboration data available.\n");
    } else {
      console.log("  Top Contributors (Last 7 Days):\n");
      agentsOutput.split("\n").forEach((line, i) => {
        const parts = line.split("|");
        const author = parts[0] || "";
        const count = parts[1] || "0";

        let displayName = author;
        if (author.startsWith("S-TRAE-")) {
          displayName = author.replace("S-TRAE-", "");
        } else if (author.startsWith("S-nezha-")) {
          displayName = author.replace("S-nezha-", "nezha/");
        } else if (author.startsWith("bot_")) {
          displayName = `bot_${author.substring(4, 12)}`;
        } else if (author.startsWith("baby-ai-")) {
          displayName = `baby-ai/${author.substring(8, 16)}`;
        }

        console.log(`  ${i + 1}. ${displayName.substring(0, 30)}`);
        console.log(`     ${count} opinions`);
      });
    }
  } catch {
    console.log("  Unable to load collaboration data.\n");
  }

  console.log("\n──────────────────────────────────────────────────\n");
}
