import { useState } from 'react';
import { X, Send, Save, Sparkles, Loader2 } from 'lucide-react';
import { useMailStore } from '../../store/useMailStore';
import { useAiStore } from '../../store/useAiStore';
import RichTextEditor from './RichTextEditor';
import { mailboxApi } from '../../api/mailbox';
import toast from 'react-hot-toast';

export default function ComposeModal() {
  const { composeData, closeCompose } = useMailStore();
  const { isComposeLoading, aiCompose } = useAiStore();

  const [to, setTo] = useState(composeData?.to || '');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(composeData?.subject || '');
  const [body, setBody] = useState(composeData?.body || '');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);

  const handleSend = async () => {
    if (!to.trim()) {
      toast.error('Please enter a recipient');
      return;
    }

    setIsSending(true);
    try {
      await mailboxApi.sendEmail({
        to: to.split(',').map(addr => ({ address: addr.trim() })),
        cc: cc ? cc.split(',').map(addr => ({ address: addr.trim() })) : undefined,
        bcc: bcc ? bcc.split(',').map(addr => ({ address: addr.trim() })) : undefined,
        subject,
        htmlBody: body,
        textBody: body.replace(/<[^>]*>/g, ''),
      });
      toast.success('Email sent!');
      closeCompose();
    } catch (err) {
      toast.error('Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await mailboxApi.saveDraft({
        to: to ? to.split(',').map(addr => ({ address: addr.trim() })) : [],
        subject,
        htmlBody: body,
        textBody: body.replace(/<[^>]*>/g, ''),
      });
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    }
  };

  const handleAiCompose = async () => {
    if (!aiPrompt.trim()) return;

    const mode = composeData?.mode === 'reply' ? 'reply' : composeData?.mode === 'forward' ? 'improve' : 'compose';
    const context = composeData?.replyTo?.textBody || composeData?.body;

    try {
      let result = '';
      for await (const chunk of aiCompose({ prompt: aiPrompt, context, mode })) {
        result += chunk;
      }

      // Parse the result
      try {
        const parsed = JSON.parse(result);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.body) setBody(parsed.body);
      } catch {
        setBody(result);
      }
      setShowAiInput(false);
      setAiPrompt('');
    } catch {
      toast.error('AI compose failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="compose-modal bg-white rounded-qq shadow-qq-lg w-[700px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-qq-border">
          <h2 className="text-lg font-semibold text-qq-text">New Email</h2>
          <button onClick={closeCompose} className="btn-icon">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-3 space-y-2 border-b border-qq-border">
          <div className="flex items-center gap-2">
            <label className="text-sm text-qq-text-secondary w-12">To</label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input-field flex-1"
              placeholder="recipient@example.com"
            />
            <button onClick={() => setShowCc(!showCc)} className="text-xs text-qq-blue hover:underline">Cc</button>
            <button onClick={() => setShowBcc(!showBcc)} className="text-xs text-qq-blue hover:underline">Bcc</button>
          </div>

          {showCc && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-qq-text-secondary w-12">Cc</label>
              <input type="text" value={cc} onChange={(e) => setCc(e.target.value)} className="input-field flex-1" />
            </div>
          )}

          {showBcc && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-qq-text-secondary w-12">Bcc</label>
              <input type="text" value={bcc} onChange={(e) => setBcc(e.target.value)} className="input-field flex-1" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-sm text-qq-text-secondary w-12">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input-field flex-1"
              placeholder="Email subject"
            />
          </div>
        </div>

        {/* AI Compose */}
        {showAiInput ? (
          <div className="px-6 py-3 border-b border-qq-border bg-qq-blue-light">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-qq-blue flex-shrink-0" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiCompose()}
                className="input-field flex-1"
                placeholder="Describe what you want to write..."
                autoFocus
              />
              <button onClick={handleAiCompose} className="btn-primary text-sm" disabled={isComposeLoading}>
                {isComposeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
              </button>
              <button onClick={() => setShowAiInput(false)} className="text-sm text-qq-text-secondary hover:text-qq-text">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="px-6 py-2 border-b border-qq-border">
            <button
              onClick={() => setShowAiInput(true)}
              className="flex items-center gap-1 text-sm text-qq-blue hover:text-qq-blue-dark"
            >
              <Sparkles className="w-4 h-4" />
              AI Compose
            </button>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <RichTextEditor content={body} onChange={setBody} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-qq-border">
          <div className="flex items-center gap-2">
            <button onClick={handleSend} className="btn-primary flex items-center gap-2" disabled={isSending}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send
            </button>
            <button onClick={handleSaveDraft} className="btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Draft
            </button>
          </div>
          <button onClick={closeCompose} className="text-sm text-qq-text-secondary hover:text-qq-text">
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
