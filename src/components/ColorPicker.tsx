import { TEXT_COLORS } from './Toolbar';

interface ColorPickerProps {
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

export default function ColorPicker({ currentColor, onSelect, onClose }: ColorPickerProps) {
  return (
    <div className="color-picker-overlay" onClick={onClose}>
      <div className="color-picker" onClick={(e) => e.stopPropagation()}>
        <div className="color-picker-title">字体颜色</div>
        <div className="color-grid">
          {TEXT_COLORS.map((c) => (
            <button
              key={c.name}
              className={`color-dot ${currentColor === c.color ? 'active' : ''}`}
              style={{ backgroundColor: c.color || '#ffffff' }}
              onClick={() => {
                onSelect(c.color);
                onClose();
              }}
              title={c.name}
            >
              {currentColor === c.color && '✓'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
