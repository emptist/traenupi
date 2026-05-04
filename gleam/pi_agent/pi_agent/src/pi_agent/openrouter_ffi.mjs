import * as gleam from "#gleam/prelude";

export function chat_completion(config, request) {
  const url = `${config.base_url}/chat/completions`;
  
  const messages = request.messages.map(msg => {
    switch (msg.constructor.name) {
      case "SystemMessage":
        return { role: "system", content: msg.content };
      case "UserMessage":
        return { role: "user", content: msg.content };
      case "AssistantMessage":
        return { role: "assistant", content: msg.content };
      case "ToolMessage":
        return { role: "tool", tool_call_id: msg.tool_call_id, content: msg.content };
      default:
        return msg;
    }
  });
  
  const body = JSON.stringify({
    model: request.model,
    messages: messages,
    stream: request.stream,
  });
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/traenupi',
      'X-Title': 'TraeNuPI Agent',
    },
    body: body,
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          return new gleam.Error({ ApiError: `API error: ${response.status} - ${text}` });
        });
      }
      return response.json();
    })
    .then(data => {
      if (data instanceof gleam.Error) {
        return data;
      }
      
      const response = {
        id: data.id,
        model: data.model,
        choices: data.choices.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content,
          },
          finish_reason: choice.finish_reason,
        })),
        usage: data.usage ? {
          prompt_tokens: data.usage.prompt_tokens,
          completion_tokens: data.usage.completion_tokens,
          total_tokens: data.usage.total_tokens,
        } : null,
      };
      
      return new gleam.Ok(response);
    })
    .catch(error => {
      return new gleam.Error({ NetworkError: `Network error: ${error.message}` });
    });
}

export function chat_completion_stream(config, request, onChunk) {
  const url = `${config.base_url}/chat/completions`;
  
  const messages = request.messages.map(msg => {
    switch (msg.constructor.name) {
      case "SystemMessage":
        return { role: "system", content: msg.content };
      case "UserMessage":
        return { role: "user", content: msg.content };
      case "AssistantMessage":
        return { role: "assistant", content: msg.content };
      case "ToolMessage":
        return { role: "tool", tool_call_id: msg.tool_call_id, content: msg.content };
      default:
        return msg;
    }
  });
  
  const body = JSON.stringify({
    model: request.model,
    messages: messages,
    stream: true,
  });
  
  return fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.api_key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://github.com/traenupi',
      'X-Title': 'TraeNuPI Agent',
    },
    body: body,
  })
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          return new gleam.Error({ ApiError: `API error: ${response.status} - ${text}` });
        });
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      function read() {
        return reader.read().then(({ done, value }) => {
          if (done) {
            return new gleam.Ok(undefined);
          }
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                continue;
              }
              try {
                const parsed = JSON.parse(data);
                const chunk = {
                  id: parsed.id,
                  choices: parsed.choices.map(choice => ({
                    index: choice.index,
                    delta: {
                      role: choice.delta.role || null,
                      content: choice.delta.content || null,
                    },
                    finish_reason: choice.finish_reason || null,
                  })),
                };
                onChunk(chunk);
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
          
          return read();
        });
      }
      
      return read();
    })
    .catch(error => {
      return new gleam.Error({ NetworkError: `Network error: ${error.message}` });
    });
}
