---
name: "skill-importer"
description: "Imports skills from external sources (GitHub, URLs, repositories). Invoke when user wants to download, import, or collect skills from the internet."
---

# Skill Importer

Imports skills from external sources and converts them to TraeNuPI's skill format.

## When to Use

- User wants to import skills from GitHub repositories
- User wants to download skills from URLs
- User wants to collect skills from the internet
- User asks "how to import skills"
- User mentions downloading or collecting skills

## Supported Sources

### 1. GitHub Repositories
```
traenupi skill import https://github.com/user/repo
traenupi skill import https://github.com/user/repo/tree/main/skills
```

### 2. Raw URLs
```
traenupi skill import https://raw.githubusercontent.com/user/repo/main/skill.md
traenupi skill import https://example.com/skills/my-skill.md
```

### 3. Local Files
```
traenupi skill import /path/to/skill.md
traenupi skill import ./skills/
```

## Process

### Step 1: Detect Source Type

The skill automatically detects:
- GitHub repository URL
- GitHub raw file URL
- Generic URL
- Local file path
- Local directory

### Step 2: Fetch Content

**For GitHub repositories:**
1. Use GitHub API to list files
2. Find all SKILL.md or skill files
3. Download each file

**For URLs:**
1. Fetch the content
2. Parse the skill format

**For local files:**
1. Read the file directly
2. Parse the skill format

### Step 3: Parse Skill Format

Supports multiple formats:
- **TraeNuPI format**: YAML frontmatter + markdown
- **Claude Code format**: Similar structure
- **Generic format**: Title + description + content

### Step 4: Convert to TraeNuPI Format

Ensure the skill has:
- `name` in frontmatter
- `description` in frontmatter (with what it does + when to invoke)
- Proper markdown content

### Step 5: Validate

Check for:
- Required fields present
- Valid YAML frontmatter
- Unique skill name
- No conflicts with existing skills

### Step 6: Store

Two options:
1. **Database storage**: Store in `skills` table
2. **File storage**: Create `.trae/skills/<name>/SKILL.md`

## Usage Examples

### Import from GitHub Repository

```bash
# Import all skills from a repository
traenupi skill import https://github.com/glittercowboy/taches-cc-resources

# Import specific skill directory
traenupi skill import https://github.com/user/repo/tree/main/skills

# Import single skill file
traenupi skill import https://github.com/user/repo/blob/main/skills/my-skill/SKILL.md
```

### Import from URL

```bash
# Import from raw GitHub URL
traenupi skill import https://raw.githubusercontent.com/user/repo/main/skill.md

# Import from any URL
traenupi skill import https://example.com/skills/awesome-skill.md
```

### Import from Local File

```bash
# Import single file
traenupi skill import /path/to/skill.md

# Import all skills from directory
traenupi skill import /path/to/skills/
```

### Options

```bash
# Dry run (preview without importing)
traenupi skill import <url> --dry-run

# Force overwrite existing skill
traenupi skill import <url> --force

# Store in database instead of file
traenupi skill import <url> --db

# Specify custom name
traenupi skill import <url> --name my-custom-name
```

## Format Conversion

### Claude Code → TraeNuPI

**Claude Code format:**
```markdown
---
name: "example-skill"
description: "Does something"
---

# Example Skill

Content here...
```

**TraeNuPI format:** (same, no conversion needed!)

### Generic → TraeNuPI

**Generic format:**
```markdown
# Example Skill

Description: Does something
When to use: When you need X

Content here...
```

**Converted to:**
```markdown
---
name: "example-skill"
description: "Does something. Invoke when you need X."
---

# Example Skill

Content here...
```

## Error Handling

### Common Errors

1. **Invalid URL**: URL not accessible or doesn't exist
2. **Invalid format**: Skill file doesn't match any known format
3. **Missing fields**: Required fields (name, description) missing
4. **Duplicate name**: Skill with same name already exists
5. **Network error**: Failed to fetch from URL

### Solutions

- Use `--dry-run` to preview before importing
- Use `--force` to overwrite existing skills
- Check URL accessibility
- Verify skill format manually

## Best Practices

1. **Preview first**: Always use `--dry-run` for new sources
2. **Validate**: Check imported skills with `traenupi skill scan`
3. **Improve**: Use `traenupi skill ai-improve` to enhance imported skills
4. **Organize**: Use categories and tags for better organization
5. **Test**: Test imported skills before relying on them

## Integration with Other Commands

```bash
# After importing, scan for gaps
traenupi skill import <url>
traenupi skill scan

# Improve imported skills
traenupi skill ai-improve <skill-id>

# Check completeness
traenupi skill score
```

## Security Considerations

- Only import from trusted sources
- Review skill content before using
- Be cautious with skills that execute commands
- Check for malicious code patterns
- Validate URLs before fetching

## Limitations

- Requires internet connection for remote URLs
- GitHub API rate limits may apply
- Some skill formats may not be supported
- Large repositories may take time to process

## Future Enhancements

- [ ] Support for skill marketplaces
- [ ] Batch import from multiple sources
- [ ] Skill dependency resolution
- [ ] Version control for imported skills
- [ ] Automatic skill updates
