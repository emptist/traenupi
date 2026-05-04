import { Agent, new as newAgent, add_message, run } from './pi_agent/agent.gleam';
import { User, UserMessage, TextContent } from './pi_agent/types.gleam';

export function createSession(apiKey, systemPrompt) {
  const agent = newAgent(systemPrompt, 'tencent/hy3-preview:free', 'medium');
  return {
    agent,
    apiKey
  };
}

export function sendMessage(session, message) {
  return new Promise((resolve, reject) => {
    const userMessage = User(UserMessage(TextContent(message), Date.now()));
    const updatedAgent = add_message(session.agent, userMessage);
    
    run(updatedAgent, session.apiKey)
      .then(result => {
        if (result.ok) {
          const messages = result.value.state.messages;
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.type === 'Assistant') {
            const content = lastMessage.value.content;
            if (content.length > 0 && content[0].type === 'TextContent') {
              resolve(content[0].value);
            } else {
              resolve('[No text content in response]');
            }
          } else {
            resolve('[Unexpected message type]');
          }
        } else {
          reject(new Error(result.error));
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function sendMessageStreaming(session, message, onChunk) {
  return new Promise((resolve, reject) => {
    const userMessage = User(UserMessage(TextContent(message), Date.now()));
    const updatedAgent = add_message(session.agent, userMessage);
    
    run(updatedAgent, session.apiKey)
      .then(result => {
        if (result.ok) {
          const messages = result.value.state.messages;
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.type === 'Assistant') {
            const content = lastMessage.value.content;
            if (content.length > 0 && content[0].type === 'TextContent') {
              const text = content[0].value;
              onChunk(text);
              resolve(text);
            } else {
              const errorMsg = '[No text content in response]';
              onChunk(errorMsg);
              resolve(errorMsg);
            }
          } else {
            const errorMsg = '[Unexpected message type]';
            onChunk(errorMsg);
            resolve(errorMsg);
          }
        } else {
          const errorMsg = `[Error: ${result.error}]`;
          onChunk(errorMsg);
          reject(new Error(result.error));
        }
      })
      .catch(error => {
        const errorMsg = `[Error: ${error.message}]`;
        onChunk(errorMsg);
        reject(error);
      });
  });
}
