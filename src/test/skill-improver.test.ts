import { describe, it } from "node:test";
import assert from "node:assert";
import {
  scoreSkillCompleteness,
  identifyGaps,
  generateTriggerPhrases,
  extractKeywords,
  buildSkillImprovementPrompt,
  parseSkillImprovementResponse,
  filterSkillsForBatch,
  type SkillRecord,
  type SkillGap,
  type BatchImproveOptions,
  type SkillScanResult,
} from "../trae/skill-improver.js";

describe("skill-improver", () => {
  describe("scoreSkillCompleteness", () => {
    it("should return 0 for a completely empty skill", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "",
        description: null,
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      assert.strictEqual(scoreSkillCompleteness(skill), 0);
    });

    it("should return 100 for a fully populated skill", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "git-workflow",
        description: "Git commit workflow rules for Nezha",
        trigger_phrases: ["git", "commit", "push"],
        anti_patterns: ["force push"],
        quick_start: "Run git commit with task ID",
        examples: ["git commit -m 'fix: issue #123'"],
        content: { body: "Detailed instructions..." },
        instructions: "Always include task ID in commits",
        category: "development",
        tags: ["git", "workflow"],
      };
      assert.strictEqual(scoreSkillCompleteness(skill), 100);
    });

    it("should return partial score for partially populated skill", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "partial-skill",
        description: "A partial skill",
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const score = scoreSkillCompleteness(skill);
      assert.ok(score > 0);
      assert.ok(score < 100);
    });

    it("should weight trigger_phrases and description heavily", () => {
      const withTriggers: SkillRecord = {
        id: "test-id",
        name: "test",
        description: null,
        trigger_phrases: ["test"],
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const withoutTriggers: SkillRecord = {
        id: "test-id",
        name: "test",
        description: "A test skill",
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const withTriggersScore = scoreSkillCompleteness(withTriggers);
      const withoutTriggersScore = scoreSkillCompleteness(withoutTriggers);
      assert.ok(withTriggersScore > 0);
      assert.ok(withoutTriggersScore > 0);
    });
  });

  describe("identifyGaps", () => {
    it("should identify all gaps for empty skill", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "",
        description: null,
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const gaps = identifyGaps(skill);
      assert.ok(gaps.length >= 5);
      assert.ok(gaps.some(g => g.field === "name"));
      assert.ok(gaps.some(g => g.field === "description"));
      assert.ok(gaps.some(g => g.field === "trigger_phrases"));
    });

    it("should identify no gaps for fully populated skill", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "complete-skill",
        description: "A complete skill",
        trigger_phrases: ["test"],
        anti_patterns: ["bad"],
        quick_start: "Quick start guide",
        examples: ["Example usage"],
        content: { body: "Content" },
        instructions: "Instructions",
        category: "dev",
        tags: ["test"],
      };
      const gaps = identifyGaps(skill);
      assert.strictEqual(gaps.length, 0);
    });

    it("should identify specific missing fields", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "partial",
        description: "Has desc",
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const gaps = identifyGaps(skill);
      assert.ok(!gaps.some(g => g.field === "description"));
      assert.ok(gaps.some(g => g.field === "trigger_phrases"));
      assert.ok(gaps.some(g => g.field === "examples"));
    });

    it("should include severity for each gap", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "",
        description: null,
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const gaps = identifyGaps(skill);
      for (const gap of gaps) {
        assert.ok(["critical", "high", "medium", "low"].includes(gap.severity));
      }
    });
  });

  describe("extractKeywords", () => {
    it("should extract keywords from skill name", () => {
      const keywords = extractKeywords("git-workflow-commit");
      assert.ok(keywords.includes("git"));
      assert.ok(keywords.includes("workflow"));
      assert.ok(keywords.includes("commit"));
    });

    it("should extract keywords from description", () => {
      const keywords = extractKeywords("baidu-cloud", "Call Baidu Cloud AI APIs for OCR and Speech");
      assert.ok(keywords.includes("baidu"));
      assert.ok(keywords.includes("cloud"));
      assert.ok(keywords.includes("ocr"));
      assert.ok(keywords.includes("speech"));
    });

    it("should filter out common stop words", () => {
      const keywords = extractKeywords("test", "This is a skill for the system that does things");
      assert.ok(!keywords.includes("this"));
      assert.ok(!keywords.includes("is"));
      assert.ok(!keywords.includes("a"));
      assert.ok(!keywords.includes("the"));
      assert.ok(!keywords.includes("that"));
    });

    it("should return empty array for empty input", () => {
      const keywords = extractKeywords("");
      assert.strictEqual(keywords.length, 0);
    });
  });

  describe("generateTriggerPhrases", () => {
    it("should generate trigger phrases from skill name and description", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "git-workflow",
        description: "Git commit workflow rules for Nezha",
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const phrases = generateTriggerPhrases(skill);
      assert.ok(phrases.length > 0);
      assert.ok(phrases.includes("git"));
      assert.ok(phrases.includes("workflow"));
    });

    it("should include existing trigger phrases", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "test",
        description: "Test skill",
        trigger_phrases: ["existing-phrase"],
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const phrases = generateTriggerPhrases(skill);
      assert.ok(phrases.includes("existing-phrase"));
    });

    it("should not duplicate phrases", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "git-workflow",
        description: "Git workflow for git commits",
        trigger_phrases: ["git"],
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const phrases = generateTriggerPhrases(skill);
      const gitCount = phrases.filter(p => p === "git").length;
      assert.strictEqual(gitCount, 1);
    });
  });

  describe("buildSkillImprovementPrompt", () => {
    it("should build a prompt with skill name and gaps", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "review-learning-documentation",
        description: null,
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const gaps = identifyGaps(skill);
      const prompt = buildSkillImprovementPrompt(skill, gaps);
      assert.ok(prompt.includes("review-learning-documentation"));
      assert.ok(prompt.includes("description"));
      assert.ok(prompt.includes("[DESCRIPTION]"));
      assert.ok(prompt.includes("[INSTRUCTIONS]"));
    });

    it("should only request missing fields", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "test-skill",
        description: "Already has description",
        trigger_phrases: null,
        anti_patterns: null,
        quick_start: null,
        examples: null,
        content: null,
        instructions: null,
        category: null,
        tags: null,
      };
      const gaps = identifyGaps(skill);
      const prompt = buildSkillImprovementPrompt(skill, gaps);
      assert.ok(!prompt.includes("[DESCRIPTION]"));
      assert.ok(prompt.includes("[INSTRUCTIONS]"));
    });

    it("should return empty prompt for complete skill", () => {
      const skill: SkillRecord = {
        id: "test-id",
        name: "complete-skill",
        description: "A complete skill",
        trigger_phrases: ["test"],
        anti_patterns: ["bad"],
        quick_start: "Quick start",
        examples: ["Example"],
        content: { body: "Content" },
        instructions: "Instructions",
        category: "dev",
        tags: ["test"],
      };
      const gaps = identifyGaps(skill);
      const prompt = buildSkillImprovementPrompt(skill, gaps);
      assert.strictEqual(prompt, "");
    });
  });

  describe("parseSkillImprovementResponse", () => {
    it("should parse a well-formed response", () => {
      const response = `[DESCRIPTION]: A skill for reviewing learning documentation
[INSTRUCTIONS]: Use this skill when you need to review and validate learning entries
[QUICK_START]: Run 'nezha skill review' to start reviewing
[EXAMPLES]: nezha skill review --recent`;
      const result = parseSkillImprovementResponse(response);
      assert.ok(result.description);
      assert.ok(result.instructions);
      assert.ok(result.quick_start);
      assert.ok(result.examples);
      assert.ok(result.description!.includes("reviewing learning documentation"));
      assert.ok(result.instructions!.includes("review and validate"));
    });

    it("should parse partial response with only some fields", () => {
      const response = `[DESCRIPTION]: A test description
[INSTRUCTIONS]: Some instructions here`;
      const result = parseSkillImprovementResponse(response);
      assert.ok(result.description);
      assert.strictEqual(result.instructions, "Some instructions here");
      assert.strictEqual(result.quick_start, null);
      assert.strictEqual(result.examples, null);
    });

    it("should handle empty response", () => {
      const result = parseSkillImprovementResponse("");
      assert.strictEqual(result.description, null);
      assert.strictEqual(result.instructions, null);
      assert.strictEqual(result.quick_start, null);
      assert.strictEqual(result.examples, null);
    });

    it("should handle response without markers", () => {
      const response = "This is just plain text without any markers";
      const result = parseSkillImprovementResponse(response);
      assert.strictEqual(result.description, null);
    });

    it("should parse examples as array", () => {
      const response = `[EXAMPLES]: example1; example2; example3`;
      const result = parseSkillImprovementResponse(response);
      assert.ok(result.examples);
      assert.strictEqual(result.examples!.length, 3);
    });
  });

  describe("filterSkillsForBatch", () => {
    const createMockSkill = (name: string, score: number): { skill: SkillRecord; score: number; gaps: SkillGap[] } => {
      const skill: SkillRecord = {
        id: `id-${name}`,
        name,
        description: score >= 15 ? "Has description" : null,
        trigger_phrases: score >= 30 ? ["test"] : null,
        instructions: score >= 40 ? "Has instructions" : null,
        quick_start: score >= 48 ? "Quick start" : null,
        examples: score >= 56 ? ["example"] : null,
        content: score >= 66 ? { body: "content" } : null,
        category: score >= 71 ? "dev" : null,
        tags: score >= 78 ? ["tag"] : null,
        anti_patterns: score >= 85 ? ["anti"] : null,
      };
      return { skill, score, gaps: identifyGaps(skill) };
    };

    it("should filter skills below threshold", () => {
      const skills = [
        createMockSkill("low1", 25),
        createMockSkill("low2", 35),
        createMockSkill("high1", 60),
        createMockSkill("high2", 80),
      ];
      const options: BatchImproveOptions = { threshold: 50 };
      const filtered = filterSkillsForBatch(skills, options);
      assert.strictEqual(filtered.length, 2);
      assert.ok(filtered.every((s: SkillScanResult) => s.score < 50));
    });

    it("should respect limit option", () => {
      const skills = [
        createMockSkill("low1", 25),
        createMockSkill("low2", 30),
        createMockSkill("low3", 35),
        createMockSkill("low4", 40),
      ];
      const options: BatchImproveOptions = { threshold: 50, limit: 2 };
      const filtered = filterSkillsForBatch(skills, options);
      assert.strictEqual(filtered.length, 2);
    });

    it("should sort by score ascending (lowest first)", () => {
      const skills = [
        createMockSkill("mid", 40),
        createMockSkill("low", 25),
        createMockSkill("high", 45),
      ];
      const options: BatchImproveOptions = { threshold: 50 };
      const filtered = filterSkillsForBatch(skills, options);
      assert.strictEqual(filtered[0].skill.name, "low");
      assert.strictEqual(filtered[1].skill.name, "mid");
      assert.strictEqual(filtered[2].skill.name, "high");
    });

    it("should only include skills with AI-fixable gaps", () => {
      const skillWithNoAiGaps: SkillRecord = {
        id: "no-ai-gaps",
        name: "has-triggers-no-desc",
        description: null,
        trigger_phrases: ["test"],
        instructions: null,
        quick_start: null,
        examples: null,
        content: null,
        category: null,
        tags: ["tag"],
        anti_patterns: null,
      };
      const skills = [
        { skill: skillWithNoAiGaps, score: 22, gaps: identifyGaps(skillWithNoAiGaps) },
      ];
      const options: BatchImproveOptions = { threshold: 50 };
      const filtered = filterSkillsForBatch(skills, options);
      assert.strictEqual(filtered.length, 1);
    });

    it("should return empty array when no skills match", () => {
      const skills = [
        createMockSkill("high1", 60),
        createMockSkill("high2", 80),
      ];
      const options: BatchImproveOptions = { threshold: 50 };
      const filtered = filterSkillsForBatch(skills, options);
      assert.strictEqual(filtered.length, 0);
    });

    it("should use default threshold of 50", () => {
      const skills = [
        createMockSkill("below", 49),
        createMockSkill("at", 50),
        createMockSkill("above", 51),
      ];
      const options: BatchImproveOptions = {};
      const filtered = filterSkillsForBatch(skills, options);
      assert.strictEqual(filtered.length, 1);
      assert.strictEqual(filtered[0].skill.name, "below");
    });
  });
});
