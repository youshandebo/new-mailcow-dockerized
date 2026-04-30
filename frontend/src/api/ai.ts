import { ChatMessage, EmailSummary, EmailClassification } from '../types';

export const aiApi = {
  compose: async function* (params: {
    prompt: string;
    context?: string;
    mode: 'compose' | 'reply' | 'improve';
  }): AsyncGenerator<string> {
    const response = await fetch('/api/ai/compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) throw new Error('AI compose failed');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
          } catch {}
        }
      }
    }
  },

  summarize: async (subject: string, body: string, from?: string[]): Promise<EmailSummary> => {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subject, body, from }),
    });
    if (!res.ok) throw new Error('AI summarize failed');
    return res.json();
  },

  classify: async (subject: string, body: string, from?: string[]): Promise<EmailClassification> => {
    const res = await fetch('/api/ai/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ subject, body, from }),
    });
    if (!res.ok) throw new Error('AI classify failed');
    return res.json();
  },

  chat: async function* (
    messages: ChatMessage[],
    context?: { currentEmail?: string }
  ): AsyncGenerator<string> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ messages, context }),
    });

    if (!response.ok) throw new Error('AI chat failed');

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) yield parsed.text;
          } catch {}
        }
      }
    }
  },
};
