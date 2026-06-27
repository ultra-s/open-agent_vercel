import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";

const anthropic = createAnthropic({
  baseURL: "https://cc.freemodel.dev",
  apiKey: "fe_oa_42584285cb4c7b402135c231a50adc183b578d1eb29fd41f",
});

const model = anthropic("claude-3-5-sonnet");

console.log("[test] Calling FreeModel via AI SDK...");

try {
  const result = await generateText({
    model,
    prompt: "What is 2+2?",
    maxTokens: 256,
  });

  console.log("[test] SUCCESS!");
  console.log("[test] Response:", result.text);
  console.log("[test] Usage:", result.usage);
} catch (error) {
  console.error("[test] ERROR:", error.message);
  console.error("[test] Full error:", error);
  process.exit(1);
}
