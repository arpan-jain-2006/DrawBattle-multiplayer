import React, { useState, useEffect } from 'react';
import { AvatarConfig, RoomSettings } from '../../types/game';
import { AvatarCustomizer } from '../Avatar/AvatarCustomizer';
import { PlusCircle, LogIn, Sparkles, Paintbrush, Trophy } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface HomeViewProps {
  avatar: AvatarConfig;
  onAvatarChange: (avatar: AvatarConfig) => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  onCreateRoom: (settings: Partial<RoomSettings>) => void;
  onJoinRoom: (roomId: string) => void;
  initialRoomCode?: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  avatar,
  onAvatarChange,
  playerName,
  onPlayerNameChange,
  onCreateRoom,
  onJoinRoom,
  initialRoomCode = '',
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings for room creation
  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(80);
  const [hints, setHints] = useState(2);
  const [customWords, setCustomWords] = useState('');

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
    }
  }, [initialRoomCode]);

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();

    const parsedCustomWords = customWords
      .split(',')
      .map((w) => w.trim())
      .filter((w) => w.length > 1);

    onCreateRoom({
      rounds,
      drawTime,
      hints,
      customWords: parsedCustomWords,
      isPrivate: true,
    });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    sounds.playPop();
    onJoinRoom(roomCode.trim().toUpperCase());
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 12px',
        maxWidth: '880px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      {/* Hero Title */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Paintbrush size={32} color="var(--accent-yellow)" className="animate-bounce-slow" />
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 8vw, 3.4rem)',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #ffd13b, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
            }}
          >
            Drawbattle
          </h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.95rem, 3vw, 1.1rem)', marginTop: '4px' }}>
          Multiplayer Drawing & Guessing Battle Arena
        </p>
      </div>

      {/* Main Player Profile & Join Card */}
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: 'clamp(20px, 4vw, 30px) clamp(16px, 3.5vw, 24px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Avatar Customizer */}
        <AvatarCustomizer avatar={avatar} onChange={onAvatarChange} />

        {/* Name Input */}
        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
            YOUR NICKNAME
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => onPlayerNameChange(e.target.value)}
            placeholder="Enter your name"
            maxLength={18}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-light)',
              color: 'var(--text-main)',
              fontSize: '1.1rem',
              fontWeight: 700,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              setShowSettingsModal(true);
            }}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.15rem' }}
          >
            <PlusCircle size={20} />
            <span>Create Private Room</span>
          </button>

          {/* Join with Code */}
          <form onSubmit={handleJoin} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="ROOM CODE"
              maxLength={8}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-main)',
                fontSize: '1.05rem',
                fontWeight: 800,
                letterSpacing: '2px',
                textAlign: 'center',
              }}
            />
            <button
              type="submit"
              disabled={!roomCode.trim()}
              className="btn-secondary"
              style={{ padding: '12px 20px', fontWeight: 700 }}
            >
              <LogIn size={18} />
              <span>Join</span>
            </button>
          </form>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          width: '100%',
          marginTop: '36px',
        }}
      >
        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <Paintbrush size={32} color="var(--accent-yellow)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Turn-Based Drawing</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Expressive brush, 22-color palette, eraser, undo, and smooth 60fps real-time vector canvas.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <Sparkles size={32} color="var(--accent-green)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Smart Guessing</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Instant matching, anti-spoil winner chat, and "You are close!" fuzzy spell detection.
          </p>
        </div>

        <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
          <Trophy size={32} color="var(--accent-blue)" style={{ margin: '0 auto 10px' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '6px' }}>Podium & Scoring</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Dynamic speed bonus scoring, timed letter hints, confetti celebration, and champion podium!
          </p>
        </div>
      </div>

      {/* Room Configuration Modal */}
      {showSettingsModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
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
              maxWidth: '480px',
              padding: 'clamp(18px, 4vw, 28px)',
              border: '2px solid var(--accent-yellow)',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
          >
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '18px' }}>
              ⚙️ Room Settings
            </h2>

            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Rounds */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  ROUNDS ({rounds})
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
                />
              </div>

              {/* Draw Time */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  DRAW TIME ({drawTime} seconds)
                </label>
                <input
                  type="range"
                  min={20}
                  max={180}
                  step={10}
                  value={drawTime}
                  onChange={(e) => setDrawTime(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
                />
              </div>

              {/* Hints */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  HINTS ({hints === 0 ? 'Disabled' : `${hints} hints`})
                </label>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={hints}
                  onChange={(e) => setHints(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--accent-yellow)' }}
                />
              </div>

              {/* Custom Words */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  CUSTOM WORDS (Optional, comma-separated)
                </label>
                <textarea
                  value={customWords}
                  onChange={(e) => setCustomWords(e.target.value)}
                  placeholder="batman, pizza, taj mahal, super mario"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    resize: 'none',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
