//// Lively-Puter Integration Example in Gleam
////
//// This example demonstrates how to use the Lively-Puter bridge
//// from Gleam code in TraeNuPI.

import gleam/io
import gleam/json
import traenupi_core/lively_puter as bridge

pub fn main() {
  io.println("🚀 Initializing Lively-Puter Bridge from Gleam...")
  
  // Initialize the bridge with default config
  let config = bridge.default_config()
  
  case bridge.initialize(config) {
    Ok(_) -> {
      io.println("✅ Bridge initialized successfully!")
      
      // Test file system
      test_file_system()
      
      // Test AI
      test_ai()
      
      // Test database
      test_database()
      
      // Test authentication
      test_auth()
      
      io.println("✅ All tests complete!")
    }
    Error(error) -> {
      io.println("❌ Failed to initialize bridge: " <> error)
    }
  }
}

fn test_file_system() {
  io.println("\n📁 Testing File System...")
  
  // Write a file
  case bridge.write_file("/documents/test.txt", "Hello from Gleam!") {
    Ok(_) -> io.println("✓ File written successfully")
    Error(error) -> io.println("❌ Write error: " <> error)
  }
  
  // Read the file back
  case bridge.read_file("/documents/test.txt") {
    Ok(content) -> io.println("✓ File content: " <> content)
    Error(error) -> io.println("❌ Read error: " <> error)
  }
  
  // Check if file exists
  case bridge.file_exists("/documents/test.txt") {
    Ok(True) -> io.println("✓ File exists")
    Ok(False) -> io.println("✗ File does not exist")
    Error(error) -> io.println("❌ Exists check error: " <> error)
  }
}

fn test_ai() {
  io.println("\n🤖 Testing AI Services...")
  
  // Send a chat message
  let messages = [
    bridge.UserMessage("What is 2 + 2?")
  ]
  
  case bridge.chat(messages) {
    Ok(response) -> {
      case response.message {
        bridge.AssistantMessage(content) -> 
          io.println("✓ AI Response: " <> content)
        _ -> io.println("✗ Unexpected message type")
      }
    }
    Error(error) -> io.println("❌ AI error: " <> error)
  }
}

fn test_database() {
  io.println("\n💾 Testing Database...")
  
  // Set a value
  let value = json.object([
    #("theme", json.string("dark")),
    #("language", json.string("en"))
  ])
  
  case bridge.db_set("user:preferences", value) {
    Ok(_) -> io.println("✓ Preferences saved")
    Error(error) -> io.println("❌ Set error: " <> error)
  }
  
  // Get the value back
  case bridge.db_get("user:preferences") {
    Ok(_) -> io.println("✓ Preferences retrieved")
    Error(error) -> io.println("❌ Get error: " <> error)
  }
  
  // List all user keys
  case bridge.db_list("user:") {
    Ok(items) -> io.println("✓ Found " <> int.to_string(list.length(items)) <> " user keys")
    Error(error) -> io.println("❌ List error: " <> error)
  }
}

fn test_auth() {
  io.println("\n🔐 Testing Authentication...")
  
  // Check if signed in
  case bridge.is_signed_in() {
    Ok(True) -> {
      io.println("✓ Already signed in")
      
      // Get user info
      case bridge.get_user() {
        Ok(user) -> io.println("✓ User: " <> user.username)
        Error(error) -> io.println("❌ Get user error: " <> error)
      }
    }
    Ok(False) -> {
      io.println("⚠️  Not signed in")
      
      // Sign in
      case bridge.sign_in() {
        Ok(user) -> io.println("✓ Signed in as: " <> user.username)
        Error(error) -> io.println("❌ Sign in error: " <> error)
      }
    }
    Error(error) -> io.println("❌ Auth check error: " <> error)
  }
}
