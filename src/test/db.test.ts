import { describe, it } from "node:test";
import assert from "node:assert";
import { psqlQuery, psqlExec, getAgentId, resolveMeetingId, setDbConfig, getDbConfig, _resetDeprecationWarnings } from "../common/db.js";

describe("Database Module", () => {
  it("should get and set db config", () => {
    const original = getDbConfig();
    setDbConfig({ host: "testhost" });
    const updated = getDbConfig();
    
    assert.strictEqual(updated.host, "testhost");
    assert.strictEqual(updated.user, original.user);
    assert.strictEqual(updated.database, original.database);
    
    setDbConfig(original);
  });

  it("should generate agent ID via identity system or fallback", () => {
    const id = getAgentId("TEST-PREFIX");
    const isGleamId = id.startsWith("S-");
    const isFallback = id.startsWith("TEST-PREFIX-");
    assert.ok(isGleamId || isFallback, `Expected Gleam ID (S-*) or fallback (TEST-PREFIX-*), got: ${id}`);
  });

  it("should handle psqlQuery with invalid SQL gracefully", () => {
    const result = psqlQuery("INVALID SQL SYNTAX", { silent: true });
    assert.strictEqual(result, "");
  });

  it("should handle psqlExec with invalid SQL gracefully", () => {
    const result = psqlExec("INVALID SQL SYNTAX", { silent: true });
    assert.strictEqual(result, false);
  });

  it("should return null for invalid meeting ID resolution", async () => {
    const result = await resolveMeetingId("invalid-id-that-does-not-exist");
    assert.strictEqual(result, null);
  });

  it("should emit deprecation warnings for psqlQuery and psqlExec", () => {
    _resetDeprecationWarnings();
    const warnings: string[] = [];
    const originalWarn = console.warn;
    console.warn = (...args: any[]) => warnings.push(args.join(" "));
    try {
      psqlQuery("SELECT 1", { silent: true });
      psqlExec("SELECT 1", { silent: true });
      const hasQueryWarning = warnings.some(w => w.includes("DEPRECATED") && w.includes("psqlQuery"));
      const hasExecWarning = warnings.some(w => w.includes("DEPRECATED") && w.includes("psqlExec"));
      assert.ok(hasQueryWarning, `Expected deprecation warning for psqlQuery in: ${warnings.join("; ") || "none"}`);
      assert.ok(hasExecWarning, `Expected deprecation warning for psqlExec in: ${warnings.join("; ") || "none"}`);
    } finally {
      console.warn = originalWarn;
    }
  });
});
