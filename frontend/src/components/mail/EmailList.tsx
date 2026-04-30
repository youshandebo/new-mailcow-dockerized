import { useMailStore } from '../../store/useMailStore';
import EmailListItem from './EmailListItem';
import LoadingSpinner from '../common/LoadingSpinner';
import { RefreshCw } from 'lucide-react';

export default function EmailList() {
  const { emails, selectedEmail, isLoading, fetchEmails, selectEmail, currentFolder } = useMailStore();

  return (
    <div className="w-[360px] border-r border-qq-border flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-qq-border">
        <h2 className="font-semibold text-qq-text text-sm">{currentFolder}</h2>
        <button
          onClick={() => fetchEmails()}
          className="btn-icon"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && emails.length === 0 ? (
          <LoadingSpinner />
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-qq-text-secondary">
            <p className="text-sm">No emails</p>
          </div>
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.uid}
              email={email}
              isActive={selectedEmail?.uid === email.uid}
              onClick={() => selectEmail(email.uid)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-qq-border text-xs text-qq-text-secondary">
        {emails.length} emails
      </div>
    </div>
  );
}
