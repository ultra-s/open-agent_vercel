import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getCustomGatewayConfig } from "./gateway-config";

describe("getCustomGatewayConfig", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns undefined when no env vars are set", () => {
    delete process.env.GATEWAY_BASE_URL;
    delete process.env.GATEWAY_API_KEY;

    expect(getCustomGatewayConfig()).toBeUndefined();
  });

  it("returns undefined when only base URL is set", () => {
    process.env.GATEWAY_BASE_URL = "https://api.example.com";
    delete process.env.GATEWAY_API_KEY;

    expect(getCustomGatewayConfig()).toBeUndefined();
  });

  it("returns undefined when only API key is set", () => {
    delete process.env.GATEWAY_BASE_URL;
    process.env.GATEWAY_API_KEY = "sk-test";

    expect(getCustomGatewayConfig()).toBeUndefined();
  });

  it("uses default format (openai-compatible) when not specified", () => {
    process.env.GATEWAY_BASE_URL = "https://api.freemodel.dev";
    process.env.GATEWAY_API_KEY = "fe_oa_test";
    delete process.env.GATEWAY_FORMAT;

    const config = getCustomGatewayConfig();

    expect(config).toBeDefined();
    expect(config?.format).toBe("openai-compatible");
  });

  it("uses default provider name when not specified", () => {
    process.env.GATEWAY_BASE_URL = "https://api.example.com";
    process.env.GATEWAY_API_KEY = "sk-test";
    delete process.env.GATEWAY_PROVIDER_NAME;

    const config = getCustomGatewayConfig();

    expect(config?.providerName).toBe("custom-gateway");
  });

  it("respects GATEWAY_FORMAT when specified", () => {
    process.env.GATEWAY_BASE_URL = "https://api.anthropic.com";
    process.env.GATEWAY_API_KEY = "sk-test";
    process.env.GATEWAY_FORMAT = "anthropic";

    const config = getCustomGatewayConfig();

    expect(config?.format).toBe("anthropic");
  });

  it("respects GATEWAY_PROVIDER_NAME when specified", () => {
    process.env.GATEWAY_BASE_URL = "https://api.example.com";
    process.env.GATEWAY_API_KEY = "sk-test";
    process.env.GATEWAY_PROVIDER_NAME = "MyCustomGateway";

    const config = getCustomGatewayConfig();

    expect(config?.providerName).toBe("MyCustomGateway");
  });

  it("returns complete config with all env vars set", () => {
    process.env.GATEWAY_BASE_URL = "https://api.freemodel.dev";
    process.env.GATEWAY_API_KEY = "fe_oa_test";
    process.env.GATEWAY_FORMAT = "openai-compatible";
    process.env.GATEWAY_PROVIDER_NAME = "FreeModel";

    const config = getCustomGatewayConfig();

    expect(config).toBeDefined();
    expect(config?.baseURL).toBe("https://api.freemodel.dev");
    expect(config?.apiKey).toBe("fe_oa_test");
    expect(config?.format).toBe("openai-compatible");
    expect(config?.providerName).toBe("FreeModel");
  });
});
