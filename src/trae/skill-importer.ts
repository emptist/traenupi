import { execSync } from "node:child_process";
import { existsSync, readFileSync, mkdirSync, writeFileSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";
import { getDbConfig } from "../common/db.js";
import { querySafeText, execSafe } from "../common/db-safe.js";

function getDbName(): string {
  const config = getDbConfig();
  return config.database || "psypi";
}

export interface ImportedSkill {
  name: string;
  description: string;
  content: string;
  source: string;
  format: "traenupi" | "claude-code" | "generic";
}

export interface ImportOptions {
  dryRun?: boolean;
  force?: boolean;
  useDb?: boolean;
  customName?: string;
}

export interface ImportResult {
  success: boolean;
  skill?: ImportedSkill;
  error?: string;
  location?: "file" | "database";
}

export type SourceType = "github-repo" | "github-file" | "url" | "local-file" | "local-dir";

export function detectSourceType(source: string): SourceType {
  if (source.startsWith("https://github.com/")) {
    if (source.includes("/blob/") || source.includes("/tree/")) {
      return "github-file";
    }
    return "github-repo";
  }
  
  if (source.startsWith("http://") || source.startsWith("https://")) {
    return "url";
  }
  
  if (existsSync(source)) {
    const stats = require("fs").statSync(source);
    return stats.isDirectory() ? "local-dir" : "local-file";
  }
  
  return "url";
}

export function parseSkill(content: string, source: string): ImportedSkill | null {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const body = frontmatterMatch[2];
    
    const nameMatch = frontmatter.match(/name:\s*["']?([^"'\n]+)["']?/);
    const descMatch = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/);
    
    if (nameMatch) {
      return {
        name: nameMatch[1].trim(),
        description: descMatch ? descMatch[1].trim() : "",
        content: body.trim(),
        source: source,
        format: frontmatter.includes("invoke") ? "traenupi" : "claude-code",
      };
    }
  }
  
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const descMatch = content.match(/(?:Description|About):\s*(.+)$/m);
  const whenMatch = content.match(/(?:When to [Uu]se|Usage):\s*(.+)$/m);
  
  if (titleMatch) {
    const name = titleMatch[1].trim().toLowerCase().replace(/\s+/g, "-");
    let description = descMatch ? descMatch[1].trim() : "";
    
    if (whenMatch) {
      description = description ? `${description}. Invoke ${whenMatch[1].trim()}` : `Invoke ${whenMatch[1].trim()}`;
    }
    
    return {
      name: name,
      description: description,
      content: content,
      source: source,
      format: "generic",
    };
  }
  
  return null;
}

export function convertToTraeNuPIFormat(skill: ImportedSkill): string {
  if (skill.format === "traenupi") {
    return `---
name: "${skill.name}"
description: "${skill.description}"
---

${skill.content}`;
  }
  
  if (skill.format === "claude-code") {
    const desc = skill.description.includes("Invoke") 
      ? skill.description 
      : `${skill.description}. Invoke when needed.`;
    
    return `---
name: "${skill.name}"
description: "${desc}"
---

${skill.content}`;
  }
  
  return `---
name: "${skill.name}"
description: "${skill.description}"
---

${skill.content}`;
}

export function validateSkill(skill: ImportedSkill): string[] {
  const errors: string[] = [];
  
  if (!skill.name || skill.name.trim() === "") {
    errors.push("Skill name is missing");
  }
  
  if (!skill.description || skill.description.trim() === "") {
    errors.push("Skill description is missing");
  }
  
  if (!skill.content || skill.content.trim() === "") {
    errors.push("Skill content is empty");
  }
  
  if (skill.name && !/^[a-z0-9-]+$/.test(skill.name)) {
    errors.push("Skill name must be lowercase with hyphens only");
  }
  
  return errors;
}

export function fetchFromURL(url: string): string | null {
  try {
    if (url.includes("github.com") && !url.includes("raw.githubusercontent.com")) {
      const rawUrl = url
        .replace("github.com", "raw.githubusercontent.com")
        .replace("/blob/", "/");
      return execSync(`curl -s "${rawUrl}"`, { encoding: "utf-8", timeout: 10000 });
    }
    
    return execSync(`curl -s "${url}"`, { encoding: "utf-8", timeout: 10000 });
  } catch (error) {
    return null;
  }
}

