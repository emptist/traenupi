import type * as $option from "../../gleam_stdlib/gleam/option.d.mts";
import type * as _ from "../gleam.d.mts";

export class NotFound extends _.CustomType {
  /** @deprecated */
  constructor(path: string);
  /** @deprecated */
  path: string;
}
export function FileError$NotFound(path: string): FileError$;
export function FileError$isNotFound(value: FileError$): boolean;
export function FileError$NotFound$0(value: FileError$): string;
export function FileError$NotFound$path(value: FileError$): string;

export class PermissionDenied extends _.CustomType {
  /** @deprecated */
  constructor(path: string);
  /** @deprecated */
  path: string;
}
export function FileError$PermissionDenied(path: string): FileError$;
export function FileError$isPermissionDenied(value: FileError$): boolean;
export function FileError$PermissionDenied$0(value: FileError$): string;
export function FileError$PermissionDenied$path(value: FileError$): string;

export class IsDirectory extends _.CustomType {
  /** @deprecated */
  constructor(path: string);
  /** @deprecated */
  path: string;
}
export function FileError$IsDirectory(path: string): FileError$;
export function FileError$isIsDirectory(value: FileError$): boolean;
export function FileError$IsDirectory$0(value: FileError$): string;
export function FileError$IsDirectory$path(value: FileError$): string;

export class NotDirectory extends _.CustomType {
  /** @deprecated */
  constructor(path: string);
  /** @deprecated */
  path: string;
}
export function FileError$NotDirectory(path: string): FileError$;
export function FileError$isNotDirectory(value: FileError$): boolean;
export function FileError$NotDirectory$0(value: FileError$): string;
export function FileError$NotDirectory$path(value: FileError$): string;

export class AlreadyExists extends _.CustomType {
  /** @deprecated */
  constructor(path: string);
  /** @deprecated */
  path: string;
}
export function FileError$AlreadyExists(path: string): FileError$;
export function FileError$isAlreadyExists(value: FileError$): boolean;
export function FileError$AlreadyExists$0(value: FileError$): string;
export function FileError$AlreadyExists$path(value: FileError$): string;

export class IoError extends _.CustomType {
  /** @deprecated */
  constructor(message: string);
  /** @deprecated */
  message: string;
}
export function FileError$IoError(message: string): FileError$;
export function FileError$isIoError(value: FileError$): boolean;
export function FileError$IoError$0(value: FileError$): string;
export function FileError$IoError$message(value: FileError$): string;

export type FileError$ = NotFound | PermissionDenied | IsDirectory | NotDirectory | AlreadyExists | IoError;

export class File extends _.CustomType {}
export function FileType$File(): FileType$;
export function FileType$isFile(value: FileType$): boolean;

export class Directory extends _.CustomType {}
export function FileType$Directory(): FileType$;
export function FileType$isDirectory(value: FileType$): boolean;

export class Symlink extends _.CustomType {}
export function FileType$Symlink(): FileType$;
export function FileType$isSymlink(value: FileType$): boolean;

export class Unknown extends _.CustomType {}
export function FileType$Unknown(): FileType$;
export function FileType$isUnknown(value: FileType$): boolean;

export type FileType$ = File | Directory | Symlink | Unknown;

export class FileInfo extends _.CustomType {
  /** @deprecated */
  constructor(
    path: string,
    file_type: FileType$,
    size: number,
    is_readonly: boolean
  );
  /** @deprecated */
  path: string;
  /** @deprecated */
  file_type: FileType$;
  /** @deprecated */
  size: number;
  /** @deprecated */
  is_readonly: boolean;
}
export function FileInfo$FileInfo(
  path: string,
  file_type: FileType$,
  size: number,
  is_readonly: boolean,
): FileInfo$;
export function FileInfo$isFileInfo(value: FileInfo$): boolean;
export function FileInfo$FileInfo$0(value: FileInfo$): string;
export function FileInfo$FileInfo$path(value: FileInfo$): string;
export function FileInfo$FileInfo$1(value: FileInfo$): FileType$;
export function FileInfo$FileInfo$file_type(value: FileInfo$): FileType$;
export function FileInfo$FileInfo$2(value: FileInfo$): number;
export function FileInfo$FileInfo$size(value: FileInfo$): number;
export function FileInfo$FileInfo$3(value: FileInfo$): boolean;
export function FileInfo$FileInfo$is_readonly(value: FileInfo$): boolean;

