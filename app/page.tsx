import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 to-sky-600 flex flex-col items-center justify-center">
      <div className="text-center text-white mb-12">
        <h1 className="text-6xl font-bold mb-4 tracking-tight">
          ✈️ Flight Sim
        </h1>
        <p className="text-xl text-sky-200 mb-2">
          Realistic Airbus A320 Simulator
        </p>
        <p className="text-sm text-sky-300">
          Multiplayer • Real-time Physics • Immersive Experience
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Link
          href="/lobby"
          className="px-8 py-4 bg-white text-sky-900 font-bold text-xl rounded-lg hover:bg-sky-50 transition-colors shadow-lg"
        >
          Multiplayer Lobby
        </Link>
        <Link
          href="/game"
          className="px-8 py-4 bg-sky-800/50 text-white font-semibold rounded-lg hover:bg-sky-700 transition-colors border border-sky-600"
        >
          Quick Game (Solo)
        </Link>
        <button className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors">
          Settings
        </button>
      </div>

      <div className="mt-16 text-sky-200 text-sm">
        <p>Controls: W/S (Throttle) ↑/↓ (Elevator) ←/→ (Rudder) A/D (Aileron)</p>
        <p>F (Flaps) G (Gear) Space (Brake)</p>
      </div>
    </div>
  );
}
