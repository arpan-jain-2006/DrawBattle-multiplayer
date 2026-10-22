import React, { useState } from 'react';
import { RoomState, Player, StrokeCommand, ChatMessage } from '../../types/game';
import { GameHeader } from './GameHeader';
import { PlayerSidebar } from './PlayerSidebar';
import { DrawingCanvas } from '../Canvas/DrawingCanvas';
import { ChatBox } from '../Chat/ChatBox';
import { WordSelectionModal } from './WordSelectionModal';
import { RoundEndModal } from './RoundEndModal';
import { GameOverPodium } from './GameOverPodium';
import { MessageSquare, Users } from 'lucide-react';

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
  const [mobileTab, setMobileTab] = useState<'chat' | 'players'>('chat');
  const currentDrawer = roomState.players.find((p) => p.id === roomState.currentDrawerId);

  return (
    <div className="game-viewport">
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

      {/* Main Responsive Arena */}
      <div className="game-arena">
        {/* Left Column on Desktop: Player Leaderboard */}
        <div className={`arena-col-players ${mobileTab === 'players' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <PlayerSidebar
            players={roomState.players}
            currentDrawerId={roomState.currentDrawerId}
            phase={roomState.phase}
          />
        </div>

        {/* Center: Interactive Canvas (Always visible) */}
        <div className="arena-col-canvas">
          <DrawingCanvas
            isDrawer={isDrawer && roomState.phase === 'DRAWING'}
            strokeHistory={strokeHistory}
            onEmitStroke={onEmitStroke}
            onEmitClear={onEmitClear}
            onEmitUndo={onEmitUndo}
            incomingStroke={incomingStroke}
            drawerName={currentDrawer?.name}
          />
        </div>

        {/* Mobile-Only Tabs Switcher (Shown between canvas and bottom content on phones) */}
        <div className="mobile-tabs-header">
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'chat' ? 'active' : ''}`}
            onClick={() => setMobileTab('chat')}
          >
            <MessageSquare size={16} />
            <span>Chat & Guess</span>
          </button>
          <button
            type="button"
            className={`mobile-tab-btn ${mobileTab === 'players' ? 'active' : ''}`}
            onClick={() => setMobileTab('players')}
          >
            <Users size={16} />
            <span>Players ({roomState.players.length})</span>
          </button>
        </div>

        {/* Right Column on Desktop: Chat & Guessing Box */}
        <div className={`arena-col-chat ${mobileTab === 'chat' ? 'mobile-visible' : 'mobile-hidden'}`}>
          <ChatBox
            messages={messages}
            onSendMessage={onSendMessage}
            isDrawer={isDrawer}
            hasGuessed={currentPlayer.hasGuessed}
            phase={roomState.phase}
          />
        </div>
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
