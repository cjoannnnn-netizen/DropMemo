import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

function createDefaultTab(): NoteTab {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    name: '',
    theme: 'dark',
    content: '',
    createdAt: now,
    updatedAt: now,
  };
}

function createDefaultData(): NotesData {
  const tab = createDefaultTab();
  return {
    version: '1.0',
    lastModified: new Date().toISOString(),
    tabs: [tab],
    activeTabId: tab.id,
  };
}

export function useNotes() {
  const [data, setData] = useState<NotesData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef<number | null>(null);

  // 加载数据
  useEffect(() => {
    const load = async () => {
      try {
        const loaded = await window.electronAPI.loadNotes();
        if (loaded && loaded.tabs && loaded.tabs.length > 0) {
          setData(loaded);
        } else {
          setData(createDefaultData());
        }
      } catch (e) {
        console.error('加载失败:', e);
        setData(createDefaultData());
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  // 防抖保存
  const scheduleSave = useCallback((newData: NotesData) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = window.setTimeout(() => {
      window.electronAPI.saveNotes(newData);
    }, 500);
  }, []);

  // 更新数据（自动保存）
  const updateData = useCallback(
    (updater: (prev: NotesData) => NotesData) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = updater(prev);
        next.lastModified = new Date().toISOString();
        scheduleSave(next);
        return next;
      });
    },
    [scheduleSave]
  );

  // 获取当前活动标签
  const activeTab = data?.tabs.find((t) => t.id === data.activeTabId) || data?.tabs[0] || null;

  // 切换标签
  const switchTab = useCallback(
    (tabId: string) => {
      updateData((prev) => ({ ...prev, activeTabId: tabId }));
    },
    [updateData]
  );

  // 新建标签
  const addTab = useCallback(() => {
    const newTab = createDefaultTab();
    updateData((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newTab.id,
    }));
  }, [updateData]);

  // 关闭标签
  const closeTab = useCallback(
    (tabId: string) => {
      updateData((prev) => {
        if (prev.tabs.length <= 1) return prev; // 至少保留一个
        const newTabs = prev.tabs.filter((t) => t.id !== tabId);
        const newActiveId =
          prev.activeTabId === tabId
            ? newTabs[Math.max(0, newTabs.length - 1)].id
            : prev.activeTabId;
        return { ...prev, tabs: newTabs, activeTabId: newActiveId };
      });
    },
    [updateData]
  );

  // 重命名标签
  const renameTab = useCallback(
    (tabId: string, name: string) => {
      updateData((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, name: name.slice(0, 20) } : t)),
      }));
    },
    [updateData]
  );

  // 更新内容
  const updateContent = useCallback(
    (tabId: string, content: string) => {
      updateData((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) =>
          t.id === tabId
            ? { ...t, content, updatedAt: new Date().toISOString() }
            : t
        ),
      }));
    },
    [updateData]
  );

  // 设置主题
  const setTheme = useCallback(
    (tabId: string, theme: ThemeKey) => {
      updateData((prev) => ({
        ...prev,
        tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, theme } : t)),
      }));
    },
    [updateData]
  );

  return {
    data,
    isLoaded,
    activeTab,
    tabs: data?.tabs || [],
    switchTab,
    addTab,
    closeTab,
    renameTab,
    updateContent,
    setTheme,
  };
}
