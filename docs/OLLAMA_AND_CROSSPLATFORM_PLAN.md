# Feature Implementation Plan: Ollama + Cross-Platform Security

## Overview

Two critical features to make TraeNuPI **production-ready** and **cross-platform**:

1. **Ollama Local Model Support** - Free, offline AI fallback
2. **Cross-Platform Secret Storage** - Works on macOS, Linux, Windows

---

## Feature 1: Ollama Local Model Integration

### Why Ollama?

| Benefit | Description |
|---------|-------------|
| **100% FREE** | No API costs, no API keys needed |
| **OFFLINE** | Works without internet |
| **PRIVATE** | Data never leaves your machine |
| **FAST** | Local inference, no latency |
| **RELIABLE** | No 500 errors from external services |

### Current Status

✅ **Already Partially Implemented:**
- `ai_provider.gleam` has `Ollama` provider type
- `ollama_chat()` function exists
- Basic config structure in place

❌ **Missing:**
- Auto-detection of running Ollama instance
- Fallback logic (OpenRouter → Ollama)
- Model management (list, pull, check availability)
- Installation/setup helpers
- Error handling when Ollama not installed

---

### Implementation Plan

#### Phase A: Enhanced Ollama Provider (Priority: HIGH)

**File to modify:** `gleam/traenupi_core/src/traenupi_core/ai_provider.gleam`

**New functions to add:**

```gleam
// Check if Ollama is running and accessible
pub fn ollama_is_available() -> Bool {
  // Try to connect to localhost:11434
  case http.get("http://localhost:11434/api/tags") {
    Ok(_) -> True
    Error(_) -> False
  }
}

// Get list of available local models
pub fn ollama_list_models() -> Result(List(String), AiError) {
  let request = http.get("http://localhost:11434/api/tags")
  
  case http.send(request) {
    Ok(response) -> {
      case response.status {
        200 -> parse_ollama_model_list(response.body)
        _ -> Error(AiNetworkError("Cannot connect to Ollama"))
      }
    }
    Error(e) -> Error(to_ai_error(e))
  }
}

// Check if specific model is available locally
pub fn ollama_model_exists(model_name: String) -> Bool {
  case ollama_list_models() {
    Ok(models) -> list.contains(models, model_name)
    Error(_) -> False
  }
}

// Smart provider selection with automatic fallback
pub fn smart_provider_selection(
  api_key: String,
  primary_model: String,
  fallback_model: String,
) -> Tuple(Provider, Provider) {
  // Primary: OpenRouter (cloud)
  let primary = openrouter(api_key)
  
  // Fallback: Ollama (local) - only if available
  let fallback = case ollama_is_available() {
    True -> case ollama_model_exists(fallback_model) {
      True -> ollama()
      False -> {
        io.println("⚠️  Ollama running but model '" <> fallback_model <> "' not found")
        io.println("   Run: ollama pull " <> fallback_model)
        NoProvider  // No fallback available
      }
    }
    False -> {
      io.println("ℹ️  Ollama not detected (optional local fallback)")
      NoProvider
    }
  }
  
  tuple(primary, fallback)
}

// Chat with automatic fallback
pub fn chat_with_fallback(
  api_key: String,
  model: String,
  messages: List(Message),
  system_prompt: Option(String),
) -> Result(ChatCompletionResponse, AiError) {
  let tuple(primary, fallback) = smart_provider_selection(
    api_key,
    model,
    "llama3",  // Default Ollama model
  )
  
  // Try primary first
  case chat_completion(primary, model, messages, system_prompt) {
    Ok(response) -> Ok(response)
    
    Error(primary_error) ->
      // Try fallback if available
      case fallback {
        Ollama(_) -> {
          io.println("")
          io.println("🔄 Primary provider failed, trying local Ollama...")
          io.println("")
          
          case chat_completion(fallback, "llama3", messages, system_prompt) {
            Ok(fallback_response) ->
              Ok(ChatCompletionResponse(
                ..fallback_response,
                is_fallback: True,
              ))
            Error(fallback_error) ->
              Error(AllProvidersFailed([primary_error, fallback_error]))
          }
        }
        
        NoProvider -> Error(primary_error)
      }
  }
}
```

