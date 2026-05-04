#!/usr/bin/env node

import { tellmeAsync } from "./src/trae/baby-ai.js";

async function testIntegration() {
  console.log("🧪 Testing PI Agent Integration...\n");

  try {
    await tellmeAsync("What is 2 + 2?", true);
    console.log("\n✅ Integration test passed!");
  } catch (error) {
    console.error("\n❌ Integration test failed:", error);
    process.exit(1);
  }
}

testIntegration();
