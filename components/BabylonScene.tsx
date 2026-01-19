'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as BABYLON from 'babylonjs';
import { babylonEngine } from '@/lib/babylon/engine';
import { createPlane } from '@/lib/babylon/plane';
import { createAirport } from '@/lib/babylon/airport';
import { multiplayerManager, MultiplayerPlayer } from '@/lib/babylon/multiplayer';
import { io, Socket } from 'socket.io-client';
import { useGameStore, FlightStatus } from '@/store/gameStore';

interface PlaneInputState {
  throttle: number;
  elevator: number;
  rudder: number;
  aileron: number;
  flaps: number;
  gear: boolean;
  brake: boolean;
}

const SOCKET_URL = 'http://localhost:3001';
const UPDATE_RATE_MS = 50;

const getFlightStatus = (speed: number, altitude: number, verticalSpeed: number, throttle: number): FlightStatus => {
  if (speed === 0 && throttle === 0) return 'parked';
  if (speed > 0 && altitude < 50) return speed < 100 ? 'taxiing' : 'takeoff';
  if (altitude > 50 && altitude < 5000) {
    if (verticalSpeed > 100) return 'climbing';
    if (verticalSpeed < -100) return 'descending';
    return altitude < 1000 ? 'climbing' : 'cruising';
  }
  if (altitude > 5000) {
    if (verticalSpeed < -100) return 'descending';
    return 'cruising';
  }
  if (altitude < 200 && verticalSpeed < -50) return 'landing';
  if (altitude < 50 && speed > 50) return 'rolled_out';
  
  return 'cruising';
};

