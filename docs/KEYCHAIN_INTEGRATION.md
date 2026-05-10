# TraeNuPI Keychain Integration

## Overview

TraeNuPI now supports **macOS Keychain** for secure API key storage. This is the **recommended method** for storing your OpenRouter API key, as it:

- ✅ Encrypts your key with macOS security
- ✅ Never stores secrets in code or config files
- ✅ Syncs securely across Apple devices (if iCloud Keychain enabled)
- ✅ No need to set environment variables manually
- ✅ Prevents accidental git commits of secrets

## Quick Setup

### Option 1: Use the Setup Script (Recommended)

```bash
./scripts/setup_keychain.sh
```

This interactive script will:
1. Check if a key already exists
2. Prompt you to enter your API key
3. Store it securely in macOS Keychain
4. Verify the storage worked

### Option 2: Manual Setup

Run this command in your terminal:

```bash
security add-generic-password \
    -s "traenupi" \
    -a "openrouter-api-key" \
    -w "your-api-key-here" \
    -T "" \
    -j "OpenRouter API key for TraeNuPI AI assistant"
```

**Parameters:**
- `-s "traenupi"`: Service name (used by TraeNuPI to find the key)
- `-a "openrouter-api-key"`: Account name (for identification)
- `-w "..."`: Your actual OpenRouter API key
- `-T ""`: No applications can access without user prompt
- -`j "..."`: Description for Keychain Access app

## How It Works

### Priority Order for API Keys

TraeNuPI searches for API keys in this order:

1. **🔐 macOS Keychain** (service: `traenupi`) - Most secure
2. **🌍 Environment Variable** (`OPENROUTER_API_KEY`) - Fallback

When you run `traenupi tellme`, it will:
1. Check Keychain first
2. If found: Display "🔐 Using API key from Keychain ✓" and use it
3. If not found: Check environment variable
4. If neither found: Show setup instructions

### Example Output

#### With Keychain:
```
$ gleam run -- tellme "What is 2+2?"

Question: What is 2+2?

🔐 Using API key from Keychain ✓
🤖 Asking AI (Pure Gleam)...
───────────────────────────────────────────────────

✅ AI Response:
4
```

#### Without Key:
```
$ gleam run -- tellme "test"

Question: test

✗ Error: No API key found

Please add your OpenRouter API key to macOS Keychain:

  security add-generic-password \
    -s "traenupi" \
    -a "openrouter-api-key" \
    -w "your-api-key-here"

Or set environment variable:
  export OPENROUTER_API_KEY='your-api-key-here'
```

## Security Features

### 🔒 Encryption
- Keys are encrypted using macOS Keychain's AES-256 encryption
- Protected by your device password / Touch ID / Face ID
- Cannot be extracted by other apps without system prompt

### 🔐 Access Control
- By default (`-T ""`), any app accessing the key triggers a macOS dialog
- User must approve access each time (or select "Always Allow")
- Prevents unauthorized access by malware

### 🚫 Git Safety
- `.gitignore` updated to block all secret files
- Keys never stored in:
  - Source code
  - Configuration files
  - Environment files (.env)
  - Log files

## Managing Your Key

### View Stored Key (masked)
```bash
security find-generic-password -s "traenupi" -g
```
This shows metadata but requires password to reveal actual key.

### Delete Key
```bash
security delete-generic-password -s "traenupi"
```

### Update Key
```bash
# Delete old one first
security delete-generic-password -s "traenupi"

# Add new one
security add-generic-password \
    -s "traenupi" \
    -a "openrouter-api-key" \
    -w "new-api-key-here"
```

### List All Keys (to verify)
```bash
security dump-keychain | grep -A 5 "traenupi"
```

## Troubleshooting

### Issue: "Key not found" error
**Solution**: Run the setup script again:
```bash
./scripts/setup_keychain.sh
```

### Issue: macOS prompts for permission every time
**Cause**: Default security setting (`-T ""`)
**Solution**: This is normal and secure! Click "Always Allow" if you trust TraeNuPI.

### Issue: Want to use environment variable instead
**Solution**: Just don't add to keychain! Set env var:
```bash
export OPENROUTER_API_KEY='your-key-here'
```

### Issue: Multiple accounts/API keys
**Solution**: You can store multiple keys with different service names:
```bash
# Primary key (used by default)
security add-generic-password -s "traenupi" -a "openrouter" -w "key1"

# Backup key (for fallback)
security add-generic-password -s "traenupi-backup" -a "openrouter" -w "key2"
```
*Note: Currently only uses "traenupi" service. Custom service names coming soon.*

## Integration Details

### Files Modified

1. **[traenupi_cli_ffi.mjs](gleam/traenupi_cli/src/traenupi_cli_ffi.mjs)**
   - Added `getKeychainPassword(service)` function
   - Uses `child_process.execSync` to call `security` command
   - Returns empty string if key not found (no crash)

2. **[traenupi_cli.gleam](gleam/traenupi_cli/src/traenupi_cli.gleam)**
   - Added `get_api_key()` function with priority logic
   - Added `get_keychain_password()` external function declaration
   - Updated `handle_tellme()` to show keychain instructions

3. **[.gitignore](.gitignore)**
   - Added comprehensive security rules
   - Blocks all potential secret files from git

### Code Flow

```
User runs: gleam run -- tellme "question"
           ↓
    handle_tellme(question)
           ↓
    get_api_key()
           ↓
    ┌──────────────────────┐
    │ get_keychain_password │ ← Calls FFI
    │ ("traenupi")         │
    └──────────┬───────────┘
               ↓
    Found? ────┴────┬──── No?
       ↓              ↓
    Return key    get_env("OPENROUTER_API_KEY")
                          ↓
                   Found? ────┬─── No?
                      ↓          ↓
                   Return key   Show error + instructions
```

## Best Practices

### ✅ DO:
- Store keys in Keychain (not .env files)
- Use unique, descriptive account names
- Add descriptions for clarity
- Delete keys when no longer needed
- Use Touch ID / Face ID on supported Macs

### ❌ DON'T:
- Commit keys to git (blocked by .gitignore anyway!)
- Share keys in chat / email / documents
- Hard-code keys in source code
- Log keys or print them in debug output
- Use weak / easily guessable passwords

## Comparison: Keychain vs Environment Variables

| Feature | Keychain | Env Variable |
|---------|----------|--------------|
| **Security** | 🔒 Encrypted | ⚠️ Plain text in memory |
| **Persistence** | ✅ Survives reboots | ❌ Lost on reboot |
| **Portability** | ✅ Syncs via iCloud | ❌ Manual setup per terminal |
| **Git Safety** | ✅ Never in files | ⚠ Risk of .env commits |
| **Convenience** | ✅ Set once, forget it | ❌ Must set every session |
| **Multi-app** | ✅ Shared safely | ❌ Global exposure |
| **Revocation** | ✅ Easy to delete | ❌ Must unset manually |

**Winner: Keychain** 🏆

---

## Getting an OpenRouter API Key

If you don't have an API key yet:

1. Visit https://openrouter.ai/keys
2. Sign up / log in
3. Click "Create Key"
4. Copy the key (starts with `sk-or-v1-`)
5. Run `./scripts/setup_keychain.sh` to store it securely

**Cost**: Most models have free tiers. Pay-as-you-go for others.

---

*Last updated: 2026-05-10*
*Status: ✅ Production Ready*
