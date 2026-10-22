import React, { useEffect } from 'react';
import { Player } from '../../types/game';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { sounds } from '../../utils/soundEffects';

interface RoundEndModalProps {
  word: string;
  roundScores: Record<string, number>;
  players: Player[];
  reason: 'timeout' | 'all_guessed';
  secondsRemaining: number;
}

export const RoundEndModal: React.FC<RoundEndModalProps> = ({
  word,
  roundScores,
  players,
  reason,
  secondsRemaining,
}) => {
  useEffect(() => {
    sounds.playFanfare();
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        backgroundColor: 'rgba(14, 19, 34, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        className="card animate-pop"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '32px 28px',
          textAlign: 'center',
          border: '3px solid var(--accent-green)',
        }}
      >
        <div style={{ fontSize: '1rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800 }}>
          {reason === 'all_guessed' ? '🎉 All Players Guessed!' : '⏰ Time\'s Up!'}
        </div>

        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          The word was:
        </h3>

        <div
          style={{
            fontSize: '2.4rem',
            fontWeight: 900,
            color: 'var(--accent-yellow)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            margin: '8px 0 24px',
          }}
        >
          {word}
        </div>

        {/* Round Scores Leaderboard */}
        <div
          style={{
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            maxHeight: '220px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          {players.map((player) => {
            const earned = roundScores[player.id] || 0;
            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: earned > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AvatarRenderer avatar={player.avatar} size={32} />
                  <span style={{ fontWeight: 700 }}>{player.name}</span>
                </div>
                <div style={{ fontWeight: 800, color: earned > 0 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                  {earned > 0 ? `+${earned} pts` : '0 pts'}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Next turn starts in <strong>{secondsRemaining}s</strong>...
        </p>
      </div>
    </div>
  );
};
