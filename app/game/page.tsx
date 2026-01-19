'use client';

import BabylonScene from '@/components/BabylonScene';
import { HUD } from '@/components/UI/HUD';

export default function GamePage() {
  return (
    <div className="w-full h-screen bg-sky-200 overflow-hidden">
      <BabylonScene />
      <HUD />
    </div>
  );
}