export type FileInfo$ = FileInfo;

export class ReadOk extends _.CustomType {
  /** @deprecated */
  constructor(content: string);
  /** @deprecated */
  content: string;
}
export function ReadResult$ReadOk(content: string): ReadResult$;
export function ReadResult$isReadOk(value: ReadResult$): boolean;
export function ReadResult$ReadOk$0(value: ReadResult$): string;
export function ReadResult$ReadOk$content(value: ReadResult$): string;

export class ReadError extends _.CustomType {
  /** @deprecated */
  constructor(error: FileError$);
  /** @deprecated */
  error: FileError$;
}
export function ReadResult$ReadError(error: FileError$): ReadResult$;
export function ReadResult$isReadError(value: ReadResult$): boolean;
export function ReadResult$ReadError$0(value: ReadResult$): FileError$;
export function ReadResult$ReadError$error(value: ReadResult$): FileError$;

export type ReadResult$ = ReadOk | ReadError;

export class WriteOk extends _.CustomType {}
export function WriteResult$WriteOk(): WriteResult$;
export function WriteResult$isWriteOk(value: WriteResult$): boolean;

export class WriteError extends _.CustomType {
  /** @deprecated */
  constructor(error: FileError$);
  /** @deprecated */
  error: FileError$;
}
export function WriteResult$WriteError(error: FileError$): WriteResult$;
export function WriteResult$isWriteError(value: WriteResult$): boolean;
export function WriteResult$WriteError$0(value: WriteResult$): FileError$;
export function WriteResult$WriteError$error(value: WriteResult$): FileError$;

export type WriteResult$ = WriteOk | WriteError;

export class DeleteOk extends _.CustomType {}
export function DeleteResult$DeleteOk(): DeleteResult$;
export function DeleteResult$isDeleteOk(value: DeleteResult$): boolean;

export class DeleteError extends _.CustomType {
  /** @deprecated */
  constructor(error: FileError$);
  /** @deprecated */
  error: FileError$;
}
export function DeleteResult$DeleteError(error: FileError$): DeleteResult$;
export function DeleteResult$isDeleteError(value: DeleteResult$): boolean;
export function DeleteResult$DeleteError$0(value: DeleteResult$): FileError$;
export function DeleteResult$DeleteError$error(value: DeleteResult$): FileError$;

export type DeleteResult$ = DeleteOk | DeleteError;

export class CurrentDir extends _.CustomType {}
export function PathComponent$CurrentDir(): PathComponent$;
export function PathComponent$isCurrentDir(value: PathComponent$): boolean;

export class ParentDir extends _.CustomType {}
export function PathComponent$ParentDir(): PathComponent$;
export function PathComponent$isParentDir(value: PathComponent$): boolean;

export class Normal extends _.CustomType {
  /** @deprecated */
  constructor(name: string);
  /** @deprecated */
  name: string;
}
export function PathComponent$Normal(name: string): PathComponent$;
export function PathComponent$isNormal(value: PathComponent$): boolean;
export function PathComponent$Normal$0(value: PathComponent$): string;
export function PathComponent$Normal$name(value: PathComponent$): string;

export type PathComponent$ = CurrentDir | ParentDir | Normal;

export class FsOk<HKK> extends _.CustomType {
  /** @deprecated */
  constructor(value: HKK);
  /** @deprecated */
  value: HKK;
}
export function FsResult$FsOk<HKK>(value: HKK): FsResult$<HKK>;
export function FsResult$isFsOk<HKK>(value: FsResult$<HKK>): boolean;
export function FsResult$FsOk$0<HKK>(value: FsResult$<HKK>): HKK;
export function FsResult$FsOk$value<HKK>(value: FsResult$<HKK>): HKK;

