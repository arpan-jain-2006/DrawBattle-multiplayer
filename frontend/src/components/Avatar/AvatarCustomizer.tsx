import React from 'react';
import {
  AvatarRenderer,
  AVATAR_COLORS,
  TOTAL_EYES,
  TOTAL_MOUTHS
} from './AvatarRenderer';
import { AvatarConfig } from '../../types/game';
import { ChevronLeft, ChevronRight, Dices } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface AvatarCustomizerProps {
  avatar: AvatarConfig;
  onChange: (avatar: AvatarConfig) => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ avatar, onChange }) => {
  const cycleEyes = (delta: number) => {
    sounds.playPop();
    const nextEyes = (avatar.eyes + delta + TOTAL_EYES) % TOTAL_EYES;
    onChange({ ...avatar, eyes: nextEyes });
  };

  const cycleMouth = (delta: number) => {
    sounds.playPop();
    const nextMouth = (avatar.mouth + delta + TOTAL_MOUTHS) % TOTAL_MOUTHS;
    onChange({ ...avatar, mouth: nextMouth });
  };

  const selectColor = (color: string) => {
    sounds.playPop();
    onChange({ ...avatar, color });
  };

  const randomize = () => {
    sounds.playPop();
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const randomEyes = Math.floor(Math.random() * TOTAL_EYES);
    const randomMouth = Math.floor(Math.random() * TOTAL_MOUTHS);
    onChange({ color: randomColor, eyes: randomEyes, mouth: randomMouth });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
      {/* Avatar with side controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px' }}>
        {/* Left eye/mouth stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            title="Previous Eyes"
            onClick={() => cycleEyes(-1)}
            className="btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            title="Previous Mouth"
            onClick={() => cycleMouth(-1)}
            className="btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Central Avatar Preview */}
        <div
          style={{
            position: 'relative',
            background: 'rgba(0, 0, 0, 0.25)',
            padding: '14px',
            borderRadius: '50%',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.1)',
            cursor: 'pointer'
          }}
          onClick={randomize}
          title="Click to randomize!"
        >
          <AvatarRenderer avatar={avatar} size={110} />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              randomize();
            }}
            title="Randomize Avatar"
            style={{
              position: 'absolute',
              bottom: 4,
              right: 4,
              background: 'var(--accent-yellow)',
              color: '#1a1a1a',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
              border: '2px solid #1a2238'
            }}
          >
            <Dices size={18} />
          </button>
        </div>

        {/* Right eye/mouth stepper */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            title="Next Eyes"
            onClick={() => cycleEyes(1)}
            className="btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          >
            <ChevronRight size={20} />
          </button>
          <button
            type="button"
            title="Next Mouth"
            onClick={() => cycleMouth(1)}
            className="btn-secondary"
            style={{ width: '38px', height: '38px', padding: 0, borderRadius: '50%' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Color Swatches */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '300px' }}>
        {AVATAR_COLORS.map((c) => {
          const isSelected = avatar.color === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => selectColor(c)}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: c,
                border: isSelected ? '3px solid #ffffff' : '2px solid rgba(0,0,0,0.3)',
                boxShadow: isSelected ? '0 0 10px rgba(255, 255, 255, 0.8)' : 'none',
                transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                transition: 'transform 0.15s ease'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
