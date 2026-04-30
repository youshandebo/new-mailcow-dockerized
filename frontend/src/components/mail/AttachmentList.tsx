import { Download, FileText, Image, Film, Music, Archive, File } from 'lucide-react';
import { EmailAttachment } from '../../types';

interface Props {
  attachments: EmailAttachment[];
}

const iconMap: Record<string, any> = {
  'image/': Image,
  'video/': Film,
  'audio/': Music,
  'application/zip': Archive,
  'application/pdf': FileText,
  'text/': FileText,
};

function getIcon(contentType: string) {
  for (const [prefix, Icon] of Object.entries(iconMap)) {
    if (contentType.startsWith(prefix)) return Icon;
  }
  return File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({ attachments }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="border-t border-qq-border pt-4 mt-4">
      <h4 className="text-sm font-medium text-qq-text mb-2">
        Attachments ({attachments.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {attachments.map((att) => {
          const Icon = getIcon(att.contentType);
          return (
            <div
              key={att.id}
              className="flex items-center gap-2 px-3 py-2 bg-qq-bg-secondary rounded-qq border border-qq-border hover:bg-qq-hover transition-colors cursor-pointer"
            >
              <Icon className="w-4 h-4 text-qq-text-secondary" />
              <div className="min-w-0">
                <p className="text-sm text-qq-text truncate max-w-[150px]">{att.filename}</p>
                <p className="text-xs text-qq-text-secondary">{formatSize(att.size)}</p>
              </div>
              <Download className="w-4 h-4 text-qq-text-secondary" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