#### Phase B: Ollama Management Utilities (Priority: MEDIUM)

**New file to create:** `gleam/traenupi_core/src/traenupi_core/ollama.gleam`

```gleam
import gleam/io
import gleam/result.{type Result}
import traenupi_core/http.{type HttpError}

pub type OllamaError {
  OllamaNotInstalled
  OllamaNotRunning
  ModelNotFound(model: String)
  PullFailed(error: String)
  HttpError(HttpError)
}

// Check if Ollama is installed on system
pub fn is_installed() -> Bool {
  // Use FFI to check if 'ollama' command exists
  command_exists("ollama")
}

// Check if Ollama daemon is running
pub fn is_running() -> Bool {
  ollama_is_available()  // Reuse from ai_provider
}

// Start Ollama daemon (if installed but not running)
pub fn start_daemon() -> Result(Nil, OllamaError) {
  case is_installed() {
    False -> Error(OllamaNotInstalled)
    True -> {
      case is_running() {
        True -> Ok(Nil)  // Already running
        False -> {
          // Try to start it
          start_ollama_process()
        }
      }
    }
  }
}

// Pull a model (download if not present)
pub fn pull_model(model_name: String) -> Result(String, OllamaError) {
  case is_installed() {
    False -> Error(OllamaNotInstalled)
    True -> {
      io.println("📥 Downloading model: " <> model_name)
      io.println("   This may take a while depending on model size...")
      
      execute_ollama_command(["pull", model_name])
    }
  }
}

// Get recommended free models
pub fn recommended_models() -> List(String) {
  [
    "llama3",                    // 8B parameters, fast
    "llama3:13b",               // More capable
    "mistral:7b",               // Good balance
    "codellama:13b",            // Code specialist
    "gemma:7b",                 # Google's model
    "phi3:mini",                # Microsoft's small model
    "tinyllama:1.1b",           # Super fast, minimal resources
  ]
}

// Show Ollama status
pub fn show_status() -> Nil {
  let installed = is_installed()
  let running = is_running()
  
  io.println("🐑 Ollama Status")
  io.println("─────────────")
  
  case installed {
    True -> {
      io.println("✅ Installed: Yes")
      
      case running {
        True -> {
          io.println("✅ Running: Yes (localhost:11434)")
          
          case ollama_list_models() {
            Ok(models) -> {
              io.println("")
              io.println("📦 Available Models (" <> int.to_string(list.length(models)) <> "):")
              list.each(models, fn(m) {
                io.println("  • " <> m)
              })
            }
            Error(_) -> io.println("⚠️  Cannot list models")
          }
        }
        False -> {
          io.println("⚠️  Running: No")
          io.println("")
          io.println("Start with: ollama serve")
        }
      }
    }
    False -> {
      io.println("❌ Installed: No")
      io.println("")
      io.println("Install from: https://ollama.ai")
    }
  }
}

// FFI functions
@external(javascript, "../traenupi_core_ffi.mjs", "commandExists")
fn command_exists(cmd: String) -> Bool

@external(javascript, "../traenupi_core_ffi.mjs", "executeOllamaCommand")
fn execute_ollama_command(args: List(String)) -> Result(String, OllamaError)

@external(javascript, "../traenupi_core_ffi.mjs", "startOllamaProcess")
fn start_ollama_process() -> Result(Nil, OllamaError)
```

#### Phase C: CLI Integration (Priority: HIGH)

**File to modify:** `gleam/traenupi_cli/src/traenupi_cli.gleam`

**Update `handle_tellme()` function:**

