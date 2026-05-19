import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
});

// 自定义规则：待办清单
turndownService.addRule('taskList', {
  filter: (node) => {
    return (
      node.nodeName === 'LI' &&
      node.getAttribute('data-type') === 'taskItem'
    );
  },
  replacement: (content, node) => {
    const element = node as HTMLElement;
    const checked = element.getAttribute('data-checked') === 'true';
    const prefix = checked ? '- [x] ' : '- [ ] ';
    return prefix + content.trim() + '\n';
  },
});

// 自定义规则：checkbox input (Tiptap task item)
turndownService.addRule('taskCheckbox', {
  filter: (node) => {
    return (
      node.nodeName === 'INPUT' &&
      (node as HTMLInputElement).type === 'checkbox'
    );
  },
  replacement: () => '',
});

// 自定义规则：task list ul
turndownService.addRule('taskListUl', {
  filter: (node) => {
    return (
      node.nodeName === 'UL' &&
      node.getAttribute('data-type') === 'taskList'
    );
  },
  replacement: (content) => {
    return content;
  },
});

// 自定义规则：颜色文字
turndownService.addRule('colorSpan', {
  filter: (node) => {
    return (
      node.nodeName === 'SPAN' &&
      !!(node as HTMLElement).style.color
    );
  },
  replacement: (content, node) => {
    const color = (node as HTMLElement).style.color;
    if (color) {
      return `<span style="color:${color}">${content}</span>`;
    }
    return content;
  },
});

// 自定义规则：删除线
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: (content) => {
    return `~~${content}~~`;
  },
});

export function htmlToMarkdown(html: string): string {
  return turndownService.turndown(html);
}

export function generateFilename(tabName: string): string {
  const date = new Date().toISOString().slice(0, 10);
  const safeName = tabName.replace(/[/\\?%*:|"<>]/g, '_').trim() || '未命名';
  return `${safeName}_${date}.md`;
}
