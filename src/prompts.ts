import type { Prompt, WeaknessType, PromptCategory, TaskStep } from "./types.js";

let promptCounter = 0;

function pid(category: PromptCategory, weakness?: WeaknessType): string {
  promptCounter += 1;
  return `${category}_${weakness ?? "general"}_${promptCounter}`;
}

export function resetPromptCounter(): void {
  promptCounter = 0;
}

export const ANTI_WEAKNESS_PROMPTS: Record<WeaknessType, Prompt[]> = {
  context_loss: [
    {
      id: pid("anti_weakness", "context_loss"),
      category: "anti_weakness",
      weakness: "context_loss",
      title: "Context Anchor",
      body: "Re-read the original task goal. Are you still working toward it, or have you drifted? State the original goal in one sentence, then compare your current action against it.",
      checklist: [
        "I can state the original goal clearly",
        "My current action directly serves that goal",
        "I haven't introduced unnecessary tangents",
      ],
    },
    {
      id: pid("anti_weakness", "context_loss"),
      category: "anti_weakness",
      weakness: "context_loss",
      title: "Progress Recap",
      body: "Summarize what you've accomplished so far in 3 bullet points. Then state what remains. This forces you to maintain a coherent mental model of the work.",
      checklist: [
        "I can list completed items",
        "I can list remaining items",
        "The remaining items still align with the goal",
      ],
    },
    {
      id: pid("anti_weakness", "context_loss"),
      category: "anti_weakness",
      weakness: "context_loss",
      title: "Assumption Audit",
      body: "List every assumption you're currently making. Which ones have you verified? Which ones are unverified? Unverified assumptions are context loss in disguise.",
      checklist: [
        "I've listed my current assumptions",
        "I've marked which are verified vs unverified",
        "I have a plan to verify the critical unverified ones",
      ],
    },
  ],

  incomplete_follow_through: [
    {
      id: pid("anti_weakness", "incomplete_follow_through"),
      category: "anti_weakness",
      weakness: "incomplete_follow_through",
      title: "Completion Check",
      body: "Before moving to the next step, verify the current step is FULLY complete. Not 'mostly done' - FULLY done. Run the tests. Check the output. Verify end-to-end.",
      checklist: [
        "All code for this step is written",
        "Tests pass for this step",
        "No TODO comments left behind",
        "The feature works end-to-end, not just in isolation",
      ],
    },
    {
      id: pid("anti_weakness", "incomplete_follow_through"),
      category: "anti_weakness",
      weakness: "incomplete_follow_through",
      title: "The Last 10%",
      body: "The last 10% of a task takes 90% of the effort. Did you actually finish, or did you stop when it 'basically works'? Check: error handling, edge cases, documentation, cleanup.",
      checklist: [
        "Error paths are handled",
        "Edge cases are covered",
        "No dead code or debug artifacts remain",
        "The implementation matches the specification exactly",
      ],
    },
    {
      id: pid("anti_weakness", "incomplete_follow_through"),
      category: "anti_weakness",
      weakness: "incomplete_follow_through",
      title: "Follow-Up Sweep",
      body: "Look back at the last 3 actions you took. Did you complete each one fully, or did you leave loose ends? Go back and tie off any loose ends before proceeding.",
      checklist: [
        "I reviewed my recent actions",
        "Each action has a clear completion state",
        "No dangling references or unfinished refactors",
      ],
    },
  ],

  edge_case_blindness: [
    {
      id: pid("anti_weakness", "edge_case_blindness"),
      category: "anti_weakness",
      weakness: "edge_case_blindness",
      title: "Empty Input Test",
      body: "What happens when the input is empty, null, undefined, or zero-length? Don't just handle the happy path - verify the sad paths too.",
      checklist: [
        "Empty input is handled gracefully",
        "Null/undefined input is handled",
        "Zero-length collections are handled",
        "Error messages are helpful, not cryptic",
      ],
    },
    {
      id: pid("anti_weakness", "edge_case_blindness"),
      category: "anti_weakness",
      weakness: "edge_case_blindness",
      title: "Boundary Probe",
      body: "What are the boundary conditions? Off-by-one errors, maximum values, minimum values, concurrent access. Think of at least 3 boundary cases for the current code.",
      checklist: [
        "I identified boundary conditions",
        "I tested or verified boundary behavior",
        "Off-by-one errors are ruled out",
        "Concurrent access is safe (if applicable)",
      ],
    },
    {
      id: pid("anti_weakness", "edge_case_blindness"),
      category: "anti_weakness",
      weakness: "edge_case_blindness",
      title: "Adversarial Input",
      body: "If someone wanted to break this code, what would they feed it? Extremely long strings, deeply nested objects, circular references, special characters. Think like an attacker.",
      checklist: [
        "I considered adversarial inputs",
        "The code doesn't crash on malformed input",
        "Resource limits are enforced (if applicable)",
        "Security-sensitive operations are validated",
      ],
    },
  ],

  quality_drift: [
    {
      id: pid("anti_weakness", "quality_drift"),
      category: "anti_weakness",
      weakness: "quality_drift",
      title: "Pattern Consistency Check",
      body: "Compare your latest code with the existing codebase patterns. Are you following the same conventions? Same naming style? Same error handling approach? Consistency is quality.",
      checklist: [
        "Naming follows existing conventions",
        "Error handling matches the codebase pattern",
        "File organization follows the project structure",
        "Dependencies are consistent with what's already used",
      ],
    },
    {
      id: pid("anti_weakness", "quality_drift"),
      category: "anti_weakness",
      weakness: "quality_drift",
      title: "Simplicity Audit",
      body: "Is this the simplest solution that works? Or have you over-engineered it? Remove any abstraction that isn't earning its keep. YAGNI - You Ain't Gonna Need It.",
      checklist: [
        "No premature abstractions",
        "No unused parameters or variables",
        "The code is readable without comments",
        "I haven't introduced unnecessary dependencies",
      ],
    },
  ],

  verification_gap: [
    {
      id: pid("anti_weakness", "verification_gap"),
      category: "anti_weakness",
      weakness: "verification_gap",
      title: "Run The Tests",
      body: "Stop. Run the test suite NOW. Don't assume tests pass - verify it. If there are no tests, write at least one test for the current change before proceeding.",
      checklist: [
        "I ran the test suite",
        "All tests pass",
        "I didn't skip failing tests",
        "New code has test coverage",
      ],
    },
    {
      id: pid("anti_weakness", "verification_gap"),
      category: "anti_weakness",
      weakness: "verification_gap",
      title: "Type Check Run",
      body: "Run the type checker / linter NOW. Type errors and lint warnings are bugs waiting to happen. Zero warnings policy.",
      checklist: [
        "Type checker passes with no errors",
        "Linter passes with no warnings",
        "No 'any' types introduced",
        "No @ts-ignore or equivalent suppressions",
      ],
    },
    {
      id: pid("anti_weakness", "verification_gap"),
      category: "anti_weakness",
      weakness: "verification_gap",
      title: "Manual Smoke Test",
      body: "Can you actually run the code and see it work? Not just 'the tests pass' - does it work in the real environment? Do a manual smoke test.",
      checklist: [
        "I ran the code manually",
        "The output matches expectations",
        "Error scenarios produce helpful output",
        "Performance is acceptable",
      ],
    },
  ],

  planning_drift: [
    {
      id: pid("anti_weakness", "planning_drift"),
      category: "anti_weakness",
      weakness: "planning_drift",
      title: "Plan vs Reality Check",
      body: "Compare your original plan with what you're actually doing. Are you still following the plan, or have you improvised a different approach? If different, is it better, or just easier?",
      checklist: [
        "I can state the original plan",
        "My current approach aligns with it",
        "Any deviations are intentional improvements",
        "I haven't silently abandoned parts of the plan",
      ],
    },
    {
      id: pid("anti_weakness", "planning_drift"),
      category: "anti_weakness",
      weakness: "planning_drift",
      title: "Dependency Map",
      body: "What does this step depend on? What depends on this step? Make sure you're not building on an unstable foundation or blocking future work.",
      checklist: [
        "Prerequisites for this step are complete",
        "This step doesn't block future work unnecessarily",
        "I understand the dependency chain",
        "I'm working on the right thing at the right time",
      ],
    },
  ],

  overconfidence: [
    {
      id: pid("anti_weakness", "overconfidence"),
      category: "anti_weakness",
      weakness: "overconfidence",
      title: "Confidence Calibration",
      body: "How confident are you that this works? Now halve that confidence. What would change your mind? What evidence would prove you wrong? Seek disconfirming evidence.",
      checklist: [
        "I've identified what could go wrong",
        "I've looked for disconfirming evidence",
        "I've tested the thing I'm most sure about",
        "I'm not relying on 'it should work' reasoning",
      ],
    },
    {
      id: pid("anti_weakness", "overconfidence"),
      category: "anti_weakness",
      weakness: "overconfidence",
      title: "Second Opinion Prompt",
      body: "If a senior engineer reviewed this code, what would they criticize? Think of the harshest reasonable critique. Now address it proactively.",
      checklist: [
        "I've identified likely critique points",
        "I've addressed the most important ones",
        "The code would survive a serious review",
        "I haven't cut corners I wouldn't accept in others' code",
      ],
    },
  ],

  scope_creep: [
    {
      id: pid("anti_weakness", "scope_creep"),
      category: "anti_weakness",
      weakness: "scope_creep",
      title: "Scope Boundary Check",
      body: "Are you doing more than what was asked? 'While I'm at it' is the enemy of shipping. Complete the current scope first. Extensions can be separate tasks.",
      checklist: [
        "I'm only implementing what was requested",
        "I haven't added 'nice to have' features",
        "Refactoring is minimal and necessary",
        "I can ship what I have now as a complete unit",
      ],
    },
    {
      id: pid("anti_weakness", "scope_creep"),
      category: "anti_weakness",
      weakness: "scope_creep",
      title: "Minimum Viable Change",
      body: "What is the smallest change that satisfies the requirement? Do that. Nothing more. You can always iterate later. Ship small, ship often.",
      checklist: [
        "I've identified the minimum change needed",
        "I'm not gold-plating the solution",
        "The change is self-contained",
        "I can explain why every line of code is necessary",
      ],
    },
  ],
};

