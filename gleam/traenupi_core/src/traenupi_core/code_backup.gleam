import gleam/dict
import gleam/int
import gleam/javascript/promise.{type Promise, await, resolve}
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import simplifile
import traenupi_core/db
import traenupi_core/db_types.{type Connection, type DbError}
import traenupi_core/db_connection
import traenupi_core/fs

pub type BackupError {
  DbErr(DbError)
  FileErr(fs.FileError)
}

pub type BackupResult {
  BackupOk(version_id: String)
  BackupSkipped(reason: String)
  BackupErr(error: BackupError)
}

pub type FileChange {
  NewFile
  Modified(old_hash: String)
  Unchanged
}

pub type CodeFile {
  CodeFile(
    path: String,
    content: String,
    hash: String,
    size: Int,
    line_count: Int,
  )
}

pub type BackupStats {
  BackupStats(
    total_files: Int,
    backed_up: Int,
    skipped: Int,
    errors: Int,
  )
}

pub fn code_extensions() -> List(String) {
  [
    "gleam", "ts", "tsx", "js", "jsx", "mjs", "cjs",
    "py", "rs", "go", "java", "kt", "swift",
    "md", "json", "yaml", "yml", "toml",
    "sh", "bash", "zsh",
  ]
}

pub fn should_backup(path: String) -> Bool {
  let parts = string.split(path, "/")
  let filename = case list.last(parts) {
    Ok(name) -> name
    Error(_) -> path
  }

  case filename {
    "package-lock.json" -> False
    "pnpm-lock.yaml" -> False
    "yarn.lock" -> False
    _ -> {
      case string.starts_with(filename, ".") {
        True -> False
        False -> {
          case fs.get_extension(path) {
            Some(ext) -> list.contains(code_extensions(), ext)
            None -> False
          }
        }
      }
    }
  }
}

@external(javascript, "./code_backup_ffi.mjs", "computeHash")
pub fn compute_hash(content: String) -> String

pub fn count_lines(content: String) -> Int {
  content
  |> string.split("\n")
  |> list.length()
}

pub fn read_code_file(path: String) -> Result(CodeFile, fs.FileError) {
  case fs.read_file_string(path) {
    Ok(content) -> {
      let hash = compute_hash(content)
      let size = string.length(content)
      let line_count = count_lines(content)
      Ok(CodeFile(
        path: path,
        content: content,
        hash: hash,
        size: size,
        line_count: line_count,
      ))
    }
    Error(e) -> Error(e)
  }
}

pub fn get_latest_version_hash(
  conn: Connection,
  file_path: String,
) -> Promise(Result(Option(String), DbError)) {
  let sql = "
    SELECT version_hash 
    FROM code_versions 
    WHERE file_path = $1 
    ORDER BY saved_at DESC 
    LIMIT 1
  "
  
  use result <- await(db.query(conn, sql, [file_path]))
  
  case result {
    Ok(query_result) -> {
      case query_result.rows {
        [row] -> {
          case dict.get(row, "version_hash") {
            Ok(hash) -> resolve(Ok(Some(hash)))
            Error(_) -> resolve(Ok(None))
          }
        }
        _ -> resolve(Ok(None))
      }
    }
    Error(e) -> resolve(Error(e))
  }
}

pub fn check_file_change(
  conn: Connection,
  file: CodeFile,
) -> Promise(Result(FileChange, DbError)) {
  use result <- await(get_latest_version_hash(conn, file.path))
  
  case result {
    Ok(Some(old_hash)) -> {
      case old_hash == file.hash {
        True -> resolve(Ok(Unchanged))
        False -> resolve(Ok(Modified(old_hash: old_hash)))
      }
    }
    Ok(None) -> resolve(Ok(NewFile))
    Error(e) -> resolve(Error(e))
  }
}

