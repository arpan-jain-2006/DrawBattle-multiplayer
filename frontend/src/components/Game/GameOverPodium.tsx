import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../../types/game';
import { AvatarRenderer } from '../Avatar/AvatarRenderer';
import { Trophy, Crown, RotateCcw } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface GameOverPodiumProps {
  leaderboard: Player[];
  isHost: boolean;
  onPlayAgain: () => void;
}

export const GameOverPodium: React.FC<GameOverPodiumProps> = ({
  leaderboard,
  isHost,
  onPlayAgain,
}) => {
  useEffect(() => {
    sounds.playFanfare();

    // Fire celebratory confetti cannons!
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffd13b', '#38bdf8', '#10b981', '#f43f5e', '#a855f7'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffd13b', '#38bdf8', '#10b981', '#f43f5e', '#a855f7'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        backgroundColor: 'rgba(14, 19, 34, 0.92)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        className="card animate-pop"
        style={{
          width: '100%',
          maxWidth: '640px',
          padding: 'clamp(20px, 4vw, 36px) clamp(14px, 3.5vw, 28px)',
          textAlign: 'center',
          border: '3px solid var(--accent-yellow)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <Trophy size={42} color="var(--accent-yellow)" />
        </div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', fontWeight: 900, marginBottom: '6px' }}>
          Game Over!
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Congratulations to our champion and artists!
        </p>

        {/* 3-Step Podium */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 'clamp(6px, 2vw, 16px)',
            marginBottom: '28px',
            minHeight: '200px',
          }}
        >
          {/* 2nd Place */}
          {second && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <AvatarRenderer avatar={second.avatar} size={58} />
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '6px' }}>{second.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{second.score} pts</div>
              <div
                style={{
                  width: '100%',
                  height: '90px',
                  background: 'linear-gradient(to top, #475569, #94a3b8)',
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.8rem',
                  color: '#ffffff',
                  marginTop: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                2
              </div>
            </div>
          )}

          {/* 1st Place */}
          {first && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1.2,
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    color: 'var(--accent-yellow)',
                  }}
                >
                  <Crown size={28} fill="var(--accent-yellow)" />
                </div>
                <AvatarRenderer avatar={first.avatar} size={76} />
              </div>

              <div style={{ fontWeight: 900, fontSize: '1.15rem', color: 'var(--accent-yellow)', marginTop: '8px' }}>
                {first.name}
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{first.score} pts</div>
              <div
                style={{
                  width: '100%',
                  height: '130px',
                  background: 'linear-gradient(to top, #ca8a04, #facc15)',
                  borderRadius: '16px 16px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '2.4rem',
                  color: '#1a1a1a',
                  marginTop: '10px',
                  boxShadow: '0 6px 16px rgba(250, 204, 21, 0.4)',
                }}
              >
                1
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
              }}
            >
              <AvatarRenderer avatar={third.avatar} size={54} />
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '6px' }}>{third.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{third.score} pts</div>
              <div
                style={{
                  width: '100%',
                  height: '65px',
                  background: 'linear-gradient(to top, #9a3412, #ea580c)',
                  borderRadius: '12px 12px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  color: '#ffffff',
                  marginTop: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                3
              </div>
            </div>
          )}
        </div>

        {/* Action Button: Play Again */}
        {isHost ? (
          <button
            type="button"
            onClick={() => {
              sounds.playPop();
              onPlayAgain();
            }}
            className="btn-primary"
            style={{ padding: '14px 28px', fontSize: '1.15rem' }}
          >
            <RotateCcw size={20} />
            <span>Play Again</span>
          </button>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Waiting for the host to start another match...
          </p>
        )}
      </div>
    </div>
  );
};
