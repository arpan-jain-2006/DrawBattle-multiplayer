import React, { useEffect, useState } from 'react';
import { Clock, Copy, Check, LogOut } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface GameHeaderProps {
  roomId: string;
  round: number;
  totalRounds: number;
  secondsRemaining: number;
  isDrawer: boolean;
  drawerWord?: string;
  maskedWord: string;
  wordLength: number;
  onLeaveRoom: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  roomId,
  round,
  totalRounds,
  secondsRemaining,
  isDrawer,
  drawerWord,
  maskedWord,
  wordLength,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  // Sound warning on countdown < 6 seconds
  useEffect(() => {
    if (secondsRemaining > 0 && secondsRemaining <= 5) {
      sounds.playTick();
    }
  }, [secondsRemaining]);

  const copyRoomLink = () => {
    sounds.playPop();
    const url = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const safeSeconds = Math.max(0, secondsRemaining);
  const isTimeCritical = safeSeconds <= 10 && safeSeconds > 0;

  return (
    <div className="game-header-bar">
      {/* Left: Timer Badge & Round */}
      <div className="header-section-left">
        <div
          className={isTimeCritical ? 'animate-glow' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isTimeCritical ? 'var(--accent-coral)' : 'rgba(255, 209, 59, 0.12)',
            color: isTimeCritical ? '#ffffff' : 'var(--accent-yellow)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            border: isTimeCritical ? '2px solid #fda4af' : '1.5px solid rgba(255, 209, 59, 0.4)',
            fontWeight: 800,
            fontSize: '1.05rem',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: isTimeCritical ? '0 0 12px rgba(244, 63, 94, 0.6)' : '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <Clock size={17} />
          <span>{safeSeconds}s</span>
        </div>

        {/* Round Badge */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          Round <strong style={{ color: 'var(--text-main)' }}>{round}</strong> / {totalRounds}
        </div>
      </div>

      {/* Center: Word Blanks / Secret Word */}
      <div className="header-section-center">
        {isDrawer && drawerWord ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--accent-yellow)', letterSpacing: '1.5px', fontWeight: 800 }}>
              ✏️ YOUR WORD TO DRAW
            </div>
            <div
              style={{
                fontSize: 'clamp(1.2rem, 4.5vw, 1.75rem)',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '2px',
                textShadow: '0 0 14px rgba(255, 209, 59, 0.5)',
              }}
            >
              {drawerWord.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div className="game-word-text">
              {maskedWord || '_ '.repeat(wordLength).trim()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
              {wordLength > 0 ? `${wordLength} letters` : 'Guess the drawing!'}
            </div>
          </div>
        )}
      </div>

      {/* Right: Room Code & Leave */}
      <div className="header-section-right">
        <button
          type="button"
          onClick={copyRoomLink}
          className="btn-secondary"
          title="Copy room invite link"
          style={{ padding: '6px 10px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          {copied ? <Check size={15} color="var(--accent-green)" /> : <Copy size={15} />}
          <span>{copied ? 'Copied!' : roomId}</span>
        </button>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="btn-secondary"
          title="Leave Game"
          style={{ padding: '6px 10px' }}
        >
          <LogOut size={15} color="var(--accent-coral)" />
        </button>
      </div>
    </div>
  );
};
