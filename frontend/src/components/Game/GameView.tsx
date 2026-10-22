import React from 'react';
import { RoomState, Player, StrokeCommand, ChatMessage } from '../../types/game';
import { GameHeader } from './GameHeader';
import { PlayerSidebar } from './PlayerSidebar';
import { DrawingCanvas } from '../Canvas/DrawingCanvas';
import { ChatBox } from '../Chat/ChatBox';
import { WordSelectionModal } from './WordSelectionModal';
import { RoundEndModal } from './RoundEndModal';
import { GameOverPodium } from './GameOverPodium';

interface GameViewProps {
  roomState: RoomState;
  currentPlayer: Player;
  isDrawer: boolean;
  drawerWord?: string;
  wordChoices: string[];
  selectionSeconds: number;
  strokeHistory: StrokeCommand[];
  incomingStroke: StrokeCommand | null;
  messages: ChatMessage[];
  roundEndData: {
    word: string;
    roundScores: Record<string, number>;
    reason: 'timeout' | 'all_guessed';
  } | null;
  gameOverData: {
    leaderboard: Player[];
    winner: Player;
  } | null;
  onEmitStroke: (stroke: StrokeCommand) => void;
  onEmitClear: () => void;
  onEmitUndo: () => void;
  onSendMessage: (text: string) => void;
  onChooseWord: (word: string) => void;
  onPlayAgain: () => void;
  onLeaveRoom: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  roomState,
  currentPlayer,
  isDrawer,
  drawerWord,
  wordChoices,
  selectionSeconds,
  strokeHistory,
  incomingStroke,
  messages,
  roundEndData,
  gameOverData,
  onEmitStroke,
  onEmitClear,
  onEmitUndo,
  onSendMessage,
  onChooseWord,
  onPlayAgain,
  onLeaveRoom,
}) => {
  const currentDrawer = roomState.players.find((p) => p.id === roomState.currentDrawerId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxWidth: '1500px',
        margin: '0 auto',
        padding: '12px 16px',
        gap: '12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header Bar */}
      <GameHeader
        roomId={roomState.id}
        round={roomState.currentRound}
        totalRounds={roomState.settings.rounds}
        secondsRemaining={roomState.secondsRemaining}
        isDrawer={isDrawer}
        drawerWord={drawerWord}
        maskedWord={roomState.maskedWord}
        wordLength={roomState.currentWordLength}
        onLeaveRoom={onLeaveRoom}
      />

      {/* Main 3-Column Arena */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          gap: '12px',
          minHeight: 0, // important for flex scrolling
        }}
      >
        {/* Left Column: Player Leaderboard Sidebar */}
        <PlayerSidebar
          players={roomState.players}
          currentDrawerId={roomState.currentDrawerId}
          phase={roomState.phase}
        />

        {/* Center Column: Interactive Canvas */}
        <DrawingCanvas
          isDrawer={isDrawer && roomState.phase === 'DRAWING'}
          strokeHistory={strokeHistory}
          onEmitStroke={onEmitStroke}
          onEmitClear={onEmitClear}
          onEmitUndo={onEmitUndo}
          incomingStroke={incomingStroke}
          drawerName={currentDrawer?.name}
        />

        {/* Right Column: Chat & Guessing Box */}
        <ChatBox
          messages={messages}
          onSendMessage={onSendMessage}
          isDrawer={isDrawer}
          hasGuessed={currentPlayer.hasGuessed}
          phase={roomState.phase}
        />
      </div>

      {/* Phase Modals */}
      {roomState.phase === 'WORD_SELECTION' && (
        <WordSelectionModal
          isDrawer={isDrawer}
          drawerName={currentDrawer?.name}
          choices={wordChoices}
          secondsRemaining={selectionSeconds}
          onChooseWord={onChooseWord}
        />
      )}

      {roomState.phase === 'ROUND_END' && roundEndData && (
        <RoundEndModal
          word={roundEndData.word}
          roundScores={roundEndData.roundScores}
          players={roomState.players}
          reason={roundEndData.reason}
          secondsRemaining={roomState.secondsRemaining}
        />
      )}

      {roomState.phase === 'GAME_OVER' && gameOverData && (
        <GameOverPodium
          leaderboard={gameOverData.leaderboard}
          isHost={currentPlayer.isHost}
          onPlayAgain={onPlayAgain}
        />
      )}
    </div>
  );
};
