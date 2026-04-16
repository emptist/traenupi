import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseTaskFile,
  decomposeTaskFromDescription,
  createTaskFromFile,
  createTask,
} from "../task.js";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

const TMP_DIR = join(import.meta.dirname, "__tmp_test__");

describe("parseTaskFile", () => {
  it("parses a valid task file", () => {
    const taskPath = join(TMP_DIR, "valid-task.json");
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      taskPath,
      JSON.stringify({
        goal: "Build the feature",
        steps: [
          {
            description: "Step 1",
            verification: ["v1"],
            edgeCases: ["e1"],
          },
          {
            description: "Step 2",
          },
        ],
      }),
    );

    const result = parseTaskFile(taskPath);
    assert.equal(result.goal, "Build the feature");
    assert.equal(result.steps.length, 2);
    assert.equal(result.steps[0].description, "Step 1");
    assert.deepEqual(result.steps[0].verification, ["v1"]);
    assert.deepEqual(result.steps[0].edgeCases, ["e1"]);
    assert.equal(result.steps[1].description, "Step 2");

    rmSync(TMP_DIR, { recursive: true });
  });

  it("throws on missing goal", () => {
    const taskPath = join(TMP_DIR, "no-goal.json");
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      taskPath,
      JSON.stringify({
        steps: [{ description: "Step 1" }],
      }),
    );

    assert.throws(() => parseTaskFile(taskPath), /goal/);
    rmSync(TMP_DIR, { recursive: true });
  });

  it("throws on empty steps", () => {
    const taskPath = join(TMP_DIR, "no-steps.json");
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      taskPath,
      JSON.stringify({
        goal: "Do something",
        steps: [],
      }),
    );

    assert.throws(() => parseTaskFile(taskPath), /steps/);
    rmSync(TMP_DIR, { recursive: true });
  });

  it("throws on step missing description", () => {
    const taskPath = join(TMP_DIR, "no-desc.json");
    mkdirSync(TMP_DIR, { recursive: true });
    writeFileSync(
      taskPath,
      JSON.stringify({
        goal: "Do something",
        steps: [{ verification: ["v1"] }],
      }),
    );

    assert.throws(() => parseTaskFile(taskPath), /Step 0/);
    rmSync(TMP_DIR, { recursive: true });
  });
});

describe("decomposeTaskFromDescription", () => {
  it("uses first line as goal, rest as steps", () => {
    const result = decomposeTaskFromDescription(
      "Build the API\n- Design schema\n- Implement routes\n- Write tests",
    );

    assert.equal(result.goal, "Build the API");
    assert.equal(result.steps.length, 3);
    assert.equal(result.steps[0].description, "Design schema");
    assert.equal(result.steps[1].description, "Implement routes");
    assert.equal(result.steps[2].description, "Write tests");
  });

  it("handles single-line description", () => {
    const result = decomposeTaskFromDescription("Fix the bug");

    assert.equal(result.goal, "Fix the bug");
    assert.equal(result.steps.length, 1);
    assert.equal(result.steps[0].description, "Fix the bug");
  });

  it("strips leading list markers from step descriptions", () => {
    const result = decomposeTaskFromDescription(
      "Goal\n1. First step\n2. Second step\n* Third step",
    );

    assert.equal(result.steps[0].description, "First step");
    assert.equal(result.steps[1].description, "Second step");
    assert.equal(result.steps[2].description, "Third step");
  });
});

describe("createTaskFromFile", () => {
  it("creates a Task with proper defaults for missing verification/edgeCases", () => {
    const task = createTaskFromFile({
      goal: "Ship it",
      steps: [{ description: "Do the thing" }],
    });

    assert.ok(task.id);
    assert.equal(task.goal, "Ship it");
    assert.equal(task.steps.length, 1);
    assert.equal(task.steps[0].description, "Do the thing");
    assert.ok(task.steps[0].verification.length > 0);
    assert.ok(task.steps[0].edgeCases.length > 0);
    assert.equal(task.steps[0].completed, false);
    assert.equal(task.steps[0].index, 0);
  });

  it("preserves explicit verification and edgeCases", () => {
    const task = createTaskFromFile({
      goal: "Test goal",
      steps: [
        {
          description: "Step A",
          verification: ["v1", "v2"],
          edgeCases: ["e1"],
        },
      ],
    });

    assert.deepEqual(task.steps[0].verification, ["v1", "v2"]);
    assert.deepEqual(task.steps[0].edgeCases, ["e1"]);
  });
});

describe("createTask", () => {
  it("creates a task from a multi-line description", () => {
    const task = createTask("Build feature\n- Step 1\n- Step 2");

    assert.equal(task.goal, "Build feature");
    assert.equal(task.steps.length, 2);
    assert.ok(task.id);
    assert.ok(task.createdAt > 0);
  });
});
