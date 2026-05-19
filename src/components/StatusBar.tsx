import { useMemo } from 'react';
import { htmlToMarkdown, generateFilename } from '../utils/markdown';

interface StatusBarProps {
  content: string;
  tabName: string;
}

export default function StatusBar({ content, tabName }: StatusBarProps) {
  const wordCount = useMemo(() => {
    const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
    return text.length;
  }, [content]);

  const handleExport = async () => {
    const markdown = htmlToMarkdown(content);
    const filename = generateFilename(tabName || '未命名');

    try {
      const result = await window.electronAPI.exportMarkdown({
        filename,
        content: markdown,
      });
      if (result.success) {
        console.log('导出成功:', result.path);
      }
    } catch (e) {
      console.error('导出失败:', e);
    }
  };

  return (
    <div className="status-bar">
      <span className="word-count">{wordCount} 字</span>
      <button className="export-btn" onClick={handleExport} title="导出 Markdown">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>导出</span>
      </button>
    </div>
  );
}
