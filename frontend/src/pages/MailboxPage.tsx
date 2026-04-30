import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useMailStore } from '../store/useMailStore';
import EmailList from '../components/mail/EmailList';
import EmailViewer from '../components/mail/EmailViewer';

export default function MailboxPage() {
  const { folder, uid } = useParams();
  const { setCurrentFolder, fetchEmails, fetchFolders, selectEmail, currentFolder } = useMailStore();

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (folder && folder !== currentFolder) {
      setCurrentFolder(folder);
    } else {
      fetchEmails();
    }
  }, [folder]);

  useEffect(() => {
    if (uid) {
      selectEmail(parseInt(uid));
    }
  }, [uid]);

  return (
    <div className="flex h-full">
      <EmailList />
      <EmailViewer />
    </div>
  );
}
