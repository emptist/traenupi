import { promises as fs } from 'fs';
import { homedir } from 'os';
import { resolve as resolvePath } from 'path';
import { Ok, Error } from '../gleam.mjs';

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

export function expandHome(path) {
  if (path.startsWith('~/')) {
    return resolvePath(homedir(), path.slice(2));
  }
  return path;
}

export function getPid() {
  return process.pid;
}

export function readFile(path) {
  return fs.readFile(path, 'utf-8')
    .then(content => new Ok(content))
    .catch(error => new Error(error.message || String(error)));
}

export function writeFile(path, content) {
  return fs.writeFile(path, content, 'utf-8')
    .then(() => new Ok(undefined))
    .catch(error => new Error(error.message || String(error)));
}

export function deleteFile(path) {
  return fs.unlink(path)
    .then(() => new Ok(undefined))
    .catch(error => new Error(error.message || String(error)));
}
