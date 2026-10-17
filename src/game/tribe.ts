import ally0 from '@/assets/tribe/ally-0.png.asset.json';
import ally1 from '@/assets/tribe/ally-1.png.asset.json';
import ally2 from '@/assets/tribe/ally-2.png.asset.json';
import ally3 from '@/assets/tribe/ally-3.png.asset.json';
import ally4 from '@/assets/tribe/ally-4.png.asset.json';
import ally5 from '@/assets/tribe/ally-5.png.asset.json';

// Atlas frames 0–7 are idle directions, followed by six walking frames per direction.
export const CAMP_ALLIES = [
  { id: 'ally-0', url: ally0.url, walkingFrames: 6, x: 940, y: 655 },
  { id: 'ally-1', url: ally1.url, walkingFrames: 6, x: 1080, y: 650 },
  { id: 'ally-2', url: ally2.url, walkingFrames: 6, x: 925, y: 710 },
  { id: 'ally-3', url: ally3.url, walkingFrames: 6, x: 1075, y: 730 },
  { id: 'ally-4', url: ally4.url, walkingFrames: 6, x: 975, y: 750 },
  { id: 'ally-5', url: ally5.url, walkingFrames: 0, x: 1100, y: 685 },
] as const;

export function isCampDestination(x: number, y: number) {
  return x >= 910 && x <= 1105 && y >= 635 && y <= 765
    && Math.hypot(x - 1000, y - 686) > 30
    && Math.hypot(x - 1046, y - 690) > 28;
}