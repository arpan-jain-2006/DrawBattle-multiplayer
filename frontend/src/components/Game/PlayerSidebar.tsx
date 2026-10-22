import React from 'react';
import { Player } from '../../types/game';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { Crown, Pen, CheckCircle2, Sparkles } from 'lucide-react';

interface PlayerSidebarProps {
  players: Player[];
  currentDrawerId: string | null;
  phase: string;
}

export const PlayerSidebar: React.FC<PlayerSidebarProps> = ({
  players,
  currentDrawerId,
  phase,
}) => {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return <span style={{ color: '#ffd13b', fontWeight: 800 }}>#1</span>;
      case 1:
        return <span style={{ color: '#cbd5e1', fontWeight: 800 }}>#2</span>;
      case 2:
        return <span style={{ color: '#f97316', fontWeight: 800 }}>#3</span>;
      default:
        return <span style={{ color: 'var(--text-muted)' }}>#{index + 1}</span>;
    }
  };

  return (
    <div className="player-sidebar-container">
      {/* Sidebar Header */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          borderBottom: '2px solid var(--border-card)',
          fontWeight: 700,
          fontSize: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>🏆 Players</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--accent-yellow)', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '12px' }}>
          {players.length} online
        </span>
      </div>

      {/* Players List */}
      <div
        style={{
          flex: 1,
          padding: '10px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {sortedPlayers.map((player, index) => {
          const isDrawer = player.id === currentDrawerId && phase === 'DRAWING';
          const hasGuessed = player.hasGuessed && phase === 'DRAWING';

          return (
            <div
              key={player.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: 'var(--radius-md)',
                background: hasGuessed
                  ? 'rgba(16, 185, 129, 0.15)'
                  : isDrawer
                  ? 'rgba(255, 209, 59, 0.15)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: hasGuessed
                  ? '1px solid var(--accent-green)'
                  : isDrawer
                  ? '1px solid var(--accent-yellow)'
                  : '1px solid var(--border-subtle)',
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Rank */}
              <div style={{ width: '22px', fontSize: '0.85rem', textAlign: 'center' }}>
                {getRankBadge(index)}
              </div>

              {/* Avatar */}
              <div style={{ position: 'relative' }}>
                <AvatarRenderer avatar={player.avatar} size={42} />
                {player.isHost && (
                  <div
                    title="Room Host"
                    style={{
                      position: 'absolute',
                      top: -6,
                      left: -6,
                      background: '#ffd13b',
                      borderRadius: '50%',
                      padding: '2px',
                      color: '#1a1a1a',
                      display: 'flex',
                    }}
                  >
                    <Crown size={12} fill="#1a1a1a" />
                  </div>
                )}
              </div>

              {/* Player Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{player.name}</span>
                </div>

                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                  }}
                >
                  {player.score} pts
                </div>
              </div>

              {/* Status Badge: Drawing or Guessed */}
              {isDrawer && (
                <div
                  title="Drawing now"
                  style={{
                    background: 'var(--accent-yellow)',
                    color: '#1a1a1a',
                    padding: '4px',
                    borderRadius: '50%',
                    display: 'flex',
                  }}
                >
                  <Pen size={14} />
                </div>
              )}

              {hasGuessed && (
                <div
                  title="Guessed correctly!"
                  style={{
                    color: 'var(--accent-green)',
                    display: 'flex',
                  }}
                >
                  <CheckCircle2 size={18} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sleek Bottom Widget (Eliminates dead empty void when few players) */}
      <div
        style={{
          marginTop: 'auto',
          padding: '12px 14px',
          background: 'rgba(0, 0, 0, 0.25)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-yellow)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <Sparkles size={13} color="var(--accent-yellow)" />
          <span>PRO TIP</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.35', margin: 0 }}>
          {phase === 'DRAWING'
            ? '⚡ Faster guesses score up to 500 bonus points!'
            : '🎨 Get ready to sketch or guess in the next round!'}
        </p>
      </div>
    </div>
  );
};
