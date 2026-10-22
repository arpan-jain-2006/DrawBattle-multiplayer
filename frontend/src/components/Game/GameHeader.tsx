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

  const isTimeCritical = secondsRemaining <= 10 && secondsRemaining > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'var(--bg-secondary)',
        border: '2px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Timer Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          className={isTimeCritical ? 'animate-glow' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isTimeCritical ? 'var(--accent-coral)' : 'var(--bg-surface)',
            color: isTimeCritical ? '#ffffff' : 'var(--accent-yellow)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            border: isTimeCritical ? '2px solid #fda4af' : '1px solid var(--border-light)',
            fontWeight: 800,
            fontSize: '1.2rem',
            minWidth: '95px',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock size={20} />
          <span>{secondsRemaining}s</span>
        </div>

        {/* Round Badge */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
          }}
        >
          Round <strong style={{ color: 'var(--text-main)' }}>{round}</strong> of {totalRounds}
        </div>
      </div>

      {/* Center: Word Blanks / Secret Word */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minWidth: '220px',
        }}
      >
        {isDrawer && drawerWord ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-yellow)', letterSpacing: '1px', fontWeight: 700 }}>
              YOUR WORD TO DRAW
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '2px' }}>
              {drawerWord.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                letterSpacing: '6px',
                color: 'var(--accent-yellow)',
                fontFamily: 'monospace',
              }}
            >
              {maskedWord || '_ '.repeat(wordLength).trim()}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {wordLength > 0 ? `${wordLength} letters` : 'Guess the drawing!'}
            </div>
          </div>
        )}
      </div>

      {/* Right: Room Code & Leave */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={copyRoomLink}
          className="btn-secondary"
          title="Copy room invite link"
          style={{ padding: '8px 14px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          {copied ? <Check size={16} color="var(--accent-green)" /> : <Copy size={16} />}
          <span>{copied ? 'Copied!' : roomId}</span>
        </button>

        <button
          type="button"
          onClick={onLeaveRoom}
          className="btn-secondary"
          title="Leave Game"
          style={{ padding: '8px 12px' }}
        >
          <LogOut size={16} color="var(--accent-coral)" />
        </button>
      </div>
    </div>
  );
};
