'use client';

import { useGameStore, FlightStatus } from '@/store/gameStore';

const statusLabels: Record<FlightStatus, string> = {
  parked: 'PARKED',
  taxiing: 'TAXIING',
  takeoff: 'TAKEOFF',
  climbing: 'CLIMBING',
  cruising: 'CRUISING',
  descending: 'DESCENDING',
  landing: 'LANDING',
  rolled_out: 'ROLLED OUT',
};

const statusColors: Record<FlightStatus, string> = {
  parked: 'text-gray-400',
  taxiing: 'text-yellow-400',
  takeoff: 'text-orange-400',
  climbing: 'text-green-400',
  cruising: 'text-cyan-400',
  descending: 'text-blue-400',
  landing: 'text-orange-400',
  rolled_out: 'text-yellow-400',
};

export function HUD() {
  const plane = useGameStore((state) => state.plane);

  const formatSpeed = (speed: number) => speed.toFixed(0);
  const formatAlt = (alt: number) => alt.toFixed(0);
  const formatFuel = (fuel: number) => fuel.toFixed(0);

  const getFlightStatus = (): FlightStatus => {
    const speed = plane.speed;
    const alt = plane.altitude;
    const vs = plane.verticalSpeed;
    const throttle = plane.throttle;
    
    if (speed === 0 && throttle === 0) return 'parked';
    if (speed > 0 && alt < 50) return speed < 100 ? 'taxiing' : 'takeoff';
    if (alt > 50 && alt < 5000) {
      if (vs > 100) return 'climbing';
      if (vs < -100) return 'descending';
      return alt < 1000 ? 'climbing' : 'cruising';
    }
    if (alt > 5000) {
      if (vs < -100) return 'descending';
      return 'cruising';
    }
    if (alt < 200 && vs < -50) return 'landing';
    if (alt < 50 && speed > 50) return 'rolled_out';
    
    return 'cruising';
  };

  const status = plane.status || getFlightStatus();

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
          <div className={`text-right text-2xl font-bold ${
            plane.speed > 250 ? 'text-green-400' : 
            plane.speed > 0 ? 'text-yellow-400' : 'text-gray-400'
          }`}>
            {formatSpeed(plane.speed)} <span className="text-sm">km/h</span>
          </div>

          <div className="text-gray-400">ALT</div>
          <div className={`text-right text-2xl font-bold ${
            plane.altitude > 1000 ? 'text-blue-400' : 'text-cyan-400'
          }`}>
            {formatAlt(plane.altitude)} <span className="text-sm">ft</span>
          </div>

          <div className="text-gray-400">VS</div>
          <div className={`text-right text-xl font-bold ${
            plane.verticalSpeed > 0 ? 'text-green-400' : 
            plane.verticalSpeed < 0 ? 'text-red-400' : 'text-gray-400'
          }`}>
            {plane.verticalSpeed > 0 ? '+' : ''}{plane.verticalSpeed.toFixed(0)}
            <span className="text-sm ml-1">fpm</span>
          </div>

          <div className="text-gray-400">HDG</div>
          <div className="text-right text-xl font-bold text-yellow-400">
            {plane.heading.toFixed(0)}°
          </div>

          <div className="text-gray-400">FUEL</div>
          <div className={`text-right text-xl font-bold ${
            plane.fuel > 50 ? 'text-green-400' : 
            plane.fuel > 20 ? 'text-yellow-400' : 'text-red-400'
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
          <div className="text-gray-400 text-sm">FLIGHT STATUS</div>
          <div className={`text-2xl font-bold ${statusColors[status]}`}>
            {statusLabels[status]}
          </div>
        </div>
      </div>

      {plane.speed > 250 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-green-500/20 border-2 border-green-500 rounded-lg px-6 py-3">
            <div className="text-green-400 font-bold text-xl">
              AIRBORNE ✈️
            </div>
          </div>
        </div>
      )}

      {plane.speed > 100 && plane.altitude < 100 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-orange-500/20 border-2 border-orange-500 rounded-lg px-6 py-3 animate-pulse">
            <div className="text-orange-400 font-bold text-xl">
              TAKEOFF 🚀
            </div>
          </div>
        </div>
      )}

      {plane.verticalSpeed < -200 && plane.altitude < 3000 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-blue-500/20 border-2 border-blue-500 rounded-lg px-6 py-3">
            <div className="text-blue-400 font-bold text-xl">
              DESCENDING 📉
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
