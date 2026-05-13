import gleam/option.{type Option, Some, None}
import gleam/result
import gleam/list
import gleam/string
import gleam/dict.{type Dict}
import traenupi_core/lively_puter.{type LivelyPuterBridge}

pub type StorageConfig {
  StorageConfig(
    base_dir: String,
    enable_cloud_sync: Bool,
    sync_paths: List(String),
  )
}

pub type StorageMetadata {
  StorageMetadata(
    version: String,
    last_sync: Int,
    source: StorageSource,
  )
}

pub type StorageSource {
  LocalStorage
  CloudStorage
  HybridStorage
}

pub type StorageError {
  FileNotFound(String)
  WriteError(String)
  ReadError(String)
  CloudSyncError(String)
  BridgeNotInitialized
}

pub type Storage {
  Storage(
    config: StorageConfig,
    bridge: Option(LivelyPuterBridge),
    metadata: StorageMetadata,
  )
}

pub fn default_config() -> StorageConfig {
  StorageConfig(
    base_dir: "~/.traenupi",
    enable_cloud_sync: False,
    sync_paths: [],
  )
}

pub fn initialize(config: StorageConfig) -> Result(Storage, StorageError) {
  let metadata = StorageMetadata(
    version: "1.0.0",
    last_sync: 0,
    source: LocalStorage,
  )
  
  case config.enable_cloud_sync {
    True -> {
      use bridge <- result.try(
        lively_puter.initialize(lively_puter.default_config())
        |> result.map_error(fn(err) { CloudSyncError(err) })
      )
      
      Ok(Storage(
        config: config,
        bridge: Some(bridge),
        metadata: StorageMetadata(..metadata, source: HybridStorage),
      ))
    }
    False -> {
      Ok(Storage(
        config: config,
        bridge: None,
        metadata: metadata,
      ))
    }
  }
}

pub fn save_json(
  storage: Storage,
  filename: String,
  data: String,
) -> Result(Nil, StorageError) {
  save_to_local(storage.config.base_dir, filename, data)
  |> result.map_error(fn(err) { WriteError(err) })
  
  case storage.bridge, should_sync_to_cloud(filename) {
    Some(bridge), True -> {
      lively_puter.db_set(bridge, "storage:" <> filename, data)
      |> result.map_error(fn(err) { CloudSyncError(err) })
    }
    _, _ -> Ok(Nil)
  }
}

pub fn load_json(
  storage: Storage,
  filename: String,
) -> Result(String, StorageError) {
  case load_from_local(storage.config.base_dir, filename) {
    Ok(data) -> Ok(data)
    Error(_) -> {
      case storage.bridge {
        Some(bridge) -> {
          use data <- result.try(
            lively_puter.db_get(bridge, "storage:" <> filename)
            |> result.map_error(fn(err) { CloudSyncError(err) })
          )
          save_to_local(storage.config.base_dir, filename, data)
          |> result.map_error(fn(err) { WriteError(err) })
          Ok(data)
        }
        None -> Error(FileNotFound(filename))
      }
    }
  }
}

pub fn delete_json(
  storage: Storage,
  filename: String,
) -> Result(Nil, StorageError) {
  delete_from_local(storage.config.base_dir, filename)
  |> result.map_error(fn(err) { WriteError(err) })
  
  case storage.bridge {
    Some(bridge) -> {
      lively_puter.db_delete(bridge, "storage:" <> filename)
      |> result.map_error(fn(err) { CloudSyncError(err) })
    }
    None -> Ok(Nil)
  }
}

pub fn sync_to_cloud(storage: Storage) -> Result(Nil, StorageError) {
  case storage.bridge {
    Some(bridge) -> {
      let cloud_files = [
        "history.json",
        "bookmarks.json",
        "state.json",
      ]
      
      list.try_each(cloud_files, fn(filename) {
        case load_from_local(storage.config.base_dir, filename) {
          Ok(data) -> {
            lively_puter.db_set(bridge, "storage:" <> filename, data)
            |> result.map_error(fn(err) { CloudSyncError(err) })
          }
          Error(_) -> Ok(Nil)
        }
      })
    }
    None -> Error(BridgeNotInitialized)
  }
}

pub fn sync_from_cloud(storage: Storage) -> Result(Nil, StorageError) {
  case storage.bridge {
    Some(bridge) -> {
      let cloud_files = [
        "history.json",
        "bookmarks.json",
        "state.json",
      ]
      
      list.try_each(cloud_files, fn(filename) {
        use data <- result.try(
          lively_puter.db_get(bridge, "storage:" <> filename)
          |> result.map_error(fn(err) { CloudSyncError(err) })
        )
        save_to_local(storage.config.base_dir, filename, data)
        |> result.map_error(fn(err) { WriteError(err) })
      })
    }
    None -> Error(BridgeNotInitialized)
  }
}

pub fn get_metadata(storage: Storage) -> StorageMetadata {
  storage.metadata
}

pub fn is_cloud_enabled(storage: Storage) -> Bool {
  option.is_some(storage.bridge)
}

fn should_sync_to_cloud(filename: String) -> Bool {
  let cloud_files = ["history.json", "bookmarks.json", "state.json"]
  list.contains(cloud_files, filename)
}

@external(javascript, "../traenupi_core_ffi.mjs", "saveToLocal")
fn save_to_local(base_dir: String, filename: String, data: String) -> Result(Nil, String)

@external(javascript, "../traenupi_core_ffi.mjs", "loadFromLocal")
fn load_from_local(base_dir: String, filename: String) -> Result(String, String)

@external(javascript, "../traenupi_core_ffi.mjs", "deleteFromLocal")
fn delete_from_local(base_dir: String, filename: String) -> Result(Nil, String)
