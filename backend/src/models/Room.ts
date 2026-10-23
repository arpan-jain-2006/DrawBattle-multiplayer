import {
  Player,
  RoomSettings,
  GamePhase,
  RoomState,
  StrokeCommand,
  ChatMessage
} from '../types';
import { wordService } from '../services/WordService';

export interface RoomEventCallbacks {
  onStateUpdate: (state: RoomState) => void;
  onWordSelection: (drawerId: string, choices: string[], timeout: number) => void;
  onRoundStart: (drawer: Player, wordLength: number, drawTime: number, round: number, totalRounds: number, word?: string) => void;
  onTimerTick: (secondsRemaining: number) => void;
  onHintReveal: (maskedWord: string) => void;
  onRoundEnd: (word: string, roundScores: Record<string, number>, reason: 'timeout' | 'all_guessed') => void;
  onGameOver: (leaderboard: Player[], winner: Player) => void;
  onChatMessage: (message: ChatMessage, recipientFilter?: (p: Player) => boolean) => void;
  onStrokeAction: (action: 'stroke' | 'clear' | 'undo', data?: any) => void;
}

export class Room {
  public readonly id: string;
  public settings: RoomSettings;
  public players: Map<string, Player> = new Map();
  public hostId: string = '';
  public phase: GamePhase = 'LOBBY';

  public currentRound: number = 0;
  public drawerOrder: string[] = [];
  public currentDrawerIndex: number = 0;
  public currentWord: string = '';
  public wordChoices: string[] = [];
  public revealedIndices: Set<number> = new Set();
  public strokeHistory: StrokeCommand[] = [];

  public secondsRemaining: number = 0;
  private timer: NodeJS.Timeout | null = null;
  private hintSchedule: number[] = []; // seconds at which to reveal hints

  private callbacks: RoomEventCallbacks;

  constructor(id: string, hostPlayer: Player, settings: Partial<RoomSettings>, callbacks: RoomEventCallbacks) {
    this.id = id;
    this.callbacks = callbacks;
    this.settings = {
      maxPlayers: settings.maxPlayers ?? 8,
      rounds: settings.rounds ?? 3,
      drawTime: settings.drawTime ?? 80,
      hints: settings.hints ?? 2,
      wordCount: settings.wordCount ?? 3,
      customWords: settings.customWords ?? [],
      isPrivate: settings.isPrivate ?? false,
    };

    hostPlayer.isHost = true;
    this.hostId = hostPlayer.id;
    this.players.set(hostPlayer.id, hostPlayer);
  }

  public addPlayer(player: Player): boolean {
    if (this.players.size >= this.settings.maxPlayers) {
      return false;
    }

    if (this.players.size === 0) {
      player.isHost = true;
      this.hostId = player.id;
    } else {
      player.isHost = false;
    }

    player.score = 0;
    player.roundScore = 0;
    player.hasGuessed = false;
    this.players.set(player.id, player);

    // If game in progress, add to drawer order
    if (this.phase !== 'LOBBY' && !this.drawerOrder.includes(player.id)) {
      this.drawerOrder.push(player.id);
    }

    this.callbacks.onStateUpdate(this.getPublicState());
    return true;
  }

  public removePlayer(playerId: string): void {
    const wasHost = this.hostId === playerId;
    const currentDrawer = this.getCurrentDrawer();
    const wasDrawer = currentDrawer?.id === playerId;

    const removedIndex = this.drawerOrder.indexOf(playerId);
    this.players.delete(playerId);
    this.drawerOrder = this.drawerOrder.filter(id => id !== playerId);

    // If removed player was before current drawer in order, decrement index so current drawer does not shift
    if (removedIndex !== -1 && removedIndex < this.currentDrawerIndex) {
      this.currentDrawerIndex = Math.max(0, this.currentDrawerIndex - 1);
    }

    if (this.players.size === 0) {
      this.clearTimer();
      return;
    }

    if (wasHost) {
      const nextHost = Array.from(this.players.values())[0];
      if (nextHost) {
        nextHost.isHost = true;
        this.hostId = nextHost.id;
      }
    }

    if (this.players.size < 2 && this.phase !== 'LOBBY') {
      this.endGamePrematurely('Not enough players to continue.');
      return;
    }

    if (wasDrawer && (this.phase === 'WORD_SELECTION' || this.phase === 'DRAWING')) {
      this.clearTimer();
      this.broadcastSystemChat('The drawer left the game. Skipping to next turn!');
      // Adjust index so nextTurn() advances to the next valid drawer slot
      this.currentDrawerIndex--;
      this.nextTurn();
      return;
    }

    // Check if remaining guessers have now all guessed
    if (this.phase === 'DRAWING') {
      this.checkAllGuessed();
    }

    this.callbacks.onStateUpdate(this.getPublicState());
  }

