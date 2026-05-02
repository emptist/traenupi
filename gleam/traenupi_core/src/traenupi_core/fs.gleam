import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string

pub type FileError {
  NotFound(path: String)
  PermissionDenied(path: String)
  IsDirectory(path: String)
  NotDirectory(path: String)
  AlreadyExists(path: String)
  IoError(message: String)
}

pub type FileType {
  File
  Directory
  Symlink
  Unknown
}

pub type FileInfo {
  FileInfo(
    path: String,
    file_type: FileType,
    size: Int,
    is_readonly: Bool,
  )
}

pub type ReadResult {
  ReadOk(content: String)
  ReadError(error: FileError)
}

pub type WriteResult {
  WriteOk
  WriteError(error: FileError)
}

pub type DeleteResult {
  DeleteOk
  DeleteError(error: FileError)
}

pub fn error_to_string(error: FileError) -> String {
  case error {
    NotFound(path: p) -> "File not found: " <> p
    PermissionDenied(path: p) -> "Permission denied: " <> p
    IsDirectory(path: p) -> "Is a directory: " <> p
    NotDirectory(path: p) -> "Not a directory: " <> p
    AlreadyExists(path: p) -> "File already exists: " <> p
    IoError(message: m) -> "IO error: " <> m
  }
}

pub fn file_type_to_string(ft: FileType) -> String {
  case ft {
    File -> "file"
    Directory -> "directory"
    Symlink -> "symlink"
    Unknown -> "unknown"
  }
}

pub fn is_file(info: FileInfo) -> Bool {
  info.file_type == File
}

pub fn is_directory(info: FileInfo) -> Bool {
  info.file_type == Directory
}

pub fn get_extension(path: String) -> Option(String) {
  let parts = string.split(path, ".")
  case parts {
    [] -> None
    [_] -> None
    ["", ..] -> None
    parts -> {
      let ext = list.last(parts)
      case ext {
        Ok(e) -> Some(e)
        Error(_) -> None
      }
    }
  }
}

pub fn get_filename(path: String) -> String {
  let parts = string.split(path, "/")
  case list.last(parts) {
    Ok(name) -> name
    Error(_) -> path
  }
}

pub fn get_directory(path: String) -> String {
  let parts = string.split(path, "/")
  case list.take(parts, list.length(parts) - 1) {
    [] -> "."
    dirs -> string.join(dirs, "/")
  }
}

pub fn join_path(parts: List(String)) -> String {
  string.join(parts, "/")
}

pub fn normalize_path(path: String) -> String {
  let parts = 
    path
    |> string.split("/")
    |> list.filter(fn(p) { p != "" && p != "." })
  
  let normalized = list.fold(parts, [], fn(acc, part) {
    case part {
      ".." -> {
        case acc {
          [] -> []
          [_, ..rest] -> rest
        }
      }
      _ -> [part, ..acc]
    }
  })
  
  normalized
  |> list.reverse()
  |> string.join("/")
}

pub fn has_extension(path: String, ext: String) -> Bool {
  case get_extension(path) {
    Some(e) -> e == ext
    None -> False
  }
}

pub fn is_absolute_path(path: String) -> Bool {
  string.starts_with(path, "/")
}

pub fn is_relative_path(path: String) -> Bool {
  !is_absolute_path(path)
}

pub type PathComponent {
  CurrentDir
  ParentDir
  Normal(name: String)
}

pub fn parse_path(path: String) -> List(PathComponent) {
  path
  |> string.split("/")
  |> list.filter_map(fn(part) {
    case part {
      "" -> Error(Nil)
      "." -> Error(Nil)
      ".." -> Ok(ParentDir)
      name -> Ok(Normal(name: name))
    }
  })
}

pub fn resolve_path(base: String, relative: String) -> String {
  case is_absolute_path(relative) {
    True -> normalize_path(relative)
    False -> {
      let base_parts = string.split(base, "/")
      let relative_parts = string.split(relative, "/")
      let combined = list.flatten([base_parts, relative_parts])
      normalize_path(string.join(combined, "/"))
    }
  }
}

pub fn change_extension(path: String, new_ext: String) -> String {
  let parts = string.split(path, ".")
  case parts {
    [] -> path
    [name] -> name <> "." <> new_ext
    name_and_exts -> {
      let name = list.first(name_and_exts)
      case name {
        Ok(n) -> n <> "." <> new_ext
        Error(_) -> path
      }
    }
  }
}

pub fn format_size(bytes: Int) -> String {
  let kb = 1024
  let mb = 1024 * 1024
  let gb = 1024 * 1024 * 1024
  case bytes {
    b if b < kb -> int_to_string(b) <> " B"
    b if b < mb -> int_to_string(b / kb) <> " KB"
    b if b < gb -> int_to_string(b / mb) <> " MB"
    b -> int_to_string(b / gb) <> " GB"
  }
}

fn int_to_string(n: Int) -> String {
  case n {
    0 -> "0"
    1 -> "1"
    2 -> "2"
    3 -> "3"
    4 -> "4"
    5 -> "5"
    6 -> "6"
    7 -> "7"
    8 -> "8"
    9 -> "9"
    10 -> "10"
    100 -> "100"
    1000 -> "1000"
    _ -> {
      case n < 0 {
        True -> "-" <> int_to_string(0 - n)
        False -> {
          let tens = n / 10
          let ones = n - tens * 10
          int_to_string(tens) <> int_to_string(ones)
        }
      }
    }
  }
}

pub type FsResult(a) {
  FsOk(value: a)
  FsError(error: FileError)
}

pub type ReadFileResult {
  ReadFileOk(content: String)
  ReadFileError(error: FileError)
}

pub type WriteFileResult {
  WriteFileOk
  WriteFileError(error: FileError)
}

@external(javascript, "../fs_ffi.mjs", "readFile")
pub fn read_file(path: String) -> ReadFileResult

@external(javascript, "../fs_ffi.mjs", "writeFile")
pub fn write_file(path: String, content: String) -> WriteFileResult

@external(javascript, "../fs_ffi.mjs", "exists")
pub fn exists(path: String) -> Bool

@external(javascript, "../fs_ffi.mjs", "deleteFile")
pub fn delete_file(path: String) -> DeleteResult

pub fn read_file_string(path: String) -> Result(String, FileError) {
  case read_file(path) {
    ReadFileOk(content: c) -> Ok(c)
    ReadFileError(error: e) -> Error(e)
  }
}

pub fn write_file_string(path: String, content: String) -> Result(Nil, FileError) {
  case write_file(path, content) {
    WriteFileOk -> Ok(Nil)
    WriteFileError(error: e) -> Error(e)
  }
}

pub fn ensure_directory(_path: String) -> Result(Nil, FileError) {
  Ok(Nil)
}

pub fn read_json(_path: String) -> Result(String, FileError) {
  Ok("{}")
}

pub fn write_json(_path: String, _content: String) -> Result(Nil, FileError) {
  Ok(Nil)
}
