import { Room, Player, GameState, RoomInfo } from '../types/index.js';

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private playerRooms: Map<string, string> = new Map();
  private gameUpdates: Map<string, GameState> = new Map();

  createRoom(hostId: string, hostName: string, options: {
    name: string;
    password?: string;
    maxPlayers?: number;
  }): Room {
    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      name: options.name || `Room ${roomId}`,
      hostId,
      players: new Map(),
      maxPlayers: options.maxPlayers || 10,
      isPrivate: !!options.password,
      password: options.password,
      gameState: 'lobby',
      createdAt: Date.now(),
    };

    const hostPlayer: Player = {
      id: hostId,
      nickname: hostName,
      isReady: false,
      joinedAt: Date.now(),
      color: this.generatePlayerColor(),
    };

    room.players.set(hostId, hostPlayer);
    this.playerRooms.set(hostId, roomId);
    this.rooms.set(roomId, room);

    return room;
  }

  joinRoom(roomId: string, playerId: string, playerName: string, password?: string): {
    success: boolean;
    room?: Room;
    error?: string;
  } {
    const room = this.rooms.get(roomId);
    
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.gameState !== 'lobby') {
      return { success: false, error: 'Game already in progress' };
    }

    if (room.players.size >= room.maxPlayers) {
      return { success: false, error: 'Room is full' };
    }

    if (room.password && room.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    const player: Player = {
      id: playerId,
      nickname: playerName,
      isReady: false,
      joinedAt: Date.now(),
      color: this.generatePlayerColor(),
    };

    room.players.set(playerId, player);
    this.playerRooms.set(playerId, roomId);

    return { success: true, room };
  }

  leaveRoom(playerId: string): Room | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players.delete(playerId);
    this.playerRooms.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    if (room.hostId === playerId) {
      const newHost = Array.from(room.players.values())[0];
      if (newHost) {
        room.hostId = newHost.id;
      }
    }

    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByPlayer(playerId: string): Room | undefined {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getAllRooms(): RoomInfo[] {
    return Array.from(this.rooms.values()).map(room => ({
      id: room.id,
      name: room.name,
      playerCount: room.players.size,
      maxPlayers: room.maxPlayers,
      isPrivate: room.isPrivate,
      hostId: room.hostId,
      createdAt: room.createdAt,
    }));
  }

  updatePlayer(playerId: string, data: Partial<Player>): void {
    const room = this.getRoomByPlayer(playerId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    Object.assign(player, data);
  }

  setPlayerReady(playerId: string, isReady: boolean): void {
    const room = this.getRoomByPlayer(playerId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    player.isReady = isReady;
  }

  updateGameState(roomId: string, playerId: string, data: {
    position?: { x: number; y: number; z: number };
    rotation?: { x: number; y: number; z: number };
    speed?: number;
  }): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    if (data.position) player.position = data.position;
    if (data.rotation) player.rotation = data.rotation;
    if (data.speed !== undefined) player.speed = data.speed;

    const state: GameState = {
      roomId,
      players: Array.from(room.players.values()),
      timestamp: Date.now(),
    };

    this.gameUpdates.set(roomId, state);
  }

  getGameState(roomId: string): GameState | undefined {
    return this.gameUpdates.get(roomId);
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generatePlayerColor(): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
      '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
      '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const gameManager = new GameManager();