  public setReady(playerId: string, isReady: boolean): void {
    const player = this.players.get(playerId);
    if (player) {
      player.isReady = isReady;
      this.callbacks.onStateUpdate(this.getPublicState());
    }
  }

  public updateSettings(newSettings: Partial<RoomSettings>): void {
    if (this.phase !== 'LOBBY') return;
    this.settings = { ...this.settings, ...newSettings };
    this.callbacks.onStateUpdate(this.getPublicState());
  }

  public startGame(): boolean {
    if (this.players.size < 2) {
      return false;
    }

    this.clearTimer();

    // Reset scores & order with active players only
    this.drawerOrder = Array.from(this.players.keys()).sort(() => 0.5 - Math.random());
    this.currentRound = 1;
    this.currentDrawerIndex = 0;
    for (const player of this.players.values()) {
      player.score = 0;
      player.roundScore = 0;
      player.hasGuessed = false;
    }

    this.startWordSelection();
    return true;
  }

  private startWordSelection(): void {
    this.clearTimer();

    if (this.players.size < 2) {
      this.endGamePrematurely('Not enough players to continue.');
      return;
    }

    this.drawerOrder = this.drawerOrder.filter(id => this.players.has(id));
    if (this.drawerOrder.length === 0) {
      this.endGamePrematurely('Not enough players left.');
      return;
    }

    if (this.currentDrawerIndex >= this.drawerOrder.length || this.currentDrawerIndex < 0) {
      this.currentDrawerIndex = 0;
    }

    this.phase = 'WORD_SELECTION';
    this.strokeHistory = [];
    this.revealedIndices.clear();

    const drawer = this.getCurrentDrawer();
    if (!drawer) {
      this.nextTurn();
      return;
    }

    // Reset round scores & guess status
    for (const player of this.players.values()) {
      player.hasGuessed = false;
      player.roundScore = 0;
      player.guessedAt = null;
    }

    // Generate word choices
    this.wordChoices = wordService.getRandomChoices(this.settings.wordCount, this.settings.customWords);
    this.secondsRemaining = 15;

    this.callbacks.onStateUpdate(this.getPublicState());
    this.callbacks.onWordSelection(drawer.id, this.wordChoices, this.secondsRemaining);
    this.callbacks.onTimerTick(this.secondsRemaining);

    this.timer = setInterval(() => {
      this.secondsRemaining--;
      if (this.secondsRemaining <= 0) {
        // Always safely clear before transitioning to prevent negative running intervals
        this.clearTimer();
        const autoWord = this.wordChoices[0] || 'apple';
        const activeDrawer = this.getCurrentDrawer();
        if (activeDrawer) {
          this.selectWord(activeDrawer.id, autoWord);
        } else {
          this.nextTurn();
        }
      } else {
        this.callbacks.onTimerTick(this.secondsRemaining);
      }
    }, 1000);
  }

  public selectWord(drawerId: string, word: string): void {
    if (this.phase !== 'WORD_SELECTION') return;
    const drawer = this.getCurrentDrawer();
    if (!drawer || drawer.id !== drawerId) return;

    this.clearTimer();
    this.currentWord = word.trim().toLowerCase();
    this.revealedIndices.clear();

    this.startDrawingRound();
  }

  private startDrawingRound(): void {
    this.clearTimer();

    if (this.players.size < 2) {
      this.endGamePrematurely('Not enough players to continue.');
      return;
    }

    const drawer = this.getCurrentDrawer();
    if (!drawer) {
      this.nextTurn();
      return;
    }

    this.phase = 'DRAWING';
    this.secondsRemaining = this.settings.drawTime;

    // Compute hint schedule
    this.setupHintSchedule();

    this.callbacks.onStateUpdate(this.getPublicState());
    this.callbacks.onRoundStart(
      drawer,
      this.currentWord.length,
      this.settings.drawTime,
      this.currentRound,
      this.settings.rounds,
      this.currentWord
    );
    this.callbacks.onTimerTick(this.secondsRemaining);

    this.timer = setInterval(() => {
      this.secondsRemaining--;

      // Check for hint triggers
      if (this.hintSchedule.includes(this.secondsRemaining)) {
        this.revealNextHint();
      }

      if (this.secondsRemaining <= 0) {
        this.clearTimer();
        this.endRound('timeout');
      } else {
        this.callbacks.onTimerTick(this.secondsRemaining);
      }
    }, 1000);
  }

  private setupHintSchedule(): void {
    this.hintSchedule = [];
    const numHints = Math.min(this.settings.hints, Math.floor(this.currentWord.length / 2));
    if (numHints <= 0) return;

    // Distribute hints across the drawTime
    const interval = Math.floor(this.settings.drawTime / (numHints + 1));
    for (let i = 1; i <= numHints; i++) {
      this.hintSchedule.push(this.settings.drawTime - (i * interval));
    }
  }

