# Flight Sim - Airbus A320 Simulator

A realistic multiplayer flight simulator built with Next.js 16, Babylon.js 7, and Socket.io.

## Features

- **Realistic A320 Physics**: Lift, drag, thrust, and aerodynamic calculations
- **Procedural 3D Models**: Detailed A320 aircraft and airport built with code
- **Interactive Controls**: Full flight controls (throttle, elevator, rudder, aileron, flaps, gear)
- **Multiplayer Lobby**: Create/join rooms, chat with players, real-time updates
- **Modern UI**: HUD with speed, altitude, heading, fuel, and more

## Getting Started

### Prerequisites

- Node.js v22+
- pnpm

### Installation

```bash
pnpm install
```

### Running the Game

You need to run both the server and client:

**Terminal 1 - Server:**
```bash
pnpm run dev:server
```

**Terminal 2 - Client:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Multiplayer Lobby

The game features a full multiplayer lobby system:

- **Create Room**: Start your own room with optional password
- **Join Room**: Enter room ID to join existing rooms
- **Real-time Chat**: Chat with other players in the room
- **Player Ready System**: Mark yourself as ready to start
- **Auto-refresh**: Room list updates automatically

## 3D Models

This project uses **procedural 3D models** - no external downloads needed!

- **Airbus A320**: Detailed aircraft with fuselage, wings, engines, landing gear, cockpit windows
- **Airport**: Runway (4km), taxiways, apron, terminal buildings, control tower, lights, and signs

You can still add custom `.glb` models to `public/models/` if you want:
- `a320.glb` - Custom aircraft model
- `runway.glb` - Custom airport model

## Controls

| Key | Action |
|-----|--------|
| W/S | Throttle (Increase/Decrease) |
| ↑/↓ | Elevator (Pitch Up/Down) |
| ←/→ | Rudder (Yaw Left/Right) |
| A/D | Aileron (Roll Left/Right) |
| F | Flaps (Toggle) |
| G | Landing Gear (Toggle) |
| Space | Brake |

## Project Structure

```
flight-sim/
├── app/
│   ├── page.tsx           # Landing page
│   ├── game/
│   │   └── page.tsx       # Game canvas
│   └── lobby/
│       └── page.tsx       # Multiplayer lobby
├── components/
│   ├── BabylonScene.tsx   # 3D scene wrapper
│   └── UI/
│       └── HUD.tsx        # Heads-up display
├── lib/
│   ├── babylon/
│   │   ├── engine.ts      # Babylon.js setup
│   │   ├── physics.ts     # A320 flight physics
│   │   ├── plane.ts       # Procedural A320 model
│   │   └── airport.ts     # Procedural airport
│   └── socket.ts          # Socket.io client
├── server/
│   └── src/
│       ├── index.ts       # Express + Socket.io server
│       ├── game/
│       │   └── GameManager.ts  # Game state management
│       └── socket/
│           └── handlers.ts     # Socket event handlers
└── public/
    └── models/            # Custom .glb models (optional)
```

## Physics Model

The A320 physics simulation includes:

- **Aerodynamics**: Lift coefficient based on angle of attack, drag from flaps and gear
- **Engine**: Thrust calculation with fuel consumption
- **Flight Dynamics**: Pitch, roll, and yaw rates
- **Ground Interaction**: Collision detection with ground

### Parameters

| Parameter | Value |
|-----------|-------|
| Mass | 78,000 kg |
| Wing Area | 122.4 m² |
| Max Thrust | 2 × 120 kN |
| Takeoff Speed | ~250 km/h |
| Landing Speed | ~220 km/h |

## Development Roadmap

- [x] A320 procedural model
- [x] Airport procedural model
- [x] Realistic physics
- [x] Socket.io multiplayer
- [x] Lobby system
- [ ] Player profiles & statistics
- [ ] Game state synchronization
- [ ] Custom model support

## License

MIT
