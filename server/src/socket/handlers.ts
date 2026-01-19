import { Server, Socket } from 'socket.io';
import { gameManager } from '../game/GameManager.js';

interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Map<string, Player>;
  maxPlayers: number;
  isPrivate: boolean;
  password?: string;
  gameState: 'lobby' | 'playing' | 'ended';
  createdAt: number;
}

interface Player {
  id: string;
  nickname: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  speed?: number;
  plane?: string;
  color?: string;
  isReady: boolean;
  joinedAt: number;
}

interface GameState {
  roomId: string;
  players: Player[];
  timestamp: number;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  roomId: string;
}

interface CreateRoomData {
  name: string;
  password?: string;
  maxPlayers?: number;
}

interface JoinRoomData {
  roomId: string;
  password?: string;
}

interface ServerToClientEvents {
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'room-created': (roomId: string, room: Room) => void;
  'room-joined': (room: Room, players: Player[]) => void;
  'room-list': (rooms: RoomInfo[]) => void;
  'game-state': (state: GameState) => void;
  'player-update': (playerId: string, data: Partial<Player>) => void;
  'chat-message': (message: ChatMessage) => void;
  'error': (message: string) => void;
  'player-ready': (playerId: string, isReady: boolean) => void;
}

interface ClientToServerEvents {
  'create-room': (data: CreateRoomData) => void;
  'join-room': (data: JoinRoomData) => void;
  'leave-room': () => void;
  'get-rooms': () => void;
  'update-player': (data: Partial<Player>) => void;
  'send-chat': (message: string) => void;
  'set-ready': (isReady: boolean) => void;
  'start-game': () => void;
}

interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  hostId: string;
  createdAt: number;
}

type TypedServer = Server<ClientToServerEvents, ServerToClientEvents>;
type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function setupSocketHandlers(io: TypedServer): void {
  io.on('connection', (socket: TypedSocket) => {
    console.log(`Player connected: ${socket.id}`);
    const nickname = `Player_${socket.id.substring(0, 4)}`;
    (socket as any).nickname = nickname;

    socket.on('create-room', (data: CreateRoomData) => {
      const room = gameManager.createRoom(socket.id, nickname, data);
      socket.join(room.id);
      (socket as any).roomId = room.id;
      
      socket.emit('room-created', room.id, room);
      console.log(`Room created: ${room.id} by ${socket.id}`);
    });

    socket.on('join-room', (data: JoinRoomData) => {
      const result = gameManager.joinRoom(
        data.roomId,
        socket.id,
        (socket as any).nickname,
        data.password
      );

      if (result.success && result.room) {
        socket.join(result.room.id);
        (socket as any).roomId = result.room.id;

        const players = Array.from(result.room.players.values());
        socket.emit('room-joined', result.room, players);

        socket.to(result.room.id).emit('player-joined', 
          result.room.players.get(socket.id)!
        );

        console.log(`${socket.id} joined room ${data.roomId}`);
      } else {
        socket.emit('error', result.error || 'Failed to join room');
      }
    });

    socket.on('leave-room', () => {
      handleLeaveRoom(socket, io);
    });

    socket.on('get-rooms', () => {
      const rooms = gameManager.getAllRooms();
      socket.emit('room-list', rooms);
    });

    socket.on('update-player', (data: Partial<Player>) => {
      gameManager.updatePlayer(socket.id, data);
      const room = gameManager.getRoomByPlayer(socket.id);
      if (room) {
        socket.to(room.id).emit('player-update', socket.id, data);
      }
    });

    socket.on('set-ready', (isReady: boolean) => {
      gameManager.setPlayerReady(socket.id, isReady);
      const room = gameManager.getRoomByPlayer(socket.id);
      if (room) {
        socket.to(room.id).emit('player-ready', socket.id, isReady);
      }
    });

    socket.on('start-game', () => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) {
        socket.emit('error', 'You are not in a room');
        return;
      }

      if (room.hostId !== socket.id) {
        socket.emit('error', 'Only the host can start the game');
        return;
      }

      room.gameState = 'playing';
      io.to(room.id).emit('game-state', {
        roomId: room.id,
        players: Array.from(room.players.values()),
        timestamp: Date.now(),
      });

      console.log(`Game started in room ${room.id}`);
    });

    socket.on('send-chat', (message: string) => {
      const room = gameManager.getRoomByPlayer(socket.id);
      if (!room) return;

      const player = room.players.get(socket.id);
      if (!player) return;

      const chatMessage: ChatMessage = {
        id: `${Date.now()}-${socket.id}`,
        playerId: socket.id,
        playerName: player.nickname,
        message,
        timestamp: Date.now(),
        roomId: room.id,
      };

      io.to(room.id).emit('chat-message', chatMessage);
    });

    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      handleLeaveRoom(socket, io);
    });
  });

  setInterval(() => {
    const rooms = gameManager.getAllRooms();
    io.emit('room-list', rooms);
  }, 5000);
}

function handleLeaveRoom(socket: TypedSocket, io: TypedServer): void {
  const roomId = (socket as any).roomId;
  if (!roomId) return;

  const room = gameManager.leaveRoom(socket.id);
  
  if (room) {
    socket.leave(roomId);
    socket.to(roomId).emit('player-left', socket.id);
  }

  (socket as any).roomId = null;
  console.log(`${socket.id} left room ${roomId}`);
}
