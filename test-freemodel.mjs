import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "https://cc.freemodel.dev",
  apiKey: "fe_oa_42584285cb4c7b402135c231a50adc183b578d1eb29fd41f",
});

console.log("[test] Calling FreeModel Anthropic endpoint...");

try {
  const message = await client.messages.create({
    model: "claude-3-5-sonnet",
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: "Hello, what is 2+2?",
      },
    ],
  });

  console.log("[test] SUCCESS - Response:");
  console.log(JSON.stringify(message, null, 2));
} catch (error) {
  console.error("[test] ERROR:", error.message);
  if (error.error) {
    console.error("[test] API Error Details:", JSON.stringify(error.error, null, 2));
  }
  if (error.response) {
    console.error("[test] HTTP Status:", error.response.status);
    const text = await error.response.text();
    console.error("[test] Response Body:", text);
  }
  process.exit(1);
}
