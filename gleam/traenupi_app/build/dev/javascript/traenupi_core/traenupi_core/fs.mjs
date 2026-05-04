/// <reference types="./fs.d.mts" />
import * as $list from "../../gleam_stdlib/gleam/list.mjs";
import * as $option from "../../gleam_stdlib/gleam/option.mjs";
import { None, Some } from "../../gleam_stdlib/gleam/option.mjs";
import * as $string from "../../gleam_stdlib/gleam/string.mjs";
import {
  readFile as read_file,
  writeFile as write_file,
  exists,
  deleteFile as delete_file,
} from "../fs_ffi.mjs";
import {
  Ok,
  Error,
  toList,
  Empty as $Empty,
  prepend as listPrepend,
  CustomType as $CustomType,
  divideInt,
} from "../gleam.mjs";

export { delete_file, exists, read_file, write_file };

export class NotFound extends $CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
export const FileError$NotFound = (path) => new NotFound(path);
export const FileError$isNotFound = (value) => value instanceof NotFound;
export const FileError$NotFound$path = (value) => value.path;
export const FileError$NotFound$0 = (value) => value.path;

export class PermissionDenied extends $CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
export const FileError$PermissionDenied = (path) => new PermissionDenied(path);
export const FileError$isPermissionDenied = (value) =>
  value instanceof PermissionDenied;
export const FileError$PermissionDenied$path = (value) => value.path;
export const FileError$PermissionDenied$0 = (value) => value.path;

export class IsDirectory extends $CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
export const FileError$IsDirectory = (path) => new IsDirectory(path);
export const FileError$isIsDirectory = (value) => value instanceof IsDirectory;
export const FileError$IsDirectory$path = (value) => value.path;
export const FileError$IsDirectory$0 = (value) => value.path;

export class NotDirectory extends $CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
export const FileError$NotDirectory = (path) => new NotDirectory(path);
export const FileError$isNotDirectory = (value) =>
  value instanceof NotDirectory;
export const FileError$NotDirectory$path = (value) => value.path;
export const FileError$NotDirectory$0 = (value) => value.path;

export class AlreadyExists extends $CustomType {
  constructor(path) {
    super();
    this.path = path;
  }
}
export const FileError$AlreadyExists = (path) => new AlreadyExists(path);
export const FileError$isAlreadyExists = (value) =>
  value instanceof AlreadyExists;
export const FileError$AlreadyExists$path = (value) => value.path;
export const FileError$AlreadyExists$0 = (value) => value.path;

export class IoError extends $CustomType {
  constructor(message) {
    super();
    this.message = message;
  }
}
export const FileError$IoError = (message) => new IoError(message);
export const FileError$isIoError = (value) => value instanceof IoError;
export const FileError$IoError$message = (value) => value.message;
export const FileError$IoError$0 = (value) => value.message;

export class File extends $CustomType {}
export const FileType$File = () => new File();
export const FileType$isFile = (value) => value instanceof File;

export class Directory extends $CustomType {}
export const FileType$Directory = () => new Directory();
export const FileType$isDirectory = (value) => value instanceof Directory;

export class Symlink extends $CustomType {}
export const FileType$Symlink = () => new Symlink();
export const FileType$isSymlink = (value) => value instanceof Symlink;

export class Unknown extends $CustomType {}
export const FileType$Unknown = () => new Unknown();
export const FileType$isUnknown = (value) => value instanceof Unknown;

export class FileInfo extends $CustomType {
  constructor(path, file_type, size, is_readonly) {
    super();
    this.path = path;
    this.file_type = file_type;
    this.size = size;
    this.is_readonly = is_readonly;
  }
}
export const FileInfo$FileInfo = (path, file_type, size, is_readonly) =>
  new FileInfo(path, file_type, size, is_readonly);
export const FileInfo$isFileInfo = (value) => value instanceof FileInfo;
export const FileInfo$FileInfo$path = (value) => value.path;
export const FileInfo$FileInfo$0 = (value) => value.path;
export const FileInfo$FileInfo$file_type = (value) => value.file_type;
export const FileInfo$FileInfo$1 = (value) => value.file_type;
export const FileInfo$FileInfo$size = (value) => value.size;
export const FileInfo$FileInfo$2 = (value) => value.size;
export const FileInfo$FileInfo$is_readonly = (value) => value.is_readonly;
export const FileInfo$FileInfo$3 = (value) => value.is_readonly;

export class ReadOk extends $CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
}
export const ReadResult$ReadOk = (content) => new ReadOk(content);
export const ReadResult$isReadOk = (value) => value instanceof ReadOk;
export const ReadResult$ReadOk$content = (value) => value.content;
export const ReadResult$ReadOk$0 = (value) => value.content;

export class ReadError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const ReadResult$ReadError = (error) => new ReadError(error);
export const ReadResult$isReadError = (value) => value instanceof ReadError;
export const ReadResult$ReadError$error = (value) => value.error;
export const ReadResult$ReadError$0 = (value) => value.error;

export class WriteOk extends $CustomType {}
export const WriteResult$WriteOk = () => new WriteOk();
export const WriteResult$isWriteOk = (value) => value instanceof WriteOk;

