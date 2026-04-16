import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ANTI_WEAKNESS_PROMPTS,
  generateStepPrompts,
  generateCheckpointPrompt,
  generateCompletionPrompt,
  getRandomAntiWeaknessPrompt,
  resetPromptCounter,
} from "../prompts.js";
import type { TaskStep, WeaknessType } from "../types.js";

describe("ANTI_WEAKNESS_PROMPTS", () => {
  it("has prompts for every weakness type", () => {
    const weaknessTypes: WeaknessType[] = [
      "context_loss",
      "incomplete_follow_through",
      "edge_case_blindness",
      "quality_drift",
      "verification_gap",
      "planning_drift",
      "overconfidence",
      "scope_creep",
    ];

    for (const wt of weaknessTypes) {
      assert.ok(
        ANTI_WEAKNESS_PROMPTS[wt],
        `Missing prompts for weakness: ${wt}`,
      );
      assert.ok(
        ANTI_WEAKNESS_PROMPTS[wt].length > 0,
        `No prompts for weakness: ${wt}`,
      );
    }
  });

  it("each prompt has required fields", () => {
    for (const [weakness, prompts] of Object.entries(ANTI_WEAKNESS_PROMPTS)) {
      for (const prompt of prompts) {
        assert.ok(prompt.id, `Prompt in ${weakness} missing id`);
        assert.ok(prompt.category, `Prompt in ${weakness} missing category`);
        assert.equal(prompt.category, "anti_weakness");
        assert.equal(prompt.weakness, weakness);
        assert.ok(prompt.title, `Prompt in ${weakness} missing title`);
        assert.ok(prompt.body, `Prompt in ${weakness} missing body`);
        assert.ok(
          Array.isArray(prompt.checklist),
          `Prompt in ${weakness} checklist is not array`,
        );
      }
    }
  });
});

describe("generateStepPrompts", () => {
  it("generates action, verify, and reflect prompts for a step", () => {
    resetPromptCounter();
    const step: TaskStep = {
      index: 0,
      description: "Implement the feature",
      verification: ["Tests pass", "Code compiles"],
      edgeCases: ["Empty input"],
      completed: false,
    };

    const prompts = generateStepPrompts(step);

    const categories = prompts.map((p) => p.category);
    assert.ok(categories.includes("action"), "Missing action prompt");
    assert.ok(categories.includes("verify"), "Missing verify prompt");
    assert.ok(categories.includes("reflect"), "Missing reflect prompt");

    const verifyCount = categories.filter((c) => c === "verify").length;
    assert.equal(verifyCount, 2, "Should have one verify prompt per verification item");

    const reflectCount = categories.filter((c) => c === "reflect").length;
    assert.equal(reflectCount, 1, "Should have one reflect prompt per edge case");
  });

  it("includes step description in action prompt body", () => {
    resetPromptCounter();
    const step: TaskStep = {
      index: 2,
      description: "Write unit tests",
      verification: [],
      edgeCases: [],
      completed: false,
    };

    const prompts = generateStepPrompts(step);
    const actionPrompt = prompts.find((p) => p.category === "action");
    assert.ok(actionPrompt);
    assert.ok(actionPrompt.body.includes("Write unit tests"));
    assert.ok(actionPrompt.title.includes("3"));
  });
});

describe("generateCheckpointPrompt", () => {
  it("includes all verification and edge case items in checklist", () => {
    resetPromptCounter();
    const step: TaskStep = {
      index: 0,
      description: "Build the API",
      verification: ["Endpoints respond", "Status codes correct"],
      edgeCases: ["Rate limiting"],
      completed: false,
    };

    const prompt = generateCheckpointPrompt(step);

    assert.equal(prompt.category, "checkpoint");
    assert.ok(prompt.checklist);
    assert.ok(prompt.checklist!.some((c) => c.includes("Endpoints respond")));
    assert.ok(prompt.checklist!.some((c) => c.includes("Rate limiting")));
  });
});

describe("generateCompletionPrompt", () => {
  it("generates a completion prompt with goal", () => {
    resetPromptCounter();
    const prompt = generateCompletionPrompt({
      goal: "Ship the product",
      steps: [],
    });

    assert.equal(prompt.category, "completion");
    assert.ok(prompt.body.includes("Ship the product"));
    assert.ok(prompt.checklist);
    assert.ok(prompt.checklist!.length > 0);
  });
});

describe("getRandomAntiWeaknessPrompt", () => {
  it("returns a prompt from the ANTI_WEAKNESS_PROMPTS set", () => {
    const weights: Record<WeaknessType, number> = {
      context_loss: 1,
      incomplete_follow_through: 1,
      edge_case_blindness: 1,
      quality_drift: 1,
      verification_gap: 1,
      planning_drift: 1,
      overconfidence: 1,
      scope_creep: 1,
    };

    const prompt = getRandomAntiWeaknessPrompt(weights);

    assert.ok(prompt.id);
    assert.equal(prompt.category, "anti_weakness");
    assert.ok(prompt.title);
    assert.ok(prompt.body);
  });

  it("returns fallback prompt when all candidates are excluded", () => {
    const weights: Record<WeaknessType, number> = {
      context_loss: 10,
      incomplete_follow_through: 0,
      edge_case_blindness: 0,
      quality_drift: 0,
      verification_gap: 0,
      planning_drift: 0,
      overconfidence: 0,
      scope_creep: 0,
    };

    const allContextLossIds = new Set(
      ANTI_WEAKNESS_PROMPTS.context_loss.map((p) => p.id),
    );

    const prompt = getRandomAntiWeaknessPrompt(weights, allContextLossIds);

    assert.equal(prompt.category, "anti_weakness");
    assert.equal(prompt.weakness, "context_loss");
    assert.ok(prompt.title);
    assert.ok(prompt.body);
  });
});
