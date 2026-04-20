import { describe, it } from "node:test";
import assert from "node:assert";
import { psqlQuery, psqlExec, getAgentId, resolveMeetingId, setDbConfig, getDbConfig } from "../common/db.js";

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

  it("should generate agent ID with custom prefix", () => {
    const id = getAgentId("TEST-PREFIX");
    assert.ok(id.startsWith("TEST-PREFIX") || id.startsWith("S-TRAE"));
  });

  it("should handle psqlQuery with invalid SQL gracefully", () => {
    const result = psqlQuery("INVALID SQL SYNTAX", { silent: true });
    assert.strictEqual(result, "");
  });

  it("should handle psqlExec with invalid SQL gracefully", () => {
    const result = psqlExec("INVALID SQL SYNTAX", { silent: true });
    assert.strictEqual(result, false);
  });

  it("should return null for invalid meeting ID resolution", () => {
    const result = resolveMeetingId("invalid-id-that-does-not-exist");
    assert.strictEqual(result, null);
  });
});