export function generateStepPrompts(step: TaskStep): Prompt[] {
  const prompts: Prompt[] = [];

  prompts.push({
    id: pid("action"),
    category: "action",
    title: `Step ${step.index + 1}: Execute`,
    body: `DO THIS NOW: ${step.description}\n\nFocus on this step only. Do not proceed to the next step until this one is fully complete.`,
    checklist: [
      "I understand what this step requires",
      "I have a clear approach in mind",
      "I can implement this without scope creep",
    ],
  });

  for (const v of step.verification) {
    prompts.push({
      id: pid("verify"),
      category: "verify",
      title: `Step ${step.index + 1}: Verify`,
      body: `VERIFY: ${v}\n\nDo not skip this verification. Run it now. Confirm it passes before moving on.`,
      checklist: [
        `I verified: ${v}`,
        "The verification actually ran (not just assumed)",
        "The result is what I expected",
      ],
    });
  }

  for (const ec of step.edgeCases) {
    prompts.push({
      id: pid("reflect"),
      category: "reflect",
      title: `Step ${step.index + 1}: Edge Case`,
      body: `EDGE CASE: ${ec}\n\nHave you handled this case? If not, handle it now before moving on.`,
      checklist: [
        `I handled the edge case: ${ec}`,
        "The handling is tested",
        "The handling doesn't break the happy path",
      ],
    });
  }

  return prompts;
}

