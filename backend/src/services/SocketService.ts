import { Server, Socket } from 'socket.io';
import { Room } from '../models/Room';
import { Player, RoomSettings, StrokeCommand, ChatMessage } from '../types';

export class SocketService {
  private io: Server;
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  public registerHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`[Socket] Connected: ${socket.id}`);

      // Create a new room
      socket.on('room:create', (data: { player: Omit<Player, 'id' | 'score' | 'roundScore' | 'isHost' | 'isReady' | 'hasGuessed' | 'guessedAt'>; settings?: Partial<RoomSettings> }) => {
        try {
          const roomId = this.generateRoomId();
          const hostPlayer: Player = {
            id: socket.id,
            name: data.player.name || 'Host',
            avatar: data.player.avatar || { color: '#FFD13B', eyes: 0, mouth: 0 },
            score: 0,
            roundScore: 0,
            isHost: true,
            isReady: true,
            hasGuessed: false,
            guessedAt: null,
          };

          const room = new Room(roomId, hostPlayer, data.settings || {}, {
            onStateUpdate: (state) => {
              this.io.to(roomId).emit('room:state', state);
            },
            onWordSelection: (drawerId, choices, timeout) => {
              const currentRoom = this.rooms.get(roomId);
              if (currentRoom) {
                for (const player of currentRoom.players.values()) {
                  if (player.id === drawerId) {
                    this.io.to(player.id).emit('game:word_selection', { choices, timeout, isDrawer: true });
                  } else {
                    this.io.to(player.id).emit('game:word_selection', { choices: [], timeout, isDrawer: false });
                  }
                }
              }
            },
            onRoundStart: (drawer, wordLength, drawTime, round, totalRounds) => {
              this.io.to(roomId).emit('game:round_start', {
                drawer,
                wordLength,
                drawTime,
                round,
                totalRounds
              });
            },
            onTimerTick: (secondsRemaining) => {
              this.io.to(roomId).emit('game:timer_tick', { secondsRemaining });
            },
            onHintReveal: (maskedWord) => {
              this.io.to(roomId).emit('game:hint_reveal', { maskedWord });
            },
            onRoundEnd: (word, roundScores, reason) => {
              this.io.to(roomId).emit('game:round_end', { word, roundScores, reason });
            },
            onGameOver: (leaderboard, winner) => {
              this.io.to(roomId).emit('game:game_over', { leaderboard, winner });
            },
            onChatMessage: (message: ChatMessage, recipientFilter) => {
              if (recipientFilter) {
                // Send selectively to matched players
                const currentRoom = this.rooms.get(roomId);
                if (currentRoom) {
                  for (const player of currentRoom.players.values()) {
                    if (recipientFilter(player)) {
                      this.io.to(player.id).emit('chat:message', message);
                    }
                  }
                }
              } else {
                this.io.to(roomId).emit('chat:message', message);
              }
            },
            onStrokeAction: (action, strokeData) => {
              const currentRoom = this.rooms.get(roomId);
              const currentDrawerId = currentRoom?.getCurrentDrawer()?.id;
              if (action === 'stroke') {
                if (currentDrawerId) {
                  this.io.to(roomId).except(currentDrawerId).emit('draw:stroke', strokeData);
                } else {
                  this.io.to(roomId).emit('draw:stroke', strokeData);
                }
              } else if (action === 'clear') {
                this.io.to(roomId).emit('draw:clear');
              } else if (action === 'undo') {
                this.io.to(roomId).emit('draw:undo');
              }
            }
          });

          this.rooms.set(roomId, room);
          this.socketToRoom.set(socket.id, roomId);
          socket.join(roomId);

          socket.emit('room:created', {
            roomId,
            state: room.getPublicState(),
            player: hostPlayer,
          });

          console.log(`[Room Created] Room ID: ${roomId} by Host: ${hostPlayer.name}`);
        } catch (error) {
          console.error('[room:create error]', error);
          socket.emit('error:message', { message: 'Failed to create room' });
        }
      });

      // Join an existing room
      socket.on('room:join', (data: { roomId: string; player: Omit<Player, 'id' | 'score' | 'roundScore' | 'isHost' | 'isReady' | 'hasGuessed' | 'guessedAt'> }) => {
        try {
          const roomId = data.roomId?.trim().toUpperCase();
          const room = this.rooms.get(roomId);

          if (!room) {
            socket.emit('error:message', { message: 'Room not found. Check the code and try again.' });
            return;
          }

          const newPlayer: Player = {
            id: socket.id,
            name: data.player.name || `Player-${socket.id.substring(0, 4)}`,
            avatar: data.player.avatar || { color: '#60A5FA', eyes: 0, mouth: 0 },
            score: 0,
            roundScore: 0,
            isHost: false,
            isReady: false,
            hasGuessed: false,
            guessedAt: null,
          };

          const joined = room.addPlayer(newPlayer);
          if (!joined) {
            socket.emit('error:message', { message: 'Room is full or unavailable.' });
            return;
          }

          this.socketToRoom.set(socket.id, roomId);
          socket.join(roomId);

          // Emit joined to the player
          socket.emit('room:joined', {
            roomId,
            state: room.getPublicState(),
            player: newPlayer,
            strokeHistory: room.strokeHistory,
          });

          // Broadcast system join message
          this.io.to(roomId).emit('chat:message', {
            id: Math.random().toString(36).substring(2, 9),
            senderId: 'system',
            senderName: 'System',
            text: `${newPlayer.name} joined the room!`,
            type: 'system',
            createdAt: Date.now()
          });

          console.log(`[Room Joined] Player ${newPlayer.name} joined room ${roomId}`);
        } catch (error) {
          console.error('[room:join error]', error);
          socket.emit('error:message', { message: 'Failed to join room' });
        }
      });

      // Update room settings (host only)
      socket.on('room:update_settings', (settings: Partial<RoomSettings>) => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && room.hostId === socket.id) {
          room.updateSettings(settings);
        }
      });

      // Player Ready toggle
      socket.on('room:ready', (isReady: boolean) => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room) {
          room.setReady(socket.id, isReady);
        }
      });

      // Start Game (host only)
      socket.on('game:start', () => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && room.hostId === socket.id) {
          const started = room.startGame();
          if (!started) {
            socket.emit('error:message', { message: 'Need at least 2 players to start the game!' });
          }
        }
      });

      // Word Choice by Drawer
      socket.on('game:choose_word', (data: { word: string }) => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && data.word) {
          room.selectWord(socket.id, data.word);
        }
      });

      // Drawing: Stroke Command
      socket.on('draw:stroke', (stroke: StrokeCommand) => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && room.phase === 'DRAWING' && room.getCurrentDrawer()?.id === socket.id) {
          room.addStroke(stroke);
        }
      });

      // Drawing: Clear Canvas
      socket.on('draw:clear', () => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && room.phase === 'DRAWING' && room.getCurrentDrawer()?.id === socket.id) {
          room.clearCanvas();
        }
      });

      // Drawing: Undo Stroke
      socket.on('draw:undo', () => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && room.phase === 'DRAWING' && room.getCurrentDrawer()?.id === socket.id) {
          room.undoStroke();
        }
      });

      // Chat / Guess Message
      socket.on('chat:send', (data: { text: string }) => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && data.text) {
          room.handleGuess(socket.id, data.text);
        }
      });

      // Play Again / Reset to Lobby
      socket.on('game:reset', () => {
        const roomId = this.socketToRoom.get(socket.id);
        const room = roomId ? this.rooms.get(roomId) : undefined;
        if (room && room.hostId === socket.id) {
          room.resetToLobby();
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log(`[Socket] Disconnected: ${socket.id}`);
        const roomId = this.socketToRoom.get(socket.id);
        if (roomId) {
          const room = this.rooms.get(roomId);
          if (room) {
            const player = room.players.get(socket.id);
            const playerName = player?.name || 'A player';

            room.removePlayer(socket.id);
            this.socketToRoom.delete(socket.id);

            if (room.players.size === 0) {
              console.log(`[Room Deleted] Room ${roomId} is now empty.`);
              this.rooms.delete(roomId);
            } else {
              this.io.to(roomId).emit('chat:message', {
                id: Math.random().toString(36).substring(2, 9),
                senderId: 'system',
                senderName: 'System',
                text: `${playerName} left the room.`,
                type: 'system',
                createdAt: Date.now()
              });
            }
          }
        }
      });
    });
  }

  private generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));
    return code;
  }
}
