# FreeModel Gateway Configuration

This guide shows how to configure Open Agent to use the FreeModel OpenAI-compatible endpoint instead of the default Vercel AI Gateway.

## Overview

Open Agent supports custom gateway endpoints through environment variables. You can route **all** AI requests through FreeModel (or any OpenAI-compatible endpoint) by setting three environment variables.

## Setup

### 1. Add Environment Variables

In your Vercel project, add these environment variables:

**For FreeModel OpenAI-compatible endpoint:**

```
GATEWAY_BASE_URL=https://api.freemodel.dev
GATEWAY_API_KEY=fe_oa_42584285cb4c7b402135c231a50adc183b578d1eb29fd41f
GATEWAY_FORMAT=openai-compatible
```

Replace the `GATEWAY_API_KEY` with your actual FreeModel API key.

### 2. Optional: Set Provider Display Name

By default, the endpoint will be labeled as "custom-gateway" in logs. You can customize this:

```
GATEWAY_PROVIDER_NAME=FreeModel
```

## How It Works

The routing priority (in order):

1. **Explicit BYOK Model Selection** — If you selected a model labeled "(BYOK)" from the picker, that connection is used
2. **Custom Gateway (FreeModel)** — If `GATEWAY_*` env vars are set, **ALL regular model requests go through this endpoint**
3. **Per-Model BYOK Connection** — If you added specific models to a BYOK connection (only checked if custom gateway is not set)
4. **Active BYOK Connection** — If you marked a BYOK connection as "active" (only checked if custom gateway is not set)
5. **Default Vercel AI Gateway** — If no custom config is set

**Important:** When `GATEWAY_BASE_URL` and `GATEWAY_API_KEY` are configured, FreeModel becomes the default gateway for all hardcoded models. Set these variables to **override the Vercel AI Gateway completely**.

**Model ID translation** — The system automatically strips the `provider/` prefix when sending to custom endpoints:
   - `openai/gpt-4-turbo` → `gpt-4-turbo`
   - `google/gemini-2-flash` → `gemini-2-flash`
   - `anthropic/claude-opus-4.6` → `claude-opus-4.6`

## Example Configurations

### FreeModel (OpenAI-compatible)
```bash
GATEWAY_BASE_URL=https://api.freemodel.dev
GATEWAY_API_KEY=fe_oa_42584285cb4c7b402135c231a50adc183b578d1eb29fd41f
GATEWAY_FORMAT=openai-compatible
GATEWAY_PROVIDER_NAME=FreeModel
```

### OpenRouter (OpenAI-compatible)
```bash
GATEWAY_BASE_URL=https://openrouter.ai/api/v1
GATEWAY_API_KEY=sk-or-xxxxx
GATEWAY_FORMAT=openai-compatible
GATEWAY_PROVIDER_NAME=OpenRouter
```

### DeepSeek (OpenAI-compatible)
```bash
GATEWAY_BASE_URL=https://api.deepseek.com
GATEWAY_API_KEY=sk-xxxxx
GATEWAY_FORMAT=openai-compatible
GATEWAY_PROVIDER_NAME=DeepSeek
```

### Self-hosted Anthropic Proxy
```bash
GATEWAY_BASE_URL=https://your-proxy.example.com
GATEWAY_API_KEY=your-api-key
GATEWAY_FORMAT=anthropic
GATEWAY_PROVIDER_NAME=My Proxy
```

## Supported Formats

- `openai-compatible` — Any OpenAI `/v1/chat/completions` compatible endpoint (FreeModel, OpenRouter, DeepSeek, etc.)
- `anthropic` — Native Anthropic Messages API endpoints
- `gemini` — Google Gemini API endpoints
- `gateway` — Vercel AI Gateway protocol (default)

## Debugging

To check if the custom gateway is being used:

1. Open browser DevTools → Console
2. Send a message in the chat
3. Look for workflow errors that show which endpoint is being called
4. The error messages will indicate if authentication or endpoint issues occur

## Troubleshooting

**"BYOK authentication failed" error:**
- Check that your `GATEWAY_API_KEY` is correct
- Verify the key hasn't been revoked or rate-limited
- Some endpoints require specific header formats

**"Cannot reach the BYOK endpoint" error:**
- Check that `GATEWAY_BASE_URL` is correct and publicly accessible
- Verify there are no firewall/DNS issues
- Test the endpoint manually with curl

**Models return empty responses:**
- Verify the model names are valid for the endpoint
- The system strips `provider/` prefixes, so `openai/gpt-4` becomes `gpt-4`
- Check if the endpoint supports streaming responses

## Local Development

To test locally with FreeModel:

1. Create a `.env.development.local` file in `apps/web/`
2. Add the environment variables above
3. Run `pnpm db:migrate:apply` to ensure the database is set up
4. Start the dev server with `pnpm dev`
5. The custom gateway will automatically be used for all chat requests

## Production Deployment

When you push to Vercel:

1. Add the environment variables in Vercel Project Settings → Environment Variables
2. Redeploy your project
3. The custom gateway will take effect immediately on the next deployment
