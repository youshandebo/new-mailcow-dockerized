import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { AiSettingsUpdate } from '../api/settings';
import { ArrowLeft, Save, Zap, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuthStore();
  const { settings, isLoading, isSaving, isTesting, error, message, fetchSettings, updateSettings, testConnection, clearMessages } = useSettingsStore();

  const [form, setForm] = useState({
    apiKey: '',
    model: '',
    baseUrl: '',
    maxTokensCompose: '2048',
    maxTokensChat: '2048',
    maxTokensSummarize: '1024',
    maxTokensClassify: '256',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyDirty, setApiKeyDirty] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchSettings();
    return () => { clearMessages(); };
  }, [isAdmin, fetchSettings, navigate, clearMessages]);

  useEffect(() => {
    if (settings) {
      setForm({
        apiKey: '',
        model: settings.model,
        baseUrl: settings.baseUrl,
        maxTokensCompose: String(settings.maxTokensCompose),
        maxTokensChat: String(settings.maxTokensChat),
        maxTokensSummarize: String(settings.maxTokensSummarize),
        maxTokensClassify: String(settings.maxTokensClassify),
      });
    }
  }, [settings]);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const parseTokenValue = (val: string): number | null => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 1 || num > 100000) return null;
    return num;
  };

  const handleSave = async () => {
    const updates: AiSettingsUpdate = {};
    if (apiKeyDirty && form.apiKey) updates.apiKey = form.apiKey;
    if (form.model !== settings?.model) updates.model = form.model;
    if (form.baseUrl !== settings?.baseUrl) updates.baseUrl = form.baseUrl;

    const tokenFields = [
      { key: 'maxTokensCompose' as const, val: form.maxTokensCompose, orig: settings?.maxTokensCompose },
      { key: 'maxTokensChat' as const, val: form.maxTokensChat, orig: settings?.maxTokensChat },
      { key: 'maxTokensSummarize' as const, val: form.maxTokensSummarize, orig: settings?.maxTokensSummarize },
      { key: 'maxTokensClassify' as const, val: form.maxTokensClassify, orig: settings?.maxTokensClassify },
    ];
    for (const { key, val, orig } of tokenFields) {
      const parsed = parseTokenValue(val);
      if (parsed === null) {
        toast.error(`${key} 必须是 1-100000 之间的整数`);
        return;
      }
      if (parsed !== orig) updates[key] = parsed;
    }

    if (Object.keys(updates).length === 0) {
      toast('没有需要保存的更改');
      return;
    }
    const success = await updateSettings(updates);
    if (success) setApiKeyDirty(false);
  };

  const handleTest = async () => {
    setTestResult(null);
    const result = await testConnection();
    setTestResult(result);
  };

  if (!isAdmin) return null;

  return (
    <div className="h-full overflow-y-auto bg-qq-bg-secondary">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-qq hover:bg-qq-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-qq-text" />
          </button>
          <h1 className="text-2xl font-bold text-qq-text">AI 模型设置</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-qq-blue" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Settings */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-qq-text mb-4">连接设置</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-qq-text mb-1">
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={form.apiKey}
                      onChange={(e) => { setForm({ ...form, apiKey: e.target.value }); setApiKeyDirty(true); }}
                      placeholder={settings?.hasApiKey ? 'API Key 已设置 (留空保持不变)' : 'sk-ant-...'}
                      className="input-field pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-qq-text-secondary hover:text-qq-text"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-qq-text-secondary mt-1">留空则保持当前密钥不变</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-qq-text mb-1">
                    Base URL
                  </label>
                  <input
                    type="text"
                    value={form.baseUrl}
                    onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                    placeholder="留空使用官方地址 (https://api.anthropic.com)"
                    className="input-field"
                  />
                  <p className="text-xs text-qq-text-secondary mt-1">可选，用于自定义 API 代理地址</p>
                </div>
              </div>
            </div>

            {/* Model Settings */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-qq-text mb-4">模型设置</h2>
              <div>
                <label className="block text-sm font-medium text-qq-text mb-1">
                  模型 ID
                </label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  placeholder="claude-sonnet-4-20250514"
                  className="input-field"
                />
                <p className="text-xs text-qq-text-secondary mt-1">
                  例如: claude-sonnet-4-20250514, claude-haiku-4-5-20251001, claude-opus-4-7
                </p>
              </div>
            </div>

            {/* Token Limits */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-qq-text mb-4">Token 限制</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-qq-text mb-1">
                    智能撰写
                  </label>
                  <input
                    type="number"
                    value={form.maxTokensCompose}
                    onChange={(e) => setForm({ ...form, maxTokensCompose: e.target.value })}
                    min={1}
                    max={100000}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-qq-text mb-1">
                    AI 对话
                  </label>
                  <input
                    type="number"
                    value={form.maxTokensChat}
                    onChange={(e) => setForm({ ...form, maxTokensChat: e.target.value })}
                    min={1}
                    max={100000}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-qq-text mb-1">
                    邮件摘要
                  </label>
                  <input
                    type="number"
                    value={form.maxTokensSummarize}
                    onChange={(e) => setForm({ ...form, maxTokensSummarize: e.target.value })}
                    min={1}
                    max={100000}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-qq-text mb-1">
                    邮件分类
                  </label>
                  <input
                    type="number"
                    value={form.maxTokensClassify}
                    onChange={(e) => setForm({ ...form, maxTokensClassify: e.target.value })}
                    min={1}
                    max={100000}
                    className="input-field"
                  />
                </div>
              </div>
              <p className="text-xs text-qq-text-secondary mt-3">
                最大生成 token 数量，数值越大生成内容越长，消耗越多
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? '保存中...' : '保存设置'}
              </button>

              <button
                onClick={handleTest}
                disabled={isTesting}
                className="btn-secondary flex items-center gap-2"
              >
                {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {isTesting ? '测试中...' : '测试连接'}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-qq text-sm ${testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {testResult.success ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {testResult.success ? '连接成功！API Key 和模型配置有效' : '连接失败，请检查 API Key 和模型配置'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
