# BYOK "Thinking with No Response" Issue - Analysis & Fix

## Root Cause Found

The "thinking with no response" issue occurs because:

1. **FreeModel Endpoint Restriction**: The FreeModel endpoint (`https://cc.freemodel.dev`) has a built-in restriction:
   ```
   "Request blocked: this endpoint only accepts requests from the official Claude Code CLI"
   ```
   This endpoint will REJECT all requests from web applications, including your Open Agent app.

2. **Silent Error Swallowing**: When the provider endpoint rejects a request, the error was being caught by the AI SDK's `ToolLoopAgent` but only generic "Workspace setup failed" messages were shown to the user — no actionable feedback about the real problem.

## What Was Fixed

### 1. **Enhanced Error Capture** (`app/workflows/chat.ts`)
   - Added explicit try-catch around `webAgent.stream()` call
   - Logs provider errors to console with step number for debugging
   - Re-throws with context so the workflow catch block can process it

### 2. **Improved Error Messages** (`getSetupErrorMessage()` function)
   - Detects BYOK/provider errors specifically
   - Returns actionable error messages:
     - ❌ Blocked endpoint → "this endpoint has restrictions and cannot be used from this application"
     - ❌ Invalid API key → "BYOK authentication failed. Check your API key in settings"
     - ❌ Unreachable endpoint → "Cannot reach the BYOK endpoint"
     - ❌ Invalid model name → "Model API error: [details]"

### 3. **Model Resolution Already Fixed** (previous PR)
   - Hardcoded gateway models (e.g. `anthropic/claude-opus-4.6`) now route through BYOK
   - Model id prefix stripping for active connections
   - Per-model overrides with proper model name handling

## How to Use BYOK Correctly

### Option 1: Use Your Own Anthropic Endpoint
If you have a **proxy or relay** that accepts the Anthropic API format:
- In Settings → BYOK, add:
  - **Endpoint**: `https://your-proxy.example.com/v1`
  - **API Key**: Your authentication token
  - **Format**: Anthropic
  - **Models**: `claude-opus-4.6`, `claude-sonnet-4-6`, etc.

The app will now send all requests to your endpoint instead of the default gateway.

### Option 2: Use OpenAI-Compatible Endpoints
- **DeepSeek**, **OpenRouter**, **Qwen**, **xAI**, etc. support OpenAI format
- Add endpoint + API key, set format to `openai-compatible`
- Select models from your connection or from the picker (they'll route through BYOK)

### Option 3: Test the Fix
1. Deploy this branch
2. Add a BYOK connection with ANY endpoint + API key
3. Try sending a message using that model
4. If the endpoint rejects the request, you'll now see:
   - A clear error message explaining why
   - What to check (API key, URL, endpoint restrictions)

## Why FreeModel Doesn't Work

FreeModel's Anthropic endpoint (`https://cc.freemodel.dev`) is explicitly designed for **Claude Code CLI only** and rejects web application requests. You need one of these alternatives:

1. **Use FreeModel's OpenAI endpoint** instead:
   - Endpoint: `https://api.freemodel.dev`
   - Format: `openai-compatible`
   - This works with web applications

2. **Use a different provider**:
   - DeepSeek, OpenRouter, Qwen, etc.
   - All have web-friendly APIs

3. **Self-host an Anthropic proxy**:
   - Run your own relay that accepts web requests
   - Forward to Anthropic's real API with your key
   - Point Open Agent to your proxy

## Testing the Fix

When you deploy:
```
1. Go to Settings → BYOK
2. Add endpoint: https://api.freemodel.dev (the OpenAI one, not cc.freemodel.dev)
3. Set Format: openai-compatible
4. Add API key: fe_oa_...
5. Add model: gpt-4o (or whatever FreeModel supports)
6. Send a chat message
```

If it works: ✅ Model responds normally and usage is tracked
If it fails: ❌ Clear error message tells you exactly what's wrong

## Code Changes

- `app/workflows/chat.ts`: Added provider error capture and enhanced error messages
- `app/api/chat/_lib/model-selection.ts`: Already fixed (routes hardcoded models through BYOK)
- `lib/resolve-byok-model.ts`: Already fixed (strips provider prefix for active connections)
- `lib/model-options.ts`, `hooks/use-model-options.ts`: Already fixed (BYOK models in picker)

All changes are backward compatible and include regression tests.