export function generateCheckpointPrompt(step: TaskStep): Prompt {
  return {
    id: pid("checkpoint"),
    category: "checkpoint",
    title: `Checkpoint: Step ${step.index + 1}`,
    body: `STEP COMPLETE CHECKPOINT for: "${step.description}"\n\nBefore moving on, confirm ALL of the following:`,
    checklist: [
      `Step "${step.description}" is fully implemented`,
      ...step.verification.map((v) => `Verified: ${v}`),
      ...step.edgeCases.map((ec) => `Edge case handled: ${ec}`),
      "Tests pass for this step",
      "No dead code or debug artifacts",
      "Code follows existing patterns and conventions",
    ],
  };
}

export function generateCompletionPrompt(task: { goal: string; steps: TaskStep[] }): Prompt {
  return {
    id: pid("completion"),
    category: "completion",
    title: "Task Completion Verification",
    body: `FINAL CHECK for goal: "${task.goal}"\n\nAll steps have been executed. Now verify the COMPLETE solution:`,
    checklist: [
      "All steps are fully complete",
      "The original goal is achieved",
      "All tests pass",
      "Type checking / linting passes",
      "No regressions in existing functionality",
      "Code is clean with no debug artifacts",
      "The solution works end-to-end in the real environment",
    ],
  };
}

export function getRandomAntiWeaknessPrompt(
  weights: Record<WeaknessType, number>,
  exclude?: Set<string>,
): Prompt {
  const entries = Object.entries(weights) as [WeaknessType, number][];
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let random = Math.random() * totalWeight;

  let selectedWeakness: WeaknessType = "verification_gap";
  for (const [weakness, weight] of entries) {
    random -= weight;
    if (random <= 0) {
      selectedWeakness = weakness;
      break;
    }
  }

  const candidates = ANTI_WEAKNESS_PROMPTS[selectedWeakness].filter(
    (p) => !exclude?.has(p.id),
  );

  if (candidates.length === 0) {
    return ANTI_WEAKNESS_PROMPTS[selectedWeakness][0];
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}