```gleam
fn handle_tellme(question: String) {
  io.println("Question: " <> question)
  io.println("")
  
  // Get API key (keychain or env)
  let api_key = get_api_key()
  
  // Setup providers with smart fallback
  let use_fallback = case api_key {
    "" -> True  // No API key? Force Ollama
    _ -> False  // Has API key, try cloud first
  }
  
  case use_fallback {
    True -> {
      // No API key - must use Ollama
      case ollama.is_running() {
        True -> {
          io.println("🐑 Using local Ollama (no API key configured)")
          
          let provider = ai_provider.ollama()
          let messages = [ai_provider.Message(role: "user", content: question)]
          
          case ai_provider.chat_completion(provider, "llama3", messages, Some(system_prompt)) {
            Ok(response) -> display_ai_response(response)
            Error(error) -> display_ai_error(error)
          }
        }
        False -> {
          io.println("❌ No API key found and Ollama not running")
          io.println("")
          io.println("Options:")
          io.println("  1. Add API key: ./scripts/setup_keychain.sh")
          io.println("  2. Install Ollama: brew install ollama && ollama serve")
          io.println("  3. Pull model: ollama pull llama3")
        }
      }
    }
    
    False -> {
      // Has API key - try OpenRouter with Ollama fallback
      io.println("🤖 Asking AI (with Ollama fallback)...")
      io.println("─" <> string.repeat("─", 50))
      
      let messages = [ai_provider.Message(role: "user", content: question)]
      let system_prompt = Some("You are a helpful AI assistant integrated with TraeNuPI.")
      
      case ai_provider.chat_with_fallback(api_key, "anthropic/claude-3.5-sonnet", messages, system_prompt) {
        Ok(response) -> {
          display_ai_response(response)
          
          case response.is_fallback {
            True -> io.println("🐑 Response via local Ollama (primary was unavailable)")
            False -> Nil
          }
        }
        Error(error) -> display_ai_error(error)
      }
    }
  }
}
```

**Add new CLI commands:**

```gleam
// In parse_args function:
"ollama" -> {
  // Subcommands for Ollama management
  case args[1] {
    "status" -> handle_ollama_status()
    "pull" -> handle_ollama_pull(args[2])
    "models" -> handle_ollama_models()
    _ -> {
      io.println("Ollama commands:")
      io.println("  traenupi ollama status     - Show Ollama status")
      io.println("  traenupi ollama pull <model> - Download a model")
      io.println("  traenupi ollama models     - List available models")
    }
  }
}

// Handler functions:
fn handle_ollama_status() {
  ollama.show_status()
}

fn handle_ollama_pull(model: Option(String)) {
  case model {
    Some(m) -> {
      case ollama.pull_model(m) {
        Ok(_) -> io.println("✅ Model '" <> m "' ready!")
        Error(e) -> io.println("❌ Error: " <> ollama_error_to_string(e))
      }
    }
    None -> {
      io.println("Usage: traenupi ollama pull <model-name>")
      io.println("")
      io.println("Recommended models:")
      list.each(ollama.recommended_models(), fn(m) {
        io.println("  • " <> m)
      })
    }
  }
}
```

#### Phase D: FFI Implementation for Ollama (Priority: MEDIUM)

**File to modify:** `gleam/traenupi_core/src/traenupi_core_ffi.mjs`

```javascript
// Add to existing FFI file:

export function commandExists(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

export function executeOllamaCommand(args) {
  try {
    const result = execSync(`ollama ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout: 300000,  // 5 minute timeout for model pulls
      stdio: 'pipe',
    });
    return { ok: true, value: result.trim() };
  } catch (error) {
    return { 
      error: true, 
      value: error.message || "Ollama command failed" 
    };
  }
}

export function startOllamaProcess() {
  try {
    // Start ollama serve in background
    spawn('ollama', ['serve'], {
      detached: true,
      stdio: 'ignore',
    });
    
    // Wait a moment for it to start
    setTimeout(() => {}, 2000);
    
    return { ok: true, value: undefined };
  } catch (error) {
    return {
      error: true,
      value: error.message || "Failed to start Ollama"
    };
  }
}
```

---

### User Experience Flow

#### Scenario 1: Perfect Setup (API Key + Ollama Running)

```
$ gleam run -- tellme "What is 2+2?"

