const { app, BrowserWindow, screen, ipcMain, Tray, nativeImage, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── 全局变量 ──
let mainWindow = null;
let tray = null;
let isVisible = false;
let isAnimating = false;
let mouseCheckInterval = null;
let hideTimeout = null;
let enterTimeout = null;
let isPinned = false;

// ── 常量 ──
const TRIGGER_DELAY = 150;
const HIDE_DELAY = 100;
const SHOW_ANIMATION = 300;
const HIDE_ANIMATION = 250;
const PANEL_WIDTH = 480;
const PANEL_HEIGHT = 560;
const NOTCH_ZONE_WIDTH = 250;
const NOTCH_ZONE_HEIGHT = 25;

// ── 存储路径 ──
function getStoragePath() {
  const settings = loadSettings() || {};
  const localPath = path.join(os.homedir(), 'Documents', 'DropMemo');

  if (settings.storageLocation === 'local') {
    if (!fs.existsSync(localPath)) {
      fs.mkdirSync(localPath, { recursive: true });
    }
    return localPath;
  }

  const icloudBase = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs');
  const icloudPath = path.join(icloudBase, 'DropMemo');

  if (fs.existsSync(icloudBase)) {
    if (!fs.existsSync(icloudPath)) {
      fs.mkdirSync(icloudPath, { recursive: true });
    }
    return icloudPath;
  }

  if (!fs.existsSync(localPath)) {
    fs.mkdirSync(localPath, { recursive: true });
  }
  return localPath;
}

function getNotesFilePath() {
  return path.join(getStoragePath(), 'notes.json');
}

// ── 数据读写 ──
function loadNotes() {
  const filePath = getNotesFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('加载便签数据失败:', e);
  }
  return null;
}

function saveNotes(data) {
  const filePath = getNotesFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('保存便签数据失败:', e);
    return false;
  }
}

