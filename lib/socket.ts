'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  nickname: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  speed?: number;
  color?: string;
  isReady: boolean;
}

interface Room {
  id: string;
  name: string;
  hostId: string;
  players: Map<string, Player>;
  maxPlayers: number;
  isPrivate: boolean;
  gameState: 'lobby' | 'playing' | 'ended';
}

interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  hostId: string;
}

interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  roomId: string;
}

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { url = 'http://localhost:3001', autoConnect = true } = options;
  
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Map<string, Player>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    socket.on('error', (message: string) => {
      setError(message);
    });

    socket.on('room-list', (roomList: RoomInfo[]) => {
      setRooms(roomList);
    });

    socket.on('room-created', (roomId: string, room: Room) => {
      setCurrentRoom(room);
      setPlayers(room.players);
    });

    socket.on('room-joined', (room: Room, playersList: Player[]) => {
      setCurrentRoom(room);
      const playerMap = new Map<string, Player>();
      playersList.forEach(p => playerMap.set(p.id, p));
      setPlayers(playerMap);
      setChatMessages([]);
    });

    socket.on('player-joined', (player: Player) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        newMap.set(player.id, player);
        return newMap;
      });
    });

    socket.on('player-left', (playerId: string) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        newMap.delete(playerId);
        return newMap;
      });
    });

    socket.on('player-update', (playerId: string, data: Partial<Player>) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(playerId);
        if (player) {
          newMap.set(playerId, { ...player, ...data });
        }
        return newMap;
      });
    });

    socket.on('player-ready', (playerId: string, isReady: boolean) => {
      setPlayers(prev => {
        const newMap = new Map(prev);
        const player = newMap.get(playerId);
        if (player) {
          newMap.set(playerId, { ...player, isReady });
        }
        return newMap;
      });
    });

    socket.on('chat-message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev.slice(-50), message]);
    });

    socket.on('game-state', (state: { players?: Player[] }) => {
      if (state.players) {
        const playerMap = new Map<string, Player>();
        state.players.forEach((p: Player) => playerMap.set(p.id, p));
        setPlayers(playerMap);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [url, autoConnect]);

  const createRoom = useCallback((name: string, password?: string, maxPlayers?: number) => {
    socketRef.current?.emit('create-room', { name, password, maxPlayers });
  }, []);

  const joinRoom = useCallback((roomId: string, password?: string) => {
    socketRef.current?.emit('join-room', { roomId, password });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave-room');
    setCurrentRoom(null);
    setPlayers(new Map());
    setChatMessages([]);
  }, []);

  const getRooms = useCallback(() => {
    socketRef.current?.emit('get-rooms');
  }, []);

  const updatePlayer = useCallback((data: Partial<Player>) => {
    socketRef.current?.emit('update-player', data);
  }, []);

  const setReady = useCallback((isReady: boolean) => {
    socketRef.current?.emit('set-ready', isReady);
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('start-game');
  }, []);

  const sendChat = useCallback((message: string) => {
    socketRef.current?.emit('send-chat', message);
  }, []);

  return {
    isConnected,
    rooms,
    currentRoom,
    players,
    chatMessages,
    error,
    createRoom,
    joinRoom,
    leaveRoom,
    getRooms,
    updatePlayer,
    setReady,
    startGame,
    sendChat,
  };
}