export default function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<ReturnType<typeof createPlane> | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const inputRef = useRef<PlaneInputState>({
    throttle: 0,
    elevator: 0,
    rudder: 0,
    aileron: 0,
    flaps: 0,
    gear: true,
    brake: false,
  });
  const lastUpdateRef = useRef<number>(0);
  const hasTakenOffRef = useRef<boolean>(false);
  
  const {
    setSpeed,
    setAltitude,
    setHeading,
    setThrottle,
    setFlaps,
    setGear,
    setFuel,
    setVerticalSpeed,
    setFlightStatus,
    setHasTakenOff,
    startGame,
    roomId,
    setConnected,
    players,
    addPlayer,
    removePlayer,
    updatePlayer,
    setPlayers,
  } = useGameStore();

  const handleInput = useCallback((event: KeyboardEvent, isDown: boolean) => {
    if (!planeRef.current) return;
    
    switch (event.code) {
      case 'KeyW':
        inputRef.current.throttle = isDown ? 100 : 0;
        break;
      case 'KeyS':
        inputRef.current.throttle = isDown ? 0 : 0;
        break;
      case 'ArrowUp':
        inputRef.current.elevator = isDown ? -1 : 0;
        break;
      case 'ArrowDown':
        inputRef.current.elevator = isDown ? 1 : 0;
        break;
      case 'ArrowLeft':
        inputRef.current.rudder = isDown ? 1 : 0;
        break;
      case 'ArrowRight':
        inputRef.current.rudder = isDown ? -1 : 0;
        break;
      case 'KeyA':
        inputRef.current.aileron = isDown ? 1 : 0;
        break;
      case 'KeyD':
        inputRef.current.aileron = isDown ? -1 : 0;
        break;
      case 'KeyF':
        if (isDown) {
          inputRef.current.flaps = (inputRef.current.flaps + 1) % 4;
        }
        break;
      case 'KeyG':
        if (isDown) {
          inputRef.current.gear = !inputRef.current.gear;
        }
        break;
      case 'Space':
        inputRef.current.brake = isDown;
        break;
    }
    
    planeRef.current.setInput(inputRef.current);
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = babylonEngine.init(canvasRef.current);
    engineRef.current = engine;
    
    const scene = babylonEngine.createScene();
    
    const plane = createPlane(scene);
    planeRef.current = plane;
    
    const airport = createAirport(scene);
    
    plane.loadModel('/models/a320.glb').catch(() => {
      console.log('Using procedural A320 model');
    });
    
    const mesh = plane.getMesh();
    if (mesh) {
      babylonEngine.setFollowTarget(mesh);
    }
    
    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);
    
    const handleKeyDown = (e: KeyboardEvent) => handleInput(e, true);
    const handleKeyUp = (e: KeyboardEvent) => handleInput(e, false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    startGame();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      babylonEngine.dispose();
    };
  }, [startGame, handleInput]);

  useEffect(() => {
    if (!roomId) return;

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to game server');
      setConnected(true);
      if (socket.id) {
        localStorage.setItem('socketId', socket.id);
      }
      
      socket.emit('join-room', { roomId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from game server');
      setConnected(false);
    });

    socket.on('room-joined', (room: any, playersList: MultiplayerPlayer[]) => {
      console.log('Joined room:', room.id);
      setPlayers(playersList);
      
      playersList.forEach(p => {
        if (p.id !== socket.id) {
          addPlayer(p);
        }
      });
    });

    socket.on('player-joined', (player: MultiplayerPlayer) => {
      console.log('Player joined:', player.nickname);
      addPlayer(player);
    });

    socket.on('player-left', (playerId: string) => {
      console.log('Player left:', playerId);
      removePlayer(playerId);
    });

    socket.on('player-update', (playerId: string, data: Partial<MultiplayerPlayer>) => {
      updatePlayer(playerId, data);
    });

    socket.on('game-state', (state: any) => {
      if (state.players) {
        setPlayers(state.players);
        state.players.forEach((p: MultiplayerPlayer) => {
          if (p.id !== socket.id) {
            addPlayer(p);
          }
        });
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [roomId, addPlayer, removePlayer, updatePlayer, setPlayers, setConnected]);

  useEffect(() => {
    if (!engineRef.current || !planeRef.current) return;
    
    const engine = engineRef.current;
    const scene = babylonEngine.getScene();
    const socket = socketRef.current;
    if (!scene) return;

    const localPlayerId = typeof window !== 'undefined' ? localStorage.getItem('socketId') || `player_${Date.now()}` : `player_${Date.now()}`;
    multiplayerManager.init(scene, localPlayerId);

    players.forEach((player, id) => {
      if (id !== localPlayerId) {
        multiplayerManager.addPlayer(player);
      }
    });

    const updateCallback = () => {
      const plane = planeRef.current;
      if (!plane) return;
      
      plane.update(engine.getDeltaTime());
      
      const state = plane.getState();
      
      const altFeet = state.altitude * 3.28;
      const vsFpm = state.verticalSpeed * 3.28 * 60;
      
      if (altFeet > 50 && !hasTakenOffRef.current) {
        hasTakenOffRef.current = true;
        setHasTakenOff(true);
      }
      
      if (altFeet < 10 && hasTakenOffRef.current && vsFpm < 50) {
        hasTakenOffRef.current = false;
        setHasTakenOff(false);
      }
      
      const status = getFlightStatus(state.speed, altFeet, vsFpm, inputRef.current.throttle);
      
      setSpeed(state.speed);
      setAltitude(altFeet);
      setHeading(state.heading);
      setThrottle(inputRef.current.throttle);
      setFlaps(inputRef.current.flaps);
      setGear(inputRef.current.gear);
      setFuel(state.fuel);
      setVerticalSpeed(vsFpm);
      setFlightStatus(status);

      multiplayerManager.update(engine.getDeltaTime());

      if (socket && roomId) {
        const now = Date.now();
        if (now - lastUpdateRef.current >= UPDATE_RATE_MS) {
          lastUpdateRef.current = now;

          socket.emit('update-player', {
            position: {
              x: state.position.x,
              y: state.position.y,
              z: state.position.z,
            },
            rotation: {
              x: state.rotation.x,
              y: state.rotation.y,
              z: state.rotation.z,
            },
            speed: state.speed,
          });
        }
      }

      const allPositions = multiplayerManager.getAllPlayerPositions();
      allPositions.forEach((data, playerId) => {
        const player = players.get(playerId);
        if (player) {
          updatePlayer(playerId, {
            position: { x: data.position.x, y: data.position.y, z: data.position.z },
            rotation: { x: data.rotation.x, y: data.rotation.y, z: data.rotation.z },
          });
        }
      });
    };
    
    scene.onBeforeRenderObservable.add(updateCallback);
    
    return () => {
      scene.onBeforeRenderObservable.removeCallback(updateCallback);
      multiplayerManager.clear();
    };
  }, [setSpeed, setAltitude, setHeading, setThrottle, setFlaps, setGear, setFuel, setVerticalSpeed, setFlightStatus, setHasTakenOff, roomId, players, updatePlayer]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ touchAction: 'none' }}
    />
  );
}