Question: What is 2+2?

🔐 Using API key from Keychain ✓
🤖 Asking AI (with Ollama fallback)...
───────────────────────────────────────────────────

✅ AI Response:
4

───────────────────────────────────────────────────
   ⏱️  Latency: ~800ms
   🤖 Model: anthropic/claude-3.5-sonnet
   🔄 Fallback: False
```

#### Scenario 2: OpenRouter Down (Auto-Fallback to Ollama)

```
$ gleam run -- tellme "What is 2+2?"

Question: What is 2+2?

🔐 Using API key from Keychain ✓
🤖 Asking AI (with Ollama fallback)...
───────────────────────────────────────────────────

🔄 Primary provider failed, trying local Ollama...

✅ AI Response:
4

───────────────────────────────────────────────────
   ⏱️  Latency: ~150ms (local!)
   🐑 Model: llama3 (local)
   🔄 Fallback: True ← Auto-switched!
```

#### Scenario 3: No API Key (Ollama Only Mode)

```
$ gleam run -- tellme "What is 2+2?"

Question: What is 2+2?

🐑 Using local Ollama (no API key configured)
───────────────────────────────────────────────────

✅ AI Response:
4 (based on my training data, 2+2=4)

───────────────────────────────────────────────────
   ⏱️  Latency: ~120ms
   🐑 Model: llama3 (local)
   💰 Cost: $0.00 (FREE!)
```

#### Scenario 4: Nothing Configured (Helpful Error)

```
$ gleam run -- tellme "test"

Question: test

❌ No API key found and Ollama not running

Options:
  1. Add API key: ./scripts/setup_keychain.sh
  2. Install Ollama: brew install ollama && ollama serve
  3. Pull model: ollama pull llama3
```

---

## Feature 2: Cross-Platform Secret Storage

### Current Status

✅ **macOS Keychain** - Working perfectly
❌ **Linux** - Not implemented
❌ **Windows** - Not implemented

---

### Implementation Plan

#### Platform Detection & Abstraction Layer

**New file:** `gleam/traenupi_core/src/traenupi_core/platform.gleam`

```gleam
import gleam/io

pub type OS {
  MacOS
  Linux
  Windows
  Unknown
}

pub type SecretStorage {
  Keychain(service: String)       // macOS
  CredentialManager(service: String)  // Windows
  GnomeKeyring(service: String)  // Linux (GNOME)
  SecretTool(service: String)    // Linux (generic)
  EnvVar(name: String)           // Fallback
  None
}

// Detect current operating system
@external(javascript, "../traenupi_core_ffi.mjs", "detectOS")
pub fn detect_os() -> OS

// Get best available secret storage for current platform
pub fn get_secret_storage(service: String) -> SecretStorage {
  case detect_os() {
    MacOS -> Keychain(service)
    Windows -> CredentialManager(service)
    Linux -> {
      // Try GNOME Keyring first, then secret-tool
      case gnome_keyring_available() {
        True -> GnomeKeyring(service)
        False -> SecretTool(service)
      }
    }
    Unknown -> EnvVar("OPENROUTER_API_KEY")
  }
}

// Retrieve secret from platform-specific storage
pub fn get_secret(service: String) -> String {
  let storage = get_secret_storage(service)
  
  case storage {
    Keychain(svc) -> get_keychain_password(svc)
    CredentialManager(svc) -> get_credential_manager_password(svc)
    GnomeKeyring(svc) -> get_gnome_keyring_password(svc)
    SecretTool(svc) -> get_secret_tool_password(svc)
    EnvVar(name) -> get_env(name)
    None -> ""
  }
}

// Store secret in platform-specific storage
pub fn set_secret(service: String, account: String, secret: String) -> Result(Nil, String) {
  let storage = get_secret_storage(service)
  
  case storage {
    Keychain(svc) -> set_keychain_password(svc, account, secret)
    CredentialManager(svc) -> set_credential_manager_password(svc, account, secret)
    GnomeKeyring(svc) -> set_gnome_keyring_password(svc, account, secret)
    SecretTool(svc) -> set_secret_tool_password(svc, account, secret)
    EnvVar(_) -> Error("Cannot store secrets in environment variables")
    None -> Error("No secret storage available")
  }
}

