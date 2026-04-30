import {
  Inbox, Send, FileText, Trash2, AlertTriangle, Archive,
  Plus, FolderOpen, ChevronDown, ChevronRight
} from 'lucide-react';
import { useMailStore } from '../../store/useMailStore';
import Badge from '../common/Badge';
import { useState } from 'react';

const iconMap: Record<string, any> = {
  INBOX: Inbox,
  'Sent': Send,
  'Drafts': FileText,
  'Trash': Trash2,
  'Junk': AlertTriangle,
  'Spam': AlertTriangle,
  'Archive': Archive,
};

const specialFolders = ['INBOX', 'Sent', 'Drafts', 'Trash', 'Junk', 'Spam', 'Archive'];

export default function Sidebar() {
  const { folders, currentFolder, setCurrentFolder } = useMailStore();
  const [showCustom, setShowCustom] = useState(true);

  const systemFolders = folders.filter((f) => specialFolders.includes(f.name));
  const customFolders = folders.filter((f) => !specialFolders.includes(f.name));

  const renderFolder = (folder: typeof folders[0]) => {
    const Icon = iconMap[folder.name] || FolderOpen;
    const isActive = currentFolder === folder.path;

    return (
      <button
        key={folder.path}
        onClick={() => setCurrentFolder(folder.path)}
        className={`folder-item w-full ${isActive ? 'active' : ''}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left text-sm truncate">{folder.name}</span>
        {folder.unread > 0 && <Badge count={folder.unread} />}
      </button>
    );
  };

  return (
    <aside className="w-[220px] bg-qq-sidebar border-r border-qq-border flex flex-col h-full overflow-hidden">
      {/* System folders */}
      <div className="py-2 flex-1 overflow-y-auto">
        {systemFolders.map(renderFolder)}

        {/* Custom folders */}
        {customFolders.length > 0 && (
          <div className="mt-2">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="flex items-center gap-1 px-4 py-1.5 text-xs text-qq-text-secondary hover:text-qq-text w-full"
            >
              {showCustom ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Folders
            </button>
            {showCustom && customFolders.map(renderFolder)}
          </div>
        )}
      </div>

      {/* New folder button */}
      <div className="p-2 border-t border-qq-border">
        <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-qq-text-secondary hover:text-qq-text hover:bg-qq-hover rounded-qq transition-colors">
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      </div>
    </aside>
  );
}
