'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/lib/socket';
import Link from 'next/link';

interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  isPrivate: boolean;
  hostId: string;
}

export default function Lobby() {
  const {
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
    setReady,
    startGame,
    sendChat,
  } = useSocket();

  const [nickname, setNickname] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [activeTab, setActiveTab] = useState<'rooms' | 'create'>('rooms');

  useEffect(() => {
    getRooms();
    const interval = setInterval(getRooms, 5000);
    return () => clearInterval(interval);
  }, [getRooms]);

  const handleCreateRoom = () => {
    if (createName.trim()) {
      createRoom(createName.trim(), createPassword || undefined);
      setShowCreateModal(false);
      setCreateName('');
      setCreatePassword('');
    }
  };

  const handleJoinRoom = () => {
    if (joinRoomId.trim()) {
      joinRoom(joinRoomId.trim().toUpperCase(), joinPassword || undefined);
      setShowJoinModal(false);
      setJoinRoomId('');
      setJoinPassword('');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      sendChat(chatInput.trim());
      setChatInput('');
    }
  };

  const myPlayer = currentRoom ? Array.from(players.values()).find(p => p.id === 'socket.id' || true) : null;
  const isHost = currentRoom?.hostId === (typeof window !== 'undefined' ? localStorage.getItem('socketId') : '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-900 to-sky-700 text-white">
      <header className="bg-sky-950/50 backdrop-blur-sm p-4 border-b border-sky-700">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            ✈️ Flight Sim
          </Link>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </header>

      {!currentRoom ? (
        <main className="max-w-6xl mx-auto p-6">
          <div className="bg-sky-800/50 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'rooms' ? 'bg-white text-sky-900' : 'bg-sky-700/50 hover:bg-sky-700'
                }`}
              >
                Rooms
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  activeTab === 'create' ? 'bg-white text-sky-900' : 'bg-sky-700/50 hover:bg-sky-700'
                }`}
              >
                Create Room
              </button>
            </div>

            {activeTab === 'rooms' && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Available Rooms</h2>
                  <button
                    onClick={getRooms}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                  >
                    Refresh
                  </button>
                </div>

                {rooms.length === 0 ? (
                  <div className="text-center py-12 text-sky-300">
                    <p className="text-lg">No rooms available</p>
                    <p className="text-sm">Create a new room to get started!</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {rooms.map(room => (
                      <div
                        key={room.id}
                        className="bg-sky-900/50 rounded-lg p-4 flex justify-between items-center hover:bg-sky-800/50 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-lg">{room.name}</span>
                            {room.isPrivate && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                Private
                              </span>
                            )}
                          </div>
                          <p className="text-sky-400 text-sm">ID: {room.id}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sky-300">
                            {room.playerCount}/{room.maxPlayers} players
                          </span>
                          <button
                            onClick={() => {
                              setJoinRoomId(room.id);
                              setShowJoinModal(true);
                            }}
                            disabled={room.playerCount >= room.maxPlayers}
                            className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-sky-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                          >
                            Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'create' && (
              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-6">Create New Room</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2">Room Name</label>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="My Flight"
                      className="w-full px-4 py-3 bg-sky-900/50 border border-sky-600 rounded-lg focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Password (optional)</label>
                    <input
                      type="password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      placeholder="Leave empty for public"
                      className="w-full px-4 py-3 bg-sky-900/50 border border-sky-600 rounded-lg focus:outline-none focus:border-white"
                    />
                  </div>
                  <button
                    onClick={handleCreateRoom}
                    disabled={!createName.trim()}
                    className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-sky-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                  >
                    Create Room
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}
        </main>
      ) : (
        <main className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-4">
              <div className="bg-sky-800/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{currentRoom.name}</h2>
                    <p className="text-sky-400">Room ID: {currentRoom.id}</p>
                  </div>
                  <button
                    onClick={leaveRoom}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg transition-colors"
                  >
                    Leave Room
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {Array.from(players.values()).map(player => (
                    <div
                      key={player.id}
                      className="bg-sky-900/50 rounded-lg p-4 flex items-center gap-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: player.color || '#4ECDC4' }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{player.nickname}</p>
                        <p className="text-xs text-sky-400">
                          {player.id === currentRoom.hostId ? 'Host' : 'Player'}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${
                        player.isReady ? 'bg-green-500/20 text-green-400' : 'bg-sky-700/50 text-sky-400'
                      }`}>
                        {player.isReady ? 'Ready' : 'Not Ready'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setReady(true)}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors"
                  >
                    Ready
                  </button>
                  <button
                    onClick={() => setReady(false)}
                    className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold transition-colors"
                  >
                    Not Ready
                  </button>
                  <button
                    onClick={startGame}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-sky-800/50 rounded-xl p-4 backdrop-blur-sm h-96 flex flex-col">
                <h3 className="font-semibold mb-3">Chat</h3>
                <div className="flex-1 overflow-y-auto space-y-2 mb-3">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-semibold" style={{ color: players.get(msg.playerId)?.color }}>
                        {msg.playerName}:
                      </span>{' '}
                      <span className="text-sky-200">{msg.message}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendChat} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 bg-sky-900/50 border border-sky-600 rounded-lg focus:outline-none focus:border-white text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </form>
              </div>

              <div className="bg-sky-800/50 rounded-xl p-4 backdrop-blur-sm">
                <h3 className="font-semibold mb-2">Controls</h3>
                <div className="text-sm space-y-1 text-sky-300">
                  <p>W/S - Throttle</p>
                  <p>↑/↓ - Elevator</p>
                  <p>←/→ - Rudder</p>
                  <p>A/D - Aileron</p>
                  <p>F - Flaps</p>
                  <p>G - Gear</p>
                  <p>Space - Brake</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-sky-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Join Room</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Room ID</label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  className="w-full px-4 py-3 bg-sky-900/50 border border-sky-600 rounded-lg focus:outline-none focus:border-white uppercase"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Password (if required)</label>
                <input
                  type="password"
                  value={joinPassword}
                  onChange={(e) => setJoinPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 bg-sky-900/50 border border-sky-600 rounded-lg focus:outline-none focus:border-white"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJoinRoom}
                  disabled={!joinRoomId.trim()}
                  className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:bg-sky-700 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
