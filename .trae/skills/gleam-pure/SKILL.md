---
name: "gleam-pure"
description: "Guides AI to use pure Gleam libraries for file, HTTP, JSON, and other operations without FFI. Invoke when working with Gleam and need to perform common operations like file I/O, HTTP requests, or data parsing."
---

# Pure Gleam Libraries - No FFI Required

## Purpose

This skill helps AI developers use pure Gleam libraries for common operations, eliminating the need for FFI and making code more portable, type-safe, and maintainable.

## Why Avoid FFI?

1. **Portability**: Pure Gleam code works on both Erlang and JavaScript targets
2. **Type Safety**: No need for `dynamic` types or unsafe casts
3. **Maintainability**: All code is in one language
4. **Testability**: Easier to test without mocking FFI calls
5. **AI-Friendly**: AI can understand and modify pure Gleam code more easily

## File System Operations

### simplifile - Cross-Platform File Operations

**Package**: `simplifile`
**Targets**: Erlang, Node.js, Deno, Bun
**Installation**: `gleam add simplifile`

```gleam
import simplifile
import gleam/io

pub fn main() {
  // Read a file
  case simplifile.read("config.txt") {
    Ok(content) -> io.println(content)
    Error(error) -> io.println(simplifile.describe_error(error))
  }
  
  // Write a file
  let content = "Hello, World!"
  case simplifile.write("output.txt", content) {
    Ok(_) -> io.println("File written successfully")
    Error(error) -> io.println(simplifile.describe_error(error))
  }
  
  // Create a directory
  case simplifile.create_directory("my_dir") {
    Ok(_) -> io.println("Directory created")
    Error(error) -> io.println(simplifile.describe_error(error))
  }
  
  // List files in a directory
  case simplifile.get_files("my_dir") {
    Ok(files) -> {
      io.println("Files in directory:")
      files |> list.each(io.println)
    }
    Error(error) -> io.println(simplifile.describe_error(error))
  }
  
  // Delete a file
  case simplifile.delete("old_file.txt") {
    Ok(_) -> io.println("File deleted")
    Error(error) -> io.println(simplifile.describe_error(error))
  }
  
  // Copy a file
  case simplifile.copy_file("source.txt", "destination.txt") {
    Ok(_) -> io.println("File copied")
    Error(error) -> io.println(simplifile.describe_error(error))
  }
}
```

### filepath - Path Manipulation

**Package**: `filepath`
**Installation**: `gleam add filepath`

```gleam
import filepath

pub fn main() {
  // Join paths
  let path = filepath.join("home", "user")
  // -> "home/user"
  
  // Get file extension
  let ext = filepath.extension("document.pdf")
  // -> Ok("pdf")
  
  // Get base name
  let base = filepath.base_name("/home/user/document.pdf")
  // -> "document.pdf"
  
  // Get directory name
  let dir = filepath.directory_name("/home/user/document.pdf")
  // -> "/home/user"
}
```

## HTTP and Networking

### gleam_http + gleam_httpc - HTTP Client (Erlang)

**Packages**: `gleam_http`, `gleam_httpc`
**Installation**: `gleam add gleam_http gleam_httpc`

```gleam
import gleam/http.{Get, Post}
import gleam/httpc
import gleam/io

pub fn main() {
  // GET request
  let request = http.request()
    |> http.set_method(Get)
    |> http.set_host("api.example.com")
    |> http.set_path("/users")
  
  case httpc.send(request) {
    Ok(response) -> {
      io.println("Status: " <> int.to_string(response.status))
      io.println("Body: " <> response.body)
    }
    Error(error) -> io.println("Request failed")
  }
  
  // POST request with JSON body
  let body = "{\"name\": \"Alice\"}"
  let request = http.request()
    |> http.set_method(Post)
    |> http.set_host("api.example.com")
    |> http.set_path("/users")
    |> http.set_body(body)
    |> http.set_header("content-type", "application/json")
  
  case httpc.send(request) {
    Ok(response) -> io.println("User created: " <> response.body)
    Error(error) -> io.println("Failed to create user")
  }
}
```

### gossamer - Web API Bindings (JavaScript)

**Package**: `gossamer`
**Targets**: JavaScript (Node.js, Deno, Bun, Browser)
**Installation**: `gleam add gossamer`

