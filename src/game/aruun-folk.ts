/** One shared, pixel-preserving atlas per uploaded Aruun look. */
import m0 from '@/assets/aruun-people/aruun-m0.png.asset.json';
import m1 from '@/assets/aruun-people/aruun-m1.png.asset.json';
import m2 from '@/assets/aruun-people/aruun-m2.png.asset.json';
import m3 from '@/assets/aruun-people/aruun-m3.png.asset.json';
import m4 from '@/assets/aruun-people/aruun-m4.png.asset.json';
import m5 from '@/assets/aruun-people/aruun-m5.png.asset.json';
import w0 from '@/assets/aruun-people/aruun-w0.png.asset.json';
import w1 from '@/assets/aruun-people/aruun-w1.png.asset.json';
import w2 from '@/assets/aruun-people/aruun-w2.png.asset.json';
import { ARUUN_PEOPLE } from './aruun-people';
const URLS: Record<string, string> = Object.fromEntries([m0,m1,m2,m3,m4,m5,w0,w1,w2].map((a, i) => [i < 6 ? `aruun-m${i}` : `aruun-w${i-6}`, a.url]));
export const ARUUN_FOLK = ARUUN_PEOPLE.map(p => {
  const url = URLS[p.look];
  if (!url) throw new Error(`Missing Aruun atlas: ${p.look}`);
  return { id: p.id, tex: p.look, url, walk: 6 as const, captive: p.captive, village: p.village, dx: p.dx, dy: p.dy,
    sleep: true as const, ...(p.female ? { death: true as const } : { warrior: true as const }) };
});