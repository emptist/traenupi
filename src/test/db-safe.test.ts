import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import {
  querySafe,
  queryOne,
  execSafe,
  transaction,
  validateIdentifier,
  escapeIdentifier,
  closePool,
} from "../common/db-safe.js";

describe("db-safe", () => {
  before(async () => {
    await execSafe("CREATE TABLE IF NOT EXISTS test_users (id SERIAL PRIMARY KEY, name TEXT NOT NULL)");
  });

  after(async () => {
    await execSafe("DROP TABLE IF EXISTS test_users");
    await closePool();
  });

  describe("validateIdentifier", () => {
    it("should validate correct identifiers", () => {
      assert.strictEqual(validateIdentifier("users"), true);
      assert.strictEqual(validateIdentifier("user_name"), true);
      assert.strictEqual(validateIdentifier("userName"), true);
      assert.strictEqual(validateIdentifier("_users"), true);
    });

    it("should reject invalid identifiers", () => {
      assert.strictEqual(validateIdentifier("123users"), false);
      assert.strictEqual(validateIdentifier("user-name"), false);
      assert.strictEqual(validateIdentifier("user name"), false);
      assert.strictEqual(validateIdentifier(""), false);
    });
  });

  describe("escapeIdentifier", () => {
    it("should escape valid identifiers", () => {
      assert.strictEqual(escapeIdentifier("users"), '"users"');
      assert.strictEqual(escapeIdentifier("user_name"), '"user_name"');
    });

    it("should throw on invalid identifiers", () => {
      assert.throws(() => escapeIdentifier("123users"));
      assert.throws(() => escapeIdentifier("user-name"));
    });
  });

  describe("querySafe", () => {
    it("should insert and query data safely", async () => {
      await execSafe("DELETE FROM test_users");
      await execSafe("INSERT INTO test_users (name) VALUES ($1)", ["Alice"]);
      await execSafe("INSERT INTO test_users (name) VALUES ($1)", ["Bob"]);

      const rows = await querySafe<{ id: number; name: string }>(
        "SELECT * FROM test_users ORDER BY id"
      );
      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[0].name, "Alice");
      assert.strictEqual(rows[1].name, "Bob");
    });

    it("should prevent SQL injection", async () => {
      await execSafe("DELETE FROM test_users");
      await execSafe("INSERT INTO test_users (name) VALUES ($1)", ["Alice"]);

      const maliciousInput = "'; DROP TABLE test_users; --";
      await execSafe("INSERT INTO test_users (name) VALUES ($1)", [maliciousInput]);

      const rows = await querySafe<{ id: number; name: string }>(
        "SELECT * FROM test_users ORDER BY id"
      );
      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[1].name, maliciousInput);

      const tableExists = await queryOne<{ exists: boolean }>(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
        ["test_users"]
      );
      assert.strictEqual(tableExists?.exists, true);
    });
  });

  describe("queryOne", () => {
    it("should return a single row", async () => {
      await execSafe("DELETE FROM test_users");
      await execSafe("INSERT INTO test_users (name) VALUES ($1)", ["Charlie"]);

      const row = await queryOne<{ id: number; name: string }>(
        "SELECT * FROM test_users WHERE name = $1",
        ["Charlie"]
      );
      assert.ok(row);
      assert.strictEqual(row.name, "Charlie");
    });

    it("should return null when no rows found", async () => {
      const row = await queryOne<{ id: number; name: string }>(
        "SELECT * FROM test_users WHERE name = $1",
        ["NonExistent"]
      );
      assert.strictEqual(row, null);
    });
  });

  describe("transaction", () => {
    it("should commit transaction on success", async () => {
      await execSafe("DELETE FROM test_users");

      const result = await transaction(async (client) => {
        await client.query("INSERT INTO test_users (name) VALUES ($1)", ["Transaction1"]);
        await client.query("INSERT INTO test_users (name) VALUES ($1)", ["Transaction2"]);
        return "success";
      });

      assert.strictEqual(result, "success");

      const rows = await querySafe<{ id: number; name: string }>(
        "SELECT * FROM test_users ORDER BY id"
      );
      assert.strictEqual(rows.length, 2);
    });

    it("should rollback transaction on error", async () => {
      await execSafe("DELETE FROM test_users");

      const result = await transaction(async (client) => {
        await client.query("INSERT INTO test_users (name) VALUES ($1)", ["Rollback1"]);
        throw new Error("Test error");
      });

      assert.strictEqual(result, null);

      const rows = await querySafe<{ id: number; name: string }>(
        "SELECT * FROM test_users"
      );
      assert.strictEqual(rows.length, 0);
    });
  });
});