// Check if GNOME Keyring is available
@external(javascript, "../traenupi_core_ffi.mjs", "gnomeKeyringAvailable")
fn gnome_keyring_available() -> Bool
```

#### Platform-Specific Implementations

**Updated FFI file:** `gleam/traenupi_core/src/traenupi_core_ffi.mjs`

```javascript
import { execSync } from 'child_process';
import os from 'os';

// ===== PLATFORM DETECTION =====

export function detectOS() {
  const platform = process.platform;
  
  switch (platform) {
    case 'darwin':
      return 'MacOS';
    case 'win32':
      return 'Windows';
    case 'linux':
      return 'Linux';
    default:
      return 'Unknown';
  }
}

// ===== macOS KEYCHAIN (Existing) =====

export function getKeychainPassword(service) {
  try {
    const password = execSync(
      `security find-generic-password -s "${service}" -w 2>/dev/null`,
      { encoding: 'utf-8' }
    ).trim();
    
    return password;
  } catch (error) {
    return "";
  }
}

export function setKeychainPassword(service, account, password) {
  try {
    execSync(
      `security add-generic-password -s "${service}" -a "${account}" -w "${password}"`,
      { encoding: 'utf-8' }
    );
    return { ok: true, value: undefined };
  } catch (error) {
    return { error: true, value: error.message };
  }
}

// ===== WINDOWS CREDENTIAL MANAGER =====

export function getCredentialManagerPassword(service) {
  try {
    // Use cmdkey or PowerShell to retrieve credential
    const script = `
      cmdkey /list | findstr "${service}"
    `;
    
    const result = execSync(
      `powershell -Command "${script}"`,
      { encoding: 'utf-8' }
    ).trim();
    
    // Parse result (simplified - may need more complex parsing)
    if (result.includes(service)) {
      // Credential exists, but cmdkey can't retrieve passwords directly
      // Need to use alternative approach or prompt user
      console.warn('Windows Credential Manager: Found entry but cannot extract password programmatically');
      return "";
    }
    
    return "";
  } catch (error) {
    return "";
  }
}

export function setCredentialManagerPassword(service, account, password) {
  try {
    // Note: cmdkey can only store, not retrieve passwords securely
    // For full support, consider using 'keytar' npm package or Windows Credential APIs
    execSync(
      `cmdkey /generic:${service} /user:${account} /pass:${password}`,
      { encoding: 'utf-8' }
    );
    return { ok: true, value: undefined };
  } catch (error) {
    return { error: true, value: error.message };
  }
}

// ===== LINUX: GNOME KEYRING =====

