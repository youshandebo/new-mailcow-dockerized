import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { cacheService } from './cacheService';
import { logger } from '../utils/logger';
import { ComposeParams, EmailContent, EmailSummary, EmailClassification, ChatMessage, AiSettings } from '../types';

const SETTINGS_KEY = 'ai:settings';

const DEFAULT_SETTINGS: AiSettings = {
  apiKey: config.claude.apiKey,
  model: 'claude-sonnet-4-20250514',
  baseUrl: '',
  maxTokensCompose: 2048,
  maxTokensChat: 2048,
  maxTokensSummarize: 1024,
  maxTokensClassify: 256,
};

class ClaudeService {
  private client: Anthropic;
  private settings: AiSettings;

  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.client = this.createClient(this.settings);
  }

  private createClient(settings: AiSettings): Anthropic {
    const options: any = { apiKey: settings.apiKey };
    if (settings.baseUrl) {
      options.baseURL = settings.baseUrl;
    }
    return new Anthropic(options);
  }

  async reloadSettings(): Promise<void> {
    try {
      const stored = await cacheService.get<AiSettings>(SETTINGS_KEY);
      if (stored) {
        this.settings = {
          apiKey: stored.apiKey || DEFAULT_SETTINGS.apiKey,
          model: stored.model || DEFAULT_SETTINGS.model,
          baseUrl: stored.baseUrl || '',
          maxTokensCompose: stored.maxTokensCompose || DEFAULT_SETTINGS.maxTokensCompose,
          maxTokensChat: stored.maxTokensChat || DEFAULT_SETTINGS.maxTokensChat,
          maxTokensSummarize: stored.maxTokensSummarize || DEFAULT_SETTINGS.maxTokensSummarize,
          maxTokensClassify: stored.maxTokensClassify || DEFAULT_SETTINGS.maxTokensClassify,
        };
        this.client = this.createClient(this.settings);
        logger.info('AI settings reloaded from Redis', { model: this.settings.model });
      }
    } catch (err: any) {
      logger.warn('Failed to reload AI settings, using current', { error: err.message });
    }
  }

  getSettings(): AiSettings {
    return { ...this.settings };
  }

  getMaskedSettings(): Omit<AiSettings, 'apiKey'> & { hasApiKey: boolean } {
    return {
      model: this.settings.model,
      baseUrl: this.settings.baseUrl,
      maxTokensCompose: this.settings.maxTokensCompose,
      maxTokensChat: this.settings.maxTokensChat,
      maxTokensSummarize: this.settings.maxTokensSummarize,
      maxTokensClassify: this.settings.maxTokensClassify,
      hasApiKey: !!this.settings.apiKey,
    };
  }

  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.messages.create({
        model: this.settings.model,
        max_tokens: 16,
        messages: [{ role: 'user', content: 'Hi' }],
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async *smartCompose(params: ComposeParams): AsyncGenerator<string> {
    const systemPrompt = `You are an email writing assistant. Write professional, clear, and appropriate emails.
When given a brief description, compose a complete email with subject and body.
When replying, match the tone and formality of the original email.
When improving, enhance clarity and professionalism while keeping the original meaning.
Output format: JSON with "subject" and "body" fields.`;

    let userPrompt = '';
    if (params.mode === 'compose') {
      userPrompt = `Write an email based on this description: ${params.prompt}`;
    } else if (params.mode === 'reply') {
      userPrompt = `Draft a reply to this email:\n\n${params.context}\n\nReply instruction: ${params.prompt}`;
    } else {
      userPrompt = `Improve this email:\n\n${params.context}\n\nImprovement instructions: ${params.prompt}`;
    }

    const stream = this.client.messages.stream({
      model: this.settings.model,
      max_tokens: this.settings.maxTokensCompose,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }

  async summarizeEmail(email: EmailContent): Promise<EmailSummary> {
    const systemPrompt = `You are an email analysis assistant. Given an email, provide:
1. A 1-2 sentence summary
2. Category: work, personal, newsletter, notification, promotion, spam, other
3. Importance: high (needs immediate action), medium (should respond today), low (informational)
4. Any action items or deadlines mentioned
Output as JSON with fields: summary, category, importance, actionItems (array of strings).`;

    const message = await this.client.messages.create({
      model: this.settings.model,
      max_tokens: this.settings.maxTokensSummarize,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Subject: ${email.subject}\n\nFrom: ${email.from?.map(a => a.address).join(', ') || 'Unknown'}\n\nBody:\n${email.body.substring(0, 4000)}`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      logger.warn('Failed to parse AI summary JSON', { text });
    }

    return {
      summary: text.substring(0, 200),
      category: 'other',
      importance: 'medium',
      actionItems: [],
    };
  }

  async classifyEmail(email: EmailContent): Promise<EmailClassification> {
    const systemPrompt = `Classify the following email into a category and importance level.
Categories: work, personal, newsletter, notification, promotion, spam, other
Importance: high, medium, low
Also suggest relevant labels.
Output as JSON with fields: category, importance, labels (array of strings).`;

    const message = await this.client.messages.create({
      model: this.settings.model,
      max_tokens: this.settings.maxTokensClassify,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Subject: ${email.subject}\n\nFrom: ${email.from?.map(a => a.address).join(', ') || 'Unknown'}\n\nBody preview:\n${email.body.substring(0, 1000)}`,
      }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      logger.warn('Failed to parse AI classification JSON', { text });
    }

    return { category: 'other', importance: 'medium', labels: [] };
  }

  async *chat(messages: ChatMessage[], systemPrompt?: string): AsyncGenerator<string> {
    const defaultSystem = `You are a helpful email assistant embedded in a webmail client.
You can help users understand emails, draft responses, translate content,
and answer questions about their email. Be concise and helpful.
If the user references an email, the content will be provided in the context.`;

    const stream = this.client.messages.stream({
      model: this.settings.model,
      max_tokens: this.settings.maxTokensChat,
      system: systemPrompt || defaultSystem,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield event.delta.text;
      }
    }
  }
}

export const claudeService = new ClaudeService();
