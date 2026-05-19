import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';

interface NoteEditorProps {
  content: string;
  tabId: string;
  onUpdate: (tabId: string, content: string) => void;
  onEditorReady: (editor: any) => void;
}

export default function NoteEditor({ content, tabId, onUpdate, onEditorReady }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder: '开始记录...',
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onUpdate(tabId, html);
      // 编辑时锁定面板
      window.electronAPI?.lockPanel();
    },
    onFocus: () => {
      window.electronAPI?.lockPanel();
    },
    editorProps: {
      attributes: {
        class: 'note-editor-content',
      },
    },
  });

  // 当切换标签时更新内容
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || '');
    }
  }, [tabId]); // 只在 tabId 变化时更新

  // 通知父组件 editor 实例
  useEffect(() => {
    if (editor) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  return (
    <div className="note-editor">
      <EditorContent editor={editor} />
    </div>
  );
}
