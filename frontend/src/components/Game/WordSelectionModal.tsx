import React from 'react';
import { sounds } from '../../utils/soundEffects';

interface WordSelectionModalProps {
  isDrawer: boolean;
  drawerName?: string;
  choices: string[];
  secondsRemaining: number;
  onChooseWord: (word: string) => void;
}

export const WordSelectionModal: React.FC<WordSelectionModalProps> = ({
  isDrawer,
  drawerName = 'Drawer',
  choices,
  secondsRemaining,
  onChooseWord,
}) => {
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
          padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3.5vw, 28px)',
          textAlign: 'center',
          border: '3px solid var(--accent-yellow)',
        }}
      >
        {isDrawer ? (
          <>
            <div
              style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                color: 'var(--accent-yellow)',
                fontWeight: 800,
                letterSpacing: '1px',
                marginBottom: '4px',
              }}
            >
              YOUR TURN TO DRAW!
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900, marginBottom: '6px' }}>
              Choose a Word
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Select a word before time runs out ({secondsRemaining}s)
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {choices && choices.length > 0 ? (
                choices.map((word) => (
                  <button
                    key={word}
                    type="button"
                    onClick={() => {
                      sounds.playPop();
                      onChooseWord(word);
                    }}
                    className="btn-primary"
                    style={{
                      padding: '16px 24px',
                      fontSize: '1.3rem',
                      textTransform: 'capitalize',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    {word}
                  </button>
                ))
              ) : (
                <div style={{ color: 'var(--text-muted)', padding: '20px', fontSize: '1.1rem' }}>
                  Loading word choices...
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <div className="animate-bounce-slow" style={{ fontSize: '3.5rem', marginBottom: '16px' }}>
              🤔
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '10px' }}>
              <span style={{ color: 'var(--accent-yellow)' }}>{drawerName}</span> is choosing a word...
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              Get ready to guess in <strong>{secondsRemaining}s</strong>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
