import React, { useState } from 'react';
import { RoomState, Player } from '../../types/game';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { Copy, Check, Play, Crown, CheckCircle2, Circle, LogOut, Settings } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface LobbyViewProps {
  roomState: RoomState;
  currentPlayer: Player;
  onStartGame: () => void;
  onToggleReady: (ready: boolean) => void;
  onUpdateSettings: (settings: any) => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  roomState,
  currentPlayer,
  onStartGame,
  onToggleReady,
  onUpdateSettings,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = currentPlayer.isHost;

  const copyInvite = () => {
    sounds.playPop();
    const url = `${window.location.origin}?room=${roomState.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = roomState.players.length >= 2;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 12px',
        maxWidth: '920px',
        margin: '0 auto',
        gap: '16px',
        width: '100%',
      }}
    >
      {/* Top Banner: Room Code & Invite */}
      <div
        className="card"
        style={{
          width: '100%',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px' }}>
            ROOM CODE
          </div>
          <div style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 900, color: 'var(--accent-yellow)', letterSpacing: '2px' }}>
            {roomState.id}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={copyInvite}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Link Copied!' : 'Invite Friends'}</span>
          </button>

          <button
            type="button"
            onClick={onLeaveRoom}
            className="btn-secondary"
            title="Leave Lobby"
            style={{ padding: '8px 12px' }}
          >
            <LogOut size={16} color="var(--accent-coral)" />
          </button>
        </div>
      </div>

      {/* Main Grid: Player Roster & Room Settings */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          width: '100%',
        }}
      >
        {/* Players Roster */}
        <div className="card" style={{ padding: 'clamp(16px, 3.5vw, 24px)', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '10px',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              👥 Players ({roomState.players.length}/{roomState.settings.maxPlayers})
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {canStart ? 'Ready!' : 'Need 2+ players'}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '10px',
              flex: 1,
            }}
          >
            {roomState.players.map((player) => {
              const isSelf = player.id === currentPlayer.id;
              return (
                <div
                  key={player.id}
                  style={{
                    background: isSelf ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                    border: isSelf ? '2px solid var(--accent-blue)' : '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                  }}
                >
                  {/* Host Crown */}
                  {player.isHost && (
                    <div
                      title="Room Host"
                      style={{
                        position: 'absolute',
                        top: 6,
                        left: 8,
                        color: 'var(--accent-yellow)',
                      }}
                    >
                      <Crown size={18} fill="var(--accent-yellow)" />
                    </div>
                  )}

                  {/* Ready Badge */}
                  <div
                    title={player.isReady ? 'Ready' : 'Not ready'}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 8,
                      color: player.isReady ? 'var(--accent-green)' : 'var(--text-muted)',
                    }}
                  >
                    {player.isReady ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </div>

                  <AvatarRenderer avatar={player.avatar} size={64} />

                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      textAlign: 'center',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {player.name} {isSelf && '(You)'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Player Ready & Start Game Actions */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            {!isHost && (
              <button
                type="button"
                onClick={() => {
                  sounds.playPop();
                  onToggleReady(!currentPlayer.isReady);
                }}
                className={currentPlayer.isReady ? 'btn-success' : 'btn-secondary'}
                style={{ flex: 1, padding: '12px' }}
              >
                {currentPlayer.isReady ? '✓ You are Ready' : 'Ready Up'}
              </button>
            )}

            {isHost && (
              <button
                type="button"
                disabled={!canStart}
                onClick={() => {
                  sounds.playPop();
                  onStartGame();
                }}
                className="btn-success"
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: '1.1rem',
                  opacity: canStart ? 1 : 0.6,
                }}
              >
                <Play size={20} fill="#ffffff" />
                <span>{canStart ? 'Start Game' : 'Waiting for Players (2 min)'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Room Settings Card */}
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '12px',
            }}
          >
            <Settings size={22} color="var(--accent-yellow)" />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Game Settings</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {/* Rounds */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Rounds</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-yellow)' }}>{roomState.settings.rounds}</span>
              </div>
              {isHost && (
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={roomState.settings.rounds}
                  onChange={(e) => onUpdateSettings({ rounds: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
                />
              )}
            </div>

            {/* Draw Time */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Draw Time</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-yellow)' }}>{roomState.settings.drawTime}s</span>
              </div>
              {isHost && (
                <input
                  type="range"
                  min={20}
                  max={180}
                  step={10}
                  value={roomState.settings.drawTime}
                  onChange={(e) => onUpdateSettings({ drawTime: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
                />
              )}
            </div>

            {/* Hints */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 700 }}>Hints</span>
                <span style={{ fontWeight: 800, color: 'var(--accent-yellow)' }}>
                  {roomState.settings.hints === 0 ? 'Disabled' : `${roomState.settings.hints} hints`}
                </span>
              </div>
              {isHost && (
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={roomState.settings.hints}
                  onChange={(e) => onUpdateSettings({ hints: Number(e.target.value) })}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
                />
              )}
            </div>

            {/* Custom Words */}
            {roomState.settings.customWords && roomState.settings.customWords.length > 0 && (
              <div
                style={{
                  background: 'var(--bg-surface)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '4px' }}>
                  Custom Words Active ({roomState.settings.customWords.length} words):
                </div>
                <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  {roomState.settings.customWords.slice(0, 10).join(', ')}
                  {roomState.settings.customWords.length > 10 ? '...' : ''}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