function loadSettings() {
  try {
    const filePath = path.join(app.getPath('userData'), 'config.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('加载设置失败:', e);
  }
  return { storageLocation: 'local' };
}

function saveSettings(data) {
  try {
    const filePath = path.join(app.getPath('userData'), 'config.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('保存设置失败:', e);
    return false;
  }
}

// ── 窗口创建 ──
function createWindow() {
  const display = screen.getPrimaryDisplay();
  const { width } = display.bounds;
  const menuBarHeight = display.workArea.y;

  mainWindow = new BrowserWindow({
    width: PANEL_WIDTH,
    height: PANEL_HEIGHT,
    x: Math.round((width - PANEL_WIDTH) / 2),
    y: menuBarHeight,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    show: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: false });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// ── 面板显示/隐藏 ──
function showPanel() {
  if (isVisible || isAnimating || !mainWindow) return;

  // 每次显示前重新计算位置，防止分辨率或多显示器配置变化导致位置错误
  const display = screen.getPrimaryDisplay();
  const { width, x: displayX } = display.bounds;
  const menuBarHeight = display.workArea.y;
  mainWindow.setPosition(
    displayX + Math.round((width - PANEL_WIDTH) / 2),
    menuBarHeight
  );
  mainWindow.setSize(PANEL_WIDTH, PANEL_HEIGHT);

  isAnimating = true;
  isVisible = true;

  mainWindow.show();
  mainWindow.webContents.send('panel-show');

  setTimeout(() => {
    isAnimating = false;
  }, SHOW_ANIMATION);
}

function hidePanel() {
  if (!isVisible || isAnimating || !mainWindow) return;
  isAnimating = true;

  mainWindow.webContents.send('panel-hide');

  setTimeout(() => {
    if (mainWindow) mainWindow.hide();
    isVisible = false;
    isAnimating = false;
  }, HIDE_ANIMATION);
}

// ── 鼠标追踪 ──
function startMouseTracking() {
  mouseCheckInterval = setInterval(() => {
    if (!mainWindow || isAnimating) return;

    const point = screen.getCursorScreenPoint();
    const display = screen.getPrimaryDisplay();
    const { width } = display.bounds;

    // 刘海热区
    const notchLeft = Math.round((width - NOTCH_ZONE_WIDTH) / 2);
    const notchRight = notchLeft + NOTCH_ZONE_WIDTH;
    const menuBarBottom = display.workArea.y;
    const inNotchZone = (
      point.x >= notchLeft &&
      point.x <= notchRight &&
      point.y >= 0 &&
      point.y <= menuBarBottom
    );

    // 面板区域
    let inPanel = false;
    if (isVisible && mainWindow) {
      const bounds = mainWindow.getBounds();
      inPanel = (
        point.x >= bounds.x &&
        point.x <= bounds.x + bounds.width &&
        point.y >= bounds.y &&
        point.y <= bounds.y + bounds.height
      );
    }

    if (inNotchZone || inPanel) {
      // 鼠标在热区或面板内
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (!isVisible && !enterTimeout) {
        enterTimeout = setTimeout(() => {
          showPanel();
          enterTimeout = null;
        }, TRIGGER_DELAY);
      }
    } else {
      // 鼠标离开
      if (enterTimeout) {
        clearTimeout(enterTimeout);
        enterTimeout = null;
      }
      if (isVisible && !hideTimeout && !isPinned) {
        hideTimeout = setTimeout(() => {
          hidePanel();
          hideTimeout = null;
        }, HIDE_DELAY);
      }
    }
  }, 16); // ~60fps
}

// ── Tray ──
function createTray() {
  const iconPath = path.join(__dirname, '..', 'logo.png');
  let icon = nativeImage.createFromPath(iconPath);
  if (!icon.isEmpty()) {
    icon = icon.resize({ width: 18, height: 18 });
  } else {
    icon = nativeImage.createEmpty();
  }

  tray = new Tray(icon);
  if (icon.isEmpty()) {
    tray.setTitle('📝');
  }
  tray.setToolTip('DropMemo - 刘海便签');

  const contextMenu = Menu.buildFromTemplate([
    { label: 'DropMemo — 刘海便签', enabled: false },
    { type: 'separator' },
    {
      label: '显示面板',
      click: () => showPanel(),
    },
    {
      label: '开机自启',
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (menuItem) => {
        app.setLoginItemSettings({ openAtLogin: menuItem.checked });
      },
    },
    { type: 'separator' },
    {
      label: '存储位置',
      enabled: false,
      sublabel: getStoragePath(),
    },
    { type: 'separator' },
    {
      label: '退出 DropMemo',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

// ── IPC 通信 ──
function setupIPC() {
  ipcMain.handle('load-notes', () => {
    return loadNotes();
  });

  ipcMain.handle('save-notes', (_, data) => {
    return saveNotes(data);
  });

  ipcMain.handle('load-settings', () => {
    return loadSettings();
  });

  ipcMain.handle('save-settings', (_, data) => {
    return saveSettings(data);
  });

  ipcMain.handle('export-markdown', async (_, { filename, content }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: '导出 Markdown',
      defaultPath: path.join(os.homedir(), 'Desktop', filename),
      filters: [{ name: 'Markdown', extensions: ['md'] }],
    });

    if (!result.canceled && result.filePath) {
      try {
        fs.writeFileSync(result.filePath, content, 'utf-8');
        return { success: true, path: result.filePath };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }
    return { success: false, error: '取消导出' };
  });

  ipcMain.handle('get-storage-path', () => {
    return getStoragePath();
  });

  // 面板锁定（编辑时不自动收起）
  ipcMain.on('lock-panel', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });

  // 置顶状态
  ipcMain.on('toggle-pin', (_, state) => {
    isPinned = state;
  });
}

// ── 应用生命周期 ──
app.whenReady().then(() => {
  createWindow();
  createTray();
  setupIPC();
  startMouseTracking();

  // 设置开机自启（默认开启）
  if (!app.getLoginItemSettings().wasOpenedAtLogin) {
    app.setLoginItemSettings({ openAtLogin: true });
  }
});

app.on('window-all-closed', () => {
  // macOS: 保持运行
});

app.on('before-quit', () => {
  if (mouseCheckInterval) {
    clearInterval(mouseCheckInterval);
  }
});

// 隐藏 Dock 图标
app.dock?.hide();
