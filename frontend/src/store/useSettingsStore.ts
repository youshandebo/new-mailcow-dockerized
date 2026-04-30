import { create } from 'zustand';
import { AiSettingsResponse, AiSettingsUpdate, settingsApi } from '../api/settings';

interface SettingsState {
  settings: AiSettingsResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  isTesting: boolean;
  error: string | null;
  message: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: AiSettingsUpdate) => Promise<boolean>;
  testConnection: () => Promise<{ success: boolean; error?: string }>;
  clearMessages: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: null,
  isLoading: false,
  isSaving: false,
  isTesting: false,
  error: null,
  message: null,

  fetchSettings: async () => {
    try {
      set({ isLoading: true, error: null });
      const { settings } = await settingsApi.getAiSettings();
      set({ settings, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.error || '加载设置失败';
      set({ error: msg, isLoading: false });
    }
  },

  updateSettings: async (updates) => {
    try {
      set({ isSaving: true, error: null, message: null });
      const { settings, message } = await settingsApi.updateAiSettings(updates);
      set({ settings, isSaving: false, message });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.error || '保存失败';
      set({ error: msg, isSaving: false });
      return false;
    }
  },

  testConnection: async () => {
    try {
      set({ isTesting: true, error: null });
      const result = await settingsApi.testConnection();
      set({ isTesting: false });
      return result;
    } catch (err: any) {
      const msg = err.response?.data?.error || '测试失败';
      set({ error: msg, isTesting: false });
      return { success: false, error: msg };
    }
  },

  clearMessages: () => set({ error: null, message: null }),
}));
