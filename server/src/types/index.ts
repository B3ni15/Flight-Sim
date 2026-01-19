export interface Player {
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

export interface Room {
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

export interface GameState {
  roomId: string;
  players: Player[];
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  roomId: string;
}

export interface ServerToClientEvents {
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

export interface ClientToServerEvents {
  'create-room': (data: { name: string; password?: string; maxPlayers?: number }) => void;
  'join-room': (data: { roomId: string; password?: string }) => void;
  'leave-room': () => void;
  'get-rooms': () => void;
  'update-player': (data: Partial<Player>) => void;
  'send-chat': (message: string) => void;
  'set-ready': (isReady: boolean) => void;
  'start-game': () => void;
}

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  hostId: string;
  createdAt: number;
}
