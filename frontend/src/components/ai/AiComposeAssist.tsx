import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';

interface Props {
  onResult: (subject: string, body: string) => void;
  context?: string;
  mode?: 'compose' | 'reply' | 'improve';
}

export default function AiComposeAssist({ onResult, context, mode = 'compose' }: Props) {
  const { isComposeLoading, aiCompose } = useAiStore();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    try {
      let result = '';
      for await (const chunk of aiCompose({ prompt, context, mode })) {
        result += chunk;
      }

      try {
        const parsed = JSON.parse(result);
        onResult(parsed.subject || '', parsed.body || result);
      } catch {
        onResult('', result);
      }

      setPrompt('');
    } catch (err) {
      console.error('AI compose failed:', err);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-qq-blue-light rounded-qq border border-qq-blue/20">
      <Sparkles className="w-4 h-4 text-qq-blue flex-shrink-0" />
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        placeholder={mode === 'reply' ? 'Describe how to reply...' : 'Describe what to write...'}
        className="flex-1 text-sm bg-transparent outline-none placeholder:text-qq-text-secondary"
        disabled={isComposeLoading}
      />
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isComposeLoading}
        className="text-sm text-qq-blue font-medium hover:text-qq-blue-dark disabled:text-qq-text-secondary"
      >
        {isComposeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
      </button>
    </div>
  );
}