export function fetchFromGitHubRepo(repoUrl: string): string[] {
  const skills: string[] = [];
  
  try {
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return skills;
    
    const [, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents`;
    
    const response = execSync(`curl -s "${apiUrl}"`, { encoding: "utf-8", timeout: 10000 });
    const files = JSON.parse(response);
    
    if (!Array.isArray(files)) return skills;
    
    for (const file of files) {
      if (file.type === "dir" && (file.name === "skills" || file.name === ".claude")) {
        const skillsUrl = `${apiUrl}/${file.name}`;
        const skillsResponse = execSync(`curl -s "${skillsUrl}"`, { encoding: "utf-8", timeout: 10000 });
        const skillFiles = JSON.parse(skillsResponse);
        
        if (Array.isArray(skillFiles)) {
          for (const skillFile of skillFiles) {
            if (skillFile.type === "dir") {
              const skillDirUrl = `${skillsUrl}/${skillFile.name}`;
              const skillDirResponse = execSync(`curl -s "${skillDirUrl}"`, { encoding: "utf-8", timeout: 10000 });
              const skillDirFiles = JSON.parse(skillDirResponse);
              
              if (Array.isArray(skillDirFiles)) {
                const skillMd = skillDirFiles.find((f: any) => f.name === "SKILL.md" || f.name.endsWith(".md"));
                if (skillMd && skillMd.download_url) {
                  const content = fetchFromURL(skillMd.download_url);
                  if (content) skills.push(content);
                }
              }
            } else if (skillFile.name.endsWith(".md") && skillFile.download_url) {
              const content = fetchFromURL(skillFile.download_url);
              if (content) skills.push(content);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching from GitHub repo:", error);
  }
  
  return skills;
}

export function importSkillFromSource(
  source: string,
  options: ImportOptions = {}
): ImportResult[] {
  const results: ImportResult[] = [];
  const sourceType = detectSourceType(source);
  
  let contents: string[] = [];
  
  switch (sourceType) {
    case "github-repo":
      contents = fetchFromGitHubRepo(source);
      break;
    
    case "github-file":
    case "url":
      const content = fetchFromURL(source);
      if (content) contents.push(content);
      break;
    
    case "local-file":
      if (existsSync(source)) {
        contents.push(readFileSync(source, "utf-8"));
      }
      break;
    
    case "local-dir":
      const fs = require("fs");
      const path = require("path");
      
      const scanDir = (dir: string) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            const skillMd = path.join(filePath, "SKILL.md");
            if (existsSync(skillMd)) {
              contents.push(readFileSync(skillMd, "utf-8"));
            }
          } else if (file.endsWith(".md")) {
            contents.push(readFileSync(filePath, "utf-8"));
          }
        }
      };
      
      if (existsSync(source)) {
        scanDir(source);
      }
      break;
  }
  
  for (const content of contents) {
    const skill = parseSkill(content, source);
    
    if (!skill) {
      results.push({
        success: false,
        error: "Failed to parse skill format",
      });
      continue;
    }
    
    if (options.customName) {
      skill.name = options.customName;
    }
    
    const errors = validateSkill(skill);
    if (errors.length > 0) {
      results.push({
        success: false,
        skill: skill,
        error: `Validation failed: ${errors.join(", ")}`,
      });
      continue;
    }
    
    if (options.dryRun) {
      results.push({
        success: true,
        skill: skill,
        location: undefined,
      });
      continue;
    }
    
    const skillContent = convertToTraeNuPIFormat(skill);
    
    if (options.useDb) {
      const checkResult = await querySafeText(
        "SELECT id FROM skills WHERE name = $1",
        [skill.name]
      );
      const existingId = checkResult.trim();
      
      if (existingId && !options.force) {
        results.push({
          success: false,
          skill: skill,
          error: "Skill already exists in database. Use --force to overwrite.",
        });
        continue;
      }
      
      let success = false;
      try {
        if (existingId && options.force) {
          success = await execSafe(
            "UPDATE skills SET description = $1, instructions = $2, content = $3::jsonb, source = 'imported', updated_at = NOW() WHERE name = $4",
            [skill.description, skill.content, JSON.stringify({ markdown: skill.content }), skill.name]
          );
        } else {
          success = await execSafe(
            "INSERT INTO skills (id, name, description, instructions, content, source) VALUES (gen_random_uuid(), $1, $2, $3, $4::jsonb, 'imported')",
            [skill.name, skill.description, skill.content, JSON.stringify({ markdown: skill.content })]
          );
        }
      } catch {
        success = false;
      }
      
      results.push({
        success: success,
        skill: skill,
        location: success ? "database" : undefined,
        error: success ? undefined : "Failed to insert into database",
      });
    } else {
      const skillsDir = join(homedir(), ".trae", "skills", skill.name);
      const skillFile = join(skillsDir, "SKILL.md");
      
      if (existsSync(skillFile) && !options.force) {
        results.push({
          success: false,
          skill: skill,
          error: "Skill already exists. Use --force to overwrite.",
        });
        continue;
      }
      
      try {
        mkdirSync(skillsDir, { recursive: true });
        writeFileSync(skillFile, skillContent, "utf-8");
        
        results.push({
          success: true,
          skill: skill,
          location: "file",
        });
      } catch (error) {
        results.push({
          success: false,
          skill: skill,
          error: `Failed to write skill file: ${error}`,
        });
      }
    }
  }
  
  return results;
}

export function printImportResults(results: ImportResult[]): void {
  console.log("\n=== Skill Import Results ===\n");
  
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  if (succeeded.length > 0) {
    console.log(`✅ Successfully imported: ${succeeded.length}`);
    for (const result of succeeded) {
      if (result.skill) {
        console.log(`   - ${result.skill.name} (${result.location})`);
      }
    }
  }
  
  if (failed.length > 0) {
    console.log(`\n❌ Failed to import: ${failed.length}`);
    for (const result of failed) {
      if (result.skill) {
        console.log(`   - ${result.skill.name}: ${result.error}`);
      } else {
        console.log(`   - ${result.error}`);
      }
    }
  }
  
  console.log("");
}

export interface SyncResult {
  name: string;
  success: boolean;
  error?: string;
}

export async function syncDatabaseSkillsToPi(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  
  const queryResult = await querySafeText(
    "SELECT name, description, instructions FROM skills",
    []
  );
  const output = queryResult.trim();
  
  if (!output) {
    console.log("No skills found in database");
    return results;
  }
  
  const traeSkillsDir = join(homedir(), ".trae", "skills");
  
  if (!existsSync(traeSkillsDir)) {
    mkdirSync(traeSkillsDir, { recursive: true });
  }
  
  const lines = output.split("\n");
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const [name, description, instructions] = line.split("|");
    
    if (!name || !description) {
      results.push({
        name: name || "unknown",
        success: false,
        error: "Missing required fields",
      });
      continue;
    }
    
    const skillDir = join(traeSkillsDir, name);
    const skillFile = join(skillDir, "SKILL.md");
    
    try {
      if (!existsSync(skillDir)) {
        mkdirSync(skillDir, { recursive: true });
      }
      
      const skillContent = `---
name: ${name}
description: ${description}
---

${instructions || ""}
`;
      
      writeFileSync(skillFile, skillContent, "utf-8");
      
      results.push({
        name: name,
        success: true,
      });
    } catch (error) {
      results.push({
        name: name,
        success: false,
        error: `Failed to write skill: ${error}`,
      });
    }
  }
  
  return results;
}

export function printSyncResults(results: SyncResult[]): void {
  console.log("\n=== Skill Sync Results ===\n");
  
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total skills: ${results.length}`);
  console.log(`✅ Synced: ${succeeded.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (failed.length > 0) {
    console.log("\nFailed skills:");
    for (const result of failed) {
      console.log(`  - ${result.name}: ${result.error}`);
    }
  }
  
  console.log(`\nSkills are now available in: ~/.trae/skills/`);
  console.log("TraeNuPI will discover them automatically on next invocation.\n");
}

export async function syncFileSystemSkillsToDb(): Promise<SyncResult[]> {
  const results: SyncResult[] = [];
  
  const traeSkillsDir = join(homedir(), ".trae", "skills");
  
  if (!existsSync(traeSkillsDir)) {
    console.log("No .trae/skills directory found");
    return results;
  }
  
  const skillDirs = readdirSync(traeSkillsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
  
  for (const skillDir of skillDirs) {
    const skillFile = join(traeSkillsDir, skillDir, "SKILL.md");
    
    if (!existsSync(skillFile)) {
      results.push({
        name: skillDir,
        success: false,
        error: "No SKILL.md file found",
      });
      continue;
    }
    
    try {
      const content = readFileSync(skillFile, "utf-8");
      const skill = parseSkill(content, skillFile);
      
      if (!skill) {
        results.push({
          name: skillDir,
          success: false,
          error: "Failed to parse skill format",
        });
        continue;
      }
      
      const checkResult = await querySafeText(
        "SELECT id FROM skills WHERE name = $1",
        [skill.name]
      );
      const existingId = checkResult.trim();
      
      let success = false;
      try {
        if (existingId) {
          success = await execSafe(
            "UPDATE skills SET description = $1, instructions = $2, content = $3::jsonb, source = 'local', updated_at = NOW() WHERE name = $4",
            [skill.description, skill.content, JSON.stringify({ markdown: skill.content }), skill.name]
          );
        } else {
          success = await execSafe(
            "INSERT INTO skills (id, name, description, instructions, content, source) VALUES (gen_random_uuid(), $1, $2, $3, $4::jsonb, 'local')",
            [skill.name, skill.description, skill.content, JSON.stringify({ markdown: skill.content })]
          );
        }
        results.push({
          name: skill.name,
          success: success,
        });
      } catch (error) {
        results.push({
          name: skill.name,
          success: false,
          error: `Failed to sync to database: ${error}`,
        });
      }
    } catch (error) {
      results.push({
        name: skillDir,
        success: false,
        error: `Failed to process skill: ${error}`,
      });
    }
  }
  
  return results;
}
