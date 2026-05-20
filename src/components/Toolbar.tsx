import { useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { TEXT_COLORS } from '../constants/colors';

interface ToolbarProps {
  editor: Editor | null;
  onColorPickerToggle: () => void;
  onThemePickerToggle: () => void;
}


export default function Toolbar({ editor, onColorPickerToggle, onThemePickerToggle }: ToolbarProps) {
  if (!editor) return null;

  const btnClass = (active: boolean) => `toolbar-btn ${active ? 'active' : ''}`;

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={btnClass(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="加粗 (⌘B)"
        >
          <strong>B</strong>
        </button>
        <button
          className={btnClass(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="斜体 (⌘I)"
        >
          <em>I</em>
        </button>
        <button
          className={btnClass(editor.isActive('strike'))}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          title="删除线 (⌘⇧X)"
        >
          <s>S</s>
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn color-btn"
          onClick={onColorPickerToggle}
          title="字体颜色"
        >
          <span className="color-icon">A</span>
          <span
            className="color-indicator"
            style={{
              backgroundColor: editor.getAttributes('textStyle').color || 'var(--text-primary)',
            }}
          />
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className={btnClass(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="无序列表"
        >
          ☰
        </button>
        <button
          className={btnClass(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="有序列表"
        >
          1.
        </button>
        <button
          className={btnClass(editor.isActive('taskList'))}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          title="待办清单 (⌘⇧9)"
        >
          ☑
        </button>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <button
          className="toolbar-btn"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="分割线"
        >
          ─
        </button>
      </div>

      <div className="toolbar-spacer" />

      <button
        className="toolbar-btn theme-btn"
        onClick={onThemePickerToggle}
        title="背景主题"
      >
        🎨
      </button>
    </div>
  );
}
