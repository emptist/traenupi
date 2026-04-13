import type { DelegateResult } from "./types.js";

const OPENCODE_URL = process.env.OPENCODE_URL || "http://127.0.0.1:5111";
const DEFAULT_TIMEOUT = 300000;

export async function isOpenCodeRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${OPENCODE_URL}/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "health-check" }),
      signal: AbortSignal.timeout(3000),
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}

export async function checkUsage(): Promise<string> {
  try {
    const res = await fetch(`${OPENCODE_URL}/session/status`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return `HTTP ${res.status}`;
    const data = (await res.json()) as Record<
      string,
      { type?: string; message?: string; next?: number }
    >;
    const entries = Object.entries(data);
    if (entries.length === 0) return "idle";
    const lines = entries.map(([id, s]) => {
      const short = id.slice(0, 12);
      if (
        s.type === "retry" &&
        s.message?.includes("Free usage exceeded")
      ) {
        const reset = s.next
          ? new Date(s.next).toLocaleTimeString()
          : "unknown";
        return `${short}: FREE USAGE EXCEEDED (resets ${reset})`;
      }
      return `${short}: ${s.type || "unknown"}`;
    });
    return lines.join("; ");
  } catch (e) {
    return `error: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function delegate(
  task: string,
  timeout: number = DEFAULT_TIMEOUT,
): Promise<DelegateResult> {
  const sessionResponse = await fetch(`${OPENCODE_URL}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "TraeNuPI Delegation" }),
    signal: AbortSignal.timeout(timeout),
  });

  if (!sessionResponse.ok) {
    return {
      success: false,
      error: `Session creation failed: HTTP ${sessionResponse.status}`,
    };
  }

  const session = (await sessionResponse.json()) as { id: string };
  const sessionId = session.id.startsWith("ses_")
    ? session.id
    : `ses_${session.id}`;

  const asyncResponse = await fetch(
    `${OPENCODE_URL}/session/${sessionId}/prompt_async`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parts: [{ type: "text", text: task }] }),
      signal: AbortSignal.timeout(10000),
    },
  );

  if (asyncResponse.status !== 204) {
    return {
      success: false,
      error: `Async prompt failed: HTTP ${asyncResponse.status}`,
    };
  }

  const startTime = Date.now();
  const pollInterval = 3000;
  const maxPollTime = timeout - 5000;

  while (Date.now() - startTime < maxPollTime) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const statusResponse = await fetch(`${OPENCODE_URL}/session/status`, {
      signal: AbortSignal.timeout(5000),
    });
    if (statusResponse.ok) {
      const statusData = (await statusResponse.json()) as Record<
        string,
        { type?: string; message?: string }
      >;
      const sessionStatus = statusData[sessionId];
      if (
        sessionStatus?.type === "retry" &&
        sessionStatus.message?.includes("Free usage exceeded")
      ) {
        return {
          success: false,
          error: `OpenCode: ${sessionStatus.message}`,
        };
      }
    }

    const sessionInfo = await fetch(`${OPENCODE_URL}/session/${sessionId}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!sessionInfo.ok) continue;

    const sessionData = (await sessionInfo.json()) as {
      time?: { archived?: number };
    };
    if (sessionData.time?.archived != null) {
      const msgResponse = await fetch(
        `${OPENCODE_URL}/session/${sessionId}/message`,
        { signal: AbortSignal.timeout(timeout) },
      );
      if (!msgResponse.ok) {
        return {
          success: false,
          error: `Failed to get messages: HTTP ${msgResponse.status}`,
        };
      }

      const msgText = await msgResponse.text();
      let messages: Array<{
        info?: {
          role?: string;
          error?: { name?: string; data?: { message?: string } };
        };
        parts?: Array<{ type?: string; text?: string }>;
      }> = [];
      try {
        messages = JSON.parse(msgText) as typeof messages;
      } catch {
        return {
          success: false,
          error: `Invalid message response: ${msgText.substring(0, 200)}`,
        };
      }

      const assistantMsg = messages.find(
        (m) => m.info?.role === "assistant",
      );
      if (assistantMsg?.info?.error) {
        const errMsg =
          assistantMsg.info.error.data?.message ||
          assistantMsg.info.error.name ||
          "Unknown error";
        return { success: false, error: `OpenCode error: ${errMsg}` };
      }

      const textParts = (assistantMsg?.parts || [])
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text!);

      return {
        success: true,
        output: textParts.join("\n") || "Task completed (no text output)",
      };
    }
  }

  return { success: false, error: "Delegation timed out" };
}
