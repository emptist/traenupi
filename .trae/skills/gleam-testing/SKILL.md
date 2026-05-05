---
name: "gleam-testing"
description: "Guides AI to write comprehensive tests for Gleam code using gleeunit. Invoke when writing tests for Gleam functions, modules, or when following TDD practices."
---

# Gleam Testing - Comprehensive Test Guide

## Purpose

This skill helps AI developers write comprehensive tests for Gleam code using the built-in testing framework `gleeunit`. It covers test organization, assertions, testing strategies, and best practices.

## Test Framework

### gleeunit - Built-in Testing

**Package**: `gleeunit` (included by default)
**Run tests**: `gleam test`

```gleam
import gleeunit
import gleeunit/should

pub fn main() {
  gleeunit.main()
}
```

## Basic Assertions

### Equality Testing

```gleam
import gleeunit/should

pub fn add(a: Int, b: Int) -> Int {
  a + b
}

pub fn add_test() {
  add(2, 3) |> should.equal(5)
  add(0, 0) |> should.equal(0)
  add(-1, 1) |> should.equal(0)
}
```

### Result Type Testing

```gleam
pub fn divide(a: Float, b: Float) -> Result(Float, String) {
  case b == 0.0 {
    True -> Error("Division by zero")
    False -> Ok(a /. b)
  }
}

pub fn divide_test() {
  divide(10.0, 2.0) |> should.equal(Ok(5.0))
  divide(10.0, 0.0) |> should.equal(Error("Division by zero"))
}

pub fn divide_ok_test() {
  divide(10.0, 2.0) |> should.be_ok()
}

pub fn divide_error_test() {
  divide(10.0, 0.0) |> should.be_error()
}
```

### Option Type Testing

```gleam
pub fn find_user(id: Int) -> Option(User) {
  case id {
    1 -> Some(User(id: 1, name: "Alice"))
    _ -> None
  }
}

pub fn find_user_test() {
  find_user(1) |> should.equal(Some(User(id: 1, name: "Alice")))
  find_user(999) |> should.equal(None)
}

pub fn find_user_some_test() {
  find_user(1) |> should.be_some()
}

pub fn find_user_none_test() {
  find_user(999) |> should.be_none()
}
```

### Boolean Testing

```gleam
pub fn is_even(n: Int) -> Bool {
  n % 2 == 0
}

pub fn is_even_test() {
  is_even(2) |> should.be_true()
  is_even(3) |> should.be_false()
}
```

### Comparison Testing

```gleam
pub fn absolute(n: Int) -> Int {
  case n < 0 {
    True -> -n
    False -> n
  }
}

pub fn absolute_test() {
  absolute(5) |> should.equal(5)
  absolute(-5) |> should.equal(5)
  absolute(0) |> should.equal(0)
}
```

## Test Organization

### File Structure

```
test/
  my_module_test.gleam    # Tests for src/my_module.gleam
  user_test.gleam         # Tests for src/user.gleam
  integration_test.gleam  # Integration tests
```

### Naming Conventions

- Test files: `<module>_test.gleam`
- Test functions: `<function>_test()`
- Multiple tests: `<function>_<scenario>_test()`

```gleam
// test/calculator_test.gleam
import calculator
import gleeunit/should

pub fn add_test() {
  calculator.add(2, 3) |> should.equal(5)
}

pub fn add_negative_numbers_test() {
  calculator.add(-2, -3) |> should.equal(-5)
}

pub fn add_zero_test() {
  calculator.add(5, 0) |> should.equal(5)
}
```

## Testing Strategies

### 1. Test Public API Only

```gleam
// src/my_module.gleam
pub fn public_function() -> Int {
  private_helper() + 1
}

fn private_helper() -> Int {
  42
}

// test/my_module_test.gleam
pub fn public_function_test() {
  my_module.public_function() |> should.equal(43)
}
```

### 2. Test Edge Cases

```gleam
pub fn factorial(n: Int) -> Result(Int, String) {
  case n {
    _ if n < 0 -> Error("Negative number")
    0 -> Ok(1)
    _ -> Ok(n * factorial(n - 1))
  }
}

pub fn factorial_test() {
  // Normal cases
  factorial(5) |> should.equal(Ok(120))
  factorial(1) |> should.equal(Ok(1))
  
  // Edge cases
  factorial(0) |> should.equal(Ok(1))
  factorial(-1) |> should.equal(Error("Negative number"))
}
```

### 3. Test Error Conditions

```gleam
pub fn parse_int(s: String) -> Result(Int, String) {
  case s {
    "0" -> Ok(0)
    "1" -> Ok(1)
    "42" -> Ok(42)
    _ -> Error("Invalid integer: " <> s)
  }
}

pub fn parse_int_test() {
  // Valid inputs
  parse_int("42") |> should.equal(Ok(42))
  parse_int("0") |> should.equal(Ok(0))
  
  // Invalid inputs
  parse_int("abc") |> should.equal(Error("Invalid integer: abc"))
  parse_int("") |> should.equal(Error("Invalid integer: "))
}
```

### 4. Test Type Constructors

```gleam
pub type User {
  User(id: Int, name: String, active: Bool)
}

pub fn create_user(id: Int, name: String) -> User {
  User(id:, name:, active: True)
}

pub fn create_user_test() {
  let user = create_user(1, "Alice")
  user.id |> should.equal(1)
  user.name |> should.equal("Alice")
  user.active |> should.be_true()
}
```

## Advanced Testing

### Testing with Custom Types