export class FsError extends _.CustomType {
  /** @deprecated */
  constructor(error: FileError$);
  /** @deprecated */
  error: FileError$;
}
export function FsResult$FsError<HKK>(error: FileError$): FsResult$<HKK>;
export function FsResult$isFsError<HKK>(value: FsResult$<HKK>): boolean;
export function FsResult$FsError$0<HKK>(value: FsResult$<HKK>): FileError$;
export function FsResult$FsError$error<HKK>(value: FsResult$<HKK>): FileError$;

export type FsResult$<HKK> = FsOk<HKK> | FsError;

export class ReadFileOk extends _.CustomType {
  /** @deprecated */
  constructor(content: string);
  /** @deprecated */
  content: string;
}
export function ReadFileResult$ReadFileOk(content: string): ReadFileResult$;
export function ReadFileResult$isReadFileOk(value: ReadFileResult$): boolean;
export function ReadFileResult$ReadFileOk$0(value: ReadFileResult$): string;
export function ReadFileResult$ReadFileOk$content(value: ReadFileResult$): string;

export class ReadFileError extends _.CustomType {
  /** @deprecated */
  constructor(error: FileError$);
  /** @deprecated */
  error: FileError$;
}
export function ReadFileResult$ReadFileError(
  error: FileError$,
): ReadFileResult$;
export function ReadFileResult$isReadFileError(value: ReadFileResult$): boolean;
export function ReadFileResult$ReadFileError$0(value: ReadFileResult$): FileError$;
export function ReadFileResult$ReadFileError$error(
  value: ReadFileResult$,
): FileError$;

export type ReadFileResult$ = ReadFileOk | ReadFileError;

export class WriteFileOk extends _.CustomType {}
export function WriteFileResult$WriteFileOk(): WriteFileResult$;
export function WriteFileResult$isWriteFileOk(value: WriteFileResult$): boolean;

export class WriteFileError extends _.CustomType {
  /** @deprecated */
  constructor(error: FileError$);
  /** @deprecated */
  error: FileError$;
}
export function WriteFileResult$WriteFileError(
  error: FileError$,
): WriteFileResult$;
export function WriteFileResult$isWriteFileError(
  value: WriteFileResult$,
): boolean;
export function WriteFileResult$WriteFileError$0(value: WriteFileResult$): FileError$;
export function WriteFileResult$WriteFileError$error(
  value: WriteFileResult$,
): FileError$;

export type WriteFileResult$ = WriteFileOk | WriteFileError;

export function error_to_string(error: FileError$): string;

export function file_type_to_string(ft: FileType$): string;

export function is_file(info: FileInfo$): boolean;

export function is_directory(info: FileInfo$): boolean;

export function get_extension(path: string): $option.Option$<string>;

export function get_filename(path: string): string;

export function get_directory(path: string): string;

export function join_path(parts: _.List<string>): string;

export function normalize_path(path: string): string;

export function has_extension(path: string, ext: string): boolean;

export function is_absolute_path(path: string): boolean;

export function is_relative_path(path: string): boolean;

export function parse_path(path: string): _.List<PathComponent$>;

export function resolve_path(base: string, relative: string): string;

export function change_extension(path: string, new_ext: string): string;

export function format_size(bytes: number): string;

export function read_file(path: string): ReadFileResult$;

export function write_file(path: string, content: string): WriteFileResult$;

export function exists(path: string): boolean;

export function delete_file(path: string): DeleteResult$;

export function read_file_string(path: string): _.Result<string, FileError$>;

export function write_file_string(path: string, content: string): _.Result<
  undefined,
  FileError$
>;

export function ensure_directory(x0: string): _.Result<undefined, FileError$>;

export function read_json(x0: string): _.Result<string, FileError$>;

export function write_json(x0: string, x1: string): _.Result<
  undefined,
  FileError$
>;
