import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PromptDriver, createDriver } from "../driver.js";
import { createTask } from "../task.js";
import type { DriverConfig } from "../types.js";

describe("PromptDriver", () => {
  it("throws if run is called without a task", async () => {
    const driver = new PromptDriver({
      intervalMs: 100,
      maxPrompts: 5,
      continuous: false,
      verbose: false,
      weaknessWeights: {
        context_loss: 1,
        incomplete_follow_through: 1,
        edge_case_blindness: 1,
        quality_drift: 1,
        verification_gap: 1,
        planning_drift: 1,
        overconfidence: 1,
        scope_creep: 1,
      },
    });

    await assert.rejects(() => driver.run(), /No task set/);
  });

  it("emits prompts and completes when not continuous", async () => {
    const outputChunks: string[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: unknown) => {
      if (typeof chunk === "string") {
        outputChunks.push(chunk);
      }
      return true;
    };

    try {
      const driver = new PromptDriver({
        intervalMs: 50,
        maxPrompts: 100,
        continuous: false,
        verbose: false,
        weaknessWeights: {
          context_loss: 1,
          incomplete_follow_through: 1,
          edge_case_blindness: 1,
          quality_drift: 1,
          verification_gap: 1,
          planning_drift: 1,
          overconfidence: 1,
          scope_creep: 1,
        },
      });

      const task = createTask("Test goal\n- Step one");
      driver.setTask(task);
      await driver.run();

      const fullOutput = outputChunks.join("");
      assert.ok(fullOutput.includes("ACTION"), "Should emit action prompt");
      assert.ok(fullOutput.includes("CHECKPOINT"), "Should emit checkpoint prompt");
      assert.ok(fullOutput.includes("COMPLETION"), "Should emit completion prompt");

      const state = driver.getState();
      assert.equal(state.phase, "complete");
      assert.ok(state.promptsEmitted > 0);
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  it("stops when maxPrompts is reached", async () => {
    const outputChunks: string[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: unknown) => {
      if (typeof chunk === "string") {
        outputChunks.push(chunk);
      }
      return true;
    };

    try {
      const driver = new PromptDriver({
        intervalMs: 50,
        maxPrompts: 3,
        continuous: true,
        verbose: false,
        weaknessWeights: {
          context_loss: 1,
          incomplete_follow_through: 1,
          edge_case_blindness: 1,
          quality_drift: 1,
          verification_gap: 1,
          planning_drift: 1,
          overconfidence: 1,
          scope_creep: 1,
        },
      });

      const task = createTask("Test\n- Step 1\n- Step 2\n- Step 3");
      driver.setTask(task);
      await driver.run();

      const state = driver.getState();
      assert.equal(state.promptsEmitted, 3);
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  it("stop() aborts the running driver", async () => {
    const outputChunks: string[] = [];
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = (chunk: unknown) => {
      if (typeof chunk === "string") {
        outputChunks.push(chunk);
      }
      return true;
    };

    try {
      const driver = new PromptDriver({
        intervalMs: 100,
        maxPrompts: 100,
        continuous: true,
        verbose: false,
        weaknessWeights: {
          context_loss: 1,
          incomplete_follow_through: 1,
          edge_case_blindness: 1,
          quality_drift: 1,
          verification_gap: 1,
          planning_drift: 1,
          overconfidence: 1,
          scope_creep: 1,
        },
      });

      const task = createTask("Test\n- Step 1");
      driver.setTask(task);

      const runPromise = driver.run();

      setTimeout(() => driver.stop(), 500);

      await runPromise;

      const state = driver.getState();
      assert.ok(state.promptsEmitted > 0, "Should have emitted some prompts before stop");
    } finally {
      process.stdout.write = originalWrite;
    }
  });

  it("getState returns a copy of the state", () => {
    const driver = new PromptDriver({
      intervalMs: 100,
      maxPrompts: 5,
      continuous: false,
      verbose: false,
      weaknessWeights: {
        context_loss: 1,
        incomplete_follow_through: 1,
        edge_case_blindness: 1,
        quality_drift: 1,
        verification_gap: 1,
        planning_drift: 1,
        overconfidence: 1,
        scope_creep: 1,
      },
    });

    const state1 = driver.getState();
    const state2 = driver.getState();
    assert.notStrictEqual(state1, state2);
  });
});

describe("createDriver", () => {
  it("merges partial config with defaults", () => {
    const driver = createDriver({ intervalMs: 500 });
    const state = driver.getState();

    assert.ok(state);
  });

  it("uses all defaults when no config provided", () => {
    const driver = createDriver();
    const state = driver.getState();
    assert.ok(state);
  });
});
