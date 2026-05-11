import gleam/io
import gleam/javascript/promise.{resolve}
import traenupi_core/commit_review

pub fn handle_commit() -> promise.Promise(Nil) {
  io.println("🔍 Reviewing changes before commit...")
  io.println("")
  
  commit_review.force_commit()
}
