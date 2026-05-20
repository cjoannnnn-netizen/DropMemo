import { useState, useRef, useCallback } from 'react';

interface TabBarProps {
  tabs: NoteTab[];
  activeTabId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSettingsClick: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onSwitch,
  onAdd,
  onClose,
  onRename,
  onSettingsClick,
  isPinned,
  onTogglePin,
}: TabBarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = useCallback((tabId: string) => {
    setEditingId(tabId);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  const handleRenameCommit = useCallback(
    (tabId: string, value: string) => {
      onRename(tabId, value);
      setEditingId(null);
    },
    [onRename]
  );

  const getTabDisplayName = (tab: NoteTab) => {
    if (tab.name) return tab.name;
    if (!tab.content) return '新便签';
    // 只取第一个 <p> 或文本节点的纯文本
    const firstLine = tab.content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .split('\n')
      .map(s => s.trim())
      .find(s => s.length > 0);
    if (!firstLine) return '新便签';
    return firstLine.length > 8 ? firstLine.slice(0, 8) + '…' : firstLine;
  };

  return (
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`tab-item ${tab.id === activeTabId ? 'active' : ''}`}
            onClick={() => onSwitch(tab.id)}
            onDoubleClick={() => handleDoubleClick(tab.id)}
          >
            {editingId === tab.id ? (
              <input
                ref={inputRef}
                className="tab-rename-input"
                defaultValue={tab.name || ''}
                placeholder="标签名称"
                maxLength={20}
                onBlur={(e) => handleRenameCommit(tab.id, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRenameCommit(tab.id, (e.target as HTMLInputElement).value);
                  }
                  if (e.key === 'Escape') setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="tab-name">{getTabDisplayName(tab)}</span>
            )}
            {tabs.length > 1 && (
              <button
                className="tab-close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(tab.id);
                }}
                title="关闭标签"
              >
                ×
              </button>
            )}
          </div>
        ))}
        {tabs.length < 20 && (
          <button className="tab-add-btn" onClick={onAdd} title="新建标签">
            +
          </button>
        )}
      </div>
      <button
        className={`settings-btn${isPinned ? ' pin-active' : ''}`}
        onClick={onTogglePin}
        title={isPinned ? '取消置顶（点击后移开鼠标将自动收起）' : '置顶固定（固定后不会自动收起）'}
      >
        {isPinned ? (
          <svg width="13" height="13" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="13" rx="2" fill="currentColor"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="12" cy="16.5" r="1.5" fill="white"/>
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2.2"/>
            <path d="M7 11V7a5 5 0 0 1 9.9-1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
      <button className="settings-btn" onClick={onSettingsClick} title="设置">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}
