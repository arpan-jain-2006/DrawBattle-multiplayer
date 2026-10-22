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
    <div className="game-header-bar">
      {/* Left: Timer Badge & Round */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          className={isTimeCritical ? 'animate-glow' : ''}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isTimeCritical ? 'var(--accent-coral)' : 'var(--bg-surface)',
            color: isTimeCritical ? '#ffffff' : 'var(--accent-yellow)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: isTimeCritical ? '2px solid #fda4af' : '1px solid var(--border-light)',
            fontWeight: 800,
            fontSize: '1.05rem',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Clock size={17} />
          <span>{secondsRemaining}s</span>
        </div>

        {/* Round Badge */}
        <div
          style={{
            background: 'var(--bg-surface)',
            padding: '5px 10px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--text-muted)',
            whiteSpace: 'nowrap',
          }}
        >
          Round <strong style={{ color: 'var(--text-main)' }}>{round}</strong>/{totalRounds}
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
          minWidth: '140px',
        }}
      >
        {isDrawer && drawerWord ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-yellow)', letterSpacing: '1px', fontWeight: 700 }}>
              YOUR WORD
            </div>
            <div style={{ fontSize: 'clamp(1.1rem, 4.5vw, 1.6rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>
              {drawerWord.toUpperCase()}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div className="game-word-text">
              {maskedWord || '_ '.repeat(wordLength).trim()}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {wordLength > 0 ? `${wordLength} letters` : 'Guess the word!'}
            </div>
          </div>
        )}
      </div>

      {/* Right: Room Code & Leave */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
