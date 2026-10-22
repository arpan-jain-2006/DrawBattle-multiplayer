import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  RoomState,
  Player,
  StrokeCommand,
  ChatMessage,
  AvatarConfig,
  RoomSettings
} from '../types/game';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export function useGameSocket() {
  const socketRef = useRef<Socket | null>(null);

  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [strokeHistory, setStrokeHistory] = useState<StrokeCommand[]>([]);
  const [incomingStroke, setIncomingStroke] = useState<StrokeCommand | null>(null);

  // Word selection state
  const [wordChoices, setWordChoices] = useState<string[]>([]);
  const [selectionSeconds, setSelectionSeconds] = useState<number>(15);
  const [drawerWord, setDrawerWord] = useState<string>('');

  // Modals state
  const [roundEndData, setRoundEndData] = useState<{
    word: string;
    roundScores: Record<string, number>;
    reason: 'timeout' | 'all_guessed';
  } | null>(null);

  const [gameOverData, setGameOverData] = useState<{
    leaderboard: Player[];
    winner: Player;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to Skribbl backend with ID:', socket.id);
    });

    socket.on('room:created', (data: { roomId: string; state: RoomState; player: Player }) => {
      setRoomState(data.state);
      setCurrentPlayer(data.player);
      setStrokeHistory([]);
      setMessages([]);
      setErrorMessage(null);
    });

    socket.on('room:joined', (data: { roomId: string; state: RoomState; player: Player; strokeHistory: StrokeCommand[] }) => {
      setRoomState(data.state);
      setCurrentPlayer(data.player);
      setStrokeHistory(data.strokeHistory || []);
      setMessages([]);
      setErrorMessage(null);
    });

    socket.on('room:state', (state: RoomState) => {
      setRoomState(state);
      // Synchronize currentPlayer reference with updated room state
      if (socket.id) {
        const me = state.players.find((p) => p.id === socket.id);
        if (me) setCurrentPlayer(me);
      }
    });

    socket.on('game:word_selection', (data: { choices: string[]; timeout: number; isDrawer: boolean }) => {
      setWordChoices(data.choices || []);
      setSelectionSeconds(data.timeout || 15);
      setRoundEndData(null);
      setGameOverData(null);
      setStrokeHistory([]);
      if (!data.isDrawer) {
        setDrawerWord('');
      }
    });

    socket.on('game:round_start', (data: { drawer: Player; wordLength: number; drawTime: number }) => {
      setStrokeHistory([]);
      setIncomingStroke(null);
      setRoundEndData(null);
    });

    socket.on('game:timer_tick', (data: { secondsRemaining: number }) => {
      setRoomState((prev) => (prev ? { ...prev, secondsRemaining: data.secondsRemaining } : null));
      setSelectionSeconds(data.secondsRemaining);
    });

    socket.on('game:hint_reveal', (data: { maskedWord: string }) => {
      setRoomState((prev) => (prev ? { ...prev, maskedWord: data.maskedWord } : null));
    });

    socket.on('game:round_end', (data: { word: string; roundScores: Record<string, number>; reason: 'timeout' | 'all_guessed' }) => {
      setRoundEndData(data);
    });

    socket.on('game:game_over', (data: { leaderboard: Player[]; winner: Player }) => {
      setGameOverData(data);
    });

    // Drawing socket stream
    socket.on('draw:stroke', (stroke: StrokeCommand) => {
      setIncomingStroke(stroke);
      setStrokeHistory((prev) => [...prev, stroke]);
    });

    socket.on('draw:clear', () => {
      setStrokeHistory([]);
      setIncomingStroke(null);
    });

    socket.on('draw:undo', () => {
      setStrokeHistory((prev) => prev.slice(0, prev.length - 1));
    });

    // Chat
    socket.on('chat:message', (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('error:message', (data: { message: string }) => {
      setErrorMessage(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Actions
  const createRoom = useCallback((playerProfile: { name: string; avatar: AvatarConfig }, settings?: Partial<RoomSettings>) => {
    socketRef.current?.emit('room:create', { player: playerProfile, settings });
  }, []);

  const joinRoom = useCallback((roomId: string, playerProfile: { name: string; avatar: AvatarConfig }) => {
    socketRef.current?.emit('room:join', { roomId, player: playerProfile });
  }, []);

  const updateSettings = useCallback((settings: Partial<RoomSettings>) => {
    socketRef.current?.emit('room:update_settings', settings);
  }, []);

  const toggleReady = useCallback((isReady: boolean) => {
    socketRef.current?.emit('room:ready', isReady);
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('game:start');
  }, []);

  const chooseWord = useCallback((word: string) => {
    setDrawerWord(word);
    socketRef.current?.emit('game:choose_word', { word });
  }, []);

  const emitStroke = useCallback((stroke: StrokeCommand) => {
    setStrokeHistory((prev) => [...prev, stroke]);
    socketRef.current?.emit('draw:stroke', stroke);
  }, []);

  const emitClear = useCallback(() => {
    setStrokeHistory([]);
    socketRef.current?.emit('draw:clear');
  }, []);

  const emitUndo = useCallback(() => {
    setStrokeHistory((prev) => prev.slice(0, prev.length - 1));
    socketRef.current?.emit('draw:undo');
  }, []);

  const sendMessage = useCallback((text: string) => {
    socketRef.current?.emit('chat:send', { text });
  }, []);

  const resetGame = useCallback(() => {
    setRoundEndData(null);
    setGameOverData(null);
    socketRef.current?.emit('game:reset');
  }, []);

  const leaveRoom = useCallback(() => {
    window.location.search = '';
    setRoomState(null);
    setCurrentPlayer(null);
    setMessages([]);
    setStrokeHistory([]);
    setDrawerWord('');
    setRoundEndData(null);
    setGameOverData(null);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
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
  };
}
