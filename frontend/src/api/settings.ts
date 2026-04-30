import client from './client';

export interface AiSettingsResponse {
  hasApiKey: boolean;
  model: string;
  baseUrl: string;
  maxTokensCompose: number;
  maxTokensChat: number;
  maxTokensSummarize: number;
  maxTokensClassify: number;
}

export interface AiSettingsUpdate {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  maxTokensCompose?: number;
  maxTokensChat?: number;
  maxTokensSummarize?: number;
  maxTokensClassify?: number;
}

export const settingsApi = {
  getAiSettings: async (): Promise<{ settings: AiSettingsResponse }> => {
    const res = await client.get('/settings/ai');
    return res.data;
  },

  updateAiSettings: async (updates: AiSettingsUpdate): Promise<{ settings: AiSettingsResponse; message: string }> => {
    const res = await client.put('/settings/ai', updates);
    return res.data;
  },

  testConnection: async (): Promise<{ success: boolean; message?: string; error?: string }> => {
    const res = await client.post('/settings/ai/test');
    return res.data;
  },
};
