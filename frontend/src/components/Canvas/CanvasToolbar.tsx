import React from 'react';
import { Pen, Eraser, Undo, Trash2 } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

export const CANVAS_PALETTE = [
  '#000000', '#ffffff', '#64748b', '#94a3b8',
  '#ef4444', '#b91c1c', '#f97316', '#c2410c',
  '#facc15', '#ca8a04', '#22c55e', '#15803d',
  '#06b6d4', '#0e7490', '#3b82f6', '#1d4ed8',
  '#a855f7', '#6b21a8', '#ec4899', '#9d174d',
  '#854d0e', '#59320e'
];

export const BRUSH_SIZES = [
  { label: 'S', size: 4 },
  { label: 'M', size: 8 },
  { label: 'L', size: 14 },
  { label: 'XL', size: 24 },
];

interface CanvasToolbarProps {
  tool: 'pen' | 'eraser';
  color: string;
  brushSize: number;
  onToolChange: (tool: 'pen' | 'eraser') => void;
  onColorChange: (color: string) => void;
  onSizeChange: (size: number) => void;
  onUndo: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  tool,
  color,
  brushSize,
  onToolChange,
  onColorChange,
  onSizeChange,
  onUndo,
  onClear,
  disabled = false,
}) => {
  if (disabled) return null;

  return (
    <div className="canvas-toolbar-container">
      {/* Left Section: Active Tool + Color Preview */}
      <div className="toolbar-section-left">
        {/* Active Color Preview Indicator */}
        <div
          title={`Active Color: ${color}`}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: color,
            border: '2px solid #ffffff',
            boxShadow: `0 0 8px ${color}80, inset 0 2px 4px rgba(0,0,0,0.3)`,
            flexShrink: 0,
          }}
        />

        {/* Tools: Pen & Eraser */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            title="Pen Tool"
            onClick={() => {
              sounds.playPop();
              onToolChange('pen');
            }}
            className={tool === 'pen' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
          >
            <Pen size={16} />
            <span className="toolbar-btn-text">Draw</span>
          </button>

          <button
            type="button"
            title="Eraser Tool"
            onClick={() => {
              sounds.playPop();
              onToolChange('eraser');
            }}
            className={tool === 'eraser' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
          >
            <Eraser size={16} />
            <span className="toolbar-btn-text">Eraser</span>
          </button>
        </div>
      </div>

      {/* Center Section: 22-Color Palette Grid */}
      <div className="toolbar-section-center">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(11, clamp(18px, 2.2vw, 24px))',
            gap: '3px',
            background: 'var(--bg-surface)',
            padding: '4px 6px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            touchAction: 'manipulation',
          }}
        >
          {CANVAS_PALETTE.map((c) => {
            const isSelected = tool === 'pen' && color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onToolChange('pen');
                  onColorChange(c);
                }}
                style={{
                  width: 'clamp(18px, 2.2vw, 24px)',
                  height: 'clamp(18px, 2.2vw, 24px)',
                  borderRadius: '4px',
                  backgroundColor: c,
                  border: isSelected ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.3)',
                  boxShadow: isSelected ? '0 0 8px #ffffff' : 'none',
                  transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                  zIndex: isSelected ? 2 : 1,
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'transform 0.1s ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Right Section: Brush Sizes & History Actions */}
      <div className="toolbar-section-right">
        {/* Brush Size Picker */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: 'var(--bg-surface)',
            padding: '3px 6px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)'
          }}
        >
          {BRUSH_SIZES.map((b) => {
            const isSelected = brushSize === b.size;
            return (
              <button
                key={b.size}
                type="button"
                title={`Brush Size ${b.label}`}
                onClick={() => {
                  sounds.playPop();
                  onSizeChange(b.size);
                }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? 'var(--accent-yellow)' : 'transparent',
                  color: isSelected ? '#1a1a1a' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: `${Math.min(b.size, 14)}px`,
                    height: `${Math.min(b.size, 14)}px`,
                    borderRadius: '50%',
                    background: isSelected ? '#1a1a1a' : '#ffffff',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Undo & Clear */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            title="Undo stroke"
            onClick={() => {
              sounds.playPop();
              onUndo();
            }}
            className="btn-secondary"
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}
          >
            <Undo size={15} />
            <span className="toolbar-btn-text">Undo</span>
          </button>

          <button
            type="button"
            title="Clear canvas"
            onClick={() => {
              sounds.playPop();
              onClear();
            }}
            className="btn-danger"
            style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
          >
            <Trash2 size={15} />
            <span className="toolbar-btn-text">Clear</span>
          </button>
        </div>
      </div>
    </div>
  );
};