export class WriteError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const WriteResult$WriteError = (error) => new WriteError(error);
export const WriteResult$isWriteError = (value) => value instanceof WriteError;
export const WriteResult$WriteError$error = (value) => value.error;
export const WriteResult$WriteError$0 = (value) => value.error;

export class DeleteOk extends $CustomType {}
export const DeleteResult$DeleteOk = () => new DeleteOk();
export const DeleteResult$isDeleteOk = (value) => value instanceof DeleteOk;

export class DeleteError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const DeleteResult$DeleteError = (error) => new DeleteError(error);
export const DeleteResult$isDeleteError = (value) =>
  value instanceof DeleteError;
export const DeleteResult$DeleteError$error = (value) => value.error;
export const DeleteResult$DeleteError$0 = (value) => value.error;

export class CurrentDir extends $CustomType {}
export const PathComponent$CurrentDir = () => new CurrentDir();
export const PathComponent$isCurrentDir = (value) =>
  value instanceof CurrentDir;

export class ParentDir extends $CustomType {}
export const PathComponent$ParentDir = () => new ParentDir();
export const PathComponent$isParentDir = (value) => value instanceof ParentDir;

export class Normal extends $CustomType {
  constructor(name) {
    super();
    this.name = name;
  }
}
export const PathComponent$Normal = (name) => new Normal(name);
export const PathComponent$isNormal = (value) => value instanceof Normal;
export const PathComponent$Normal$name = (value) => value.name;
export const PathComponent$Normal$0 = (value) => value.name;

export class FsOk extends $CustomType {
  constructor(value) {
    super();
    this.value = value;
  }
}
export const FsResult$FsOk = (value) => new FsOk(value);
export const FsResult$isFsOk = (value) => value instanceof FsOk;
export const FsResult$FsOk$value = (value) => value.value;
export const FsResult$FsOk$0 = (value) => value.value;

export class FsError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const FsResult$FsError = (error) => new FsError(error);
export const FsResult$isFsError = (value) => value instanceof FsError;
export const FsResult$FsError$error = (value) => value.error;
export const FsResult$FsError$0 = (value) => value.error;

export class ReadFileOk extends $CustomType {
  constructor(content) {
    super();
    this.content = content;
  }
}
export const ReadFileResult$ReadFileOk = (content) => new ReadFileOk(content);
export const ReadFileResult$isReadFileOk = (value) =>
  value instanceof ReadFileOk;
export const ReadFileResult$ReadFileOk$content = (value) => value.content;
export const ReadFileResult$ReadFileOk$0 = (value) => value.content;

export class ReadFileError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const ReadFileResult$ReadFileError = (error) => new ReadFileError(error);
export const ReadFileResult$isReadFileError = (value) =>
  value instanceof ReadFileError;
export const ReadFileResult$ReadFileError$error = (value) => value.error;
export const ReadFileResult$ReadFileError$0 = (value) => value.error;

export class WriteFileOk extends $CustomType {}
export const WriteFileResult$WriteFileOk = () => new WriteFileOk();
export const WriteFileResult$isWriteFileOk = (value) =>
  value instanceof WriteFileOk;

export class WriteFileError extends $CustomType {
  constructor(error) {
    super();
    this.error = error;
  }
}
export const WriteFileResult$WriteFileError = (error) =>
  new WriteFileError(error);
export const WriteFileResult$isWriteFileError = (value) =>
  value instanceof WriteFileError;
export const WriteFileResult$WriteFileError$error = (value) => value.error;
export const WriteFileResult$WriteFileError$0 = (value) => value.error;

export function error_to_string(error) {
  if (error instanceof NotFound) {
    let p = error.path;
    return "File not found: " + p;
  } else if (error instanceof PermissionDenied) {
    let p = error.path;
    return "Permission denied: " + p;
  } else if (error instanceof IsDirectory) {
    let p = error.path;
    return "Is a directory: " + p;
  } else if (error instanceof NotDirectory) {
    let p = error.path;
    return "Not a directory: " + p;
  } else if (error instanceof AlreadyExists) {
    let p = error.path;
    return "File already exists: " + p;
  } else {
    let m = error.message;
    return "IO error: " + m;
  }
}

export function file_type_to_string(ft) {
  if (ft instanceof File) {
    return "file";
  } else if (ft instanceof Directory) {
    return "directory";
  } else if (ft instanceof Symlink) {
    return "symlink";
  } else {
    return "unknown";
  }
}

export function is_file(info) {
  return info.file_type instanceof File;
}

export function is_directory(info) {
  return info.file_type instanceof Directory;
}

export function get_extension(path) {
  let parts = $string.split(path, ".");
  if (parts instanceof $Empty) {
    return new None();
  } else {
    let $ = parts.tail;
    if ($ instanceof $Empty) {
      return new None();
    } else {
      let $1 = parts.head;
      if ($1 === "") {
        return new None();
      } else {
        let parts$1 = parts;
        let ext = $list.last(parts$1);
        if (ext instanceof Ok) {
          let e = ext[0];
          return new Some(e);
        } else {
          return new None();
        }
      }
    }
  }
}

