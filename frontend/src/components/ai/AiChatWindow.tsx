import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useAiStore } from '../../store/useAiStore';
import { useMailStore } from '../../store/useMailStore';

export default function AiChatWindow() {
  const { isChatOpen, toggleChat, chatMessages, isChatLoading, sendChatMessage, clearChat } = useAiStore();
  const { selectedEmail } = useMailStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim() || isChatLoading) return;

    const currentEmail = selectedEmail
      ? `Subject: ${selectedEmail.subject}\nFrom: ${selectedEmail.from[0]?.address}\nBody: ${selectedEmail.textBody?.substring(0, 1000)}`
      : undefined;

    sendChatMessage(input.trim(), currentEmail);
    setInput('');
  };

  const quickActions = [
    { label: 'Summarize this email', prompt: 'Please summarize the current email I am viewing.' },
    { label: 'Draft a reply', prompt: 'Help me draft a reply to this email.' },
    { label: 'Translate to English', prompt: 'Translate the current email content to English.' },
  ];

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-qq-blue text-white rounded-full shadow-qq-lg flex items-center justify-center hover:bg-qq-blue-dark transition-colors z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="ai-chat-panel fixed bottom-6 right-6 w-[380px] h-[520px] bg-white rounded-qq shadow-qq-lg border border-qq-border flex flex-col z-40">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-qq-border bg-qq-blue text-white rounded-t-qq">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1 hover:bg-white/20 rounded">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={toggleChat} className="p-1 hover:bg-white/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-qq-text-secondary">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Ask me anything about your emails</p>
            <p className="text-xs mt-1">I can help summarize, translate, or draft replies</p>

            {selectedEmail && (
              <div className="mt-4 space-y-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendChatMessage(action.prompt, `Subject: ${selectedEmail.subject}\nFrom: ${selectedEmail.from[0]?.address}\nBody: ${selectedEmail.textBody?.substring(0, 1000)}`)}
                    className="block w-full text-left text-sm px-3 py-2 rounded-qq bg-qq-bg-secondary hover:bg-qq-hover transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] px-4 py-2 rounded-qq text-sm ${
                msg.role === 'user'
                  ? 'bg-qq-blue text-white rounded-br-sm'
                  : 'bg-qq-bg-secondary text-qq-text rounded-bl-sm'
              }`}
            >
              {msg.content || (isChatLoading && i === chatMessages.length - 1 ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null)}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-qq-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask AI..."
            className="input-field flex-1 text-sm"
            disabled={isChatLoading}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isChatLoading}
            className="btn-icon text-qq-blue disabled:text-qq-text-secondary"
          >
            {isChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