pub fn save_code_version(
  conn: Connection,
  file: CodeFile,
  saved_by: String,
  project_name: String,
  reason: String,
) -> Promise(Result(String, DbError)) {
  let sql = "
    INSERT INTO code_versions (
      file_path, content, version_hash, saved_by, 
      project_name, file_size, line_count, reason
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id::TEXT as version_id
  "
  
  let params = [
    file.path,
    file.content,
    file.hash,
    saved_by,
    project_name,
    int.to_string(file.size),
    int.to_string(file.line_count),
    reason,
  ]
  
  use result <- await(db.query(conn, sql, params))
  
  case result {
    Ok(query_result) -> {
      case query_result.rows {
        [row] -> {
          case dict.get(row, "version_id") {
            Ok(id) -> resolve(Ok(id))
            Error(_) -> resolve(Error(db_types.QueryError("Failed to decode version_id")))
          }
        }
        _ -> resolve(Error(db_types.QueryError("No version_id returned")))
      }
    }
    Error(e) -> resolve(Error(e))
  }
}

fn db_error_to_backup_error(e: DbError) -> BackupError {
  DbErr(e)
}

pub fn backup_file(
  file_path: String,
  saved_by: String,
  project_name: String,
  reason: String,
) -> Promise(BackupResult) {
  case read_code_file(file_path) {
    Ok(file) -> {
      use result <- await(db_connection.with_connection(fn(conn) {
        use change_result <- await(check_file_change(conn, file))
        
        case change_result {
          Ok(Unchanged) -> resolve(Ok(BackupSkipped(reason: "No changes detected")))
          Ok(NewFile) | Ok(Modified(_)) -> {
            use save_result <- await(save_code_version(conn, file, saved_by, project_name, reason))
            
            case save_result {
              Ok(id) -> resolve(Ok(BackupOk(version_id: id)))
              Error(e) -> resolve(Error(db_error_to_backup_error(e)))
            }
          }
          Error(e) -> resolve(Error(db_error_to_backup_error(e)))
        }
      }, db_error_to_backup_error))
      
      case result {
        Ok(backup_result) -> resolve(backup_result)
        Error(e) -> resolve(BackupErr(error: e))
      }
    }
    Error(e) -> resolve(BackupErr(error: FileErr(e)))
  }
}

pub fn scan_directory(dir: String) -> Result(List(String), fs.FileError) {
  case simplifile.is_directory(dir) {
    Ok(True) -> {
      case simplifile.read_directory(dir) {
        Ok(entries) -> {
          let files = 
            entries
            |> list.filter(should_backup)
            |> list.map(fn(name) { 
              let path = case string.ends_with(dir, "/") {
                True -> dir <> name
                False -> dir <> "/" <> name
              }
              path
            })
          Ok(files)
        }
        Error(e) -> Error(fs.IoError(message: simplifile.describe_error(e)))
      }
    }
    Ok(False) -> Error(fs.NotDirectory(path: dir))
    Error(e) -> Error(fs.IoError(message: simplifile.describe_error(e)))
  }
}

pub fn backup_project(
  project_dir: String,
  project_name: String,
  saved_by: String,
) -> Promise(BackupStats) {
  case scan_directory(project_dir) {
    Ok(files) -> {
      let total = list.length(files)
      backup_files_loop(files, saved_by, project_name, BackupStats(
        total_files: total,
        backed_up: 0,
        skipped: 0,
        errors: 0,
      ))
    }
    Error(_) -> resolve(BackupStats(
      total_files: 0,
      backed_up: 0,
      skipped: 0,
      errors: 1,
    ))
  }
}

fn backup_files_loop(
  files: List(String),
  saved_by: String,
  project_name: String,
  stats: BackupStats,
) -> Promise(BackupStats) {
  case files {
    [] -> resolve(stats)
    [file_path, ..rest] -> {
      use result <- await(backup_file(file_path, saved_by, project_name, "auto-backup"))
      
      let new_stats = case result {
        BackupOk(_) -> BackupStats(
          total_files: stats.total_files,
          backed_up: stats.backed_up + 1,
          skipped: stats.skipped,
          errors: stats.errors,
        )
        BackupSkipped(_) -> BackupStats(
          total_files: stats.total_files,
          backed_up: stats.backed_up,
          skipped: stats.skipped + 1,
          errors: stats.errors,
        )
        BackupErr(_) -> BackupStats(
          total_files: stats.total_files,
          backed_up: stats.backed_up,
          skipped: stats.skipped,
          errors: stats.errors + 1,
        )
      }
      
      backup_files_loop(rest, saved_by, project_name, new_stats)
    }
  }
}

pub fn get_project_name(project_dir: String) -> String {
  let gleam_toml = project_dir <> "/gleam.toml"
  let package_json = project_dir <> "/package.json"
  
  case simplifile.is_file(gleam_toml) {
    Ok(True) -> {
      case simplifile.read(gleam_toml) {
        Ok(content) -> {
          let lines = string.split(content, "\n")
          case list.first(lines) {
            Ok(first_line) -> {
              case string.split(first_line, "=") {
                [_, name_part] -> {
                  name_part
                  |> string.trim()
                  |> string.replace("\"", "")
                }
                _ -> "unknown"
              }
            }
            Error(_) -> "unknown"
          }
        }
        Error(_) -> "unknown"
      }
    }
    _ -> {
      case simplifile.is_file(package_json) {
        Ok(True) -> {
          case simplifile.read(package_json) {
            Ok(content) -> {
              case string.split(content, "\"name\"") {
                [_, rest] -> {
                  case string.split(rest, "\"") {
                    [_, name, ..] -> name
                    _ -> "unknown"
                  }
                }
                _ -> "unknown"
              }
            }
            Error(_) -> "unknown"
          }
        }
        _ -> "unknown"
      }
    }
  }
}

pub fn stats_to_string(stats: BackupStats) -> String {
  "Backup complete: " 
  <> int.to_string(stats.backed_up) 
  <> " backed up, "
  <> int.to_string(stats.skipped)
  <> " skipped, "
  <> int.to_string(stats.errors)
  <> " errors ("
  <> int.to_string(stats.total_files)
  <> " total files)"
}
