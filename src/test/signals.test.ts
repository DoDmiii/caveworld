import { describe, it, expect } from 'vitest';
import { hornReady, recallOrders, alarmThreats, campResponse, campWarrior, CAMP_GUARD_POSTS } from '@/game/signals';
describe('war horn and camp alarm', () => {
  it('horn requires ownership and cooldown completion', () => {
    expect(hornReady([], 100, 0)).toBe(false);
    expect(hornReady(['horn'], 100, 101)).toBe(false);
    expect(hornReady(['horn'], 101, 101)).toBe(true);
  });
  it('recalls only standing followers within 600, without recruiting or changing saved orders', () => {
    const orders = new Map([['a',{id:'a',mode:'follow' as const,x:0,y:0}],['b',{id:'b',mode:'follow' as const,x:0,y:0}]]);
    expect([...recallOrders([{id:'a',x:600,y:0,down:false},{id:'b',x:601,y:0,down:false},{id:'c',x:0,y:0,down:false}],orders,{x:0,y:0}).keys()]).toEqual(['a']);
    expect(recallOrders([{id:'a',x:0,y:0,down:true}],orders,{x:0,y:0}).size).toBe(0);
    expect(orders.size).toBe(2);
  });
  it('drums detect only live hostile targets within 280', () => {
    const f = {id:'enemy',x:280,y:0,alive:true,hostile:true};
    expect(alarmThreats([f], [{x:0,y:0}])).toEqual([f]);
    expect(alarmThreats([{...f,x:281},{...f,hostile:false},{...f,alive:false}], [{x:0,y:0}])).toEqual([]);
    expect(alarmThreats([f],[])).toEqual([]);
  });
  it('women and pacifists never join camp defense', () => {
    for (const id of ['orka','ura','nuka','torvik','ymra','skorra']) expect(campWarrior(id)).toBe(false);
    for (const id of ['tamo','bruk','ilvar']) expect(campWarrior(id)).toBe(true);
  });
  it('alarm sends warriors against raiders and civilians to safety without recruiting', () => {
    const actors = [{id:'a',profile:'bruk',x:1000,y:700,down:false},{id:'b',profile:'nuka',x:1050,y:700,down:false}];
    const foe = {id:'f',x:1000,y:820,hostile:true,alive:true};
    const r = campResponse(actors,[foe],true);
    expect(r.targets.get('a')).toEqual(foe); expect(r.targets.has('b')).toBe(false);
    expect(r.orders.get('b')?.y).toBe(605);
    expect(campResponse(actors,[foe],false).orders.size).toBe(0);
    expect(campResponse([{id:'a',profile:'bruk',x:2000,y:700,down:false}], [foe],true).orders.size).toBe(0);
  });
  it('idle alarm gives every warrior its own gate post, away from the bed', () => {
    const actors = [{id:'ally-0',profile:'bruk',x:1000,y:700,down:false},{id:'ally-1',profile:'tamo',x:1010,y:700,down:false}];
    const r = campResponse(actors,[],true);
    const a = r.orders.get('ally-0')!, b = r.orders.get('ally-1')!;
    expect(Math.hypot(a.x-b.x,a.y-b.y)).toBeGreaterThanOrEqual(40);
    for (const o of [a,b]) { expect(Math.hypot(o.x-1046,o.y-690)).toBeGreaterThan(60); expect(o.y).toBeLessThan(790); }
    expect(new Set(CAMP_GUARD_POSTS.map(p=>`${p.x},${p.y}`)).size).toBe(CAMP_GUARD_POSTS.length);
  });
});
