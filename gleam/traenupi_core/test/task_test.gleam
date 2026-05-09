import gleeunit
import gleeunit/should
import gleam/option.{Some, None}
import traenupi_core/task.{Pending, Running, Completed, Failed}
import gleam/dict

pub fn main() {
  gleeunit.main()
}

pub fn task_decode_valid_test() {
  let row = dict.from_list([
    #("id", "task-123"),
    #("title", "Test Task"),
    #("description", "A test task"),
    #("status", "PENDING"),
    #("priority", "5"),
    #("result", ""),
    #("error", ""),
    #("retry_count", "0"),
    #("created_at", "1000000"),
    #("updated_at", "1000000"),
    #("completed_at", ""),
    #("depends_on", ""),
    #("blocking", ""),
  ])
  
  case task.decode_task(row) {
    Ok(t) -> {
      should.equal(t.id, "task-123")
      should.equal(t.title, "Test Task")
      should.equal(t.status, Pending)
      should.equal(t.priority, 5)
    }
    Error(_) -> should.fail()
  }
}

pub fn task_decode_running_status_test() {
  let row = dict.from_list([
    #("id", "task-456"),
    #("title", "Running Task"),
    #("description", ""),
    #("status", "RUNNING"),
    #("priority", "10"),
    #("result", ""),
    #("error", ""),
    #("retry_count", "0"),
    #("created_at", "1000000"),
    #("updated_at", "1000000"),
    #("completed_at", ""),
    #("depends_on", ""),
    #("blocking", ""),
  ])
  
  case task.decode_task(row) {
    Ok(t) -> should.equal(t.status, Running)
    Error(_) -> should.fail()
  }
}

pub fn task_decode_completed_status_test() {
  let row = dict.from_list([
    #("id", "task-789"),
    #("title", "Completed Task"),
    #("description", ""),
    #("status", "COMPLETED"),
    #("priority", "3"),
    #("result", "Success"),
    #("error", ""),
    #("retry_count", "0"),
    #("created_at", "1000000"),
    #("updated_at", "2000000"),
    #("completed_at", "2000000"),
    #("depends_on", ""),
    #("blocking", ""),
  ])
  
  case task.decode_task(row) {
    Ok(t) -> {
      should.equal(t.status, Completed)
      should.equal(t.result, Some("Success"))
    }
    Error(_) -> should.fail()
  }
}

pub fn task_decode_failed_status_test() {
  let row = dict.from_list([
    #("id", "task-failed"),
    #("title", "Failed Task"),
    #("description", ""),
    #("status", "FAILED"),
    #("priority", "1"),
    #("result", ""),
    #("error", "Something went wrong"),
    #("retry_count", "3"),
    #("created_at", "1000000"),
    #("updated_at", "2000000"),
    #("completed_at", ""),
    #("depends_on", ""),
    #("blocking", ""),
  ])
  
  case task.decode_task(row) {
    Ok(t) -> {
      should.equal(t.status, Failed)
      should.equal(t.error, Some("Something went wrong"))
      should.equal(t.retry_count, 3)
    }
    Error(_) -> should.fail()
  }
}

pub fn task_decode_missing_id_test() {
  let row = dict.from_list([
    #("title", "No ID"),
    #("status", "pending"),
  ])
  
  case task.decode_task(row) {
    Ok(_) -> should.fail()
    Error(_) -> should.equal(True, True)
  }
}

pub fn task_decode_invalid_status_test() {
  let row = dict.from_list([
    #("id", "task-bad"),
    #("title", "Bad Status"),
    #("description", ""),
    #("status", "invalid_status"),
    #("priority", "5"),
    #("result", ""),
    #("error", ""),
    #("retry_count", "0"),
    #("created_at", "1000000"),
    #("updated_at", "1000000"),
    #("completed_at", ""),
    #("depends_on", ""),
    #("blocking", ""),
  ])
  
  case task.decode_task(row) {
    Ok(_) -> should.fail()
    Error(_) -> should.equal(True, True)
  }
}

pub fn task_status_conversion_test() {
  should.equal(task.status_to_string(Pending), "PENDING")
  should.equal(task.status_to_string(Running), "RUNNING")
  should.equal(task.status_to_string(Completed), "COMPLETED")
  should.equal(task.status_to_string(Failed), "FAILED")
  
  should.equal(task.status_from_string("PENDING"), Ok(Pending))
  should.equal(task.status_from_string("RUNNING"), Ok(Running))
  should.equal(task.status_from_string("COMPLETED"), Ok(Completed))
  should.equal(task.status_from_string("FAILED"), Ok(Failed))
  should.equal(task.status_from_string("invalid"), Error(task.InvalidStatus("Unknown status: invalid")))
}

pub fn task_new_test() {
  let t = task.new_task("My Task", 5)
  should.equal(t.title, "My Task")
  should.equal(t.priority, 5)
  should.equal(t.status, Pending)
  should.equal(t.retry_count, 0)
}

pub fn task_with_description_test() {
  let t = task.new_task("Task", 1)
  let t = task.with_description(t, "A description")
  
  case t.description {
    Some(d) -> should.equal(d, "A description")
    None -> should.fail()
  }
}

pub fn task_start_test() {
  let t = task.new_task("Task", 1)
  
  case task.start(t) {
    Ok(started) -> should.equal(started.status, Running)
    Error(_) -> should.fail()
  }
}

pub fn task_start_already_running_test() {
  let t = task.new_task("Task", 1)
  
  case task.start(t) {
    Ok(started) -> {
      case task.start(started) {
        Ok(_) -> should.fail()
        Error(e) -> should.equal(e, task.InvalidStatus("Task is already running"))
      }
    }
    Error(_) -> should.fail()
  }
}

pub fn task_complete_test() {
  let t = task.new_task("Task", 1)
  
  case task.start(t) {
    Ok(started) -> {
      let completed = task.complete(started, "Done")
      should.equal(completed.status, Completed)
      should.equal(completed.result, Some("Done"))
    }
    Error(_) -> should.fail()
  }
}

pub fn task_fail_test() {
  let t = task.new_task("Task", 1)
  
  case task.start(t) {
    Ok(started) -> {
      let failed = task.fail(started, "Error occurred")
      should.equal(failed.status, Failed)
      should.equal(failed.error, Some("Error occurred"))
    }
    Error(_) -> should.fail()
  }
}