  private revealNextHint(): void {
    const unrevealedIndices: number[] = [];
    for (let i = 0; i < this.currentWord.length; i++) {
      if (this.currentWord[i] !== ' ' && !this.revealedIndices.has(i)) {
        unrevealedIndices.push(i);
      }
    }

    if (unrevealedIndices.length > 0) {
      const randomIndex = unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
      this.revealedIndices.add(randomIndex);
      const masked = wordService.getMaskedWord(this.currentWord, this.revealedIndices);
      this.callbacks.onHintReveal(masked);
      this.callbacks.onStateUpdate(this.getPublicState());
    }
  }

  public handleGuess(playerId: string, rawText: string): void {
    const player = this.players.get(playerId);
    const drawer = this.getCurrentDrawer();
    if (!player || !drawer) return;

    const text = rawText.trim();
    if (!text) return;

    // If player is drawer, they cannot guess
    if (player.id === drawer.id) {
      this.callbacks.onChatMessage({
        id: Math.random().toString(36).substring(2, 9),
        senderId: player.id,
        senderName: player.name,
        text,
        type: 'chat',
        createdAt: Date.now()
      });
      return;
    }

    // If player already guessed, route chat secretly to other guessers / drawer
    if (player.hasGuessed) {
      this.callbacks.onChatMessage({
        id: Math.random().toString(36).substring(2, 9),
        senderId: player.id,
        senderName: player.name,
        text,
        type: 'chat',
        createdAt: Date.now()
      }, (p) => p.hasGuessed || p.id === drawer.id);
      return;
    }

    // Check guess against current word
    const isCorrect = this.phase === 'DRAWING' && text.toLowerCase() === this.currentWord.toLowerCase();

    if (isCorrect) {
      player.hasGuessed = true;
      player.guessedAt = Date.now();

      // Points calculation based on time remaining and rank
      const guessersCount = Array.from(this.players.values()).filter(p => p.hasGuessed).length;
      const basePoints = Math.round(100 + (this.secondsRemaining / this.settings.drawTime) * 400);
      const rankBonus = Math.max(0, 100 - (guessersCount - 1) * 25);
      const totalPoints = basePoints + rankBonus;

      player.roundScore = totalPoints;
      player.score += totalPoints;

      // Drawer also earns points when someone guesses
      const drawerBonus = Math.round(50 + 200 / (this.players.size - 1));
      drawer.roundScore += drawerBonus;
      drawer.score += drawerBonus;

      // Broadcast correct guess
      this.callbacks.onChatMessage({
        id: Math.random().toString(36).substring(2, 9),
        senderId: player.id,
        senderName: player.name,
        text: `${player.name} guessed the word! 🎉`,
        type: 'guess_correct',
        createdAt: Date.now()
      });

      this.callbacks.onStateUpdate(this.getPublicState());

      // If all guessers guessed, finish round early
      this.checkAllGuessed();
    } else {
      // Check if guess is close (Levenshtein distance == 1)
      if (this.phase === 'DRAWING' && wordService.isCloseGuess(text, this.currentWord)) {
        this.callbacks.onChatMessage({
          id: Math.random().toString(36).substring(2, 9),
          senderId: 'system',
          senderName: 'System',
          text: `"${text}" is very close!`,
          type: 'close',
          createdAt: Date.now()
        }, (p) => p.id === player.id);
      }

      // Regular chat broadcast
      this.callbacks.onChatMessage({
        id: Math.random().toString(36).substring(2, 9),
        senderId: player.id,
        senderName: player.name,
        text,
        type: 'chat',
        createdAt: Date.now()
      });
    }
  }

  private checkAllGuessed(): void {
    if (this.phase !== 'DRAWING') return;
    const drawer = this.getCurrentDrawer();
    if (!drawer) return;

    const guessers = Array.from(this.players.values()).filter(p => p.id !== drawer.id);
    const allGuessed = guessers.length > 0 && guessers.every(p => p.hasGuessed);

    if (allGuessed) {
      this.endRound('all_guessed');
    }
  }

  private endRound(reason: 'timeout' | 'all_guessed'): void {
    if (this.phase !== 'DRAWING') return;

    this.clearTimer();
    this.phase = 'ROUND_END';
    this.secondsRemaining = 5;

    const roundScores: Record<string, number> = {};
    for (const player of this.players.values()) {
      roundScores[player.id] = player.roundScore;
    }

    this.callbacks.onRoundEnd(this.currentWord, roundScores, reason);
    this.callbacks.onStateUpdate(this.getPublicState());
    this.callbacks.onTimerTick(this.secondsRemaining);

    this.timer = setInterval(() => {
      this.secondsRemaining--;
      if (this.secondsRemaining <= 0) {
        this.clearTimer();
        this.nextTurn();
      } else {
        this.callbacks.onTimerTick(this.secondsRemaining);
      }
    }, 1000);
  }

