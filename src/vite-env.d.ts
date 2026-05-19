/// <reference types="vite/client" />

interface ElectronAPI {
  loadNotes: () => Promise<NotesData | null>;
  saveNotes: (data: NotesData) => Promise<boolean>;
  loadSettings: () => Promise<AppSettings | null>;
  saveSettings: (data: AppSettings) => Promise<boolean>;
  exportMarkdown: (params: { filename: string; content: string }) => Promise<{ success: boolean; path?: string; error?: string }>;
  getStoragePath: () => Promise<string>;
  lockPanel: () => void;
  onPanelShow: (callback: () => void) => () => void;
  onPanelHide: (callback: () => void) => () => void;
}

interface Window {
  electronAPI: ElectronAPI;
}

interface NoteTab {
  id: string;
  name: string;
  theme: ThemeKey;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesData {
  version: string;
  lastModified: string;
  tabs: NoteTab[];
  activeTabId: string;
}

interface AppSettings {
  triggerDelay: number;
  hideDelay: number;
  autoLaunch: boolean;
  storageLocation: 'icloud' | 'local';
  panelWidth: number;
}

type ThemeKey = 'dark' | 'paper' | 'sticky';
