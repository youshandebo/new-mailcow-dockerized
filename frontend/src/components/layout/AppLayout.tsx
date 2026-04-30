import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import ComposeModal from '../compose/ComposeModal';
import AiChatWindow from '../ai/AiChatWindow';
import { useMailStore } from '../../store/useMailStore';
import { Toaster } from 'react-hot-toast';

export default function AppLayout() {
  const { showCompose } = useMailStore();

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Toaster position="top-right" />
      <TopBar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      {showCompose && <ComposeModal />}
      <AiChatWindow />
    </div>
  );
}
