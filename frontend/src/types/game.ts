export interface AvatarConfig {
  color: string;
  eyes: number; // 0 to 7
  mouth: number; // 0 to 7
}

export interface Player {
  id: string;
  name: string;
  avatar: AvatarConfig;
  score: number;
  roundScore: number;
  isHost: boolean;
  isReady: boolean;
  hasGuessed: boolean;
  guessedAt: number | null;
}

export interface RoomSettings {
  maxPlayers: number;
  rounds: number;
  drawTime: number;
  hints: number;
  wordCount: number;
  customWords: string[];
  isPrivate: boolean;
}

export type GamePhase = 'LOBBY' | 'WORD_SELECTION' | 'DRAWING' | 'ROUND_END' | 'GAME_OVER';

export interface StrokePoint {
  x: number; // 0 to 1 normalized
  y: number; // 0 to 1 normalized
}

export interface StrokeCommand {
  id: string;
  tool: 'pen' | 'eraser';
  color: string;
  size: number;
  points: StrokePoint[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'chat' | 'guess_correct' | 'close' | 'system';
  createdAt: number;
}

export interface RoomState {
  id: string;
  settings: RoomSettings;
  phase: GamePhase;
  players: Player[];
  hostId: string;
  currentRound: number;
  currentTurnIndex: number;
  currentDrawerId: string | null;
  currentWordLength: number;
  maskedWord: string;
  secondsRemaining: number;
}
