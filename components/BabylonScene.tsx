'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import * as BABYLON from 'babylonjs';
import { babylonEngine } from '@/lib/babylon/engine';
import { createPlane } from '@/lib/babylon/plane';
import { createAirport } from '@/lib/babylon/airport';
import { useGameStore } from '@/store/gameStore';

interface PlaneInputState {
  throttle: number;
  elevator: number;
  rudder: number;
  aileron: number;
  flaps: number;
  gear: boolean;
  brake: boolean;
}

export default function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<ReturnType<typeof createPlane> | null>(null);
  const engineRef = useRef<BABYLON.Engine | null>(null);
  const inputRef = useRef<PlaneInputState>({
    throttle: 0,
    elevator: 0,
    rudder: 0,
    aileron: 0,
    flaps: 0,
    gear: true,
    brake: false,
  });
  
  const {
    setSpeed,
    setAltitude,
    setHeading,
    setThrottle,
    setFlaps,
    setGear,
    setFuel,
    setVerticalSpeed,
    startGame,
  } = useGameStore();

  const handleInput = useCallback((event: KeyboardEvent, isDown: boolean) => {
    if (!planeRef.current) return;
    
    const current = inputRef.current;
    
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
      babylonEngine.setupFollowTarget(mesh);
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
    if (!engineRef.current || !planeRef.current) return;
    
    const engine = engineRef.current;
    const scene = babylonEngine.getScene();
    if (!scene) return;
    
    const updateCallback = () => {
      const plane = planeRef.current;
      if (!plane) return;
      
      plane.update(engine.getDeltaTime());
      
      const state = plane.getState();
      setSpeed(state.speed);
      setAltitude(state.altitude * 3.28);
      setHeading(state.heading);
      setThrottle(inputRef.current.throttle);
      setFlaps(inputRef.current.flaps);
      setGear(inputRef.current.gear);
      setFuel(state.fuel);
      setVerticalSpeed(state.verticalSpeed * 3.28 * 60);
    };
    
    scene.onBeforeRenderObservable.add(updateCallback);
    
    return () => {
      scene.onBeforeRenderObservable.removeCallback(updateCallback);
    };
  }, [setSpeed, setAltitude, setHeading, setThrottle, setFlaps, setGear, setFuel, setVerticalSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ touchAction: 'none' }}
    />
  );
}
