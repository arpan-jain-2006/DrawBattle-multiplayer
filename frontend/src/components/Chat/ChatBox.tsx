import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types/game';
import { Send, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ChatBoxProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isDrawer: boolean;
  hasGuessed: boolean;
  phase: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  messages,
  onSendMessage,
  isDrawer,
  hasGuessed,
  phase,
}) => {
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(sounds.isMuted);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio cue on correct guess
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.type === 'guess_correct') {
        sounds.playChime();
      }
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;

    onSendMessage(text);
    setInputText('');
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const getPlaceholder = () => {
    if (phase !== 'DRAWING') return 'Type message...';
    if (isDrawer) return 'Chat with guessers...';
    if (hasGuessed) return 'Chat with players...';
    return 'Type your guess here...';
  };

  return (
    <div className="chat-box-container">
      {/* Chat Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          borderBottom: '2px solid var(--border-card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
          <span>💬 Game Chat</span>
        </div>

        <button
          type="button"
          onClick={toggleSound}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="btn-secondary"
          style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div
        style={{
          flex: 1,
          padding: '12px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', margin: 'auto' }}>
            No messages yet. Send a message or guess!
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'guess_correct') {
              return (
                <div
                  key={msg.id}
                  style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid var(--accent-green)',
                    color: '#6ee7b7',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Sparkles size={16} color="var(--accent-green)" />
                  <span>{msg.text}</span>
                </div>
              );
            }

            if (msg.type === 'close') {
              return (
                <div
                  key={msg.id}
                  style={{
                    background: 'rgba(250, 204, 21, 0.15)',
                    border: '1px solid var(--accent-yellow)',
                    color: '#fde047',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  💡 {msg.text}
                </div>
              );
            }

            if (msg.type === 'system') {
              return (
                <div
                  key={msg.id}
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    textAlign: 'center',
                    padding: '4px',
                    fontStyle: 'italic',
                  }}
                >
                  {msg.text}
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  wordBreak: 'break-word',
                }}
              >
                <strong style={{ color: 'var(--accent-blue)', marginRight: '6px' }}>
                  {msg.senderName}:
                </strong>
                <span>{msg.text}</span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '8px',
          padding: '10px',
          background: 'var(--bg-surface)',
          borderTop: '2px solid var(--border-card)',
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={getPlaceholder()}
          maxLength={60}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: hasGuessed ? '2px solid var(--accent-green)' : '1px solid var(--border-light)',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
          }}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="btn-primary"
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
