import { formatDistanceToNow } from 'date-fns';
import { Paperclip, Star } from 'lucide-react';
import Avatar from '../common/Avatar';
import { Email } from '../../types';

interface Props {
  email: Email;
  isActive: boolean;
  onClick: () => void;
}

export default function EmailListItem({ email, isActive, onClick }: Props) {
  const senderName = email.from[0]?.name || email.from[0]?.address || 'Unknown';
  const senderEmail = email.from[0]?.address || '';

  let timeStr = '';
  try {
    timeStr = formatDistanceToNow(new Date(email.date), { addSuffix: true });
  } catch {
    timeStr = email.date;
  }

  return (
    <div
      onClick={onClick}
      className={`email-item ${isActive ? 'active' : ''} ${!email.isRead ? 'unread' : ''}`}
    >
      <Avatar name={senderName} email={senderEmail} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm truncate ${!email.isRead ? 'font-semibold text-qq-text' : 'text-qq-text-secondary'}`}>
            {senderName}
          </span>
          <span className="text-xs text-qq-text-secondary flex-shrink-0">{timeStr}</span>
        </div>

        <div className="flex items-center gap-1">
          {email.isFlagged && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
          <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-qq-text' : 'text-qq-text-secondary'}`}>
            {email.subject}
          </p>
        </div>

        <div className="flex items-center gap-1 mt-0.5">
          <p className="text-xs text-qq-text-secondary truncate flex-1">{email.preview}</p>
          {email.hasAttachments && <Paperclip className="w-3 h-3 text-qq-text-secondary flex-shrink-0" />}
        </div>
      </div>
    </div>
  );
}
