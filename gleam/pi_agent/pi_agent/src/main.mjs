import * as gleam from "#gleam/prelude";
import * as list from "#gleam/list";
import { 
  default_config,
  create_request,
  UserMessage,
  send_chat_completion,
} from "#pi-agent/openrouter";
import {
  get_models,
  get_free_models,
  get_model_ids,
} from "#pi-agent/openrouter_models";

async function main() {
  const app = document.getElementById('app');
  
  // Get API key from localStorage
  let apiKey = localStorage.getItem('openrouter_api_key');
  
  if (!apiKey) {
    app.innerHTML = `
      <h1>PI Agent</h1>
      <p>Please enter your OpenRouter API key:</p>
      <div>
        <input type="password" id="api-key-input" placeholder="API key..." style="width: 300px; padding: 8px;">
        <button id="save-key-button" style="padding: 8px 16px;">Save</button>
      </div>
    `;
    
    document.getElementById('save-key-button').addEventListener('click', () => {
      const keyInput = document.getElementById('api-key-input');
      const key = keyInput.value.trim();
      if (key) {
        localStorage.setItem('openrouter_api_key', key);
        location.reload();
      }
    });
    
    document.getElementById('api-key-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('save-key-button').click();
      }
    });
    
    return;
  }

  app.innerHTML = '<h1>PI Agent</h1><p>Loading models...</p>';

  try {
    // Get free models
    const modelsResult = await get_models(apiKey);
    
    if (modelsResult instanceof gleam.Ok) {
      const freeModels = get_free_models(modelsResult[0]);
      const freeModelsCount = list.length(freeModels);
      
      app.innerHTML = `
        <h1>PI Agent</h1>
        <p>✅ Found ${freeModelsCount} free models</p>
        <p>Using: tencent/hy3-preview:free</p>
        <div>
          <input type="text" id="message-input" placeholder="Type a message..." style="width: 300px; padding: 8px;">
          <button id="send-button" style="padding: 8px 16px;">Send</button>
        </div>
        <div id="response" style="margin-top: 20px;"></div>
      `;

      // Add event listeners
      const messageInput = document.getElementById('message-input');
      const sendButton = document.getElementById('send-button');
      const responseDiv = document.getElementById('response');

      sendButton.addEventListener('click', async () => {
        const message = messageInput.value.trim();
        if (!message) return;

        responseDiv.innerHTML = '<p>Thinking...</p>';
        sendButton.disabled = true;

        try {
          const config = default_config(apiKey);
          const messages = [new UserMessage(message)];
          const request = create_request(config, messages);
          
          const result = await send_chat_completion(config, request);
          
          if (result instanceof gleam.Ok) {
            const response = result[0];
            const content = response.choices[0].message.content;
            responseDiv.innerHTML = `<p><strong>Assistant:</strong> ${content}</p>`;
          } else {
            responseDiv.innerHTML = `<p style="color: red;">Error: ${JSON.stringify(result)}</p>`;
          }
        } catch (error) {
          responseDiv.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
        } finally {
          sendButton.disabled = false;
        }
      });

      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendButton.click();
        }
      });
    } else {
      app.innerHTML = `<h1>PI Agent</h1><p style="color: red;">Error: ${JSON.stringify(modelsResult)}</p>`;
    }
  } catch (error) {
    app.innerHTML = `<h1>PI Agent</h1><p style="color: red;">Error: ${error.message}</p>`;
  }
}

main();
