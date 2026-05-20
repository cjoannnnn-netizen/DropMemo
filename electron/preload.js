const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 数据操作
  loadNotes: () => ipcRenderer.invoke('load-notes'),
  saveNotes: (data) => ipcRenderer.invoke('save-notes', data),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (data) => ipcRenderer.invoke('save-settings', data),

  // 导出
  exportMarkdown: (params) => ipcRenderer.invoke('export-markdown', params),

  // 存储路径
  getStoragePath: () => ipcRenderer.invoke('get-storage-path'),

  // 面板锁定（编辑时防收起）
  lockPanel: () => ipcRenderer.send('lock-panel'),
  togglePin: (state) => ipcRenderer.send('toggle-pin', state),

  // 面板显隐事件
  onPanelShow: (callback) => {
    ipcRenderer.on('panel-show', callback);
    return () => ipcRenderer.removeListener('panel-show', callback);
  },
  onPanelHide: (callback) => {
    ipcRenderer.on('panel-hide', callback);
    return () => ipcRenderer.removeListener('panel-hide', callback);
  },
});
