import { create } from 'zustand';
import { Folder, Email, EmailDetail } from '../types';
import { mailboxApi } from '../api/mailbox';

interface MailState {
  folders: Folder[];
  currentFolder: string;
  emails: Email[];
  selectedEmail: EmailDetail | null;
  isLoading: boolean;
  isLoadingEmail: boolean;
  totalEmails: number;
  currentPage: number;
  searchQuery: string;
  searchResults: number[];
  showCompose: boolean;
  composeData: {
    to: string;
    subject: string;
    body: string;
    mode: 'compose' | 'reply' | 'forward';
    replyTo?: EmailDetail;
  } | null;

  fetchFolders: () => Promise<void>;
  setCurrentFolder: (folder: string) => void;
  fetchEmails: (folder?: string, page?: number) => Promise<void>;
  selectEmail: (uid: number) => Promise<void>;
  clearSelection: () => void;
  markAsRead: (uid: number) => Promise<void>;
  markAsUnread: (uid: number) => Promise<void>;
  toggleFlag: (uid: number) => Promise<void>;
  deleteEmail: (uid: number) => Promise<void>;
  moveEmail: (uid: number, toFolder: string) => Promise<void>;
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  openCompose: (data?: Partial<MailState['composeData']>) => void;
  closeCompose: () => void;
}

export const useMailStore = create<MailState>((set, get) => ({
  folders: [],
  currentFolder: 'INBOX',
  emails: [],
  selectedEmail: null,
  isLoading: false,
  isLoadingEmail: false,
  totalEmails: 0,
  currentPage: 1,
  searchQuery: '',
  searchResults: [],
  showCompose: false,
  composeData: null,

  fetchFolders: async () => {
    try {
      const folders = await mailboxApi.getFolders();
      set({ folders });
    } catch (err) {
      console.error('Failed to fetch folders:', err);
    }
  },

  setCurrentFolder: (folder) => {
    set({ currentFolder: folder, selectedEmail: null, currentPage: 1, searchQuery: '', searchResults: [] });
    get().fetchEmails(folder);
  },

  fetchEmails: async (folder, page = 1) => {
    const targetFolder = folder || get().currentFolder;
    set({ isLoading: true });
    try {
      const { emails, total } = await mailboxApi.getEmails(targetFolder, page);
      set({ emails, totalEmails: total, currentPage: page, isLoading: false });
    } catch (err) {
      console.error('Failed to fetch emails:', err);
      set({ isLoading: false });
    }
  },

  selectEmail: async (uid) => {
    set({ isLoadingEmail: true, selectedEmail: null });
    try {
      const email = await mailboxApi.getEmail(get().currentFolder, uid);
      set({ selectedEmail: email, isLoadingEmail: false });

      // Mark as read
      if (!email.isRead) {
        get().markAsRead(uid);
      }
    } catch (err) {
      console.error('Failed to fetch email:', err);
      set({ isLoadingEmail: false });
    }
  },

  clearSelection: () => set({ selectedEmail: null }),

  markAsRead: async (uid) => {
    try {
      await mailboxApi.markAsRead(get().currentFolder, uid);
      set((state) => ({
        emails: state.emails.map((e) => (e.uid === uid ? { ...e, isRead: true } : e)),
      }));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  },

  markAsUnread: async (uid) => {
    try {
      await mailboxApi.markAsUnread(get().currentFolder, uid);
      set((state) => ({
        emails: state.emails.map((e) => (e.uid === uid ? { ...e, isRead: false } : e)),
      }));
    } catch (err) {
      console.error('Failed to mark as unread:', err);
    }
  },

  toggleFlag: async (uid) => {
    try {
      const email = get().emails.find((e) => e.uid === uid);
      if (!email) return;
      await mailboxApi.toggleFlag(get().currentFolder, uid, !email.isFlagged);
      set((state) => ({
        emails: state.emails.map((e) => (e.uid === uid ? { ...e, isFlagged: !e.isFlagged } : e)),
      }));
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  },

  deleteEmail: async (uid) => {
    try {
      await mailboxApi.deleteEmail(get().currentFolder, uid);
      set((state) => ({
        emails: state.emails.filter((e) => e.uid !== uid),
        selectedEmail: state.selectedEmail?.uid === uid ? null : state.selectedEmail,
      }));
    } catch (err) {
      console.error('Failed to delete email:', err);
    }
  },

  moveEmail: async (uid, toFolder) => {
    try {
      await mailboxApi.moveEmail(get().currentFolder, uid, toFolder);
      set((state) => ({
        emails: state.emails.filter((e) => e.uid !== uid),
        selectedEmail: state.selectedEmail?.uid === uid ? null : state.selectedEmail,
      }));
    } catch (err) {
      console.error('Failed to move email:', err);
    }
  },

  search: async (query) => {
    set({ searchQuery: query, isLoading: true });
    try {
      const uids = await mailboxApi.searchEmails(get().currentFolder, query);
      set({ searchResults: uids, isLoading: false });
    } catch (err) {
      console.error('Search failed:', err);
      set({ isLoading: false });
    }
  },

  clearSearch: () => set({ searchQuery: '', searchResults: [] }),

  openCompose: (data) => {
    set({
      showCompose: true,
      composeData: {
        to: data?.to || '',
        subject: data?.subject || '',
        body: data?.body || '',
        mode: data?.mode || 'compose',
        replyTo: data?.replyTo,
      },
    });
  },

  closeCompose: () => set({ showCompose: false, composeData: null }),
}));