```gleam
import gossamer
import gossamer/promise
import gossamer/response
import gleam/io

pub fn main() {
  // Fetch API
  use resp <- promise.then(gossamer.fetch("https://api.example.com/users"))
  use body <- promise.then(response.text(resp))
  
  io.println("Response: " <> body)
  promise.resolve(body)
}
```

### mist - HTTP Server

**Package**: `mist`
**Installation**: `gleam add mist`

```gleam
import mist
import gleam/http.{Get}

pub fn handle_request(request) {
  case request.method {
    Get -> {
      case request.path {
        ["/"] -> mist.Response(200, [], "Hello, World!")
        ["/users"] -> mist.Response(200, [], "[{\"name\": \"Alice\"}]")
        _ -> mist.Response(404, [], "Not Found")
      }
    }
    _ -> mist.Response(405, [], "Method Not Allowed")
  }
}

pub fn main() {
  mist.new(handle_request)
    |> mist.port(3000)
    |> mist.start
}
```

## Data Formats

### gleam_json - JSON Parsing and Encoding

**Package**: `gleam_json`
**Installation**: `gleam add gleam_json`

```gleam
import gleam/json
import gleam/dynamic/decode

// Encoding
pub fn encode_user(user: User) -> String {
  json.object([
    #("name", json.string(user.name)),
    #("age", json.int(user.age)),
    #("email", json.string(user.email)),
    #("active", json.bool(user.active)),
  ])
  |> json.to_string
}

// Decoding
pub fn decode_user(json_string: String) -> Result(User, json.DecodeError) {
  let user_decoder = {
    use name <- decode.field("name", decode.string)
    use age <- decode.field("age", decode.int)
    use email <- decode.field("email", decode.string)
    use active <- decode.field("active", decode.bool)
    decode.success(User(name:, age:, email:, active:))
  }
  
  json.parse(from: json_string, using: user_decoder)
}
```

## Environment Variables

### envoy - Environment Variable Access

**Package**: `envoy`
**Installation**: `gleam add envoy`

```gleam
import envoy
import gleam/io

pub fn main() {
  // Get environment variable
  case envoy.get("HOME") {
    Ok(home) -> io.println("Home directory: " <> home)
    Error(_) -> io.println("HOME not set")
  }
  
  // Get with default
  let port = envoy.get("PORT") |> option.unwrap("3000")
  io.println("Port: " <> port)
}
```

## Logging

### gleam_community_ansi - Colored Logging

**Package**: `gleam_community_ansi`
**Installation**: `gleam add gleam_community_ansi`

```gleam
import gleam_community/ansi
import gleam/io

pub fn main() {
  io.println(ansi.green("Success: Operation completed"))
  io.println(ansi.red("Error: Something went wrong"))
  io.println(ansi.yellow("Warning: Check your input"))
}
```

## Best Practices

1. **Always check for errors**: Use `case` expressions to handle `Result` types
2. **Use descriptive error messages**: Use `describe_error()` functions when available
3. **Choose the right target**: Use `gleam_httpc` for Erlang, `gossamer` for JavaScript
4. **Install dependencies**: Always run `gleam add <package>` before using
5. **Test cross-platform**: Test on both Erlang and JavaScript targets when possible

## Quick Reference

| Operation | Package | Installation |
|-----------|---------|--------------|
| File I/O | `simplifile` | `gleam add simplifile` |
| Path manipulation | `filepath` | `gleam add filepath` |
| HTTP (Erlang) | `gleam_http`, `gleam_httpc` | `gleam add gleam_http gleam_httpc` |
| HTTP (JS) | `gossamer` | `gleam add gossamer` |
| HTTP Server | `mist` | `gleam add mist` |
| JSON | `gleam_json` | `gleam add gleam_json` |
| Environment | `envoy` | `gleam add envoy` |
| Logging | `gleam_community_ansi` | `gleam add gleam_community_ansi` |

## When to Use This Skill

- When you need to perform file operations in Gleam
- When you need to make HTTP requests
- When you need to parse or encode JSON
- When you need to access environment variables
- When you want to avoid FFI for better portability
- When you want type-safe operations without dynamic types
