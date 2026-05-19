import { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import TabBar from './components/TabBar';
import Toolbar from './components/Toolbar';
import NoteEditor from './components/NoteEditor';
import ColorPicker from './components/ColorPicker';
import ThemePicker, { THEMES } from './components/ThemePicker';
import Settings from './components/Settings';
import StatusBar from './components/StatusBar';
import { useNotes } from './hooks/useNotes';

export default function App() {
  const {
    isLoaded,
    activeTab,
    tabs,
    switchTab,
    addTab,
    closeTab,
    renameTab,
    updateContent,
    setTheme,
  } = useNotes();

  const [panelVisible, setPanelVisible] = useState(false);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // 监听面板显隐
  useEffect(() => {
    const cleanupShow = window.electronAPI?.onPanelShow(() => {
      setPanelVisible(true);
    });
    const cleanupHide = window.electronAPI?.onPanelHide(() => {
      setPanelVisible(false);
    });
    return () => {
      cleanupShow?.();
      cleanupHide?.();
    };
  }, []);

  const handleEditorReady = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);
  }, []);

  const handleColorSelect = useCallback(
    (color: string) => {
      if (editor) {
        if (color) {
          editor.chain().focus().setColor(color).run();
        } else {
          editor.chain().focus().unsetColor().run();
        }
      }
    },
    [editor]
  );

  const handleThemeSelect = useCallback(
    (theme: ThemeKey) => {
      if (activeTab) {
        setTheme(activeTab.id, theme);
      }
    },
    [activeTab, setTheme]
  );

  // 根据主题生成完整 CSS 变量
  const currentTheme = THEMES.find((t) => t.key === (activeTab?.theme || 'dark')) || THEMES[0];
  const themeStyle = {
    '--bg-primary': currentTheme.bgPrimary,
    '--bg-secondary': currentTheme.bgSecondary,
    '--bg-hover': currentTheme.bgHover,
    '--bg-active': currentTheme.bgActive,
    '--text-primary': currentTheme.textPrimary,
    '--text-secondary': currentTheme.textSecondary,
    '--text-muted': currentTheme.textMuted,
    '--border-color': currentTheme.borderColor,
    '--accent-color': currentTheme.accentColor,
    '--shadow-large': currentTheme.shadow,
  } as React.CSSProperties;

  if (!isLoaded) {
    return (
      <div className="loading">
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div
      className={`app-container ${panelVisible ? 'visible' : 'hidden'}`}
      style={themeStyle}
    >
      <div className="panel">
        <TabBar
          tabs={tabs}
          activeTabId={activeTab?.id || ''}
          onSwitch={switchTab}
          onAdd={addTab}
          onClose={closeTab}
          onRename={renameTab}
          onSettingsClick={() => setShowSettings(!showSettings)}
        />

        <Toolbar
          editor={editor}
          onColorPickerToggle={() => setShowColorPicker(!showColorPicker)}
          onThemePickerToggle={() => setShowThemePicker(!showThemePicker)}
        />

        {showColorPicker && (
          <ColorPicker
            currentColor={editor?.getAttributes('textStyle').color || ''}
            onSelect={handleColorSelect}
            onClose={() => setShowColorPicker(false)}
          />
        )}

        {showThemePicker && (
          <ThemePicker
            currentTheme={activeTab?.theme || 'dark'}
            onSelect={handleThemeSelect}
            onClose={() => setShowThemePicker(false)}
          />
        )}

        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} />
        )}

        {activeTab && (
          <NoteEditor
            key={activeTab.id}
            content={activeTab.content}
            tabId={activeTab.id}
            onUpdate={updateContent}
            onEditorReady={handleEditorReady}
          />
        )}

        <StatusBar
          content={activeTab?.content || ''}
          tabName={activeTab?.name || ''}
        />
      </div>
    </div>
  );
}