```gleam
pub type Shape {
  Circle(radius: Float)
  Rectangle(width: Float, height: Float)
}

pub fn area(shape: Shape) -> Float {
  case shape {
    Circle(radius) -> 3.14159 *. radius *. radius
    Rectangle(width, height) -> width *. height
  }
}

pub fn area_test() {
  let circle = Circle(2.0)
  area(circle) |> should.equal(12.56636)
  
  let rect = Rectangle(3.0, 4.0)
  area(rect) |> should.equal(12.0)
}
```

### Testing with Lists

```gleam
pub fn double_all(numbers: List(Int)) -> List(Int) {
  numbers |> list.map(fn(n) { n * 2 })
}

pub fn double_all_test() {
  double_all([1, 2, 3]) |> should.equal([2, 4, 6])
  double_all([]) |> should.equal([])
  double_all([0]) |> should.equal([0])
}
```

### Testing with Functions

```gleam
pub fn apply_twice(f: fn(Int) -> Int, x: Int) -> Int {
  f(f(x))
}

pub fn apply_twice_test() {
  let double = fn(n) { n * 2 }
  apply_twice(double, 3) |> should.equal(12)
  
  let add_one = fn(n) { n + 1 }
  apply_twice(add_one, 5) |> should.equal(7)
}
```

### Testing with State

```gleam
pub type Counter {
  Counter(count: Int)
}

pub fn new_counter() -> Counter {
  Counter(count: 0)
}

pub fn increment(counter: Counter) -> Counter {
  Counter(count: counter.count + 1)
}

pub fn counter_test() {
  let c1 = new_counter()
  c1.count |> should.equal(0)
  
  let c2 = increment(c1)
  c2.count |> should.equal(1)
  
  let c3 = increment(c2)
  c3.count |> should.equal(2)
}
```

## Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

1. **Red**: Write a failing test
2. **Green**: Write minimal code to pass
3. **Refactor**: Improve code while keeping tests green

```gleam
// Step 1: Red - Write failing test
pub fn fibonacci_test() {
  fibonacci(0) |> should.equal(Ok(0))
  fibonacci(1) |> should.equal(Ok(1))
  fibonacci(10) |> should.equal(Ok(55))
}

// Step 2: Green - Minimal implementation
pub fn fibonacci(n: Int) -> Result(Int, String) {
  case n {
    _ if n < 0 -> Error("Negative input")
    0 -> Ok(0)
    1 -> Ok(1)
    _ -> {
      let assert Ok(a) = fibonacci(n - 2)
      let assert Ok(b) = fibonacci(n - 1)
      Ok(a + b)
    }
  }
}

// Step 3: Refactor - Optimize
pub fn fibonacci(n: Int) -> Result(Int, String) {
  case n < 0 {
    True -> Error("Negative input")
    False -> Ok(fib_helper(n, 0, 1))
  }
}

fn fib_helper(n: Int, a: Int, b: Int) -> Int {
  case n {
    0 -> a
    _ -> fib_helper(n - 1, b, a + b)
  }
}
```

## Running Tests

### Run All Tests

```bash
gleam test
```

### Run Specific Test File

```bash
gleam test test/my_module_test.gleam
```

### Run with Verbose Output

```bash
gleam test --verbose
```

## Best Practices

1. **One assertion per test**: Keep tests focused
2. **Descriptive names**: Use clear test function names
3. **Test behavior, not implementation**: Focus on what, not how
4. **Test edge cases**: Cover boundary conditions
5. **Test error paths**: Don't just test happy paths
6. **Keep tests simple**: Avoid complex test logic
7. **Use setup/teardown**: For complex test scenarios
8. **Test both targets**: Run tests on Erlang and JavaScript
9. **Fast tests**: Keep tests fast for quick feedback
10. **Independent tests**: Tests should not depend on each other

## Common Patterns

### Testing JSON Parsing

```gleam
import gleam/json
import gleam/dynamic/decode

pub type User {
  User(name: String, age: Int)
}

pub fn decode_user(json_string: String) -> Result(User, json.DecodeError) {
  let decoder = {
    use name <- decode.field("name", decode.string)
    use age <- decode.field("age", decode.int)
    decode.success(User(name:, age:))
  }
  json.parse(from: json_string, using: decoder)
}

pub fn decode_user_test() {
  let json = "{\"name\": \"Alice\", \"age\": 30}"
  decode_user(json) |> should.equal(Ok(User(name: "Alice", age: 30)))
}
```

### Testing HTTP Handlers

```gleam
import gleam/http.{Get, Post}

pub fn handle_request(request: http.Request) -> http.Response {
  case request.method {
    Get -> http.Response(200, [], "Hello")
    Post -> http.Response(201, [], "Created")
    _ -> http.Response(405, [], "Method Not Allowed")
  }
}

pub fn handle_request_test() {
  let get_request = http.Request(Get, [], "/", "", "")
  let response = handle_request(get_request)
  response.status |> should.equal(200)
  
  let post_request = http.Request(Post, [], "/", "", "")
  let response = handle_request(post_request)
  response.status |> should.equal(201)
}
```

## Quick Reference

| Assertion | Usage |
|-----------|-------|
| `should.equal` | Test equality |
| `should.not_equal` | Test inequality |
| `should.be_ok` | Test Result is Ok |
| `should.be_error` | Test Result is Error |
| `should.be_some` | Test Option is Some |
| `should.be_none` | Test Option is None |
| `should.be_true` | Test Bool is True |
| `should.be_false` | Test Bool is False |
| `should.be_empty` | Test List is empty |
| `should.be_greater_than` | Test numeric comparison |
| `should.be_less_than` | Test numeric comparison |

## When to Use This Skill

- When writing tests for Gleam functions or modules
- When following TDD (Test-Driven Development) practices
- When you need to test Result or Option types
- When you need to test custom types
- When you need to test error conditions
- When you want comprehensive test coverage
