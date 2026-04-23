import { describe, it } from "node:test";
import assert from "node:assert";
import {
  resolveId,
  resolveMeetingId,
  resolveTaskId,
  resolveIssueId,
  resolveAgentId,
  resolveOpinionId,
  resolveSkillId,
  detectEntityType,
  validateShortId,
  type EntityType,
  type ResolutionResult,
} from "../common/resolve-id.js";

describe("resolve-id", () => {
  describe("validateShortId", () => {
    it("should accept valid hex short IDs (8 chars)", () => {
      assert.strictEqual(validateShortId("1a2b3c4d"), true);
    });

    it("should accept valid full UUIDs (36 chars)", () => {
      assert.strictEqual(
        validateShortId("1d45fcd0-3fb1-4f8b-b0a2-8548b95519b8"),
        true
      );
    });

    it("should accept valid hex prefixes of various lengths", () => {
      assert.strictEqual(validateShortId("1a2b"), true);
      assert.strictEqual(validateShortId("1a2b3c"), true);
      assert.strictEqual(validateShortId("1a2b3c4d5e6f"), true);
    });

    it("should reject empty strings", () => {
      assert.strictEqual(validateShortId(""), false);
    });

    it("should reject non-hex characters", () => {
      assert.strictEqual(validateShortId("g1234567"), false);
      assert.strictEqual(validateShortId("xyz"), false);
    });

    it("should reject strings that are too short (less than 4 chars)", () => {
      assert.strictEqual(validateShortId("ab"), false);
      assert.strictEqual(validateShortId("1"), false);
    });

    it("should accept UUIDs with dashes", () => {
      assert.strictEqual(
        validateShortId("1d45fcd0-3fb1-4f8b"),
        true
      );
    });
  });

  describe("resolveId", () => {
    it("should return null for invalid short ID", () => {
      const result = resolveId("xx", "meeting");
      assert.strictEqual(result, null);
    });

    it("should return null for non-existent ID", () => {
      const result = resolveId("ffffffff", "meeting");
      assert.strictEqual(result, null);
    });

    it("should return full UUID for a full UUID input", () => {
      const fullId = "1d45fcd0-3fb1-4f8b-b0a2-8548b95519b8";
      const result = resolveId(fullId, "meeting");
      assert.ok(result);
      assert.strictEqual(result.id, fullId);
      assert.strictEqual(result.ambiguous, false);
      assert.strictEqual(result.matches, 1);
    });

    it("should return entity type in result", () => {
      const result = resolveId("1d45fcd0-3fb1-4f8b-b0a2-8548b95519b8", "task");
      if (result) {
        assert.strictEqual(result.entityType, "task");
      }
    });

    it("should detect ambiguity when multiple matches exist", () => {
      const result = resolveId("1", "meeting", { allowAmbiguous: true });
      if (result && result.matches > 1) {
        assert.strictEqual(result.ambiguous, true);
      }
    });

    it("should return null by default when ambiguous", () => {
      const result = resolveId("1", "meeting");
      if (result === null) {
        assert.strictEqual(result, null);
      }
    });
  });

  describe("resolveMeetingId", () => {
    it("should return null for non-existent meeting ID", () => {
      const result = resolveMeetingId("ffffffff");
      assert.strictEqual(result, null);
    });

    it("should return full UUID for a valid full UUID input", () => {
      const fullId = "1d45fcd0-3fb1-4f8b-b0a2-8548b95519b8";
      const result = resolveMeetingId(fullId);
      assert.strictEqual(result, fullId);
    });
  });

  describe("resolveTaskId", () => {
    it("should return null for non-existent task ID", () => {
      const result = resolveTaskId("ffffffff");
      assert.strictEqual(result, null);
    });
  });

  describe("resolveIssueId", () => {
    it("should return null for non-existent issue ID", () => {
      const result = resolveIssueId("ffffffff");
      assert.strictEqual(result, null);
    });
  });

  describe("resolveAgentId", () => {
    it("should return null for non-existent agent ID", () => {
      const result = resolveAgentId("ffffffff");
      assert.strictEqual(result, null);
    });
  });

  describe("resolveOpinionId", () => {
    it("should return null for non-existent opinion ID", () => {
      const result = resolveOpinionId("ffffffff");
      assert.strictEqual(result, null);
    });
  });

  describe("resolveSkillId", () => {
    it("should return null for non-existent skill ID", () => {
      const result = resolveSkillId("ffffffff");
      assert.strictEqual(result, null);
    });
  });

  describe("detectEntityType", () => {
    it("should return null for non-existent ID", () => {
      const result = detectEntityType("ffffffff");
      assert.strictEqual(result, null);
    });

    it("should return the entity type when found", () => {
      const fullId = "1d45fcd0-3fb1-4f8b-b0a2-8548b95519b8";
      const result = detectEntityType(fullId);
      if (result) {
        assert.ok(["meeting", "task", "issue", "agent", "opinion", "skill", "memory"].includes(result.entityType));
      }
    });
  });
});
