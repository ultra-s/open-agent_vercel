import type { GatewayConfig } from "@open-agents/agent";

/**
 * Load gateway configuration from environment variables.
 * If set, overrides the default Vercel AI Gateway with a custom endpoint.
 *
 * Environment variables:
 * - GATEWAY_BASE_URL: The custom gateway endpoint base URL
 * - GATEWAY_API_KEY: The API key for the custom gateway
 * - GATEWAY_FORMAT: The protocol format ("openai-compatible", "anthropic", "gemini", or "gateway")
 * - GATEWAY_PROVIDER_NAME: Display name for the provider (default: "custom")
 *
 * Example for FreeModel OpenAI-compatible:
 * GATEWAY_BASE_URL=https://api.freemodel.dev
 * GATEWAY_API_KEY=fe_oa_42584285cb4c7b402135c231a50adc183b578d1eb29fd41f
 * GATEWAY_FORMAT=openai-compatible
 */
export function getCustomGatewayConfig(): GatewayConfig | undefined {
  const baseURL = process.env.GATEWAY_BASE_URL;
  const apiKey = process.env.GATEWAY_API_KEY;

  if (!baseURL || !apiKey) {
    return undefined;
  }

  return {
    baseURL,
    apiKey,
    format: (process.env.GATEWAY_FORMAT as any) ?? "openai-compatible",
    providerName:
      process.env.GATEWAY_PROVIDER_NAME ?? "custom-gateway",
  };
}
