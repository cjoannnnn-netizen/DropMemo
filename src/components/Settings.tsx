import { useState, useEffect } from 'react';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    window.electronAPI.loadSettings().then((res) => {
      setSettings(res || { storageLocation: 'local', autoLaunch: true } as AppSettings);
    });
  }, []);

  const handleOpenStorage = async () => {
    const storagePath = await window.electronAPI.getStoragePath();
    window.open(`file://${storagePath}`);
  };

  const handleStorageChange = async (location: 'icloud' | 'local') => {
    if (settings && settings.storageLocation !== location) {
      const newSettings = { ...settings, storageLocation: location };
      setSettings(newSettings);
      await window.electronAPI.saveSettings(newSettings);
      // 刷新页面重新加载便签数据
      window.location.reload();
    }
  };

  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <span className="settings-title">设置</span>
          <button className="settings-close" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <div className="settings-label">关于</div>
            <div className="settings-info">
              <div className="settings-app-name">DropMemo</div>
              <div className="settings-version">版本 1.0.0</div>
              <div className="settings-desc">Mac 刘海便签工具</div>
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <div className="settings-label">数据存储位置</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                className={`settings-action-btn ${settings?.storageLocation === 'icloud' ? 'active' : ''}`}
                onClick={() => handleStorageChange('icloud')}
                style={{ flex: 1, textAlign: 'center', borderColor: settings?.storageLocation === 'icloud' ? 'var(--accent-color)' : '' }}
              >
                ☁️ iCloud
              </button>
              <button
                className={`settings-action-btn ${settings?.storageLocation === 'local' ? 'active' : ''}`}
                onClick={() => handleStorageChange('local')}
                style={{ flex: 1, textAlign: 'center', borderColor: settings?.storageLocation === 'local' ? 'var(--accent-color)' : '' }}
              >
                💻 本地
              </button>
            </div>
            <button className="settings-action-btn" onClick={handleOpenStorage} style={{ textAlign: 'center' }}>
              📂 打开当前数据目录
            </button>
            <div className="settings-hint">
              {settings?.storageLocation === 'icloud' 
                ? '数据通过 iCloud 在 Mac 设备间同步' 
                : '数据仅保存在本机的 Documents 目录中'}
            </div>
            <div className="settings-hint" style={{ color: 'var(--text-muted)' }}>
              * 切换位置会自动刷新应用
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-section">
            <div className="settings-label">使用说明</div>
            <div className="settings-tips">
              <div className="tip-item">🖱️ 鼠标移到刘海区域展开便签</div>
              <div className="tip-item">📝 双击标签名可重命名</div>
              <div className="tip-item">🎨 工具栏右侧切换背景主题</div>
              <div className="tip-item">⬇️ 底部导出为 Markdown 文件</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
