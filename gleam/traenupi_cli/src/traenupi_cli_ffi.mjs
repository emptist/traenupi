// Use Gleam's actual List classes from prelude
import { Empty, NonEmpty } from './prelude.mjs';
import { execSync } from 'child_process';

export function getArgs() {
  const args = process.argv.slice(2);
  
  // Convert JavaScript array to Gleam List using official classes
  let gleamList = new Empty();
  for (let i = args.length - 1; i >= 0; i--) {
    gleamList = new NonEmpty(args[i], gleamList);
  }
  
  return gleamList;
}

export function intToString(i) {
  return i.toString();
}

export function getEnv(key) {
  return process.env[key] || "";
}

export function systemTime() {
  return Date.now();
}

export function getKeychainPassword(service) {
  try {
    // Read password from macOS keychain (safe - never logs the password)
    const password = execSync(
      `security find-generic-password -s "${service}" -w 2>/dev/null`,
      { encoding: 'utf-8' }
    ).trim();
    
    return password;
  } catch (error) {
    // Key not found in keychain or other error
    return "";
  }
}
