import { format } from 'date-fns';
import {
  Reply, ReplyAll, Forward, Trash2, Star, MoreHorizontal, Mail, MailOpen
} from 'lucide-react';
import { useMailStore } from '../../store/useMailStore';
import EmailBody from './EmailBody';
import AttachmentList from './AttachmentList';
import AiSummaryPanel from '../ai/AiSummaryPanel';
import LoadingSpinner from '../common/LoadingSpinner';
import Avatar from '../common/Avatar';

export default function EmailViewer() {
  const { selectedEmail, isLoadingEmail, openCompose, deleteEmail, toggleFlag, markAsUnread } = useMailStore();

  if (isLoadingEmail) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!selectedEmail) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-qq-text-secondary">
        <Mail className="w-16 h-16 mb-4 opacity-30" />
        <p className="text-lg">Select an email to read</p>
        <p className="text-sm mt-1">Choose from the list on the left</p>
      </div>
    );
  }

  const senderName = selectedEmail.from[0]?.name || selectedEmail.from[0]?.address || 'Unknown';
  const senderEmail = selectedEmail.from[0]?.address || '';

  let dateStr = '';
  try {
    dateStr = format(new Date(selectedEmail.date), 'PPpp');
  } catch {
    dateStr = selectedEmail.date;
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Action bar */}
      <div className="flex items-center gap-1 px-6 py-3 border-b border-qq-border">
        <button
          onClick={() => openCompose({ mode: 'reply', replyTo: selectedEmail, subject: `Re: ${selectedEmail.subject}`, to: senderEmail })}
          className="btn-icon flex items-center gap-1 text-sm"
        >
          <Reply className="w-4 h-4" /> Reply
        </button>
        <button
          onClick={() => openCompose({ mode: 'reply', replyTo: selectedEmail, subject: `Re: ${selectedEmail.subject}`, to: selectedEmail.to.map(a => a.address).join(',') })}
          className="btn-icon flex items-center gap-1 text-sm"
        >
          <ReplyAll className="w-4 h-4" /> Reply All
        </button>
        <button
          onClick={() => openCompose({ mode: 'forward', subject: `Fwd: ${selectedEmail.subject}`, body: selectedEmail.htmlBody || selectedEmail.textBody })}
          className="btn-icon flex items-center gap-1 text-sm"
        >
          <Forward className="w-4 h-4" /> Forward
        </button>

        <div className="w-px h-6 bg-qq-border mx-2" />

        <button onClick={() => toggleFlag(selectedEmail.uid)} className="btn-icon">
          <Star className={`w-4 h-4 ${selectedEmail.isFlagged ? 'text-yellow-400 fill-yellow-400' : ''}`} />
        </button>
        <button onClick={() => markAsUnread(selectedEmail.uid)} className="btn-icon">
          <MailOpen className="w-4 h-4" />
        </button>
        <button onClick={() => deleteEmail(selectedEmail.uid)} className="btn-icon text-red-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Email content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Subject */}
        <h1 className="text-xl font-semibold text-qq-text mb-4">{selectedEmail.subject}</h1>

        {/* Sender info */}
        <div className="flex items-start gap-3 mb-6">
          <Avatar name={senderName} email={senderEmail} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-qq-text">{senderName}</span>
              <span className="text-sm text-qq-text-secondary">&lt;{senderEmail}&gt;</span>
            </div>
            <div className="text-sm text-qq-text-secondary mt-0.5">
              To: {selectedEmail.to.map(a => a.name || a.address).join(', ')}
              {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                <span> | Cc: {selectedEmail.cc.map(a => a.name || a.address).join(', ')}</span>
              )}
            </div>
            <div className="text-xs text-qq-text-secondary mt-1">{dateStr}</div>
          </div>
        </div>

        {/* AI Summary */}
        <AiSummaryPanel
          subject={selectedEmail.subject}
          body={selectedEmail.textBody || selectedEmail.htmlBody}
          from={selectedEmail.from.map(a => a.address)}
        />

        {/* Email body */}
        <EmailBody html={selectedEmail.htmlBody} text={selectedEmail.textBody} />

        {/* Attachments */}
        {selectedEmail.attachments && (
          <AttachmentList attachments={selectedEmail.attachments} />
        )}
      </div>
    </div>
  );
}
