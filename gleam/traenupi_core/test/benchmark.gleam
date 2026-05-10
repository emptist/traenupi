import traenupi_core/ai_provider as ai_provider
import gleam/io
import gleam/string
import gleam/int
import gleam/float
import gleam/option.{None}

pub fn main() {
  io.println("📊 Pure Gleam AI Provider Benchmark")
  io.println("═" <> string.repeat("═", 50))
  io.println("")
  
  // Test 1: Provider Creation Speed
  io.println("🧪 Test 1: Provider Creation (1000 iterations)")
  let start1 = ai_provider.system_time()
  
  iterate(1000, fn() { let _provider = ai_provider.openrouter("test-api-key") })
  
  let end1 = ai_provider.system_time()
  let duration1 = end1 - start1
  
  io.println("   ⏱️  Time: " <> int.to_string(duration1) <> "ms")
  io.println("   📈 Average: " <> float.to_string(int.to_float(duration1) /. 1000.0) <> "ms per creation")
  io.println("")
  
  // Test 2: Message Creation
  io.println("🧪 Test 2: Message Object Creation (1000 messages)")
  let start2 = ai_provider.system_time()
  
  let messages = make_messages(1000, [])
  
  let end2 = ai_provider.system_time()
  let duration2 = end2 - start2
  
  io.println("   ⏱️  Time: " <> int.to_string(duration2) <> "ms")
  io.println("   📊 Messages created: " <> int.to_string(length(messages)))
  io.println("")
  
  // Test 3: Error Handling Overhead
  io.println("🧪 Test 3: Error Type Conversion (10000 iterations)")
  let start3 = ai_provider.system_time()
  
  iterate(10000, fn() {
    let _error_str = ai_provider.error_to_string(ai_provider.AiNetworkError("Test error"))
  })
  
  let end3 = ai_provider.system_time()
  let duration3 = end3 - start3
  
  io.println("   ⏱️  Time: " <> int.to_string(duration3) <> "ms")
  io.println("   📈 Average: " <> float.to_string(int.to_float(duration3) /. 10000.0) <> "ms per conversion")
  io.println("")
  
  // Test 4: Fallback Logic Setup
  io.println("🧪 Test 4: Fallback Provider Chain (100 iterations)")
  let start4 = ai_provider.system_time()
  
  iterate(100, fn() {
    let primary = ai_provider.openrouter("key1")
    let fallback = ai_provider.ollama()
    let test_msg = [ai_provider.Message(role: "user", content: "test")]
    let _chained = ai_provider.ask_with_fallback(primary, fallback, "model1", "model2", test_msg, None)
  })
  
  let end4 = ai_provider.system_time()
  let duration4 = end4 - start4
  
  io.println("   ⏱️  Time: " <> int.to_string(duration4) <> "ms")
  io.println("   📈 Average: " <> float.to_string(int.to_float(duration4) /. 100.0) <> "ms per chain setup")
  io.println("")
  
  // Test 5: Response Object Creation
  io.println("🧪 Test 5: Response Object Creation (1000 iterations)")
  let start5 = ai_provider.system_time()
  
  iterate(1000, fn() {
    let _response = ai_provider.ChatCompletionResponse(
      id: "test-id",
      model: "test-model",
      content: "Test response",
      provider: "openrouter",
      latency_ms: 10,
      is_fallback: False
    )
  })
  
  let end5 = ai_provider.system_time()
  let duration5 = end5 - start5
  
  io.println("   ⏱️  Time: " <> int.to_string(duration5) <> "ms")
  io.println("   📈 Average: " <> float.to_string(int.to_float(duration5) /. 1000.0) <> "ms per response")
  io.println("")
  
  // Summary
  io.println("═" <> string.repeat("═", 50))
  io.println("📋 Benchmark Summary:")
  io.println("   ✅ Provider creation: " <> int.to_string(duration1) <> "ms (1000x)")
  io.println("   ✅ Message creation: " <> int.to_string(duration2) <> "ms (1000 msgs)")
  io.println("   ✅ Error handling: " <> int.to_string(duration3) <> "ms (10000x)")
  io.println("   ✅ Fallback chain: " <> int.to_string(duration4) <> "ms (100x)")
  io.println("   ✅ Response object: " <> int.to_string(duration5) <> "ms (1000x)")
  io.println("")
  io.println("🎯 Pure Gleam Performance:")
  io.println("   • Zero external dependencies")
  io.println("   • No pi overhead")
  io.println("   • No TypeScript compilation")
  io.println("   • Native Gleam runtime performance")
  io.println("   • Type-safe at compile time")
  io.println("")
}

fn make_messages(count: Int, acc: List(ai_provider.Message)) -> List(ai_provider.Message) {
  case count {
    0 -> acc
    n -> make_messages(n - 1, [ai_provider.Message(role: "user", content: "msg " <> int.to_string(n)), ..acc])
  }
}

fn length(list: List(a)) -> Int {
  case list {
    [] -> 0
    [_, ..rest] -> 1 + length(rest)
  }
}

fn iterate(times: Int, function: fn() -> a) {
  case times {
    0 -> Nil
    _ -> {
      let _ = function()
      iterate(times - 1, function)
    }
  }
}
