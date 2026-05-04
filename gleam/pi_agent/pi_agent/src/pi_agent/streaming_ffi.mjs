export function createStreamingRequest(url, headers, body, onChunk) {
  return new Promise((resolve, reject) => {
    const controller = new AbortController()
    
    fetch(url, {
      method: 'POST',
      headers: Object.fromEntries(headers),
      body: body,
      signal: controller.signal,
    })
    .then(response => {
      if (!response.ok) {
        reject(`HTTP ${response.status}: ${response.statusText}`)
        return
      }
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      
      function readChunk() {
        reader.read().then(({ done, value }) => {
          if (done) {
            onChunk('', true)
            resolve({ cleanup: () => controller.abort() })
            return
          }
          
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                onChunk('', true)
                resolve({ cleanup: () => controller.abort() })
                return
              }
              
              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content || ''
                if (content) {
                  onChunk(content, false)
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
          
          readChunk()
        })
        .catch(error => {
          if (error.name !== 'AbortError') {
            reject(error.message)
          }
        })
      }
      
      readChunk()
    })
    .catch(error => {
      reject(error.message)
    })
  })
}

export function cancelStream(handle) {
  handle.cleanup()
}
