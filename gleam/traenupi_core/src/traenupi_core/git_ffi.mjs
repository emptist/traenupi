import { execSync } from 'child_process';
import { readFileSync } from 'fs';

export function checkGitStatus() {
  return new Promise((resolve) => {
    try {
      const result = execSync('git status --porcelain', { encoding: 'utf-8' });
      resolve(result.trim() === '' ? 'clean' : 'dirty');
    } catch (error) {
      resolve('error');
    }
  });
}

export function getChangedFiles() {
  return new Promise((resolve) => {
    try {
      const result = execSync('git status --porcelain', { encoding: 'utf-8' });
      const files = result
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => line.substring(3).trim());
      
      resolve(files);
    } catch (error) {
      resolve([]);
    }
  });
}

export function countFileLines(file) {
  return new Promise((resolve) => {
    try {
      const content = readFileSync(file, 'utf-8');
      const lines = content.split('\n').length;
      resolve(lines);
    } catch (error) {
      resolve(0);
    }
  });
}

export function commitChanges() {
  return new Promise((resolve) => {
    try {
      const message = `feat: Auto-commit by TraeNuPI

Reviewed and approved by TraeNuPI Product Manager`;
      execSync(`git add -A && git commit -m "${message}"`, { encoding: 'utf-8' });
      console.log('✅ Changes committed successfully');
      resolve(undefined);
    } catch (error) {
      console.error('❌ Failed to commit:', error.message);
      resolve(undefined);
    }
  });
}

export function stringEndsWith(suffix, str) {
  return str.endsWith(suffix);
}

export function intToString(i) {
  return String(i);
}
