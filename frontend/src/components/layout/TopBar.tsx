import { Search, Edit3, Settings, LogOut, User } from 'lucide-react';
import { useMailStore } from '../../store/useMailStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopBar() {
  const { openCompose, search, clearSearch, searchQuery } = useMailStore();
  const { user, isAdmin, logout } = useAuthStore();
  const [query, setQuery] = useState(searchQuery);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query.trim());
    } else {
      clearSearch();
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-qq-border flex items-center px-4 gap-4 shadow-sm z-50">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 bg-qq-blue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">Q</span>
        </div>
        <span className="font-semibold text-qq-text text-lg hidden sm:block">QQ Mail</span>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-qq-text-secondary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search emails..."
            className="input-field pl-10 pr-4 py-2 bg-qq-bg-secondary border-transparent focus:bg-white"
          />
        </div>
      </form>

      {/* Compose button */}
      <button onClick={() => openCompose()} className="btn-primary flex items-center gap-2">
        <Edit3 className="w-4 h-4" />
        <span className="hidden sm:block">Compose</span>
      </button>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2 p-2 rounded-qq hover:bg-qq-hover transition-colors"
        >
          <div className="w-8 h-8 bg-qq-blue rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-qq-text hidden md:block">{user?.name}</span>
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-qq shadow-qq-lg border border-qq-border py-1 z-50">
            <div className="px-4 py-2 border-b border-qq-border">
              <p className="text-sm font-medium text-qq-text">{user?.name}</p>
              <p className="text-xs text-qq-text-secondary">{user?.email}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => { navigate('/settings'); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-qq-text hover:bg-qq-hover"
              >
                <Settings className="w-4 h-4" /> AI 设置
              </button>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-qq-hover"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
