import { create } from 'zustand';

export type FlightStatus = 'parked' | 'taxiing' | 'takeoff' | 'climbing' | 'cruising' | 'descending' | 'landing' | 'rolled_out';

export interface MultiplayerPlayer {
  id: string;
  nickname: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  speed?: number;
  color?: string;
  isReady: boolean;
}

export interface PlaneState {
  speed: number;
  altitude: number;
  heading: number;
  throttle: number;
  flaps: number;
  gear: boolean;
  fuel: number;
  verticalSpeed: number;
  status: FlightStatus;
  hasTakenOff: boolean;
}

export interface MultiplayerState {
  isConnected: boolean;
  roomId: string | null;
  players: Map<string, MultiplayerPlayer>;
  localPlayerId: string | null;
}

interface GameState extends MultiplayerState {
  isPlaying: boolean;
  plane: PlaneState;
  setSpeed: (speed: number) => void;
  setAltitude: (altitude: number) => void;
  setHeading: (heading: number) => void;
  setThrottle: (throttle: number) => void;
  setFlaps: (flaps: number) => void;
  setGear: (gear: boolean) => void;
  setFuel: (fuel: number) => void;
  setVerticalSpeed: (vs: number) => void;
  setFlightStatus: (status: FlightStatus) => void;
  setHasTakenOff: (hasTakenOff: boolean) => void;
  startGame: () => void;
  stopGame: () => void;
  setConnected: (connected: boolean) => void;
  setRoomId: (roomId: string | null) => void;
  setLocalPlayerId: (id: string | null) => void;
  addPlayer: (player: MultiplayerPlayer) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, data: Partial<MultiplayerPlayer>) => void;
  setPlayers: (players: MultiplayerPlayer[]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isConnected: false,
  roomId: null,
  players: new Map(),
  localPlayerId: null,
  isPlaying: false,
  plane: {
    speed: 0,
    altitude: 0,
    heading: 270,
    throttle: 0,
    flaps: 0,
    gear: true,
    fuel: 100,
    verticalSpeed: 0,
    status: 'parked',
    hasTakenOff: false,
  },
  setSpeed: (speed) => set((state) => ({ plane: { ...state.plane, speed } })),
  setAltitude: (altitude) => set((state) => ({ plane: { ...state.plane, altitude } })),
  setHeading: (heading) => set((state) => ({ plane: { ...state.plane, heading } })),
  setThrottle: (throttle) => set((state) => ({ plane: { ...state.plane, throttle } })),
  setFlaps: (flaps) => set((state) => ({ plane: { ...state.plane, flaps } })),
  setGear: (gear) => set((state) => ({ plane: { ...state.plane, gear } })),
  setFuel: (fuel) => set((state) => ({ plane: { ...state.plane, fuel } })),
  setVerticalSpeed: (verticalSpeed) => set((state) => ({ plane: { ...state.plane, verticalSpeed } })),
  setFlightStatus: (status) => set((state) => ({ plane: { ...state.plane, status } })),
  setHasTakenOff: (hasTakenOff) => set((state) => ({ plane: { ...state.plane, hasTakenOff } })),
  startGame: () => set({ isPlaying: true }),
  stopGame: () => set({ isPlaying: false, roomId: null, players: new Map() }),
  setConnected: (isConnected) => set({ isConnected }),
  setRoomId: (roomId) => set({ roomId }),
  setLocalPlayerId: (localPlayerId) => set({ localPlayerId }),
  addPlayer: (player) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.set(player.id, player);
    return { players: newPlayers };
  }),
  removePlayer: (playerId) => set((state) => {
    const newPlayers = new Map(state.players);
    newPlayers.delete(playerId);
    return { players: newPlayers };
  }),
  updatePlayer: (playerId, data) => set((state) => {
    const newPlayers = new Map(state.players);
    const player = newPlayers.get(playerId);
    if (player) {
      newPlayers.set(playerId, { ...player, ...data });
    }
    return { players: newPlayers };
  }),
  setPlayers: (playersList) => set(() => {
    const newPlayers = new Map<string, MultiplayerPlayer>();
    playersList.forEach(p => newPlayers.set(p.id, p));
    return { players: newPlayers };
  }),
}));
