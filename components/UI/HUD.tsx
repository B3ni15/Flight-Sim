'use client';

import { useGameStore } from '@/store/gameStore';

export function HUD() {
  const plane = useGameStore((state) => state.plane);

  const formatSpeed = (speed: number) => speed.toFixed(0);
  const formatAlt = (alt: number) => alt.toFixed(0);
  const formatFuel = (fuel: number) => fuel.toFixed(0);

  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg font-mono">
        <div className="space-y-2">
          <div className="text-2xl font-bold">AIRBUS A320</div>
          <div className="text-sm text-gray-300">Flight Sim</div>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-black/70 text-white p-4 rounded-lg font-mono">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <div className="text-gray-400">SPEED</div>
          <div className="text-right text-2xl font-bold text-green-400">
            {formatSpeed(plane.speed)} <span className="text-sm">km/h</span>
          </div>

          <div className="text-gray-400">ALT</div>
          <div className="text-right text-2xl font-bold text-blue-400">
            {formatAlt(plane.altitude)} <span className="text-sm">ft</span>
          </div>

          <div className="text-gray-400">VS</div>
          <div className={`text-right text-xl font-bold ${
            plane.verticalSpeed > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {plane.verticalSpeed > 0 ? '+' : ''}{plane.verticalSpeed.toFixed(1)}
          </div>

          <div className="text-gray-400">HDG</div>
          <div className="text-right text-xl font-bold text-yellow-400">
            {plane.heading.toFixed(0)}°
          </div>

          <div className="text-gray-400">FUEL</div>
          <div className={`text-right text-xl font-bold ${
            plane.fuel > 20 ? 'text-green-400' : 'text-red-400'
          }`}>
            {formatFuel(plane.fuel)}%
          </div>

          <div className="text-gray-400">FLAPS</div>
          <div className="text-right text-xl font-bold text-cyan-400">
            {plane.flaps}
          </div>

          <div className="text-gray-400">GEAR</div>
          <div className={`text-right text-xl font-bold ${
            plane.gear ? 'text-red-400' : 'text-green-400'
          }`}>
            {plane.gear ? 'DOWN' : 'UP'}
          </div>

          <div className="text-gray-400">THR</div>
          <div className="text-right text-xl font-bold text-orange-400">
            {plane.throttle.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg font-mono">
        <div className="text-lg font-bold mb-2">Controls</div>
        <div className="text-sm space-y-1">
          <div><span className="text-yellow-400">W/S</span> - Throttle</div>
          <div><span className="text-yellow-400">↑/↓</span> - Elevator</div>
          <div><span className="text-yellow-400">←/→</span> - Rudder</div>
          <div><span className="text-yellow-400">A/D</span> - Aileron</div>
          <div><span className="text-yellow-400">F</span> - Flaps</div>
          <div><span className="text-yellow-400">G</span> - Gear</div>
          <div><span className="text-yellow-400">Space</span> - Brake</div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/70 text-white p-4 rounded-lg font-mono">
        <div className="text-center">
          <div className="text-gray-400 text-sm">STATUS</div>
          <div className={`text-xl font-bold ${
            plane.speed > 250 ? 'text-green-400' :
            plane.speed > 0 ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {plane.speed > 250 ? 'AIRBORNE' : plane.speed > 0 ? 'TAXIING' : 'STOPPED'}
          </div>
        </div>
      </div>
    </div>
  );
}
