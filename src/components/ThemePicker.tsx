interface ThemePickerProps {
  currentTheme: ThemeKey;
  onSelect: (theme: ThemeKey) => void;
  onClose: () => void;
}

export interface ThemeColors {
  key: ThemeKey;
  name: string;
  bgPrimary: string;
  bgSecondary: string;
  bgHover: string;
  bgActive: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  accentColor: string;
  shadow: string;
}

const THEMES: ThemeColors[] = [
  {
    key: 'dark',
    name: '深夜黑',
    bgPrimary: '#1a1a2e',
    bgSecondary: 'rgba(255, 255, 255, 0.06)',
    bgHover: 'rgba(255, 255, 255, 0.1)',
    bgActive: 'rgba(255, 255, 255, 0.15)',
    textPrimary: '#e0e0e0',
    textSecondary: 'rgba(255, 255, 255, 0.5)',
    textMuted: 'rgba(255, 255, 255, 0.3)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    accentColor: '#6c5ce7',
    shadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
  },
  {
    key: 'paper',
    name: '纸质白',
    bgPrimary: '#f5f0e8',
    bgSecondary: 'rgba(0, 0, 0, 0.04)',
    bgHover: 'rgba(0, 0, 0, 0.07)',
    bgActive: 'rgba(0, 0, 0, 0.1)',
    textPrimary: '#2c2c2c',
    textSecondary: 'rgba(0, 0, 0, 0.5)',
    textMuted: 'rgba(0, 0, 0, 0.3)',
    borderColor: 'rgba(0, 0, 0, 0.08)',
    accentColor: '#5b4fcf',
    shadow: '0 25px 60px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.06)',
  },
  {
    key: 'sticky',
    name: '便签黄',
    bgPrimary: '#FEF3B5',
    bgSecondary: 'rgba(0, 0, 0, 0.04)',
    bgHover: 'rgba(0, 0, 0, 0.06)',
    bgActive: 'rgba(0, 0, 0, 0.09)',
    textPrimary: '#4a3f2f',
    textSecondary: 'rgba(74, 63, 47, 0.6)',
    textMuted: 'rgba(74, 63, 47, 0.35)',
    borderColor: 'rgba(74, 63, 47, 0.1)',
    accentColor: '#c8952e',
    shadow: '0 25px 60px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(200, 180, 100, 0.3)',
  },
];

export { THEMES };

export default function ThemePicker({ currentTheme, onSelect, onClose }: ThemePickerProps) {
  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="theme-picker" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker-title">背景主题</div>
        <div className="theme-grid">
          {THEMES.map((t) => (
            <button
              key={t.key}
              className={`theme-option ${currentTheme === t.key ? 'active' : ''}`}
              onClick={() => {
                onSelect(t.key);
                onClose();
              }}
            >
              <span className="theme-preview" style={{ backgroundColor: t.bgPrimary }} />
              <span className="theme-name">{t.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
