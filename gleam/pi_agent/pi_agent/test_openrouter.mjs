import { Ok, Error } from "./build/dev/javascript/gleam_stdlib/gleam.mjs";
import { 
  send_chat_completion,
  send_chat_completion_stream,
  OpenRouterConfig,
  UserMessage,
  create_request,
} from "./build/dev/javascript/pi_agent/pi_agent/openrouter.mjs";

async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY || 
    await new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec('security find-generic-password -s "openrouter" -w', (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });

  console.log("🔑 API Key found:", apiKey.substring(0, 10) + "...");

  const config = new OpenRouterConfig(
    apiKey,
    "https://openrouter.ai/api/v1",
    "tencent/hy3-preview:free"
  );

  const messages = [new UserMessage("Hello! Can you tell me a short joke?")];
  const request = create_request(config, messages);

  console.log("\n📤 Sending request to OpenRouter...");
  console.log("Model:", request.model);
  console.log("Message:", messages[0].content);

  try {
    const result = await send_chat_completion(config, request);

    if (result instanceof Ok) {
      console.log("\n✅ Response received!");
      console.log("Response ID:", result[0].id);
      console.log("Model:", result[0].model);
      console.log("\n🤖 Assistant response:");
      console.log(result[0].choices[0].message.content);
      
      if (result[0].usage) {
        console.log("\n📊 Usage:");
        console.log("  Prompt tokens:", result[0].usage.prompt_tokens);
        console.log("  Completion tokens:", result[0].usage.completion_tokens);
        console.log("  Total tokens:", result[0].usage.total_tokens);
      }
    } else {
      console.error("\n❌ Error:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("\n❌ Exception:", error);
  }
}

async function testStreaming() {
  const apiKey = process.env.OPENROUTER_API_KEY || 
    await new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      exec('security find-generic-password -s "openrouter" -w', (error, stdout) => {
        if (error) reject(error);
        else resolve(stdout.trim());
      });
    });

  const config = new OpenRouterConfig(
    apiKey,
    "https://openrouter.ai/api/v1",
    "tencent/hy3-preview:free"
  );

  const messages = [new UserMessage("Count from 1 to 5, one number per line.")];
  const request = create_request(config, messages);

  console.log("\n📤 Testing streaming response...");
  console.log("Model:", request.model);

  let fullResponse = "";

  try {
    const result = await send_chat_completion_stream(
      config,
      request,
      (chunk) => {
        if (chunk.choices && chunk.choices[0] && chunk.choices[0].delta) {
          const content = chunk.choices[0].delta.content;
          if (content) {
            process.stdout.write(content);
            fullResponse += content;
          }
        }
      }
    );

    if (result instanceof Ok) {
      console.log("\n\n✅ Streaming complete!");
      console.log("Full response length:", fullResponse.length);
    } else {
      console.error("\n❌ Streaming error:", JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error("\n❌ Streaming exception:", error);
  }
}

async function main() {
  console.log("🧪 Testing OpenRouter Client\n");
  console.log("=" .repeat(50));

  await testOpenRouter();

  console.log("\n" + "=".repeat(50));

  await testStreaming();

  console.log("\n" + "=".repeat(50));
  console.log("✅ All tests completed!");
}

main().catch(console.error);