  private nextTurn(): void {
    this.clearTimer();

    if (this.players.size < 2) {
      this.endGamePrematurely('Not enough players to continue.');
      return;
    }

    // Retain only currently active players in drawer rotation
    this.drawerOrder = this.drawerOrder.filter(id => this.players.has(id));
    if (this.drawerOrder.length === 0) {
      this.endGamePrematurely('Not enough players left.');
      return;
    }

    this.currentDrawerIndex++;

    // If everyone drew in this round, advance round
    if (this.currentDrawerIndex >= this.drawerOrder.length) {
      this.currentDrawerIndex = 0;
      this.currentRound++;

      if (this.currentRound > this.settings.rounds) {
        this.gameOver();
        return;
      }
    }

    // Ensure index is within current drawerOrder bounds
    if (this.currentDrawerIndex < 0 || this.currentDrawerIndex >= this.drawerOrder.length) {
      this.currentDrawerIndex = 0;
    }

    // Validate the next drawer exists, or pick next available
    const nextDrawerId = this.drawerOrder[this.currentDrawerIndex];
    if (!nextDrawerId || !this.players.has(nextDrawerId)) {
      let foundIndex = -1;
      for (let i = 0; i < this.drawerOrder.length; i++) {
        if (this.players.has(this.drawerOrder[i])) {
          foundIndex = i;
          break;
        }
      }
      if (foundIndex === -1) {
        this.endGamePrematurely('Not enough players left.');
        return;
      }
      this.currentDrawerIndex = foundIndex;
    }

    this.startWordSelection();
  }

  private gameOver(): void {
    this.clearTimer();
    this.phase = 'GAME_OVER';

    const leaderboard = Array.from(this.players.values()).sort((a, b) => b.score - a.score);
    const winner = leaderboard[0];

    this.callbacks.onGameOver(leaderboard, winner);
    this.callbacks.onStateUpdate(this.getPublicState());
  }

  public resetToLobby(): void {
    this.clearTimer();
    this.phase = 'LOBBY';
    this.currentRound = 0;
    this.currentDrawerIndex = 0;
    this.currentWord = '';
    this.revealedIndices.clear();
    this.strokeHistory = [];

    for (const player of this.players.values()) {
      player.score = 0;
      player.roundScore = 0;
      player.hasGuessed = false;
      player.isReady = false;
    }

    this.callbacks.onStateUpdate(this.getPublicState());
  }

  private endGamePrematurely(reason: string): void {
    this.clearTimer();
    this.phase = 'LOBBY';
    this.broadcastSystemChat(`Game stopped: ${reason}`);
    this.resetToLobby();
  }

  public addStroke(stroke: StrokeCommand): void {
    this.strokeHistory.push(stroke);
    this.callbacks.onStrokeAction('stroke', stroke);
  }

  public clearCanvas(): void {
    this.strokeHistory = [];
    this.callbacks.onStrokeAction('clear');
  }

  public undoStroke(): void {
    if (this.strokeHistory.length > 0) {
      this.strokeHistory.pop();
      this.callbacks.onStrokeAction('undo');
    }
  }

  public getCurrentDrawer(): Player | null {
    if (this.drawerOrder.length === 0) return null;
    if (this.currentDrawerIndex < 0 || this.currentDrawerIndex >= this.drawerOrder.length) {
      return null;
    }
    const drawerId = this.drawerOrder[this.currentDrawerIndex];
    return this.players.get(drawerId) || null;
  }

  private broadcastSystemChat(text: string): void {
    this.callbacks.onChatMessage({
      id: Math.random().toString(36).substring(2, 9),
      senderId: 'system',
      senderName: 'System',
      text,
      type: 'system',
      createdAt: Date.now()
    });
  }

  private clearTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getPublicState(): RoomState {
    const drawer = this.getCurrentDrawer();
    return {
      id: this.id,
      settings: this.settings,
      phase: this.phase,
      players: Array.from(this.players.values()),
      hostId: this.hostId,
      currentRound: this.currentRound,
      currentTurnIndex: this.currentDrawerIndex,
      currentDrawerId: drawer ? drawer.id : null,
      currentWordLength: this.currentWord.length,
      maskedWord: this.phase === 'DRAWING'
        ? wordService.getMaskedWord(this.currentWord, this.revealedIndices)
        : '',
      secondsRemaining: this.secondsRemaining
    };
  }
}
