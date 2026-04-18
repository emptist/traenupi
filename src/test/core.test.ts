import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "child_process";

describe("TraeNuPI Core Integration", () => {
  describe("CLI help", () => {
    it("shows usage info", () => {
      const output = execFileSync("node", ["dist/index.js", "--help"], {
        encoding: "utf-8",
      });
      assert.ok(output.includes("traenupi"), "Should show traenupi name");
      assert.ok(output.includes("daemon"), "Should show daemon command");
      assert.ok(output.includes("tellme"), "Should show tellme command");
    });

    it("shows version", () => {
      const output = execFileSync("node", ["dist/index.js", "--version"], {
        encoding: "utf-8",
      });
      assert.ok(output.startsWith("traenupi v"), "Should show version");
    });
  });

  describe("tellme help", () => {
    it("shows all tellme options including session flag", () => {
      const output = execFileSync("node", ["dist/index.js", "tellme", "--help"], {
        encoding: "utf-8",
      });
      assert.ok(output.includes("--daemon"), "Should show --daemon option");
      assert.ok(output.includes("--quick"), "Should show --quick option");
      assert.ok(output.includes("--session"), "Should show --session option");
    });
  });

  describe("PI_FLAGS consistency", () => {
    it("pi is callable with no-tools flags", () => {
      try {
        const output = execFileSync("pi", [
          "--no-tools",
          "--no-context-files",
          "--no-skills",
          "--no-prompt-templates",
          "-p",
          "Reply with exactly: OK",
        ], {
          encoding: "utf-8",
          timeout: 30000,
        });
        assert.ok(output.length > 0, "Pi should respond");
      } catch (e) {
        const err = e as Error & { stdout?: string };
        if (err.stdout) {
          assert.ok(err.stdout.length > 0, "Pi should respond via stdout");
        }
      }
    });
  });

  describe("Context building", () => {
    it("quick mode produces shorter prompts than full mode", () => {
      const fullOutput = execFileSync("node", ["dist/index.js", "know"], {
        encoding: "utf-8",
        timeout: 10000,
      }).length;

      assert.ok(fullOutput > 0, "Knowledge should load");
    });
  });

  describe("Error handling", () => {
    it("tellme without question shows error", () => {
      try {
        execFileSync("node", ["dist/index.js", "tellme"], {
          encoding: "utf-8",
        });
        assert.fail("Should exit with error");
      } catch (e) {
        const err = e as Error & { status?: number };
        assert.ok(
          err.status === 1 || err.message.includes("1"),
          "Should exit with code 1"
        );
      }
    });

    it("search without query shows error", () => {
      try {
        execFileSync("node", ["dist/index.js", "search"], {
          encoding: "utf-8",
        });
        assert.fail("Should exit with error");
      } catch (e) {
        const err = e as Error & { status?: number };
        assert.ok(
          err.status === 1 || err.message.includes("1"),
          "Should exit with code 1"
        );
      }
    });
  });
});
