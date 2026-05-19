import { useState, useRef, useCallback } from 'react';

interface TabBarProps {
  tabs: NoteTab[];
  activeTabId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onSettingsClick: () => void;
}

export default function TabBar({
  tabs,
  activeTabId,
  onSwitch,
  onAdd,
  onClose,
  onRename,
  onSettingsClick,
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
    // 从内容提取第一行的文本
    const textWithNewlines = tab.content.replace(/<\/(p|li|h[1-6]|div)>/g, '\n').replace(/<[^>]*>/g, '').trim();
    const firstLine = textWithNewlines.split('\n')[0].trim();
    return firstLine.slice(0, 15) || '新便签';
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
      <button className="settings-btn" onClick={onSettingsClick} title="设置">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}