export function gnomeKeyringAvailable() {
  try {
    execSync('which secret-tool', { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

export function getGnomeKeyringPassword(service) {
  try {
    const password = execSync(
      `secret-tool lookup service "${service}" 2>/dev/null`,
      { encoding: 'utf-8' }
    ).trim();
    
    return password;
  } catch (error) {
    return "";
  }
}

export function setGnomeKeyringPassword(service, account, password) {
  try {
    execSync(
      `secret-tool store --label="TraeNuPI: ${service}" service "${service}" account "${account}" <<< "${password}"`,
      { encoding: 'utf-8', stdin: 'pipe' }
    );
    return { ok: true, value: undefined };
  } catch (error) {
    return { error: true, value: error.message };
  }
}

// ===== LINUX: SECRET-TOOL (Fallback) =====

export function getSecretToolPassword(service) {
  // Same as GNOME Keyring (secret-tool is the CLI tool)
  return getGnomeKeyringPassword(service);
}

export function setSecretToolPassword(service, account, password) {
  // Same as GNOME Keyring
  return setGnomeKeyringPassword(service, account, password);
}
```

#### Updated CLI Code for Cross-Platform

**Modified:** `gleam/traenupi_cli/src/traenupi_cli.gleam`

```gleam
fn get_api_key() -> String {
  // Priority 1: Platform-specific secure storage
  let platform_key = platform.get_secret("openrouter")
  
  case platform_key {
    "" -> {
      // Try alternate service name
      let alt_key = platform.get_secret("traenupi")
      
      case alt_key {
        "" -> {
          // Priority 2: Environment variable (universal fallback)
          get_env("OPENROUTER_API_KEY")
        }
        key -> {
          let os = platform.detect_os()
          io.println("🔐 Using API key from " <> format_os(os) <> " ✓")
          key
        }
      }
    }
    key -> {
      let os = platform.detect_os()
      io.println("🔐 Using API key from " <> format_os(os) <> " ✓")
      key
    }
  }
}

fn format_os(os: platform.OS) -> String {
  case os {
    platform.MacOS -> "macOS Keychain"
    platform.Windows -> "Windows Credential Manager"
    platform.Linux -> "Linux Secret Storage"
    platform.Unknown -> "secure storage"
  }
}
```

#### Cross-Platform Setup Scripts

**Create:** `scripts/setup_windows.ps1` (PowerShell for Windows)

```powershell
# TraeNuPI Setup Script for Windows
# Run in PowerShell as Administrator

Write-Host "🔐 TraeNuPI Windows Setup" -ForegroundColor Cyan
Write-Host "═════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if credential already exists
$check = cmdkey /list 2>&1 | Select-String "traenupi"

if ($check) {
    Write-Host "⚠️  A 'traenupi' credential already exists." -ForegroundColor Yellow
    $update = Read-Host "Do you want to update it? (y/n)"
    
    if ($update -eq 'y') {
        cmdkey /delete:traenupi
        Write-Host "✓ Old credential deleted" -ForegroundColor Green
    } else {
        Write-Host "❌ Setup cancelled"
        exit 0
    }
}

Write-Host ""
Write-Host "Please enter your OpenRouter API key:" -ForegroundColor Yellow
Write-Host "(Get one at https://openrouter.ai/keys)" -ForegroundColor Gray
Write-Host ""

# Secure string input (hidden)
$apiKeySecure = Read-Host "API Key" -AsSecureString
$apiKeyPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($apiKeySecure)
$apiKey = [Runtime.InteropServices.Marshal]::PtrToStringAuto($apiKeyPtr)

if (-not $apiKey) {
    Write-Host "❌ Error: No API key provided" -ForegroundColor Red
    exit 1
}

# Store in Windows Credential Manager
cmdkey /generic:traenupi /user:openrouter-api-key /pass:$apiKey

Write-Host ""
Write-Host "✅ Success! API key stored in Windows Credential Manager" -ForegroundColor Green
Write-Host ""
Write-Host "Key details:" -ForegroundColor White
Write-Host "  • Target: traenupi" -ForegroundColor Gray
Write-Host "  • User: openrouter-api-key" -ForegroundColor Gray
Write-Host "  • Location: Windows Credential Manager (Windows)" -ForegroundColor Gray
Write-Host ""
Write-Host "You can now use TraeNuPI!" -ForegroundColor Cyan
Write-Host ""
Write-Host "  gleam run -- tellme `"Your question here`"" -ForegroundColor White
Write-Host ""

# Clean up secure string
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($apiKeyPtr)
```

**Create:** `scripts/setup_linux.sh` (Bash for Linux)

```bash
#!/bin/bash
# TraeNuPI Setup Script for Linux
# Supports: GNOME Keyring, KDE Wallet, .netrc fallback

set -e

echo "🔐 TraeNuPI Linux Setup"
echo "════════════════════"
echo ""

# Detect desktop environment
detect_desktop_env() {
    if [ "$XDG_CURRENT_DESKTOP" = "GNOME" ] || [ "$DESKTOP_SESSION" = "gnome" ]; then
        echo "gnome"
    elif [ "$XDG_CURRENT_DESKTOP" = "KDE" ] || [ "$DESKTOP_SESSION" = "plasma" ]; then
        echo "kde"
    else
        echo "unknown"
    fi
}

DESKTOP_ENV=$(detect_desktop_env)

# Check for secret-tool (part of libsecret)
if ! command -v secret-tool &> /dev/null; then
    echo "⚠️  'secret-tool' not found."
    echo ""
    echo "Installing libsecret (GNOME Keyring CLI)..."
    echo ""
    
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y libsecret-tools
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y libsecret
    elif command -v pacman &> /dev/null; then
        sudo pacman -S --noconfirm libsecret
    else
        echo "❌ Cannot auto-install. Please install 'libsecret' manually."
        exit 1
    fi
fi

# Check if key already exists
if secret-tool search service traenupi 2>/dev/null | grep -q "label"; then
    echo "⚠️  A 'traenupi' entry already exists."
    echo ""
    read -p "Do you want to update it? (y/n): " update_choice
    
    if [[ $update_choice =~ ^[Yy]$ ]]; then
        echo "Deleting old entry..."
        # Note: secret-tool doesn't have delete, this is simplified
        echo "✓ Old key will be overwritten"
    else
        echo "❌ Setup cancelled"
        exit 0
    fi
fi

echo ""
echo "Please enter your OpenRouter API key:"
echo "(Get one at https://openrouter.ai/keys)"
echo ""
read -s -p "API Key: " api_key
echo ""

if [ -z "$api_key" ]; then
    echo "❌ Error: No API key provided"
    exit 1
fi

# Store using secret-tool (GNOME Keyring / libsecret)
echo "$api_key" | secret-tool store --label="TraeNuPI API Key" service traenupi account openrouter-api-key

echo ""
echo "✅ Success! API key stored securely"
echo ""
echo "Storage details:"
echo "  • Service: traenupi"
echo "  • Account: openrouter-api-key"
echo "  • Backend: $(case $DESKTOP_ENV in gnome) echo "GNOME Keyring"; kde) echo "KDE Wallet"; *) echo "libsecret"; esac)"
echo ""
echo "You can now use TraeNuPI!"
echo ""
echo "  gleam run -- tellme \"Your question here\""
echo ""
echo "To verify:"
echo "  secret-tool lookup service traenupi"
echo ""
echo "🔒 Your key is encrypted and secure!"
```

---

### Platform Comparison Matrix

| Feature | macOS | Windows | Linux (GNOME) | Linux (Other) |
|---------|-------|---------|---------------|---------------|
| **Storage** | Keychain | Credential Manager | GNOME Keyring | libsecret/.netrc |
| **Encryption** | AES-256 | DPAPI | libsecret | GPG/User perms |
| **CLI Tool** | `security` | `cmdkey` / PowerShell | `secret-tool` | `secret-tool` |
| **GUI App** | Keychain Access | Credential Manager | Seahorse | Seahorse/KWallet |
| **Sync** | iCloud | Domain controller | N/A | N/A |
| **Gleam Support** | ✅ Complete | ✅ Planned | ✅ Planned | ⚠️ Basic |
| **Setup Script** | `setup_keychain.sh` | `setup_windows.ps1` | `setup_linux.sh` | `setup_linux.sh` |

---

### Updated File Structure After Implementation

```
traenupi/
├── gleam/
│   ├── traenupi_core/
│   │   ├── src/traenupi_core/
│   │   │   ├── ai_provider.gleam      ← ENHANCED (Ollama fallback)
│   │   │   ├── ollama.gleam           ← NEW (Ollama management)
│   │   │   ├── platform.gleam         ← NEW (Cross-platform)
│   │   │   └── ... (existing modules)
│   │   └── src/
│   │       └── traenupi_core_ffi.mjs  ← UPDATED (platform detection)
│   │
│   └── traenupi_cli/
│       ├── src/traenupi_cli.gleam     ← UPDATED (smart fallback)
│       └── src/traenupi_cli_ffi.mjs   ← UPDATED (already cross-platform)
│
├── scripts/
│   ├── setup_keychain.sh              ← EXISTING (macOS)
│   ├── setup_windows.ps1              ← NEW (Windows)
│   └── setup_linux.sh                ← NEW (Linux)
│
└── docs/
    ├── KEYCHAIN_INTEGRATION.md        ← RENAME to SECRET_STORAGE.md
    ├── MIGRATION_PLAN_TS_TO_GLEAM.md  ← UPDATE with new features
    └ ├── OLLAMA_SETUP.md             ← NEW (Ollama guide)
```

---

## Implementation Timeline

### Week 1: Core Features (High Priority)

| Day | Task | Files |
|-----|------|-------|
| 1-2 | Enhance Ollama fallback logic | `ai_provider.gleam`, `http_ffi.mjs` |
| 3 | Create `ollama.gleam` module | New file |
| 4 | Update CLI for Ollama commands | `traenupi_cli.gleam` |
| 5 | Test end-to-end with real Ollama | Manual testing |

### Week 2: Cross-Platform Secrets (High Priority)

| Day | Task | Files |
|-----|------|-------|
| 1-2 | Create `platform.gleam` abstraction | New file |
| 3 | Implement Windows support | `traenupi_core_ffi.mjs` |
| 4 | Implement Linux support | `traenupi_core_ffi.mjs` |
| 5 | Create setup scripts | `scripts/*.ps1`, `scripts/*.sh` |

### Week 3: Polish & Documentation (Medium Priority)

| Day | Task | Output |
|-----|------|--------|
| 1-2 | Update documentation | Markdown files |
| 3 | Test on all platforms | VM testing |
| 4 | Edge cases & error handling | Code improvements |
| 5 | Final integration test | Full suite |

---

## Success Criteria

### Ollama Integration:

- [ ] Auto-detects running Ollama instance
- [ ] Falls back gracefully when OpenRouter fails
- [ ] Works offline with zero configuration
- [ ] Provides helpful setup instructions
- [ ] Lists/pulls/manages models via CLI
- [ ] Shows clear status information

### Cross-Platform Secrets:

- [ ] Works on macOS (existing functionality preserved)
- [ ] Works on Windows (Credential Manager)
- [ ] Works on Linux (GNOME Keyring / libsecret)
- [ ] Falls back to environment variables
- [ ] Provides platform-appropriate setup scripts
- [ ] Detects OS automatically
- [ ] Clear error messages for unsupported scenarios

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Ollama not installed** | Low - just no fallback | Clear install instructions |
| **Windows API complexity** | Medium - limited programmatic access | Document manual setup, use basic cmdkey |
| **Linux fragmentation** | Low - multiple desktop environments | Support libsecret as common denominator |
| **Platform bugs** | Low - Gleam runs on Node.js | Test on each target platform |

---

## Next Steps

### Immediate Actions:

1. ✅ **Review this plan** - Confirm features and priorities
2. 🔨 **Implement Ollama enhancement** - Start with `ai_provider.gleam`
3. 🔧 **Create platform module** - Abstract OS differences
4. 🧪 **Test on macOS** - Verify existing + new features
5. 💻 **Get Windows/Linux testers** - Community feedback
6. 📚 **Update documentation** - User guides for all platforms

### Questions:

1. **Ollama default model preference?**
   - `llama3` (recommended, good balance)
   - `tinyllama` (fastest, minimal resources)
   - Let user choose during setup

2. **Windows priority level?**
   - Full Credential Manager support (complex)
   - Basic cmdkey storage (simple, works now)
   - Environment variable only (skip for now)

3. **Linux scope?**
   - GNOME Keyring only (most common)
   - Multiple backends (GNOME + KDE + generic)
   - .netrc file fallback (universal Unix)

---

*Document Version: 1.0*
*Created: 2026-05-10*
*Status: Ready for Implementation*
*Dependencies: Pure Gleam base (Phase 1 complete)*