export function get_filename(path) {
  let parts = $string.split(path, "/");
  let $ = $list.last(parts);
  if ($ instanceof Ok) {
    let name = $[0];
    return name;
  } else {
    return path;
  }
}

export function get_directory(path) {
  let parts = $string.split(path, "/");
  let $ = $list.take(parts, $list.length(parts) - 1);
  if ($ instanceof $Empty) {
    return ".";
  } else {
    let dirs = $;
    return $string.join(dirs, "/");
  }
}

export function join_path(parts) {
  return $string.join(parts, "/");
}

export function normalize_path(path) {
  let _block;
  let _pipe = path;
  let _pipe$1 = $string.split(_pipe, "/");
  _block = $list.filter(_pipe$1, (p) => { return (p !== "") && (p !== "."); });
  let parts = _block;
  let normalized = $list.fold(
    parts,
    toList([]),
    (acc, part) => {
      if (part === "..") {
        if (acc instanceof $Empty) {
          return acc;
        } else {
          let rest = acc.tail;
          return rest;
        }
      } else {
        return listPrepend(part, acc);
      }
    },
  );
  let _pipe$2 = normalized;
  let _pipe$3 = $list.reverse(_pipe$2);
  return $string.join(_pipe$3, "/");
}

export function has_extension(path, ext) {
  let $ = get_extension(path);
  if ($ instanceof Some) {
    let e = $[0];
    return e === ext;
  } else {
    return false;
  }
}

export function is_absolute_path(path) {
  return $string.starts_with(path, "/");
}

export function is_relative_path(path) {
  return !is_absolute_path(path);
}

export function parse_path(path) {
  let _pipe = path;
  let _pipe$1 = $string.split(_pipe, "/");
  return $list.filter_map(
    _pipe$1,
    (part) => {
      if (part === "") {
        return new Error(undefined);
      } else if (part === ".") {
        return new Error(undefined);
      } else if (part === "..") {
        return new Ok(new ParentDir());
      } else {
        let name = part;
        return new Ok(new Normal(name));
      }
    },
  );
}

export function resolve_path(base, relative) {
  let $ = is_absolute_path(relative);
  if ($) {
    return normalize_path(relative);
  } else {
    let base_parts = $string.split(base, "/");
    let relative_parts = $string.split(relative, "/");
    let combined = $list.flatten(toList([base_parts, relative_parts]));
    return normalize_path($string.join(combined, "/"));
  }
}

export function change_extension(path, new_ext) {
  let parts = $string.split(path, ".");
  if (parts instanceof $Empty) {
    return path;
  } else {
    let $ = parts.tail;
    if ($ instanceof $Empty) {
      let name = parts.head;
      return (name + ".") + new_ext;
    } else {
      let name_and_exts = parts;
      let name = $list.first(name_and_exts);
      if (name instanceof Ok) {
        let n = name[0];
        return (n + ".") + new_ext;
      } else {
        return path;
      }
    }
  }
}

function int_to_string(n) {
  if (n === 0) {
    return "0";
  } else if (n === 1) {
    return "1";
  } else if (n === 2) {
    return "2";
  } else if (n === 3) {
    return "3";
  } else if (n === 4) {
    return "4";
  } else if (n === 5) {
    return "5";
  } else if (n === 6) {
    return "6";
  } else if (n === 7) {
    return "7";
  } else if (n === 8) {
    return "8";
  } else if (n === 9) {
    return "9";
  } else if (n === 10) {
    return "10";
  } else if (n === 100) {
    return "100";
  } else if (n === 1000) {
    return "1000";
  } else {
    let $ = n < 0;
    if ($) {
      return "-" + int_to_string(0 - n);
    } else {
      let tens = globalThis.Math.trunc(n / 10);
      let ones = n - tens * 10;
      return int_to_string(tens) + int_to_string(ones);
    }
  }
}

export function format_size(bytes) {
  let kb = 1024;
  let mb = 1024 * 1024;
  let gb = 1024 * 1024 * 1024;
  let b = bytes;
  if (b < kb) {
    return int_to_string(b) + " B";
  } else {
    let b = bytes;
    if (b < mb) {
      return int_to_string(divideInt(b, kb)) + " KB";
    } else {
      let b = bytes;
      if (b < gb) {
        return int_to_string(divideInt(b, mb)) + " MB";
      } else {
        let b = bytes;
        return int_to_string(divideInt(b, gb)) + " GB";
      }
    }
  }
}

export function read_file_string(path) {
  let $ = read_file(path);
  if ($ instanceof ReadFileOk) {
    let c = $.content;
    return new Ok(c);
  } else {
    let e = $.error;
    return new Error(e);
  }
}

export function write_file_string(path, content) {
  let $ = write_file(path, content);
  if ($ instanceof WriteFileOk) {
    return new Ok(undefined);
  } else {
    let e = $.error;
    return new Error(e);
  }
}

export function ensure_directory(_) {
  return new Ok(undefined);
}

export function read_json(_) {
  return new Ok("{}");
}

export function write_json(_, _1) {
  return new Ok(undefined);
}
