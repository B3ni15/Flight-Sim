import { create } from 'zustand';

interface PlaneState {
  speed: number;
  altitude: number;
  heading: number;
  throttle: number;
  flaps: number;
  gear: boolean;
  fuel: number;
  verticalSpeed: number;
}

interface GameState {
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
  startGame: () => void;
  stopGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
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
  },
  setSpeed: (speed) => set((state) => ({ plane: { ...state.plane, speed } })),
  setAltitude: (altitude) => set((state) => ({ plane: { ...state.plane, altitude } })),
  setHeading: (heading) => set((state) => ({ plane: { ...state.plane, heading } })),
  setThrottle: (throttle) => set((state) => ({ plane: { ...state.plane, throttle } })),
  setFlaps: (flaps) => set((state) => ({ plane: { ...state.plane, flaps } })),
  setGear: (gear) => set((state) => ({ plane: { ...state.plane, gear } })),
  setFuel: (fuel) => set((state) => ({ plane: { ...state.plane, fuel } })),
  setVerticalSpeed: (verticalSpeed) => set((state) => ({ plane: { ...state.plane, verticalSpeed } })),
  startGame: () => set({ isPlaying: true }),
  stopGame: () => set({ isPlaying: false }),
}));
