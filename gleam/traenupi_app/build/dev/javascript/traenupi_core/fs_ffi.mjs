import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";

export function readFile(path) {
  try {
    const content = readFileSync(path, "utf-8");
    return { ReadFileOk: content };
  } catch (error) {
    return { ReadFileError: { NotFound: path } };
  }
}

export function writeFile(path, content) {
  try {
    writeFileSync(path, content, "utf-8");
    return { WriteFileOk: null };
  } catch (error) {
    return { WriteFileError: { IoError: error.message } };
  }
}

export function exists(path) {
  return existsSync(path);
}

export function deleteFile(path) {
  try {
    unlinkSync(path);
    return { DeleteOk: null };
  } catch (error) {
    return { DeleteError: { NotFound: path } };
  }
}
