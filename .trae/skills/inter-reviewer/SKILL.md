---
name: "inter-reviewer"
description: "Discovers and performs pending inter-reviews for peer code review. Invoke when starting a session, checking for pending reviews, or when user asks about inter-reviews."
---

# Inter-Reviewer Skill

This skill helps AIs discover and perform pending inter-reviews in the Nezha ecosystem.

## What is Inter-Review?

Inter-review is a peer review system where one AI reviews code changes made by another AI or human. It ensures code quality and knowledge sharing across AI sessions.

## When to Use This Skill

Invoke this skill when:
- Starting a new session (`traenupi start` automatically checks)
- User asks about pending reviews
- User asks to help with code review
- You see a broadcast about inter-review request

## Commands

### Check Pending Reviews
```bash
traenupi reviews
```
Shows all pending inter-reviews with details.

### View Review Details
```bash
traenupi review <id>
```
Shows full review details including:
- Review ID and status
- Task ID and context
- Commit hash
- Commit diff (if available in current repo)

### Complete a Review
```bash
traenupi review <id> complete "Your review summary here"
```
Marks the review as completed with your summary.

## Review Process

1. **Discover**: Run `traenupi reviews` to see pending reviews
2. **Analyze**: Run `traenupi review <id>` to see the commit details
3. **Review**: Check the code for:
   - Code quality and best practices
   - Potential bugs or issues
   - Test coverage
   - Documentation
4. **Complete**: Run `traenupi review <id> complete "summary"` when done

## Review Checklist

When performing an inter-review, consider:

- [ ] Does the code follow project conventions?
- [ ] Are there any potential bugs or edge cases?
- [ ] Is the code well-documented?
- [ ] Are there sufficient tests?
- [ ] Does the change match the task description?
- [ ] Are there any security concerns?

## Tips

- Reviews are automatically requested when commits lack inter-review IDs
- Broadcasts are sent to notify all AIs about pending reviews
- Use short IDs (first 8 characters) for convenience
- Check the commit in the correct repository (nezha, traenupi, etc.)

## Example Session

```
$ traenupi reviews
📋 Found 2 pending review(s):
  🔍 325e19d6... | Task: 51621f6a... | By: S-TRAE-nezha...

$ traenupi review 325e19d6
📋 Review ID: 325e19d6-1e47-4fcf-a138-e3505c8e1517
📊 Status: pending
📝 Task ID: 51621f6a-b4cd-4ae8-9acb-00aa6f9e55f6
...

$ traenupi review 325e19d6 complete "Good implementation of auto-request feature"
✅ Review completed: 325e19d6...
```
