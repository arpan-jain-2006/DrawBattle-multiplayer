import { useState, useEffect } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { HomeView } from './components/Lobby/HomeView';
import { LobbyView } from './components/Lobby/LobbyView';
import { GameView } from './components/Game/GameView';
import { AvatarConfig, RoomSettings } from './types/game';
import { AlertCircle, X } from 'lucide-react';

export function App() {
  // Stored avatar configuration
  const [avatar, setAvatar] = useState<AvatarConfig>(() => {
    const saved = localStorage.getItem('skribbl_avatar');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { color: '#FFD13B', eyes: 0, mouth: 0 };
  });

  // Stored player nickname
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('skribbl_nickname') || 'Guest';
  });

  // Check URL query param for invite link: ?room=XYZ
  const [initialRoomCode, setInitialRoomCode] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInitialRoomCode(roomParam.toUpperCase());
    }
  }, []);

  const handleAvatarChange = (newAvatar: AvatarConfig) => {
    setAvatar(newAvatar);
    localStorage.setItem('skribbl_avatar', JSON.stringify(newAvatar));
  };

  const handlePlayerNameChange = (name: string) => {
    setPlayerName(name);
    localStorage.setItem('skribbl_nickname', name);
  };

  const {
    roomState,
    currentPlayer,
    messages,
    strokeHistory,
    incomingStroke,
    wordChoices,
    selectionSeconds,
    drawerWord,
    roundEndData,
    gameOverData,
    errorMessage,
    createRoom,
    joinRoom,
    updateSettings,
    toggleReady,
    startGame,
    chooseWord,
    emitStroke,
    emitClear,
    emitUndo,
    sendMessage,
    resetGame,
    leaveRoom,
    clearError,
  } = useGameSocket();

  const handleCreateRoom = (settings: Partial<RoomSettings>) => {
    createRoom(
      {
        name: playerName.trim() || 'Player',
        avatar,
      },
      settings
    );
  };

  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId, {
      name: playerName.trim() || 'Player',
      avatar,
    });
  };

  const isDrawer = Boolean(currentPlayer && roomState?.currentDrawerId === currentPlayer.id);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Error Banner */}
      {errorMessage && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            background: 'var(--accent-coral)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
          }}
        >
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={clearError}
            style={{ background: 'transparent', color: '#ffffff', display: 'flex', marginLeft: '6px' }}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Screen Router */}
      {!roomState || !currentPlayer ? (
        <HomeView
          avatar={avatar}
          onAvatarChange={handleAvatarChange}
          playerName={playerName}
          onPlayerNameChange={handlePlayerNameChange}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          initialRoomCode={initialRoomCode}
        />
      ) : roomState.phase === 'LOBBY' ? (
        <LobbyView
          roomState={roomState}
          currentPlayer={currentPlayer}
          onStartGame={startGame}
          onToggleReady={toggleReady}
          onUpdateSettings={updateSettings}
          onLeaveRoom={leaveRoom}
        />
      ) : (
        <GameView
          roomState={roomState}
          currentPlayer={currentPlayer}
          isDrawer={isDrawer}
          drawerWord={drawerWord}
          wordChoices={wordChoices}
          selectionSeconds={selectionSeconds}
          strokeHistory={strokeHistory}
          incomingStroke={incomingStroke}
          messages={messages}
          roundEndData={roundEndData}
          gameOverData={gameOverData}
          onEmitStroke={emitStroke}
          onEmitClear={emitClear}
          onEmitUndo={emitUndo}
          onSendMessage={sendMessage}
          onChooseWord={chooseWord}
          onPlayAgain={resetGame}
          onLeaveRoom={leaveRoom}
        />
      )}
    </div>
  );
}

export default App;
