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
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '10px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '2px solid var(--border-card)',
        borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
      }}
    >
      {/* Primary Tools: Pen & Eraser */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          title="Pen"
          onClick={() => {
            sounds.playPop();
            onToolChange('pen');
          }}
          className={tool === 'pen' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
        >
          <Pen size={18} />
          <span>Draw</span>
        </button>

        <button
          type="button"
          title="Eraser"
          onClick={() => {
            sounds.playPop();
            onToolChange('eraser');
          }}
          className={tool === 'eraser' ? 'btn-primary' : 'btn-secondary'}
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
        >
          <Eraser size={18} />
          <span>Eraser</span>
        </button>
      </div>

      {/* Brush Size Picker */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-surface)',
          padding: '4px 8px',
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
              title={`Size ${b.label}`}
              onClick={() => {
                sounds.playPop();
                onSizeChange(b.size);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isSelected ? 'var(--accent-yellow)' : 'transparent',
                color: isSelected ? '#1a1a1a' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              <div
                style={{
                  width: `${b.size}px`,
                  height: `${b.size}px`,
                  borderRadius: '50%',
                  background: isSelected ? '#1a1a1a' : '#ffffff',
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Color Palette Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(11, 22px)',
          gap: '4px',
          background: 'var(--bg-surface)',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-light)'
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
                width: '22px',
                height: '22px',
                borderRadius: '4px',
                backgroundColor: c,
                border: isSelected ? '2px solid #ffffff' : '1px solid rgba(0,0,0,0.4)',
                boxShadow: isSelected ? '0 0 6px #ffffff' : 'none',
                transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                zIndex: isSelected ? 2 : 1,
              }}
            />
          );
        })}
      </div>

      {/* Action Tools: Undo & Clear */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          title="Undo last stroke"
          onClick={() => {
            sounds.playPop();
            onUndo();
          }}
          className="btn-secondary"
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}
        >
          <Undo size={18} />
          <span>Undo</span>
        </button>

        <button
          type="button"
          title="Clear canvas"
          onClick={() => {
            sounds.playPop();
            onClear();
          }}
          className="btn-danger"
          style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
};
