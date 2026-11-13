import { CAVES, CAVE_IDS, CAVE_SIZE, CAVE_SPAWN, CAVE_EXIT, PAINT_WALL, PAINTINGS, caveAt, caveWalkable, caveDeposits, newCaves, mineDeposit, paint, sharpen, caveDamageFactor, caveSprintFactor, caveColdFactor, type CaveState, type CaveId, type PaintingId } from './caves';
import { renderCave } from './cave-render';
import { FIST_FINISHER } from './wedge';
import { EMPTY_DUELS, DUEL_EFFECTS, DUEL_HP, RING_RADIUS, SPECTATOR_RANGE, CHALLENGE_REACH, APPROACH_SPEED, APPROACH_ESCAPE, GATHER_MS, FIST_FINISHER_IMPACT, MOCK_LINES, CHEER_LINES, rollRules, acceptChance, claimsWoman, opponentDamage, playerDuelDamage, hitDuelist, playerYields, leftRing, ringSlot, duelTribute, recordOutcome, isShamed, onCooldown, setCooldown, nextMockDelay, challengeLine, rulesText, newDuelAi, duelThink, staggerAi, isDodging, duelVelocity, type DuelBook, type DuelRules, type DuelCause, type DuelOutcome, type DuelAi } from './duel';
import { createFlocks, createFish, tickFlocks, tickFish, guardsNotice, type Flock, type Fish, type Movement } from './ambient';
import { witnessesOf, resolveDeed, startRumor, spreadRumors, EMPTY_RUMORS, type RumorState, type DeedKind, type Observer } from './events';
import { EMPTY_CARRIERS, startCarriers, stepCarriers, isCarrier, pruneCarriers, type CarrierState, type CarrierView } from './chase';
import { EMPTY_LORE, recordLore, tribeOfVillage, LORE, type LoreState, type LoreEvent } from './lore';
import { EMPTY_FEAR, addFear, addFearAmount, decayFear, fearOf, moraleBreaks, canDemandTribute, demandTribute, fearTier, TRIBUTE_REL_COST, type FearState, type FearEvent } from './fear';
import { DRUM_ICON } from './signal-art';
import { hornReady, recallOrders, alarmThreats, campResponse, campAlarmActive, CAMP_RESPONSE_RANGE, HORN_COOLDOWN_MINUTES, HORN_RECALL_MINUTES, DRUM_REACH } from './signals';
import { cameraZoom } from './mobile-controls';
import { eat, roast, FOOD, type Food, type Pantry } from './food';
import * as Phaser from 'phaser';
import { MAP, BIOME_COLOR, BIOME_FLORA, BIOME_NAME, biomeAt, riverX, isFord, FORDS, villageAt, VILLAGES, dragonVillageAt, streamDist, STREAM_HALF } from './biomes';
import { DRAGON_TEXTURES, DRAGON_HOUSES, DRAGON_FENCES } from './dragon';
import { TERRACES, cliffPoints, heightAt, nearCliff, CLIFF_H } from './terrain';
import { canRecruit, MAX_COMPANIONS, companionWeapon, ALLY_REACH, ALLY_STRIKE_MS, ALLY_DAMAGE, newAllyHealth, hitAlly, tickAllyHealth, allyDowned, pickVictim, type AllyHealth, type CompanionOrder, type Foe } from './companions';
import { CompanionMovement, findCompanionPath, clearCompanionPoint, type CompanionActor, type Block } from './companion-movement';
import { getAvailableInteractions } from './interactions';
import { EMPTY_REPRO, conceive, advanceDay, birthSuspicion, reproLabels, PLAYER, type ReproState } from './reproduction';
import { EMPTY_COUPLES, addLure, seductionRefusal, witnessReaction, discover, secretAffair, relationLabel, GIFT_LURE, GREET_LURE, COUPLES, womanOf, LURE_NEEDED, type CouplesState, type WitnessReaction } from './partners';
import { ADULT_WOMEN, CLOSENESS_MS, closenessRefusal, closenessWitnesses, blocksSight, type ClosenessContext } from './bonding';
import { FINISHER_REACH, flankSlot, separation, lungeIndex, hitFighter, recoverFighter, canFinish, canFinishWith, finisherStyle, finisherImpactFrame, finishFighter, KNOCKDOWN_MS, newFighter, hitWarrior, isLethalWeapon, FIGHTER_HP } from './combat';
import north from '@/assets/north.png.asset.json';
import { corpseParts } from './corpse-art';
import northEast from '@/assets/north-east.png.asset.json';
import east from '@/assets/east.png.asset.json';
import southEast from '@/assets/south-east.png.asset.json';
import south from '@/assets/south.png.asset.json';
import southWest from '@/assets/south-west.png.asset.json';
import west from '@/assets/west.png.asset.json';
import northWest from '@/assets/north-west.png.asset.json';
import campfire from '@/assets/campfire.png.asset.json';
import { CAMP_TEXTURES, CAMP_LAYOUT } from './camp';
import { EMPTY_FIRES, IGNITE_MS, IGNITE_RANGE, HEAT_DAMAGE_PER_SEC, firePhase, ruinSmoking, isBurning, ignite, inHeat, rebuildDue, respawnExtra, clearVillageFires, removeFires, repairHut, repairBlock, repairCostText, type FireState } from './arson';
import { RUIN_TEXTURES, FLAME_SHEET, SMOKE_SHEET, FLAMMABLE_HOUSES, doorPoint, ruinKey, type FlammableHouse } from './fire-art';
import { NORDIC_TEXTURES, NORDIC_LAYOUT, NORDIC_HOUSES } from './nordic';
import { lootHouse } from './village-loot';
import tree0 from '@/assets/tree-east.png.asset.json';
import tree1 from '@/assets/tree-south-east.png.asset.json';
import tree2 from '@/assets/tree-south.png.asset.json';
import tree3 from '@/assets/tree-south-west.png.asset.json';
import tree4 from '@/assets/tree-west.png.asset.json';
import tree5 from '@/assets/tree-north-west.png.asset.json';
import tree6 from '@/assets/tree-north.png.asset.json';
import tree7 from '@/assets/tree-north-east.png.asset.json';
import snowTree0 from '@/assets/snow/snow-tree-0.png.asset.json';
import snowTree1 from '@/assets/snow/snow-tree-1.png.asset.json';
import snowTree2 from '@/assets/snow/snow-tree-2.png.asset.json';
import snowRock0 from '@/assets/snow/snow-rock-0.png.asset.json';
import snowRock1 from '@/assets/snow/snow-rock-1.png.asset.json';
import snowRock2 from '@/assets/snow/snow-rock-2.png.asset.json';
import snowRock3 from '@/assets/snow/snow-rock-3.png.asset.json';
import snowRock4 from '@/assets/snow/snow-rock-4.png.asset.json';
import snowRock5 from '@/assets/snow/snow-rock-5.png.asset.json';
const SNOW_TREES=[snowTree0,snowTree1,snowTree2];
const SNOW_ROCKS=[snowRock0,snowRock1,snowRock2,snowRock3,snowRock4,snowRock5];
import walkEast from '@/assets/walk-east.png.asset.json';
import walkSouthEast from '@/assets/walk-south-east.png.asset.json';
import walkSouth from '@/assets/walk-south.png.asset.json';
import walkSouthWest from '@/assets/walk-south-west.png.asset.json';
import walkWest from '@/assets/walk-west.png.asset.json';
import walkNorthWest from '@/assets/walk-north-west.png.asset.json';
import walkNorth from '@/assets/walk-north.png.asset.json';
import walkNorthEast from '@/assets/walk-north-east.png.asset.json';
import { SKINS, SKIN_ANIMS, skinFrame, ARMED_SKINS, ARMED_ANIMS, armedFrame, isArmed, TORCH_SKINS, CLUB_SKINS } from './skins';
import { armorSpeed, armorDamage, armorCold, peltFor, playerTint, skinFor, type SkinId, PELT_NAME, type ArmorId } from './appearance';
import { XP, levelFromXp, RECIPES, craft, type ItemId, coldFactor, BANDAGE_HP_PER_SEC, BOLA_SLOW, BOLA_MS, pickupAmount } from './progress';
import { IDLE, WALK, ATTACK, SLEEP, BED, ICON_SPEAR, ICON_AXE, DEATH, CROUCH, FINISHER, BEHEAD, type Weapon } from './gear';
import { TIGER, GAZELLE, SNOW, WOLF_EAT, type SnowKind } from './wildlife';
const NAME: Record<string, string> = { tiger: 'Säbelzahntiger', gazelle: 'Gazelle', wolf: 'Schneewolf', bear: 'Höhlenbär', mammoth: 'Mammut' };
const reachOf = (k: string) => k === 'mammoth' ? 48 : k === 'bear' ? 38 : 32;
import { tickTask, nextTask, taskLabel, type TaskState } from './tasks';
import { preloadCampers, createCampers, tickCampers, type Camper } from './campers';
import resWood from '@/assets/res-wood.png.asset.json';
import resStone from '@/assets/res-stone.png.asset.json';
import resFlint from '@/assets/res-flint.png.asset.json';
import resFiber from '@/assets/res-fiber.png.asset.json';
import { saveGame, type GameSave } from './save';
import { preloadChildren, syncChildren, tickChildren, type Kid } from './child-folk';
import { FOLK_HOMES, preloadFolk, createFolk, tickFolk, poseFolk, dieFolk, isWarrior, surrenderFrameOf, boundFrame, isChampion, type Folk } from './nordic-folk';
import { championFallen, assignAllyTargets, recordChampionDeath, villagesToRespawn, clearRespawn, CHAMPION_HP, CHAMPION_DAMAGE, CHAMPION_ALLY_DAMAGE, CHAMPION_NAMES, type RaidState } from './raid';
import { interact, drop, CARRY_SPEED , canExecute } from './captives';
import { woundFrom, bleedDamage, isBleeding, limpFactor, hitstopMs } from './wounds';
import { weatherAt, regionOf, WEATHER, weatherColdFactor, fireStrength, isWet, type Weather } from './weather';
import { headStage } from './decay';
import { pickCarcass, isFresh, FEED_REACH, FEED_ALERT_RATE, feedingSight, type Carcass } from './scavenge';
import skullAsset from '@/assets/severed_skull.png.asset.json';
import to0 from '@/assets/totem/totem-0.png.asset.json';import to1 from '@/assets/totem/totem-1.png.asset.json';import to2 from '@/assets/totem/totem-2.png.asset.json';import to3 from '@/assets/totem/totem-3.png.asset.json';import to4 from '@/assets/totem/totem-4.png.asset.json';import to5 from '@/assets/totem/totem-5.png.asset.json';import to6 from '@/assets/totem/totem-6.png.asset.json';import to7 from '@/assets/totem/totem-7.png.asset.json';
const TOTEM_TEX=[to0,to1,to2,to3,to4,to5,to6,to7];
import { TOTEM_FEAR_RANGE, STRUCTURES, placementError, canAfford, pay, refund, hangMeat, collectJerky, dryCount, dryProgress, RACK_SLOTS, SHELTER_RANGE, type Placed, type StructureKind } from './building';
import { TRAPS, TRAP_KINDS, PIT_DAMAGE, trapPlacementError, triggerTrap, collectTrap, type Trap, type TrapKind, type TrapTarget } from './traps';
import rack0 from '@/assets/build/rack-0.png.asset.json';
import rack1 from '@/assets/build/rack-1.png.asset.json';
import rack2 from '@/assets/build/rack-2.png.asset.json';
import sh0 from '@/assets/build/shelter-0.png.asset.json';
import sh1 from '@/assets/build/shelter-1.png.asset.json';
import sh2 from '@/assets/build/shelter-2.png.asset.json';
import sh3 from '@/assets/build/shelter-3.png.asset.json';
import sh4 from '@/assets/build/shelter-4.png.asset.json';
import sh5 from '@/assets/build/shelter-5.png.asset.json';
import sh6 from '@/assets/build/shelter-6.png.asset.json';
import sh7 from '@/assets/build/shelter-7.png.asset.json';
import ba0 from '@/assets/build/barricade-0.png.asset.json';
import ba1 from '@/assets/build/barricade-1.png.asset.json';
import ba2 from '@/assets/build/barricade-2.png.asset.json';
import ba3 from '@/assets/build/barricade-3.png.asset.json';
import ba4 from '@/assets/build/barricade-4.png.asset.json';
import ba5 from '@/assets/build/barricade-5.png.asset.json';
import ba6 from '@/assets/build/barricade-6.png.asset.json';
import ba7 from '@/assets/build/barricade-7.png.asset.json';
const RACK_TEX=[rack0,rack1,rack2],SHELTER_TEX=[sh0,sh1,sh2,sh3,sh4,sh5,sh6,sh7],BARRICADE_TEX=[ba0,ba1,ba2,ba3,ba4,ba5,ba6,ba7];
/** Texture key of a structure: racks pick a stable variant, rotating builds use their direction. */
const structTex=(s:{kind:StructureKind;dir:number;id?:string})=>s.kind==='drum'?'drum-0':s.kind==='rack'?`rack-${[...(s.id??'')].reduce((a,c)=>a+c.charCodeAt(0),0)%3}`:`${s.kind}-${s.dir}`;
export type BuildCommand={op:'select';kind:StructureKind|TrapKind}|{op:'rotate'|'place'|'remove'|'cancel'};
export type BuildStatus={kind:StructureKind|TrapKind;dir:number;error:string|null};
import { CHEST_POS, CHEST_RANGE, EMPTY_CHEST, deposit, withdraw, type ChestGoods, type Storable } from './storage';
import { getProfile, profileState, PROFILE_IDS, type ProfileStates } from './profiles';
import { advanceTrust, trustSteps, TRUST_STEPS, type TrustBook, type TrustEvent } from './trust';
import { personalDialogues } from './trust-dialogue';
import { emptyCampSocial, availableCampDialogues, resolveCampDialogue, pairBond, bondLabel, type CampSocial, type CampDialogue } from './camp-dialogue';
import { partyBonuses, discountedRecipe, bonusYield, BRUK_EXTRA_HP, refusesFight, partyHungerFactor, followRefusal, nukaSnack, YMRA_TRADE_BONUS, companionPace, leashExceeded, uraColdDamage, triesToFlee, ILVAR_ESCAPE_DIST, type PartyBonuses } from './bonuses';
import type { ProfileView } from './ProfileDetails';

import { decideReaction, type BehaviorDecision } from './behavior';
import { EMPTY_WARBANDS, scheduleRaid, launchDue, arrive, advanceRaid, endRaid, retreat, fordRoute, addRevenge, burnTarget, raidGoalsDone, raidSpoils, torchCount, MAX_RAIDERS, MIN_SQUAD, MARCH_LIMIT_MINUTES, CAMP_ARRIVAL, RAID_SIGHT, RAID_TORCH_MS, TORCH_ENGAGE, DEFENDER_ENGAGE, SQUAD_BROKEN_FEAR, RAIDER_HP, type WarbandState } from './warbands';
import { PERSONAL_SPACE, SHOVE_RANGE, SHOVE_SPEED, SHOVE_MS, SHOVE_DAMAGE, SHOVE_COOLDOWN_MS, KIN_ALARM_RADIUS, CARRY_SIGHT, shoveStep, nextStrikes, isKinCrime, guardsSpace, escortGoal, pickEscort } from './tension';
import { warningLevel, patrolsActive, patrolAttacks, patrolRoute, pickBark, BARK_MS, BARK_COOLDOWN_MS, WARNING_NAME, type BarkKind, type WarningLevel } from './patrols';
import { getVillageRelationship } from './relationships';
import type { InteractionContext, InteractionId } from './interactions';
import { EMPTY_RELATIONSHIPS, changeVillageRelationship, changePersonalRelationship, getPersonalRelationship, isAlarmActive, raiseAlarm, type RelationshipState } from './relationships';
import { resolveInteraction, villageKey, INTERACTION_RANGE, isSocialAction, socialReady, SOCIAL_COOLDOWN_MS } from './tribal';
import { START_MINUTES, clockOf, isNight, skyTint, ambientTemp, tickHunger, tickWarmth, survivalDamage, advanceClock, canSprint, nextExhausted, HUNGER_WARN, COLD_WARN, SLEEP_CLOCK_PER_SEC, SLEEP_HUNGER_COST } from './survival';
import { newTutorial, tutorialEvent, TUTORIAL_DONE, type TutorialEvent, type TutorialState } from './tutorial';
import { TREE_HP, ROCK_HP, TREE_DROP, ROCK_DROP, RESOURCE_NAME, emptyStock, gain, type Resource, type Stock } from './harvest';

export type CaveCommand = { op: 'paint'; id: PaintingId } | { op: 'sharpen' | 'fire' | 'shelter' };
export type GameInput = { cheatRaid?: boolean; duelChoice?: 'accept' | 'flee' | null; torch?: 'main' | 'off' | null; armor?: ArmorId | null; fly?: boolean; horn?: boolean; drumToggle?: boolean; zoomScale?: number; focus?: boolean; throwSpear?: boolean; caveCommand?: CaveCommand | null; x: number; y: number; sprint: boolean; action: number; attack: number; paused: boolean; weapon: Weapon; sleep: boolean; crouch: boolean; respawn: number; eat: Food | null; club: boolean; craft: ItemId | null; save: number; interaction?: { id: InteractionId; target: string } | null; dialogueChoice?: { target: string; dialogue: string; choice: string } | null; chestTransfer?: { kind: Storable; n: number } | null; chestToggle?: number; build?: BuildCommand | null };
export type TalkTarget = InteractionContext & { id: string; name: string; profile?: ProfileView | undefined; dialogues?: CampDialogue[] };
export type DuelStatus = { phase: 'approach' | 'prompt' | 'gather' | 'fight' | 'done'; name: string; rules: string; cause: DuelCause; line?: string; woman?: string };
export type GameStatus = { duel?: DuelStatus | null; shamed?: string | null; lore?: LoreState; skull?: number; wolfPelt?: number; sabrePelt?: number; bleeding?: boolean; campAlarm?: boolean; nearDrum?: boolean; hornCooldown?: number; caves?: CaveState; cavePrompt?: string | null; nearPaint?: boolean; x: number; y: number; stamina: number; health: number; berries: number; meat: number; cooked: number; nearFire: boolean; healPulse: number; area: string; message: string; weapon: Weapon; sleeping: boolean; nearBed: boolean; hidden: boolean; crouching: boolean; dead: boolean; wood: number; stone: number; flint: number; fiber: number; xp: number; level: number; owned: ItemId[]; hunger: number; warmth: number; day: number; minutes: number; talk?: TalkTarget | null; companionCount?: number; craftDiscount?: boolean; nearChest?: boolean; chest?: ChestGoods; chestOpen?: boolean; tutorial?: TutorialState; squad?: SquadMember[]; jerky?: number; build?: BuildStatus | null; nearRack?: { hung: number; ready: number } | null; nearTrap?: { meat: number } | null; nearOwnBuild?: boolean; weather?: Weather; boss?: { name: string; hp: number; max: number; down: boolean } | null };
export type SquadMember = { id: string; name: string; hp: number; max: number; down: number; portrait: string; frame: string };
type Creature = {
  kind: 'tiger' | 'gazelle' | SnowKind;
  slowUntil?: number;
  sprite: Phaser.Physics.Arcade.Sprite;
  state: 'idle' | 'wander' | 'flee' | 'chase' | 'attack' | 'dead';
  facing: number;
  hp: number;
  stateUntil: number;
  nextDecision: number;
  nextAttack: number;
  wanderX: number;
  wanderY: number;
  turnAt?: number;
  alert?: number;
  feedOn?: string | undefined;
  feeding?: boolean;
};
const sprites = [east, southEast, south, southWest, west, northWest, north, northEast];
const treeTex = [tree0,tree1,tree2,tree3,tree4,tree5,tree6,tree7];
const walkSheets = [walkEast, walkSouthEast, walkSouth, walkSouthWest, walkWest, walkNorthWest, walkNorth, walkNorthEast];
const WORLD = 2048;
// Start camp sits in the forecourt of a cave carved into the northern massif.
const CAMP = { x: 1000, y: 640 };
const FIRE_DY = 40;

export function createWorld(parent: HTMLElement, input: GameInput, onStatus: (s: GameStatus) => void, initial: GameSave | null = null) {
  class Wilderness extends Phaser.Scene {
    caves: CaveState = newCaves();
    caveView: ReturnType<typeof renderCave> | undefined;
    caveCollider?: Phaser.Physics.Arcade.Collider;
    caveHidden = new Map<Phaser.GameObjects.GameObject, boolean>();
    caveDisabled: Phaser.Physics.Arcade.Body[] = [];
    cavePrompt: string | null = null;
    caveOreHits = new Map<string, number>();
    caveFollowers() { return this.companionActors().filter(a => this.companionOrders.get(a.id)?.mode === 'follow'); }
    enterCave(id: CaveId, restore = false) {
      const p = this.player; if (!p || this.carried || this.spear) return;
      this.building = null; this.ghost?.setVisible(false); this.target = undefined; this.marker?.setVisible(false); this.talk = null;
      const keep = new Set<Phaser.GameObjects.GameObject>([p, ...this.caveFollowers().map(a => a.sprite), ...(this.night ? [this.night] : [])]);
      for (const o of this.children.list) {
        if (keep.has(o)) continue;
        if ('visible' in o && 'setVisible' in o) { const v = o as Phaser.GameObjects.Image; this.caveHidden.set(o, v.visible); v.setVisible(false); }
        if ('body' in o) { const b = (o as Phaser.Physics.Arcade.Sprite).body; if (b && b.enable) { b.enable = false; this.caveDisabled.push(b as Phaser.Physics.Arcade.Body); } }
      }
      this.caves = { ...this.caves, current: id };
      this.caveView = renderCave(this, id, this.caves);
      this.caveCollider = this.physics.add.collider([p, ...this.caveFollowers().map(a => a.sprite)], this.caveView.walls);
      this.physics.world.setBounds(0, 0, CAVE_SIZE, CAVE_SIZE);
      this.cameras.main.setBounds(0, 0, CAVE_SIZE, CAVE_SIZE);
      if (!restore) {
        p.setPosition(CAVE_SPAWN.x, CAVE_SPAWN.y); this.lastFacing = 6;
        this.caveFollowers().forEach((a, i) => { a.sprite.setPosition(288 + i * 28, 528); this.companionMovement.reset(a.id); });
      }
      p.setVelocity(0, 0); this.cameras.main.centerOn(p.x, p.y);
      this.nearBed = false; this.nearChest = false; this.nearRack = null; this.nearDrum = false;
      this.message = `${CAVES[id].name}${(this.owned.includes('torch')&&!!input.torch) ? '' : ' · Ohne Fackel ist es stockfinster'}`; this.messageUntil = this.time.now + 2500;
      this.lastAction = input.action;
      if (!restore) this.persist();
    }
    exitCave() {
      const p = this.player, id = this.caves.current; if (!p || !id) return;
      this.caveCollider?.destroy(); this.caveView?.destroy(); this.caveView = undefined;
      for (const [o, visible] of this.caveHidden) if (o.active && 'setVisible' in o) (o as Phaser.GameObjects.Image).setVisible(visible);
      for (const b of this.caveDisabled) b.enable = true;
      this.caveHidden.clear(); this.caveDisabled = []; this.caves = { ...this.caves, current: null }; this.cavePrompt = null;
      this.physics.world.setBounds(MAP.x, MAP.y, MAP.w, MAP.h); this.cameras.main.setBounds(MAP.x, MAP.y, MAP.w, MAP.h);
      const c = CAVES[id]; p.setPosition(c.x, c.y + 56).setVelocity(0, 0); this.lastFacing = 2;
      this.caveFollowers().forEach((a, i) => { a.sprite.setPosition(c.x - 28 + i * 28, c.y + 84); this.companionMovement.reset(a.id); });
      this.cameras.main.centerOn(p.x, p.y); this.tutLast = { x: p.x, y: p.y }; this.persist();
    }
    caveWarm(p: {x:number;y:number}) { const id=this.caves.current; return !!id && (this.caves.builds[id] ?? []).some(b => b.kind==='fire' && Math.hypot(b.x-p.x,b.y-p.y)<100); }
    caveAction(time: number) {
      const p=this.player, id=this.caves.current; if (!p || !id) return;
      if (Math.hypot(p.x-CAVE_EXIT.x,p.y-CAVE_EXIT.y)<36) { this.exitCave(); return; }
      if (Math.hypot(p.x-PAINT_WALL.x,p.y-PAINT_WALL.y)<44) { this.message='Ritualwand · wähle eine Malerei'; this.messageUntil=time+2000; return; }
      if (this.caveWarm(p) && this.meat>0) { const r=roast(this.pantry()); if(r){this.setPantry(r);this.message='Fleisch am Höhlenfeuer gebraten';this.messageUntil=time+2000;} }
      else { this.message='Mineralien mit der Steinaxt abbauen'; this.messageUntil=time+1800; }
    }
    applyCaveCommand(time: number) {
      const cmd=input.caveCommand; input.caveCommand=null;
      const p=this.player,id=this.caves.current; if(!cmd||!p||!id||this.dead)return;
      const nearWall=Math.hypot(p.x-PAINT_WALL.x,p.y-PAINT_WALL.y)<44;
      if(cmd.op==='paint') { if(!nearWall)return; const next=paint(this.caves,cmd.id); if(!next)return; this.caves=next;this.message=`${PAINTINGS[cmd.id].name} · ${PAINTINGS[cmd.id].effect}`; }
      else if(cmd.op==='sharpen') { const next=sharpen(this.caves);if(!next)return;this.caves=next;this.message='Obsidian-Klingen gefertigt · Speer und Keule sind geschärft'; }
      else {
        const cost=cmd.op==='fire'?{wood:4,stone:2}:{wood:3,fiber:4};
        const x=Math.round(p.x+Math.cos(this.lastFacing*Math.PI/4)*36),y=Math.round(p.y+Math.sin(this.lastFacing*Math.PI/4)*36);
        const builds=this.caves.builds[id]??[];
        if(!canAfford(cost,this.stock)||builds.length>=20||!caveWalkable(x,y)||builds.some(b=>Math.hypot(b.x-x,b.y-y)<48)||Math.hypot(x-CAVE_EXIT.x,y-CAVE_EXIT.y)<45||Math.hypot(x-PAINT_WALL.x,y-PAINT_WALL.y)<60){this.message='Hier ist kein freier Bauplatz oder Material fehlt';this.messageUntil=time+2200;return;}
        this.stock=pay(cost,this.stock);this.caves={...this.caves,builds:{...this.caves.builds,[id]:[...builds,{id:`${id}:${x}:${y}`,kind:cmd.op,x,y}]}};this.message=cmd.op==='fire'?'Höhlenfeuer errichtet':'Leder-Unterstand errichtet';
      }
      this.caveView?.refresh(this.caves);this.messageUntil=time+3000;this.persist();
    }
    updateCave(time: number, delta: number) {
      const p=this.player,id=this.caves.current;if(!p||!id)return;
      input.horn=false;input.drumToggle=false;
      this.applyCaveCommand(time);
      const k=this.keys,dt=Math.min(delta,100)/1000;
      if(input.save!==this.lastSaveReq){this.lastSaveReq=input.save;this.persist();this.message='Spielstand gespeichert';this.messageUntil=time+1800;}
      else if(time-this.lastAutosave>15000){this.lastAutosave=time;this.persist();}
      if(this.health<=0&&!this.dead){this.dead=true;this.playDeath(p);}
      if(this.dead){p.setVelocity(0,0);if(input.respawn!==this.lastRespawn){this.lastRespawn=input.respawn;this.dead=false;this.health=100;this.hunger=50;this.warmth=80;this.exitCave();p.setPosition(CAMP.x,CAMP.y-30);p.anims.stop();this.persist();}this.report(time,p);return;}
      let dx=input.x,dy=input.y;
      if(k?.['A']?.isDown||k?.['LEFT']?.isDown)dx=-1;if(k?.['D']?.isDown||k?.['RIGHT']?.isDown)dx=1;
      if(k?.['W']?.isDown||k?.['UP']?.isDown)dy=-1;if(k?.['S']?.isDown||k?.['DOWN']?.isDown)dy=1;
      if(input.paused||this.attacking){dx=0;dy=0;}
      const moving=Math.hypot(dx,dy)>0.12,running=!!(moving&&(input.sprint||k?.['SHIFT']?.isDown)&&canSprint(this.exhausted,this.stamina));
      const len=Math.max(1,Math.hypot(dx,dy));p.setVelocity(dx/len*(running?105:65),dy/len*(running?105:65));
      if(!input.paused){this.clock=advanceClock(this.clock,dt);this.stamina=Phaser.Math.Clamp(this.stamina+(running?-22*caveSprintFactor(this.caves):13)*dt,0,100);this.exhausted=nextExhausted(this.exhausted,this.stamina);this.hunger=tickHunger(this.hunger,dt*(running?caveSprintFactor(this.caves):1));const before=this.warmth;const warm=this.caveWarm(p);const roof=(this.caves.builds[id]??[]).some(b=>b.kind==='shelter'&&Math.hypot(b.x-p.x,b.y-p.y)<SHELTER_RANGE);const after=tickWarmth(before,{ambient:CAVES[id].ambient,nearFire:warm,seconds:dt});this.warmth=after<before?before-(before-after)*coldFactor(input.torch?this.owned:this.owned.filter(i=>i!=='torch'),false)*armorCold(this.armorNow())*caveColdFactor(this.caves)*(roof?0.5:1):after;this.health=Math.max(0,this.health-survivalDamage(this.hunger,this.warmth,dt));if(this.owned.includes('bandage')&&this.hunger>30)this.health=Math.min(100,this.health+BANDAGE_HP_PER_SEC*dt);}
      if(input.craft){const r=RECIPES.find(r=>r.id===input.craft);const next=r&&craft(r,this.stock,levelFromXp(this.xp),this.owned);if(r&&next){this.stock=next;this.owned.push(r.id);this.addXp(XP.craft);this.message=`${r.name} hergestellt`;this.messageUntil=time+2000;}input.craft=null;}
      if(input.weapon!==this.weapon)this.weapon=input.weapon==='none'||this.owned.includes(input.weapon)?input.weapon:'none';
      const attackKey=k?.['Q'];const attackNow=this.clickAttack||(attackKey&&Phaser.Input.Keyboard.JustDown(attackKey));this.clickAttack=false;
      if(!input.paused&&!this.attacking&&(input.attack!==this.lastAttack||attackNow)){this.lastAttack=input.attack;this.attacking=true;p.setVelocity(0,0);this.playAttack(p,this.held);
        const a=this.lastFacing*Math.PI/4;
        const d=caveDeposits(id).find(d=>!this.caves.mined.includes(d.id)&&Math.hypot(d.x-p.x,d.y-p.y)<48&&((d.x-p.x)*Math.cos(a)+(d.y-p.y)*Math.sin(a))/Math.max(1,Math.hypot(d.x-p.x,d.y-p.y))>0.25);
        if(d){if(this.held!=='axe'){this.message='Dafür brauchst du die Steinaxt';}else{const hits=(this.caveOreHits.get(d.id)??0)+1;this.caveOreHits.set(d.id,hits);if(hits>=3){const next=mineDeposit(this.caves,d.id);if(next){this.caves=next;this.caveView?.ore.get(d.id)?.destroy();this.addXp(15);this.message=`+${d.yield} ${d.kind==='obsidian'?'Obsidian':'Erd-Pigmente'} · +15 EP`;this.persist();}}else this.message='Die Mineralader bröckelt …';}this.messageUntil=time+2200;}
      }else this.lastAttack=input.attack;
      if(!this.attacking){if(moving){this.lastFacing=(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;this.playWalk(p,this.held,running);}else this.setIdle(p,this.held);}p.setDepth(60000+p.y);
      const e=k?.['E'];const actionNow=e&&Phaser.Input.Keyboard.JustDown(e);
      if(!input.paused&&!this.attacking&&(input.action!==this.lastAction||actionNow)){this.lastAction=input.action;this.caveAction(time);if(!this.caves.current){this.report(time,p);return;}}else this.lastAction=input.action;
      const food=input.eat;input.eat=null;if(food){const r=eat(this.pantry(),food);if(r){this.setPantry(r);this.healPulse++;}}
      const actors=this.caveFollowers();const blocks=(this.caveView?.walls.getChildren()??[]).flatMap(o=>{const b=(o as Phaser.Physics.Arcade.Sprite).body;return b?[{x:b.x,y:b.y,width:b.width,height:b.height}]:[];});
      this.companionMovement.tick(actors,this.companionOrders,p,this.lastFacing,time,input.paused||this.dead,running,false,blocks);
      for(const a of actors){a.sprite.setDepth(60000+a.sprite.y);if(!input.paused){const h=this.allyHealth(a.id);let next=tickAllyHealth(h,time,delta,this.caveWarm(a.sprite),this.allyMaxHp(a.id));const cold=uraColdDamage(PROFILE_IDS[a.id]??a.id,id==='ice'?'nordics':'wenjaWest',this.owned.includes('fur'))*caveColdFactor(this.caves);if(cold&&!this.caveWarm(a.sprite))next={...next,hp:Math.max(0,next.hp-cold*dt)};this.allyHp.set(a.id,next);}}
      this.cavePrompt=Math.hypot(p.x-CAVE_EXIT.x,p.y-CAVE_EXIT.y)<36?'Höhle verlassen':null;
      this.hidden=false;this.nearBed=false;this.nearChest=false;this.nearRack=null;this.talk=null;this.report(time,p);
    }
    player?: Phaser.Physics.Arcade.Sprite;
    keys?: Record<string, Phaser.Input.Keyboard.Key>;
    obstacles?: Phaser.Physics.Arcade.StaticGroup;
    berries: { x: number; y: number; picked: boolean; sprite: Phaser.GameObjects.Image }[] = [];
    stamina = 100;
    /** Leer gesprintet: erst ab SPRINT_RECOVER wieder sprinten. */
    exhausted = false;
    cooked = 0;
    healPulse = 0;
    health = 100;
    count = 0;
    lastAction = 0;
    lastAttack = 0;
    attacking = false;
    finisher: Folk | undefined = undefined;
    sleeping = false;
    weapon: Weapon = 'none';
    lastReport = 0;
    message = '';
    messageUntil = 0;
    lastFacing = 2;
    nearBed = false;
    nearChest = false;
    chest: ChestGoods = { ...EMPTY_CHEST };
    nearDrum = false;
    manualAlarm = false;
    campAlarm = false;
    hornReadyAt = 0;
    recallUntil = 0;
    responseOrders = new Map<string, CompanionOrder>();
    defenseTargets = new Map<string, Foe & { ref: Creature | Folk }>();
    signalWave(x: number, y: number) {
      const wave = this.add.image(x, y-10, 'signal-wave').setDepth(y+3000).setScale(0.3);
      this.tweens.add({ targets: wave, scale: 5, alpha: 0, duration: 1100, onComplete: () => wave.destroy() });
    }
    tickSignals(time: number, stopped: boolean) {
      const p = this.player; if (!p) return;
      const drums = this.structures.filter(s => s.kind === 'drum');
      this.nearDrum = drums.some(s => Math.hypot(s.x-p.x,s.y-p.y)<=DRUM_REACH);
      const key = this.keys?.['H'];
      const horn = input.horn || (key && Phaser.Input.Keyboard.JustDown(key)); input.horn = false;
      if (horn && !stopped && !this.attacking && !this.carried) {
        if (hornReady(this.owned,this.clock,this.hornReadyAt)) {
          this.hornReadyAt=this.clock+HORN_COOLDOWN_MINUTES;this.recallUntil=this.clock+HORN_RECALL_MINUTES;
          this.signalWave(p.x,p.y);this.message='Sammelruf! Dein Jagdtrupp kommt zu dir.';this.messageUntil=time+2500;this.persist();
        } else { this.message=this.owned.includes('horn')?'Das Kriegshorn ist noch nicht bereit':'Stelle zuerst ein Kriegshorn her';this.messageUntil=time+1800; }
      }
      const foes = this.allyFoes();
      const threats = alarmThreats(foes,drums);
      if (input.drumToggle) { input.drumToggle=false;if(this.nearDrum&&!stopped&&!this.building)this.toggleDrum(time,threats.length>0); }
      const raidNear=!!this.warband.active&&this.warband.active.phase!=='return'&&this.raiders().some(f=>f.combat.phase==='ready'&&Math.hypot(f.sprite.x-CAMP.x,f.sprite.y-CAMP.y)<=CAMP_RESPONSE_RANGE);
      if(!drums.length)this.manualAlarm=false;
      const active=campAlarmActive(drums.length,this.manualAlarm,threats.length,raidNear);
      if (active !== this.campAlarm) {
        this.campAlarm=active;
        if (!stopped) { this.message=active?'Lageralarm! Krieger verteidigen die Sippe.':'Das Lager ist wieder ruhig';this.messageUntil=time+3500; }
        if(active)drums.forEach(d=>this.signalWave(d.x,d.y));
      }
      const actors=this.companionActors();
      const response=campResponse(actors.map(a=>({id:a.id,x:a.sprite.x,y:a.sprite.y,profile:PROFILE_IDS[a.id]??a.id,down:allyDowned(this.allyHealth(a.id))})),foes,active);
      const previous=this.responseOrders;
      this.responseOrders=response.orders;
      this.defenseTargets=new Map([...response.targets].flatMap(([id,t])=>{const f=foes.find(f=>f.id===t.id);return f?[[id,f] as const]:[];}));
      for (const [id] of previous) if(!this.responseOrders.has(id)){const a=actors.find(a=>a.id===id);a?.sprite.setVelocity(0,0);this.companionMovement.reset(id);}
    }
    toggleDrum(time: number, threatened = false) {
      this.manualAlarm=!this.manualAlarm;
      this.message=this.manualAlarm?'Alarm-Trommel: Sippe in Alarmbereitschaft':threatened?'Feinde in der Nähe · Lageralarm bleibt aktiv':'Alarm-Trommel: Entwarnung';
      this.messageUntil=time+2400;this.persist();
    }
    movementOrders() {
      const orders=new Map(this.companionOrders);
      for(const [id,order] of this.responseOrders)orders.set(id,order);
      return orders;
    }
    chestOpen = false;
    lastChestToggle = 0;
    jerky = 0;
    structures: Placed[] = [];
    structSprites = new Map<string, Phaser.GameObjects.Image>();
    traps: Trap[] = [];
    trapSprites = new Map<string, Phaser.GameObjects.Image>();
    nearTrap: Trap | null = null;
    ghost?: Phaser.GameObjects.Image;
    building: BuildStatus | null = null;
    nearRack: Placed | null = null;
    dryGfx?: Phaser.GameObjects.Graphics;
    /** Draws a segmented drying bar above every rack holding meat (one segment per slot). */
    drawDryBars(){const g=this.dryGfx??=this.add.graphics();g.clear();for(const s of this.structures){if(s.kind!=='rack'||!s.meat.length)continue;const w=24,h=3,x=s.x-w/2,y=s.y-34;g.setDepth(s.y+1000);g.fillStyle(0x1a120b,0.85).fillRect(x-1,y-1,w+2,h+2);const sw=(w-(RACK_SLOTS-1))/RACK_SLOTS;s.meat.forEach((t,i)=>{const f=dryProgress(t,this.clock);g.fillStyle(f>=1?0x7fd04a:0xd9873a,1).fillRect(x+i*(sw+1),y,sw*f,h);});}}
    makeObstacle?: (x:number,y:number,key:string,bw:number,bh:number)=>Phaser.Physics.Arcade.Sprite|undefined;
    spawnStructure(s:Placed){const key=structTex(s);const o=s.kind==='barricade'?this.makeObstacle?.(s.x,s.y,key,26,8):s.kind==='shelter'?this.makeObstacle?.(s.x,s.y,key,40,8):s.kind==='totem'?this.makeObstacle?.(s.x,s.y,key,6,4):this.makeObstacle?.(s.x,s.y,key,22,6);if(o)this.structSprites.set(s.id,o as unknown as Phaser.GameObjects.Image);}
    /** Procedural pixel icons for the three trap kinds (no uploaded art yet). */
    makeTrapTextures(){
      if(this.textures.exists('trap-snare'))return;
      const g=this.add.graphics();
      g.lineStyle(2,0xc9a86a).strokeCircle(8,8,5);g.generateTexture('trap-snare',16,16);g.clear();
      g.fillStyle(0x120d08).fillEllipse(10,8,18,12);g.fillStyle(0xd8d0c0);for(let i=0;i<4;i++)g.fillTriangle(3+i*4,11,5+i*4,4,7+i*4,11);g.generateTexture('trap-pit',20,16);g.clear();
      g.fillStyle(0xe8e0cc).fillRect(2,6,12,3);g.fillRect(6,2,3,12);g.generateTexture('trap-rattle',16,16);g.destroy();
    }
    spawnTrap(t:Trap){this.makeTrapTextures();const o=this.add.image(t.x,t.y,`trap-${t.kind}`).setDepth(t.y+1);this.trapSprites.set(t.id,o);}
    /** Checks every trap against creatures and raiders crossing its radius; applies catches, wounds and alarms. */
    tickTraps(time:number){
      if(!this.traps.length||this.caves.current)return;
      const targets:{x:number;y:number;kind:TrapTarget;creature?:Creature}[]=[];
      for(const c of this.creatures){if(c.state==='dead')continue;const kind:TrapTarget|null=c.kind==='gazelle'?'prey':c.kind==='mammoth'?null:'predator';if(kind)targets.push({x:c.sprite.x,y:c.sprite.y,kind,creature:c});}
      for(const f of this.raiders())targets.push({x:f.sprite.x,y:f.sprite.y,kind:'raider'});
      if(!targets.length)return;
      let changed=false;
      for(const t of this.traps){
        const hit=targets.find(o=>Math.hypot(o.x-t.x,o.y-t.y)<TRAPS[t.kind].radius);
        if(!hit)continue;
        const r=triggerTrap(t,hit.kind);
        if(!r)continue;
        changed=true;
        if(r.trap){this.traps=this.traps.map(o=>o.id===t.id?r.trap!:o);}
        else{this.trapSprites.get(t.id)?.destroy();this.trapSprites.delete(t.id);this.traps=this.traps.filter(o=>o.id!==t.id);}
        if(r.event.kind==='catch'&&hit.creature){const c=hit.creature;c.state='dead';c.sprite.destroy();if(this.target===c)this.target=undefined;this.bleed(t.x,t.y,0,1,6);this.addXp(XP.gazelle);this.message=`Schlinge hat eine Gazelle gefangen · [E] Fleisch holen`;this.messageUntil=time+3000;}
        else if(r.event.kind==='wound'&&hit.creature){const c=hit.creature;c.hp-=PIT_DAMAGE;this.bleed(c.sprite.x,c.sprite.y,0,1,9);if(c.hp<=0){c.state='dead';c.sprite.destroy();if(this.target===c)this.target=undefined;const meat=this.add.image(c.sprite.x,c.sprite.y,'meat').setDepth(c.sprite.y);this.meatPickups.push({x:c.sprite.x,y:c.sprite.y,sprite:meat});this.addXp(XP[c.kind]);this.message=`${NAME[c.kind]} ist in der Fallgrube verendet`;this.messageUntil=time+3000;}else{c.state='flee';c.stateUntil=time+5000;this.message=`${NAME[c.kind]} hat sich in der Fallgrube verletzt`;this.messageUntil=time+2600;}}
        else if(r.event.kind==='alarm'){this.message='Knochenrassel klappert – Krieger nähern sich!';this.messageUntil=time+3000;}
      }
      if(changed)this.persist();
    }
    tutorial: TutorialState = newTutorial();
    tutLast?: { x: number; y: number };
    tut(ev: TutorialEvent, time: number) { const r = tutorialEvent(this.tutorial, ev); this.tutorial = r.state; if (r.completed) { this.message = this.tutorial.step >= TUTORIAL_DONE ? `Einführung geschafft · +${r.completed.xp} EP` : `Ziel erreicht: ${r.completed.title} · +${r.completed.xp} EP`; this.messageUntil = time + 2600; this.addXp(r.completed.xp); this.persist(); } }
    bed?: Phaser.GameObjects.Image;
    creatures: Creature[] = [];
    campers: Camper[] = [];
    tasks: Record<string, TaskState> = {};
    /** Severed heads rot to bare skulls after three game days. */
    /** Corpses lying in the open that scavengers can reach. */
    carcasses():Carcass[]{return this.folk.filter(f=>f.combat.phase==='dead'&&f.c.state==='free'&&f.deathClock!==undefined&&!villageAt(f.sprite.x,f.sprite.y,60)).map(f=>({id:f.c.id,x:f.sprite.x,y:f.sprite.y,deathClock:f.deathClock!}));}
    /** Wolves trot to the nearest fresh corpse and feed; returns true while that overrides wandering. */
    scavenge(c:Creature):boolean{
      const all=this.carcasses();const feeders:Record<string,number>={};for(const o of this.creatures)if(o!==c&&o.state==='wander'&&o.feedOn)feeders[o.feedOn]=(feeders[o.feedOn]??0)+1;
      let t=c.feedOn?all.find(k=>k.id===c.feedOn):undefined;
      if(!t||!isFresh(t,this.clock)){t=pickCarcass(c.sprite,all,this.clock,feeders);c.feedOn=t?.id;}
      if(!t)return false;
      const body=c.sprite.body as Phaser.Physics.Arcade.Body;const dx=t.x-c.sprite.x,dy=t.y-c.sprite.y,d=Math.hypot(dx,dy);
      if(d>FEED_REACH){body.setVelocity(dx/d*SNOW.wolf.speed*0.6,dy/d*SNOW.wolf.speed*0.6);return true;}
      body.setVelocity(0,0);c.facing=(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;c.feeding=true;return true;
    }
    tickSkulls(){for(const f of this.folk){if(f.combat.phase!=='dead')continue;if(f.deathClock===undefined)f.deathClock=this.clock;if(!f.beheaded)continue;const h=f.headSprite;if(h?.active&&headStage(f.deathClock,this.clock,f.skullTaken)==='skull'&&h.texture.key!=='severed-skull'&&!this.tweens.isTweening(h))h.setTexture('severed-skull').setScale(1).setAngle(0);}}
    tickTasks(){this.tickSkulls();if(this.caves.current)return;for(const [id,t] of Object.entries(this.tasks)){const r=tickTask(t,this.chest,this.clock,this.companionOrders.get(id)?.mode!=='follow');this.tasks[id]=r.task;this.chest=r.chest;}}
    companionOrders = new Map<string, CompanionOrder>();
    companionMovement = new CompanionMovement();
    allyFocus: string | undefined;
    allyHp = new Map<string, AllyHealth>();
    allyMaxHp(id: string) { return PROFILE_IDS[id] === 'bruk' ? 50 + BRUK_EXTRA_HP : 50; }
    allyHealth(id: string) { let h = this.allyHp.get(id); if (!h) { h = newAllyHealth(this.allyMaxHp(id)); this.allyHp.set(id, h); } return h; }
    meatCarry = 0; berryCarry = 0; tradeCarry = 0; snackDay = -1;
    followingPids() { return this.companionActors().filter(a => this.companionOrders.get(a.id)?.mode === 'follow' && !allyDowned(this.allyHealth(a.id))).map(a => PROFILE_IDS[a.id] ?? a.id); }
    tribePids() { return [...this.campers.map((_, i) => PROFILE_IDS[`ally-${i}`] ?? ''), ...this.folk.filter(f => f.c.state === 'camp').map(f => PROFILE_IDS[f.c.id] ?? f.c.id)]; }
    shirks(id: string, t: { ref: Creature | Folk } | undefined) { const h = this.allyHealth(id); return refusesFight(PROFILE_IDS[id] ?? id, t && 'kind' in t.ref ? t.ref.kind : undefined, h.hp / this.allyMaxHp(id)); }
    /** Profile bonuses of the people currently following or living in camp. */
    party(): PartyBonuses {
      const following = this.followingPids(), tribe = this.tribePids();
      const trust = Object.fromEntries(Object.entries(PROFILE_IDS).map(([actor, pid]) => [pid, this.profiles[actor]?.trust ?? 0]));
      return partyBonuses(following, tribe, trust);
    }
    /** Standing followers that enemies may strike. */
    standingAllies() { return this.companionActors().filter(a => (this.companionOrders.get(a.id)?.mode === 'follow' || this.responseOrders.has(a.id)) && !allyDowned(this.allyHealth(a.id))).map(a => ({ id: a.id, x: a.sprite.x, y: a.sprite.y })); }
    /** Apply an enemy hit to a companion; returns true when it landed on an ally. */
    hitCompanion(id: string, dmg: number, fx: number, fy: number, time: number) {
      const a = this.companionActors().find(o => o.id === id); if (!a) return;
      const h = hitAlly(this.allyHealth(id), dmg, time); this.allyHp.set(id, h);
      this.bleed(a.sprite.x, a.sprite.y, fx, fy, 6); a.sprite.setTintFill(0xffffff); this.time.delayedCall(90, () => a.sprite.clearTint());
      if (allyDowned(h)) { a.sprite.setVelocity(0, 0); a.sprite.anims.stop(); a.sprite.setAngle(90); this.companionMovement.reset(id); this.message = 'Ein Begleiter wurde niedergeschlagen!'; this.messageUntil = time + 1800; }
    }
    tickAllies(time: number, delta: number, paused: boolean) {
      for (const a of this.companionActors()) {
        const before = this.allyHealth(a.id); if (paused) { if (allyDowned(before)) before.downUntil += Math.min(delta, 100); continue; }
        const nearFire = Math.hypot(a.sprite.x - CAMP.x, a.sprite.y - CAMP.y - FIRE_DY) < 120;
        let h = tickAllyHealth(before, time, delta, nearFire, this.allyMaxHp(a.id));
        const pid = PROFILE_IDS[a.id] ?? a.id, order = this.companionOrders.get(a.id);
        if (order?.mode === 'follow' && !allyDowned(h)) {
          const cold = uraColdDamage(pid, biomeAt(a.sprite.x, a.sprite.y), this.owned.includes('fur')) * caveColdFactor(this.caves);
          if (cold) { h = { hp: Math.max(0, before.hp - cold * Math.min(delta, 100) / 1000), downUntil: 0 }; if (h.hp <= 0) h = hitAlly(h, 1, time); if (time > this.nextUraWarn) { this.nextUraWarn = time + 20000; this.message = 'Ura friert im Schnee · Fellkleidung schützt sie'; this.messageUntil = time + 2400; } }
          if (leashExceeded(pid, Math.hypot(a.sprite.x - CAMP.x, a.sprite.y - CAMP.y))) { this.companionOrders.set(a.id, { id: a.id, x: a.home.x, y: a.home.y, mode: 'return' }); this.companionMovement.reset(a.id); this.message = 'Kuruk: „Das ist zu weit für meine alten Knochen!“ · Er kehrt ins Lager zurück'; this.messageUntil = time + 3000; }
        }
        this.allyHp.set(a.id, h);
        if (allyDowned(before) && !allyDowned(h)) { a.sprite.setAngle(0); this.message = 'Dein Begleiter steht wieder auf'; this.messageUntil = time + 1500; }
        if (allyDowned(h)) { a.sprite.setVelocity(0, 0); a.sprite.setAngle(90); }
      }
    }
    nextUraWarn = 0; ilvarEscaping: string | undefined; ilvarNight = -1;
    /** Ilvar sneaks off toward Frostheim at night while he does not trust you yet. */
    tickIlvar(time: number, paused: boolean) {
      const f = this.folk.find(o => PROFILE_IDS[o.c.id] === 'ilvar'); if (!f) return;
      const p = this.player; const c = clockOf(this.clock);
      if (!this.ilvarEscaping) {
        if (paused || f.c.state !== 'camp' || f.combat.phase !== 'ready' || this.companionOrders.has(f.c.id)) return;
        if (!triesToFlee('ilvar', this.profiles[f.c.id]?.trust ?? 0, isNight(c.minutesOfDay), this.ilvarNight === c.day)) return;
        this.ilvarNight = c.day; this.ilvarEscaping = f.c.id;
        this.message = 'Ilvar versucht im Schutz der Nacht zu fliehen!'; this.messageUntil = time + 3000;
      }
      if (f.c.state !== 'camp') { this.ilvarEscaping = undefined; return; }
      const s = f.sprite; if (paused) { s.setVelocity(0, 0); return; }
      if (p && Math.hypot(p.x - s.x, p.y - s.y) < 26) {
        this.ilvarEscaping = undefined; s.setVelocity(0, 0); s.anims.stop();
        this.message = 'Du hast Ilvar eingeholt · er kehrt widerwillig ins Lager zurück'; this.messageUntil = time + 2600;
        s.setPosition(940 + this.folk.indexOf(f) % 4 * 38, 735); return;
      }
      if (Math.hypot(s.x - CAMP.x, s.y - CAMP.y) > ILVAR_ESCAPE_DIST) {
        const v = FOLK_HOMES[f.t.village]; this.ilvarEscaping = undefined;
        f.c = { ...f.c, state: 'free', x: v.x + f.t.dx, y: v.y + f.t.dy }; s.setVelocity(0, 0); s.setPosition(f.c.x, f.c.y); poseFolk(f);
        this.message = `Ilvar ist nach ${v.name} entkommen`; this.messageUntil = time + 3000; this.persist(); return;
      }
      const v = FOLK_HOMES[f.t.village], dx = v.x - s.x, dy = v.y - s.y, d = Math.hypot(dx, dy) || 1;
      s.setVelocity(dx / d * 46, dy / d * 46); f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      s.play(`${f.t.tex}-walk-${f.facing}`, true); s.setDepth(s.y);
    }
    squad() {
      return this.companionActors().filter(a => this.companionOrders.get(a.id)?.mode === 'follow').map(a => {
        const h = this.allyHealth(a.id), max = this.allyMaxHp(a.id);
        return { id: a.id, name: getProfile(a.id)?.name ?? 'Begleiter', hp: Math.round(h.hp), max, down: allyDowned(h) ? Math.max(0, Math.ceil((h.downUntil - this.time.now) / 1000)) : 0,
          portrait: this.campers.find(c => c.template.id === a.id)?.template.url ?? this.folk.find(f => f.c.id === a.id)?.t.url ?? '', frame: a.texture };
      });
    }
    allyGear = new Map<string, { img: Phaser.GameObjects.Image; next: number; swingUntil: number }>();
    meatPickups: { x: number; y: number; sprite: Phaser.GameObjects.Image; skorra?: string }[] = [];
    meat = 0;
    trees: { x: number; y: number; dir: number; hp: number; tint: number; sprite: Phaser.Physics.Arcade.Sprite }[] = [];
    stumps: { x: number; y: number; dir: number; sprite?: Phaser.GameObjects.Image }[] = [];
    minedRocks: [number, number][] = [];
    lootedHouses: string[] = [];
    folk: Folk[] = [];
    flocks: Flock[] = createFlocks(); fish: Fish[] = createFish(); birdGfx?: Phaser.GameObjects.Graphics; fishGfx?: Phaser.GameObjects.Graphics; nextBirdMsg = 0;
    tickAmbient(time: number, delta: number, p: Phaser.Physics.Arcade.Sprite, m: Movement) {
      const dt = Math.min(delta, 100), cam = this.cameras.main.worldView;
      const view = (x: number, y: number) => x > cam.x - 40 && x < cam.right + 40 && y > cam.y - 40 && y < cam.bottom + 40;
      const flushed = tickFlocks(this.flocks, p.x, p.y, m, time, dt);
      tickFish(this.fish, p.x, p.y, m, time, dt);
      for (const f of flushed) if (guardsNotice(f) && time > this.nextBirdMsg) {
        this.nextBirdMsg = time + 8000; this.message = 'Vögel flattern auf · die Drachenwachen horchen auf!'; this.messageUntil = time + 2200;
        for (const g of this.folk) if (g.combat.phase === 'ready' && g.c.state === 'free' && isWarrior(g.t) && Math.hypot(g.sprite.x - f.x, g.sprite.y - f.y) < 260) g.sprite.setFlipX(f.x < g.sprite.x);
      }
      const bg = this.birdGfx ??= this.add.graphics().setDepth(95000), fg = this.fishGfx ??= this.add.graphics().setDepth(4);
      bg.clear(); fg.clear();
      for (const fl of this.flocks) for (const b of fl.birds) {
        if (!view(b.x, b.y)) continue;
        if (b.state === 'rest') { const hop = Math.sin(time / 300 + b.hx) > 0.9 ? 1 : 0; bg.fillStyle(0x3b2f2a, 1).fillRect(b.x - 2, b.y - 2 - hop, 4, 3); bg.fillStyle(0xd9a441, 1).fillRect(b.x + 2, b.y - 1 - hop, 1, 1); }
        else { const up = Math.floor(time / 90) % 2 === 0; bg.fillStyle(0x2a2220, 1).fillRect(b.x - 1, b.y - 1, 3, 2); bg.fillRect(b.x - 4, b.y - (up ? 3 : 0), 3, 1); bg.fillRect(b.x + 2, b.y - (up ? 3 : 0), 3, 1); }
      }
      for (const f of this.fish) {
        if (!view(f.x, f.y)) continue;
        const wig = Math.round(Math.sin(f.phase * 3)), fleeing = f.fleeUntil > time;
        fg.fillStyle(0x5d6f6a, 0.85).fillRect(f.x - 3, f.y - 1 + wig * 0.5, 6, 2); fg.fillStyle(0xc77a8a, 0.8).fillRect(f.x - 1, f.y, 3, 1);
        if (fleeing) fg.fillStyle(0xe8f4ff, 0.7).fillRect(f.x - f.dx * 6 - 1, f.y - f.dy * 6 - 1, 2, 2);
      }
    }
    barks = new Map<string, { text: Phaser.GameObjects.Text; until: number; next: number; sprite: Phaser.GameObjects.Components.Transform }>();
    patrolStep = new Map<string, number>();
    warband: WarbandState = EMPTY_WARBANDS;
    /** Guards allowed to fight far from home: ford guards and raiders. */
    roaming = new Set<string>();
    stuck = new Map<string, { until: number; turn: number }>();
    fordGuards() { const out = new Set<string>(); VILLAGES.forEach((_, vi) => { const w = this.folk.find(f => f.t.village === vi && !f.t.captive && isWarrior(f.t) && !isChampion(f.t)); if (w) out.add(w.c.id); }); return out; }
    /** Fixed squad for the running raid (rebuilt after loading); captured or dead members drop out, nobody is pulled in mid-raid. */
    raidRoster = new Set<string>();
    raidRoutes = new Map<string, { pts: { x: number; y: number }[]; i: number; goal: { x: number; y: number }; retry: number }>();
    raidWaitMs = 0;
    raidTorches = new Map<string, { hut: string; ms: number; barked?: boolean }>();
    torchFx = new Map<string, Phaser.GameObjects.Sprite>();
    routeBudget = 0;
    raiders() {
      const a = this.warband.active; if (!a) return [];
      if (!this.raidRoster.size) { const duel = this.duelIds(); for (const f of this.folk.filter(f => f.t.village === a.village && isWarrior(f.t) && !isChampion(f.t) && f.c.state === 'free' && f.combat.phase === 'ready' && !duel.has(f.c.id)).slice(0, Math.min(MAX_RAIDERS, a.size ?? MIN_SQUAD))) { this.raidRoster.add(f.c.id); f.combat = { ...f.combat, hp: f.combat.hp >= FIGHTER_HP ? RAIDER_HP : f.combat.hp, max: RAIDER_HP }; } }
      return this.folk.filter(f => this.raidRoster.has(f.c.id) && f.c.state === 'free' && f.combat.phase !== 'dead');
    }
    /** Walks a folk sprite toward a point, turning aside for a moment when blocked. */
    walkTo(f: Folk, x: number, y: number, speed: number, time: number) {
      const s = f.sprite, body = s.body as Phaser.Physics.Arcade.Body; let dx = x - s.x, dy = y - s.y; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      const st = this.stuck.get(f.c.id);
      if (!body.blocked.none && (!st || time > st.until + 400)) this.stuck.set(f.c.id, { until: time + 700, turn: f.seed % 2 ? 1 : -1 });
      const cur = this.stuck.get(f.c.id); if (cur && time < cur.until) { const t = cur.turn; [dx, dy] = [-dy * t, dx * t]; }
      s.setVelocity(dx * speed, dy * speed); f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      s.play(`${f.t.tex}-walk-${f.facing}`, true); s.setDepth(s.y); return dl;
    }
    obstacleBlocks(): Block[] {
      return (this.obstacles?.getChildren() ?? []).flatMap(o => { const b = (o as Phaser.Physics.Arcade.Sprite).body; return b ? [{ x: b.x, y: b.y, width: b.width, height: b.height }] : []; });
    }
    /** Long marches follow a path around the mountain wall, river and cliffs; close to the goal raiders walk straight. One path search per frame. */
    raidTravel(f: Folk, goal: { x: number; y: number }, speed: number, time: number, blocks: () => Block[]) {
      const s = f.sprite, far = Math.hypot(goal.x - s.x, goal.y - s.y);
      if (far < 200) { this.raidRoutes.delete(f.c.id); this.walkTo(f, goal.x, goal.y, speed, time); return far; }
      let r = this.raidRoutes.get(f.c.id); const wp0 = r?.pts[r.i];
      if (!r || Math.hypot(r.goal.x - goal.x, r.goal.y - goal.y) > 64 || (wp0 && Math.hypot(wp0.x - s.x, wp0.y - s.y) > 160) || (!r.pts.length && time > r.retry)) {
        if (this.routeBudget <= 0) { s.setVelocity(0, 0); s.anims.stop(); return far; }
        this.routeBudget--; r = { pts: this.raidPath({ x: s.x, y: s.y }, goal, blocks()), i: 0, goal: { ...goal }, retry: time + 1500 }; this.raidRoutes.set(f.c.id, r);
      }
      while (r.pts[r.i] && Math.hypot(r.pts[r.i]!.x - s.x, r.pts[r.i]!.y - s.y) < 12) r.i++;
      const wp = r.pts[r.i] ?? goal; this.walkTo(f, wp.x, wp.y, speed, time); return far;
    }
    /** Path search that first steps off a blocked spot (a hut wall, a fence corner) onto the nearest free ground. */
    raidPath(from: { x: number; y: number }, goal: { x: number; y: number }, blocks: Block[]) {
      const direct = findCompanionPath(from, goal, blocks); if (direct.length) return direct;
      for (let rad = 12; rad <= 60; rad += 12) for (let k = 0; k < 8; k++) {
        const st = { x: from.x + Math.cos(k * Math.PI / 4) * rad, y: from.y + Math.sin(k * Math.PI / 4) * rad };
        if (!clearCompanionPoint(st, blocks)) continue;
        const pts = findCompanionPath(st, goal, blocks); if (pts.length) return [st, ...pts];
      }
      return [];
    }
    clearRaidFx() { this.torchFx.forEach(o => o.destroy()); this.torchFx.clear(); this.raidTorches.clear(); this.raidRoutes.clear(); }
    /** The raid is over: survivors are ordinary guards again. */
    disbandRaid() {
      for (const f of this.folk) if (this.raidRoster.has(f.c.id) && f.combat.max === RAIDER_HP) { const { max: _m, ...rest } = f.combat; f.combat = { ...rest, hp: Math.min(rest.hp, FIGHTER_HP) }; }
      this.raidRoster.clear(); this.clearRaidFx();
    }
    /** Torchbearers carry a small flame while they march and assault. */
    syncTorchFx(bearers: Folk[]) {
      const keep = new Set(bearers.map(f => f.c.id));
      for (const [id, o] of this.torchFx) if (!keep.has(id)) { o.destroy(); this.torchFx.delete(id); }
      for (const f of bearers) {
        let o = this.torchFx.get(f.c.id);
        if (!o) { o = this.add.sprite(0, 0, 'house-flame').setOrigin(FLAME_SHEET.ox, FLAME_SHEET.oy).setScale(0.22); o.play({ key: 'house-flame', startFrame: f.seed % FLAME_SHEET.frames }); this.torchFx.set(f.c.id, o); }
        const left = f.facing >= 3 && f.facing <= 5, s = f.sprite;
        o.setPosition(s.x + (left ? -7 : 7), s.y - 6).setDepth(s.y + 2);
      }
    }
    /** A raider's torch reaches the roof: the camp hut burns like any other fire. */
    raiderIgnite(h: FlammableHouse, f: Folk, time: number) {
      if (this.fires[h.id]) return;
      this.fires = ignite(this.fires, h.id, 'camp', this.clock);
      const w = this.warband.active; if (w) this.warband = { ...this.warband, active: { ...w, burned: (w.burned ?? 0) + 1 } };
      this.bark(f.c.id, f.sprite, 'attack', time, true, 'Brenne, Höhlenlager!');
      this.message = `Ein Krieger aus ${FOLK_HOMES[f.t.village]!.name} hat eine deiner Hütten angezündet!`; this.messageUntil = time + 4000;
      this.cameras.main.shake(220, 0.004); this.syncFireFx(time); this.persist();
    }
    /** The whole squad is down: their goods are yours and their village trembles. */
    raidBeaten(village: number, time: number) {
      const name = FOLK_HOMES[village]!.name, n = this.raidRoster.size;
      if (!n) { this.message = `Der Kriegstrupp aus ${name} hat sich zerstreut`; this.messageUntil = time + 3000; return; }
      const sp = raidSpoils(n);
      this.stock = { ...this.stock, flint: this.stock.flint + sp.flint, fiber: this.stock.fiber + sp.fiber }; this.cooked += sp.cooked; this.xp += sp.xp;
      this.fear = addFearAmount(decayFear(this.fear, clockOf(this.clock).day), villageKey(name), SQUAD_BROKEN_FEAR);
      this.message = `Der Rachetrupp aus ${name} ist zerschlagen! Beute: ${sp.flint} Feuerstein, ${sp.fiber} Fasern, ${sp.cooked} Braten · +${sp.xp} EP`; this.messageUntil = time + 5500;
    }
    /** Cheat "raid": a squad from the angriest (or nearest) village sets off right now. */
    cheatRaid(time: number) {
      const p = this.player; if (!p || this.warband.active) { this.message = 'Es ist schon ein Kriegstrupp unterwegs'; this.messageUntil = time + 2000; return; }
      const fury = this.warband.fury ?? {};
      const order = FOLK_HOMES.map((v, i) => ({ i, f: fury[String(i)] ?? 0, d: Math.hypot(v.x - CAMP.x, v.y - CAMP.y) })).sort((a, b) => b.f - a.f || a.d - b.d);
      const pick = order.find(o => this.folk.some(f => f.t.village === o.i && isWarrior(f.t) && !isChampion(f.t) && f.c.state === 'free' && f.combat.phase === 'ready'));
      if (!pick) { this.message = 'Kein Dorf hat noch Krieger'; this.messageUntil = time + 2000; return; }
      const pending = { ...this.warband.pending }; delete pending[String(pick.i)];
      this.warband = { ...this.warband, pending, active: { village: pick.i, phase: 'march', until: this.clock + MARCH_LIMIT_MINUTES, size: MAX_RAIDERS, burned: 0 } };
    }
    /** Retaliation and revenge raids: squads march to the camp, torch huts, free their kin and fight the player and the camp's warriors. */
    tickWarband(time: number, stopped: boolean, ids: Set<string>) {
      const p = this.player; if (!p) return;
      VILLAGES.forEach((v, vi) => { const lvl = this.villageLevel.get(villageKey(v.name)) ?? 0; this.warband = scheduleRaid(this.warband, vi, lvl >= 3, this.clock, championFallen(this.raid, vi)); });
      if (input.cheatRaid) { input.cheatRaid = false; this.cheatRaid(time); }
      const before = this.warband.active; this.warband = launchDue(this.warband, this.clock);
      if (this.warband.active && this.warband.active !== before && !before) {
        this.raidRoster.clear(); this.clearRaidFx();
        const v = FOLK_HOMES[this.warband.active.village]!, n = this.raiders().length;
        if (!n) { this.warband = endRaid(this.warband, this.clock); return; }
        this.message = `Ein Rachetrupp aus ${v.name} marschiert auf dein Lager! (${n} Krieger mit Fackeln)`; this.messageUntil = time + 5500; this.persist();
      }
      const a = this.warband.active; if (!a) { if (this.torchFx.size || this.raidRoutes.size) this.clearRaidFx(); this.raidRoster.clear(); return; }
      const v = FOLK_HOMES[a.village]!, raiders = this.raiders(), ready = raiders.filter(f => f.combat.phase === 'ready');
      const prevPhase = a.phase; this.warband = advanceRaid(this.warband, this.clock, ready.length);
      if (!this.warband.active) {
        if (!ready.length) this.raidBeaten(a.village, time); else { this.message = `Der Kriegstrupp aus ${v.name} ist abgezogen`; this.messageUntil = time + 4000; }
        this.roaming.clear(); this.disbandRaid(); this.persist(); return;
      }
      if (this.warband.active.phase !== prevPhase && this.warband.active.phase === 'return') { this.message = `Die Krieger aus ${v.name} ziehen sich zurück`; this.messageUntil = time + 3000; }
      const phase = this.warband.active.phase, size = this.warband.active.size ?? MIN_SQUAD, dt = Math.min(this.game.loop.delta, 100);
      this.routeBudget = 1; let cache: Block[] | undefined; const blocks = () => (cache ??= this.obstacleBlocks());
      const huts = FLAMMABLE_HOUSES.filter(h => h.owner === 'camp');
      const bearers = phase === 'return' ? [] : ready.slice(0, torchCount(size));
      const taken = new Set<string>();
      for (const [id, t] of this.raidTorches) if (bearers.some(b => b.c.id === id)) taken.add(t.hut); else this.raidTorches.delete(id);
      let arrived = false, home = 0;
      const marching = ready.filter(f => !((this.folkMood.get(f.c.id)?.armedUntil ?? 0) > time));
      raiders.forEach((f, i) => {
        if (f.combat.phase !== 'ready') { this.raidTorches.delete(f.c.id); return; }
        this.roaming.add(f.c.id);
        const m = this.folkMood.get(f.c.id), torch = bearers.includes(f), s = f.sprite;
        // A torchbearer shakes off a scuffle as soon as nobody is right on him and goes back to the huts.
        if (torch && m && (m.armedUntil ?? 0) > time && Math.hypot(p.x - s.x, p.y - s.y) > TORCH_ENGAGE + 16 && !this.standingAllies().some(al => Math.hypot(al.x - s.x, al.y - s.y) < TORCH_ENGAGE)) m.armedUntil = 0;
        if ((m?.armedUntil ?? 0) > time) { this.raidTorches.delete(f.c.id); if (phase === 'march' && Math.hypot(s.x - CAMP.x, s.y - CAMP.y) < CAMP_RESPONSE_RANGE + 80) arrived = true; return; }
        ids.add(f.c.id);
        if (stopped) { s.setVelocity(0, 0); s.anims.stop(); return; }
        const d = Math.hypot(p.x - s.x, p.y - s.y);
        const reach = torch ? TORCH_ENGAGE : phase === 'assault' ? RAID_SIGHT : 140;
        const defender = phase !== 'return' && !torch && this.standingAllies().some(al => Math.hypot(al.x - s.x, al.y - s.y) < DEFENDER_ENGAGE);
        if (phase !== 'return' && (d < reach || defender) && m) { m.armedUntil = time + 25000; this.raidTorches.delete(f.c.id); this.bark(f.c.id, s, 'attack', time, true); return; }
        if (phase === 'march') {
          // The squad marches together: the leader follows the path and waits for stragglers, the others keep close behind him.
          const leader = marching[0];
          if (!leader || leader === f) {
            const behind = marching.some(o => o !== f && Math.hypot(o.sprite.x - s.x, o.sprite.y - s.y) > 110);
            const toCamp = Math.hypot(CAMP.x - s.x, CAMP.y - 30 - s.y);
            if (behind && toCamp > CAMP_ARRIVAL && this.raidWaitMs < 9000) { this.raidWaitMs += dt; s.setVelocity(0, 0); s.anims.stop(); s.setFrame(f.facing); }
            else { if (!behind) this.raidWaitMs = 0; this.raidTravel(f, { x: CAMP.x, y: CAMP.y - 30 }, 50, time, blocks); }
            if (toCamp < CAMP_ARRIVAL) arrived = true;
          } else {
            const k = marching.indexOf(f), ang = Math.atan2(leader.sprite.y - (CAMP.y - 30), leader.sprite.x - CAMP.x) + (k % 2 ? 1 : -1) * (0.5 + 0.25 * Math.floor((k - 1) / 2));
            const slot = { x: leader.sprite.x + Math.cos(ang) * 24 * (1 + Math.floor((k - 1) / 2) * 0.6), y: leader.sprite.y + Math.sin(ang) * 24 * (1 + Math.floor((k - 1) / 2) * 0.6) };
            if (Math.hypot(slot.x - s.x, slot.y - s.y) < 8) { s.setVelocity(0, 0); s.anims.stop(); s.setFrame(f.facing); } else this.raidTravel(f, slot, 58, time, blocks);
          }
          if (Math.random() < 0.002) this.bark(f.c.id, s, 'attack', time);
          return;
        }
        if (phase === 'assault') {
          if (torch) {
            const cur = this.raidTorches.get(f.c.id);
            const hut = (cur && !this.fires[cur.hut] ? huts.find(h => h.id === cur.hut) : undefined) ?? burnTarget(huts, this.fires, s, taken);
            if (hut) {
              taken.add(hut.id); let t = this.raidTorches.get(f.c.id); if (!t || t.hut !== hut.id) { t = { hut: hut.id, ms: 0 }; this.raidTorches.set(f.c.id, t); }
              const door = doorPoint(hut);
              if (this.raidTravel(f, door, 52, time, blocks) < 10) {
                s.setVelocity(0, 0); s.anims.stop(); f.facing = 6; s.setFrame(6);
                if (!t.barked) { t.barked = true; this.bark(f.c.id, s, 'attack', time, true, 'Feuer auf ihre Hütten!'); }
                t.ms += dt; if (t.ms >= RAID_TORCH_MS) { this.raidTorches.delete(f.c.id); this.raiderIgnite(hut, f, time); }
              }
              return;
            }
          }
          const kin = this.folk.find(c => c.c.state === 'camp' && c.t.village === a.village && !this.companionOrders.has(c.c.id));
          if (!kin) { if (this.raidTravel(f, { x: CAMP.x + Math.cos(time / 2000 + i * 1.6) * 60, y: CAMP.y + Math.sin(time / 2000 + i * 1.6) * 40 }, 30, time, blocks) < 8) { s.setVelocity(0, 0); s.anims.stop(); } return; }
          if (this.raidTravel(f, { x: kin.sprite.x, y: kin.sprite.y }, 44, time, blocks) < 16) {
            kin.c = { ...kin.c, state: 'free', x: v.x + kin.t.dx, y: v.y + kin.t.dy }; kin.sprite.setVelocity(0, 0); kin.sprite.setPosition(kin.c.x, kin.c.y); poseFolk(kin);
            this.bark(f.c.id, s, 'alarm', time, true, 'Wir holen dich heim!');
            this.message = `Krieger aus ${v.name} haben ${getProfile(kin.c.id)?.name ?? 'einen Gefangenen'} aus deinem Lager befreit!`; this.messageUntil = time + 4500; this.persist();
          }
          return;
        }
        if (this.raidTravel(f, { x: f.t.x, y: f.t.y }, 44, time, blocks) < 20 || Math.hypot(s.x - v.x, s.y - v.y) < v.r * 0.6) home++;
      });
      this.syncTorchFx(bearers.filter(f => !((this.folkMood.get(f.c.id)?.armedUntil ?? 0) > time)));
      if (arrived) { this.warband = arrive(this.warband, this.clock); this.message = `Krieger aus ${v.name} greifen dein Lager an!`; this.messageUntil = time + 4000; this.cameras.main.shake(300, 0.006); this.persist(); }
      const now = this.warband.active;
      if (now?.phase === 'assault' && raidGoalsDone(now, this.folk.some(c => c.c.state === 'camp' && c.t.village === a.village && !this.companionOrders.has(c.c.id)), huts, this.fires)) {
        this.warband = retreat(this.warband, this.clock); this.raidRoutes.clear();
        this.message = (now.burned ?? 0) > 0 ? `Die Krieger aus ${v.name} ziehen ab · dein Lager brennt!` : `Die Krieger aus ${v.name} ziehen mit ihren Leuten ab`; this.messageUntil = time + 4000; this.persist();
      }
      if (phase === 'return' && home >= ready.length) { this.warband = endRaid(this.warband, this.clock); this.roaming.clear(); this.disbandRaid(); this.message = `Der Kriegstrupp aus ${v.name} ist heimgekehrt`; this.messageUntil = time + 3000; this.persist(); }
    }
    villageLevel = new Map<string, WarningLevel>();
    /** Short speech bubble above a person; respects a per-person cooldown. */
    bark(id: string, sprite: Phaser.GameObjects.Components.Transform, kind: BarkKind, time: number, force = false, line?: string) {
      let b = this.barks.get(id);
      if (b && !force && time < b.next) return;
      if (!b) { b = { text: this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '8px', color: '#1c1712', backgroundColor: '#f4ead2', padding: { x: 3, y: 2 } }).setOrigin(0.5, 1).setResolution(4), until: 0, next: 0, sprite }; this.barks.set(id, b); }
      b.sprite = sprite; b.text.setText(line ?? pickBark(kind, time / 997 + id.length)).setVisible(true);
      b.until = time + BARK_MS; b.next = time + BARK_COOLDOWN_MS;
    }
    /** Guards of tense villages walk a ring outside the fence; hostile ones attack on sight. Returns ids it moved. */
    tickPatrols(time: number, stopped: boolean): Set<string> {
      const ids = new Set<string>(), p = this.player, now = Date.now();
      for (const b of this.barks.values()) {
        const on = time < b.until; b.text.setVisible(on);
        if (on) b.text.setPosition(b.sprite.x, b.sprite.y - 24).setDepth(b.sprite.y + 3000);
      }
      VILLAGES.forEach(v => {
        const vk = villageKey(v.name), lvl = warningLevel(getVillageRelationship(this.rel, vk), isAlarmActive(this.rel, vk, now));
        const prev = this.villageLevel.get(vk);
        if (prev !== undefined && prev !== lvl && p && Math.hypot(p.x - v.x, p.y - v.y) < v.r + 500) {
          this.message = `${v.name}: ${WARNING_NAME[lvl]}${patrolsActive(lvl) ? ' · Wachen patrouillieren' : ''}`; this.messageUntil = time + 2400;
        }
        this.villageLevel.set(vk, lvl);
      });
      if (!p) return ids;
      this.tickWarband(time, stopped, ids);
      const fordGuards = this.fordGuards();
      const duelIds = this.duelIds();
      this.folk.forEach((f, i) => {
        if (ids.has(f.c.id) || duelIds.has(f.c.id)) return;
        if (f.t.captive || f.c.state !== 'free' || f.combat.phase !== 'ready') return;
        const v = FOLK_HOMES[f.t.village], vk = villageKey(v.name), lvl = this.villageLevel.get(vk) ?? 0, m = this.folkMood.get(f.c.id);
        if (!patrolsActive(lvl) || (m?.armedUntil ?? 0) > time) return;
        ids.add(f.c.id);
        const s = f.sprite, d = Math.hypot(p.x - s.x, p.y - s.y);
        if (stopped) { s.setVelocity(0, 0); s.anims.stop(); return; }
        if (patrolAttacks(lvl, d) && m) { m.armedUntil = time + 25000; this.bark(f.c.id, s, 'attack', time, true); return; }
        if (d < 140) this.bark(f.c.id, s, lvl >= 3 ? 'spotted' : 'warn', time);
        const ford = fordGuards.has(f.c.id); if (ford) this.roaming.add(f.c.id);
        const route = ford ? fordRoute(v) : patrolRoute(v, i), step = this.patrolStep.get(f.c.id) ?? 0, wp = route[step % route.length]!;
        const dx = wp.x - s.x, dy = wp.y - s.y, dl = Math.hypot(dx, dy), body = s.body as Phaser.Physics.Arcade.Body;
        if (dl < 10 || (!body.blocked.none && time > f.until)) { this.patrolStep.set(f.c.id, step + 1); f.until = time + 800; if (Math.random() < 0.15) this.bark(f.c.id, s, 'patrol', time); return; }
        s.setVelocity(dx / dl * 30, dy / dl * 30);
        f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
        s.play(`${f.t.tex}-walk-${f.facing}`, true); s.setDepth(s.y);
      });
      return ids;
    }
    rel: RelationshipState = EMPTY_RELATIONSHIPS;
    profiles: ProfileStates = {};
    trustProgress: TrustBook = {};
    trustEvent(id: string, event: TrustEvent, options: { peace?: boolean; minutes?: number } = {}) {
      const biography = getProfile(id); if (!biography || !TRUST_STEPS[biography.id]) return;
      const before = this.profiles[id] ?? profileState(biography);
      const next = advanceTrust(biography.id, this.trustProgress[id], before.trust, event, this.clock, options);
      this.trustProgress[id] = next.state; this.profiles[id] = { ...before, trust: next.trust };
      if (next.gained) { this.message = `${biography.name} · Vertrauen ${next.gained > 0 ? '+' : ''}${next.gained} (${next.trust}/100)`; this.messageUntil = this.time.now + 3000; }
    }
    tickTrust(minutes: number) {
      const p = this.player; if (!p || this.dead || this.health <= 0) return;
      for (const f of this.folk.filter(f => f.c.state === 'camp')) {
        const pid = PROFILE_IDS[f.c.id]; if (!pid || !TRUST_STEPS[pid]) continue;
        if (!this.trustProgress[f.c.id]) this.trustEvent(f.c.id, 'joined');
        const peace = pid === 'ilvar' ? getVillageRelationship(this.rel, 'frostheim') >= 0 && this.folk.some(t => t.c.id === 'nordic-w0' && t.c.state === 'free' && t.combat.hp === 60 && t.combat.phase === 'ready') : getVillageRelationship(this.rel, 'eisfurt') >= 10;
        this.trustEvent(f.c.id, 'day', { peace });
        if (!this.sleeping && isNight(clockOf(this.clock).minutesOfDay) && Math.hypot(p.x - CAMP.x, p.y - CAMP.y - FIRE_DY) < 120 && Math.hypot(f.sprite.x - p.x, f.sprite.y - p.y) < 120 && !allyDowned(this.allyHealth(f.c.id)) && !this.allyFoes().some(t => t.hostile && t.alive && Math.hypot(t.x - p.x, t.y - p.y) < 250)) this.trustEvent(f.c.id, 'watch', { minutes });
      }
    }
    personalTopics(id: string) {
      const actor = this.companionActors().find(a => a.id === id), pid = PROFILE_IDS[id];
      if (!actor || !pid || !TRUST_STEPS[pid]) return [];
      return personalDialogues(pid, this.profiles[id]?.trust ?? 0, this.trustProgress[id]);
    }
    personalChoice(id: string, choice: string, time: number) {
      const actor = this.companionActors().find(a => a.id === id), p = this.player, pid = PROFILE_IDS[id];
      if (!actor || !p || !pid || Math.hypot(actor.sprite.x - p.x, actor.sprite.y - p.y) > INTERACTION_RANGE) return;
      if (!this.personalTopics(id).some(d => d.choices.some(c => c.id === choice))) return;
      this.message = 'Deine Taten zählen mehr als Versprechen.'; this.messageUntil = time + 3000;
      if (choice === 'listen') this.message = trustSteps(pid, this.trustProgress[id]).filter(s => !s.done).map(s => s.label).join(' · ') || 'Du hast mein Vertrauen.';
      if (choice === 'meal') { if (this.cooked < 1) this.message = 'Du hast kein gebratenes Fleisch dabei.'; else { this.cooked--; this.trustEvent(id, 'meal'); } }
      if (choice === 'weapon') { if (!this.owned.includes('spear') || !this.hasSpear || this.spear || this.spearOnGround) this.message = 'Du brauchst einen verfügbaren Speer.'; else { this.owned = this.owned.filter(i => i !== 'spear'); this.weapon = 'none'; input.weapon = 'none'; this.trustEvent(id, 'weapon'); } }
      if (choice === 'hunt') { if (this.followingCount() >= MAX_COMPANIONS && this.companionOrders.get(id)?.mode !== 'follow') this.message = 'Dein Jagdtrupp ist voll.'; else { this.companionOrders.set(id, { id, mode: 'follow', x: actor.sprite.x, y: actor.sprite.y }); this.companionMovement.reset(id); this.message = 'Skorra: „Eine Jagd. Dann sehen wir weiter.“'; } }
      if (choice === 'heal') {
        const wounded = this.campPeople().find(a => this.allyHealth(a.id).hp < this.allyMaxHp(a.id)) ?? (this.allyHealth(id).hp < this.allyMaxHp(id) ? actor : undefined);
        if (!this.owned.includes('bandage') || (!wounded && this.health >= 100)) this.message = 'Du brauchst einen Heilwickel und einen Verwundeten am Feuer.';
        else if (!this.campPeople().some(a => a.id === id) || Math.hypot(p.x - CAMP.x, p.y - CAMP.y - FIRE_DY) > 120) this.message = 'Versorgt den Verwundeten gemeinsam am Feuer.';
        else { if (wounded) { this.allyHp.set(wounded.id, { hp: Math.min(this.allyMaxHp(wounded.id), this.allyHealth(wounded.id).hp + 25), downUntil: 0 }); wounded.sprite.setAngle(0); } else this.health = Math.min(100, this.health + 25); this.trustEvent(id, 'heal'); }
      }
      if (choice === 'mercy') this.trustEvent(id, 'mercy');
      this.persist();
    }
    campSocial: CampSocial = emptyCampSocial();
    couples: CouplesState = EMPTY_COUPLES;
    repro: ReproState = EMPTY_REPRO;
    kids: Kid[] = [];
    /** Daily pregnancy/birth step; cuckoo births feed the social father's suspicion. */
    tickRepro(time: number) {
      const day = clockOf(this.clock).day; if (day <= this.repro.day) return;
      const couples = Object.fromEntries(Object.keys(COUPLES).map(w => [w, this.folkAlive(w) && !this.couples.broken.includes(w) && this.folkAlive(COUPLES[w]!) ? COUPLES[w] : undefined]));
      const r = advanceDay(this.repro, day, couples, Math.random); this.repro = r.state;
      for (const b of r.births) {
        let msg = `${this.personName(b.child.mother)} hat ein Kind geboren · ${b.child.name}`;
        const social = b.child.social;
        if (b.foreign && social && this.folkAlive(social)) {
          const sus = birthSuspicion(b, this.couples.suspicion[social] ?? 0);
          this.couples = { ...this.couples, suspicion: { ...this.couples.suspicion, [social]: sus.suspicion }, broken: sus.exposed && !this.couples.broken.includes(b.child.mother) ? [...this.couples.broken, b.child.mother] : this.couples.broken };
          msg += sus.exposed ? ` · ${this.personName(social)} erkennt das fremde Haar!` : ` · ${this.personName(social)} zweifelt: „Das Kind sieht mir nicht ähnlich…“`;
          if (sus.exposed) this.confrontPartner(social, time);
        }
        this.message = msg; this.messageUntil = time + 4000;
      }
      if (r.births.length || r.state !== this.repro) this.persist();
    }
    folkAlive = (id: string) => { const f = this.folk.find(o => o.c.id === id); return !!f && f.combat.phase !== 'dead'; };
    personName = (id: string) => getProfile(id)?.name ?? id;

    duels: DuelBook = EMPTY_DUELS;
    duel: { phase: 'approach' | 'prompt' | 'gather' | 'fight' | 'done'; id: string; village: number; cause: DuelCause; woman?: string | undefined; rules: DuelRules; since: number; center: { x: number; y: number }; ai: DuelAi; spectators: string[]; knock?: { vx: number; vy: number; until: number }; nextCheer: number; outcome?: DuelOutcome } | null = null;
    duelSwingAt = -1e9; fistFinish = false;
    mocker: { id: string; until: number } | null = null; nextMock = 0; nextJeer = 0;
    /** Armor and fur skins stay off while the ring is closed. */
    inDuelFight() { return !!this.duel && (this.duel.phase === 'gather' || this.duel.phase === 'fight'); }
    armorNow() { return this.inDuelFight() ? null : input.armor; }
    fistsDuel() { return this.inDuelFight() && this.duel?.rules.arms === 'fists'; }
    clubNow() { return !!input.club && !this.fistsDuel(); }
    duelIds() { const ids = new Set<string>(); if (this.duel) { ids.add(this.duel.id); this.duel.spectators.forEach(id => ids.add(id)); } if (this.mocker) ids.add(this.mocker.id); return ids; }
    duelFoe() { const d = this.duel; return d ? this.folk.find(f => f.c.id === d.id) : undefined; }
    /** Why the player may not challenge this man; undefined hides the option (women, captives). */
    challengeRefusal(f: Folk): string | null | undefined {
      if (!isWarrior(f.t) || f.c.state !== 'free') return undefined;
      if (isChampion(f.t)) return 'Ein Champion kämpft nur um sein Dorf.';
      if (this.duel) return 'Ein Zweikampf läuft bereits.';
      if (this.carried) return 'Du trägst jemanden.';
      if ((this.folkMood.get(f.c.id)?.armedUntil ?? 0) > this.time.now) return 'Er kämpft schon gegen dich.';
      if (onCooldown(this.duels, f.c.id, this.clock)) return 'Er hat sich heute schon gestellt.';
      return null;
    }
    /** Starts a duel: a wronged man walks up and speaks; an accepted player challenge closes the ring at once. */
    startDuel(f: Folk, cause: DuelCause, time: number, woman?: string) {
      const p = this.player; if (!p) return;
      const rules = rollRules(Math.random);
      this.duel = { phase: cause === 'jealousy' ? 'approach' : 'gather', id: f.c.id, village: f.t.village, cause, woman, rules, since: time, center: { x: (p.x + f.sprite.x) / 2, y: (p.y + f.sprite.y) / 2 }, ai: newDuelAi(time), spectators: [], nextCheer: time + 1500 };
      this.interruptForDuel();
      if (cause === 'player') this.closeRing(f, time);
      else { this.bark(f.c.id, f.sprite, 'alarm', time, true, 'Du Hund! Sie gehört zu mir!'); this.message = `${this.personName(f.c.id)} kommt auf dich zu · er will dich zur Rede stellen!`; this.messageUntil = time + 3000; }
    }
    interruptForDuel() { this.igniting = undefined; this.building = null; this.ghost?.setVisible(false); this.target = undefined; this.marker?.setVisible(false); }
    closeRing(f: Folk, time: number) {
      const d = this.duel, p = this.player; if (!d || !p) return;
      d.phase = 'gather'; d.since = time; d.center = { x: (p.x + f.sprite.x) / 2, y: (p.y + f.sprite.y) / 2 }; d.ai = newDuelAi(time + GATHER_MS);
      f.combat = { hp: DUEL_HP, phase: 'ready', downUntil: 0, max: DUEL_HP };
      d.spectators = this.folk.filter(o => o !== f && o.t.village === d.village && o.c.state === 'free' && o.combat.phase === 'ready' && !isCarrier(this.carriers, o.c.id) && Math.hypot(o.sprite.x - d.center.x, o.sprite.y - d.center.y) < SPECTATOR_RANGE).map(o => o.c.id);
      for (const id of d.spectators) { const m = this.folkMood.get(id); if (m) m.armedUntil = 0; }
      this.message = `Der Kreis schließt sich · ${rulesText(d.rules)}${input.armor ? ' · Pelz abgelegt' : ''}${d.rules.arms === 'fists' && this.weapon !== 'none' ? ' · Waffe weggesteckt' : ''}`; this.messageUntil = time + 3200;
    }
    /** Ends the duel and applies honour, fear, tribute, mockery and the woman's choice. */
    endDuel(outcome: DuelOutcome, time: number) {
      const d = this.duel; if (!d || d.phase === 'done') return;
      const f = this.duelFoe(), v = FOLK_HOMES[d.village]!, vk = villageKey(v.name), fx = DUEL_EFFECTS[outcome], name = this.personName(d.id);
      this.rel = changeVillageRelationship(changePersonalRelationship(this.rel, d.id, fx.rel, vk), vk, fx.rel);
      this.fear = addFearAmount(decayFear(this.fear, clockOf(this.clock).day), vk, fx.fear);
      this.duels = recordOutcome(this.duels, outcome, vk, d.id, this.clock);
      d.phase = 'done'; d.since = time; d.outcome = outcome;
      if (f && f.combat.phase === 'ready') f.combat = { hp: Math.min(f.combat.hp, 60), phase: 'ready', downUntil: 0 };
      let msg = '';
      if (outcome === 'win') {
        this.addXp(60); msg = `Du hast ${name} besiegt · ${v.name} zollt dir Respekt und fürchtet dich`;
        const w = d.woman ?? womanOf(d.id);
        const wf = w ? this.folk.find(o => o.c.id === w) : undefined;
        if (w && wf && wf.c.state === 'free' && wf.combat.phase === 'ready' && claimsWoman(d.cause, this.couples.affairs[w] ?? 0, this.couples.lure[w] ?? 0, LURE_NEEDED)) {
          wf.c = { ...wf.c, state: 'camp', x: Math.round(wf.sprite.x), y: Math.round(wf.sprite.y) }; poseFolk(wf);
          this.companionOrders.set(w, { id: w, mode: 'return', x: wf.sprite.x, y: wf.sprite.y }); this.companionMovement.reset(w);
          if (!this.couples.broken.includes(w)) this.couples = { ...this.couples, broken: [...this.couples.broken, w] };
          this.trustEvent(w, 'joined');
          const kids = this.repro.children.filter(c => c.mother === w).map(c => c.name);
          this.bark(w, wf.sprite, 'flee', time, true, 'Sie haben mich verstoßen…');
          msg += ` · ${this.personName(w)} wird verstoßen und folgt dir${kids.length ? ` mit ${kids.join(' und ')}` : ''} ins Lager`;
        }
        for (const id of d.spectators) { const o = this.folk.find(x => x.c.id === id); if (o) this.bark(id, o.sprite, 'greet', time, true, 'Er hat gesiegt!'); }
      } else {
        if (fx.tribute) {
          const t = duelTribute({ berries: this.count, meat: this.meat, cooked: this.cooked, jerky: this.jerky, wood: this.stock.wood, stone: this.stock.stone, flint: this.stock.flint, fiber: this.stock.fiber });
          this.count = t.left.berries; this.meat = t.left.meat; this.cooked = t.left.cooked; this.jerky = t.left.jerky;
          this.stock = { ...this.stock, wood: t.left.wood, stone: t.left.stone, flint: t.left.flint, fiber: t.left.fiber };
          const took = Object.entries(t.taken).filter(([, n]) => n > 0).length;
          msg = `Du hast gegen ${name} verloren · ${v.name} nimmt dir Tribut ab${took ? '' : ' (du hattest nichts)'} · man verspottet dich`;
        } else msg = `Du bist vor ${name} davongelaufen · Feigling! ${v.name} verachtet dich`;
        if (f && f.combat.phase === 'ready') { this.bark(d.id, f.sprite, 'alarm', time, true, outcome === 'fled' ? 'Lauf nur, Feigling!' : 'Geh mir aus den Augen!'); if (outcome === 'fled' && this.player && Math.hypot(f.sprite.x - this.player.x, f.sprite.y - this.player.y) < 200) { const m = this.folkMood.get(d.id); if (m) m.armedUntil = time + 9000; } }
        d.spectators.slice(0, 3).forEach((id, i) => { const o = this.folk.find(x => x.c.id === id); if (o) this.bark(id, o.sprite, 'warn', time, true, MOCK_LINES[(i + Math.floor(time / 97)) % MOCK_LINES.length]); });
        this.nextMock = time + 6000;
      }
      this.message = msg; this.messageUntil = time + 5000; this.persist();
    }
    /** Approach, prompt, ring and fight; called every frame from tribal(), also while paused for the prompt answer. */
    tickDuel(time: number, stop: boolean) {
      const d = this.duel, p = this.player; if (!d || !p) return;
      const f = this.duelFoe();
      const choice = input.duelChoice; input.duelChoice = null;
      if (!f || (f.combat.phase === 'dead' && d.phase !== 'done') || (f.c.state !== 'free' && d.phase !== 'done')) { this.duel = null; return; }
      if (d.phase === 'prompt') { if (choice === 'accept') this.closeRing(f, time); else if (choice === 'flee') this.endDuel('fled', time); f.sprite.setVelocity(0, 0); return; }
      if (d.phase === 'done') {
        for (const id of [d.id, ...d.spectators]) { const o = this.folk.find(x => x.c.id === id); if (o && o.combat.phase === 'ready') { o.sprite.setVelocity(0, 0); if (id === d.id && d.outcome === 'win' && d.rules.goal === 'submit') o.sprite.setFrame(surrenderFrameOf(o)); } }
        if (time - d.since > 2400) this.duel = null; return;
      }
      if (this.dead || this.health <= 0) { if (d.phase === 'fight' || d.phase === 'gather') this.endDuel('lose', time); else this.duel = null; return; }
      const s = f.sprite, face = (x: number, y: number) => { f.facing = (Math.round(Math.atan2(y - s.y, x - s.x) / (Math.PI / 4)) + 8) % 8; };
      if (stop) { s.setVelocity(0, 0); for (const id of d.spectators) this.folk.find(o => o.c.id === id)?.sprite.setVelocity(0, 0); return; }
      const dist = Math.hypot(p.x - s.x, p.y - s.y);
      if (d.phase === 'approach') {
        if (dist > APPROACH_ESCAPE) { this.endDuel('fled', time); return; }
        if (dist <= CHALLENGE_REACH || time - d.since > 25000) { s.setVelocity(0, 0); s.anims.stop(); face(p.x, p.y); s.setFrame(f.facing); d.phase = 'prompt'; this.attacking = false; this.attackPending = false; return; }
        this.walkTo(f, p.x, p.y, APPROACH_SPEED, time); return;
      }
      // Spectators take their places and cheer.
      d.spectators.forEach((id, i) => {
        const o = this.folk.find(x => x.c.id === id); if (!o || o.combat.phase !== 'ready' || o.c.state !== 'free') return;
        const slot = ringSlot(i, d.spectators.length, d.center), gx = slot.x - o.sprite.x, gy = slot.y - o.sprite.y;
        if (Math.hypot(gx, gy) > 6) this.walkTo(o, slot.x, slot.y, 70, time);
        else { o.sprite.setVelocity(0, 0); o.sprite.anims.stop(); o.facing = (Math.round(Math.atan2(d.center.y - o.sprite.y, d.center.x - o.sprite.x) / (Math.PI / 4)) + 8) % 8; o.sprite.setFrame(o.facing); o.sprite.setDepth(o.sprite.y); }
        this.folkMood.get(id)?.icon.setVisible(false);
      });
      if (d.phase === 'fight' && time > d.nextCheer && d.spectators.length) { d.nextCheer = time + 2200 + Math.random() * 2000; const id = d.spectators[Math.floor(Math.random() * d.spectators.length)]!; const o = this.folk.find(x => x.c.id === id); if (o) this.bark(id, o.sprite, 'greet', time, true, CHEER_LINES[Math.floor(Math.random() * CHEER_LINES.length)]); }
      if (leftRing(d.center, p) && (d.phase === 'fight' || time - d.since > 900)) {
        const guard = d.spectators.map(id => this.folk.find(o => o.c.id === id)).filter((o): o is Folk => !!o && isWarrior(o.t) && o.combat.phase === 'ready').sort((a, b) => Math.hypot(a.sprite.x - p.x, a.sprite.y - p.y) - Math.hypot(b.sprite.x - p.x, b.sprite.y - p.y))[0];
        if (guard) { this.hurtPlayer(6, time); this.hitFlash = time + 200; this.bark(guard.c.id, guard.sprite, 'attack', time, true, 'Feigling! Kein Weglaufen!'); }
        this.endDuel('fled', time); return;
      }
      if (d.phase === 'gather') {
        const a = Math.atan2(s.y - p.y, s.x - p.x), gx = d.center.x + Math.cos(a) * 28, gy = d.center.y + Math.sin(a) * 28;
        if (Math.hypot(gx - s.x, gy - s.y) > 5) this.walkTo(f, gx, gy, 60, time); else { s.setVelocity(0, 0); s.anims.stop(); face(p.x, p.y); s.setFrame(f.facing); }
        if (time - d.since >= GATHER_MS) { d.phase = 'fight'; d.ai = newDuelAi(time); this.bark(d.id, s, 'attack', time, true, d.rules.goal === 'death' ? 'Einer von uns stirbt heute!' : 'Knie nieder oder blute!'); this.message = `Kämpft! · ${rulesText(d.rules)}`; this.messageUntil = time + 2000; }
        return;
      }
      // Fight.
      if (playerYields(this.health, d.rules.goal)) { this.endDuel('lose', time); return; }
      if (f.combat.phase === 'downed') {
        s.setVelocity(0, 0);
        if (time >= f.combat.downUntil) { f.combat = { hp: Math.round(DUEL_HP * 0.35), phase: 'ready', downUntil: 0, max: DUEL_HP }; poseFolk(f); d.ai = staggerAi(d.ai, time); this.bark(d.id, s, 'alarm', time, true, 'Noch lebe ich!'); this.message = `${this.personName(d.id)} rappelt sich wieder auf!`; this.messageUntil = time + 1800; }
        else if (time >= this.messageUntil) { this.message = `${this.personName(d.id)} liegt am Boden · Angriff: Finisher!`; this.messageUntil = time + 500; }
        return;
      }
      const th = duelThink(d.ai, { now: time, dist, playerSwing: time - this.duelSwingAt < 140, rng: Math.random });
      d.ai = th.ai; face(p.x, p.y);
      const v = d.knock && time < d.knock.until ? { x: d.knock.vx, y: d.knock.vy } : duelVelocity(th.move, s, p, d.center, d.ai.dir);
      s.setVelocity(v.x, v.y); s.setDepth(s.y);
      const striking = d.ai.state === 'strike';
      if (th.strikeStarted) {
        if (d.rules.arms === 'weapons') s.play(`${f.t.tex}-attack-${f.facing}`);
        else { s.anims.stop(); s.setFrame(f.facing); this.tweens.add({ targets: s, scaleX: s.scaleX * 1.12, scaleY: s.scaleY * 0.92, duration: 110, yoyo: true }); }
      } else if (!striking) { if (Math.hypot(v.x, v.y) > 4) { const vf = (Math.round(Math.atan2(v.y, v.x) / (Math.PI / 4)) + 8) % 8; s.play(`${f.t.tex}-walk-${d.ai.state === 'backstep' ? f.facing : vf}`, true); } else { s.anims.stop(); s.setFrame(f.facing); } }
      if (th.landHit && !this.finisher) {
        const dmg = opponentDamage(d.rules.arms), ux = (p.x - s.x) / Math.max(1, dist), uy = (p.y - s.y) / Math.max(1, dist);
        this.hurtPlayer(dmg, time); this.hitFlash = time + 200; this.lastDamage = time;
        this.shove = { vx: ux * 170, vy: uy * 170, until: time + 150 };
        this.bleed(p.x, p.y, ux, uy, d.rules.arms === 'weapons' ? 6 : 2);
        this.message = d.rules.arms === 'weapons' ? `${this.personName(d.id)} trifft dich mit der Waffe!` : `${this.personName(d.id)} schlägt dir ins Gesicht!`; this.messageUntil = time + 1200;
      }
    }
    /** The player's blow on the duelist: he may jump away, otherwise half damage under the duel's goal. */
    duelStruck(f: Folk, base: number, fx: number, fy: number, time: number) {
      const d = this.duel; if (!d) return;
      if (d.phase !== 'fight') return;
      if (isDodging(d.ai, time)) { this.message = `${this.personName(d.id)} weicht aus!`; this.messageUntil = time + 900; return; }
      const dmg = playerDuelDamage(base), r = hitDuelist(f.combat, dmg, time, d.rules.goal);
      f.combat = r.fighter; d.ai = staggerAi(d.ai, time); d.knock = { vx: fx * 140, vy: fy * 140, until: time + 140 };
      this.punch(dmg); this.bleed(f.sprite.x, f.sprite.y, fx, fy, d.rules.arms === 'weapons' ? 12 : 4);
      f.sprite.setTint(0xff6b4a); this.time.delayedCall(140, () => f.sprite.clearTint());
      if (r.result === 'submitted') { f.sprite.setVelocity(0, 0); f.sprite.anims.stop(); f.sprite.setFrame(surrenderFrameOf(f)); this.bark(d.id, f.sprite, 'flee', time, true, 'Genug! Ich unterwerfe mich!'); this.endDuel('win', time); return; }
      if (r.result === 'downed') { poseFolk(f); this.message = `${this.personName(d.id)} geht zu Boden · Angriff: Finisher!`; this.messageUntil = time + 2200; return; }
      this.message = `Treffer! · ${this.personName(d.id)} ${Math.round(f.combat.hp)}/${DUEL_HP}`; this.messageUntil = time + 1000;
    }
    /** Shamed villages jeer and now and then a villager runs up only to shove the coward. */
    tickMockery(time: number, stop: boolean) {
      const p = this.player; if (!p || this.duel) return;
      const shamed = FOLK_HOMES.findIndex(v => isShamed(this.duels, villageKey(v.name), this.clock) && Math.hypot(p.x - v.x, p.y - v.y) < v.r + 120);
      const m = this.mocker;
      if (m) {
        const f = this.folk.find(o => o.c.id === m.id);
        if (!f || stop || time > m.until || f.combat.phase !== 'ready' || f.c.state !== 'free' || (this.folkMood.get(f.c.id)?.armedUntil ?? 0) > time) { f?.sprite.setVelocity(0, 0); this.mocker = null; return; }
        const d = this.walkTo(f, p.x, p.y, 96, time);
        if (d <= 18) {
          const dx = p.x - f.sprite.x, dy = p.y - f.sprite.y, l = Math.max(1, Math.hypot(dx, dy));
          this.shove = { vx: dx / l * 260, vy: dy / l * 260, until: time + 260 }; this.cameras.main.shake(140, 0.004);
          this.bark(f.c.id, f.sprite, 'warn', time, true, MOCK_LINES[Math.floor(Math.random() * MOCK_LINES.length)]);
          this.message = 'Du wirst geschubst und ausgelacht'; this.messageUntil = time + 1600;
          f.sprite.setVelocity(0, 0); this.mocker = null;
        }
        return;
      }
      if (shamed < 0 || stop || this.dead) return;
      const near = this.folk.filter(o => o.t.village === shamed && o.c.state === 'free' && o.combat.phase === 'ready' && !isCarrier(this.carriers, o.c.id) && (this.folkMood.get(o.c.id)?.armedUntil ?? 0) <= time && Math.hypot(o.sprite.x - p.x, o.sprite.y - p.y) < 230);
      if (time > this.nextJeer && near.length) { this.nextJeer = time + 3500 + Math.random() * 2500; const o = near[Math.floor(Math.random() * near.length)]!; this.bark(o.c.id, o.sprite, 'warn', time, false, MOCK_LINES[Math.floor(Math.random() * MOCK_LINES.length)]); }
      if (time > this.nextMock && near.length) { this.nextMock = time + nextMockDelay(Math.random); const o = near[Math.floor(Math.random() * near.length)]!; this.mocker = { id: o.c.id, until: time + 6000 }; }
    }
    /** Autosave mid-duel: the save counts it as running away, so reloading cannot dodge the outcome. */
    savedDuelView(): { rel: RelationshipState; fear: FearState; duels: DuelBook } {
      const d = this.duel;
      if (!d || d.phase === 'done') return { rel: this.rel, fear: this.fear, duels: this.duels };
      const vk = villageKey(FOLK_HOMES[d.village]!.name), fx = DUEL_EFFECTS.fled;
      return { rel: changeVillageRelationship(changePersonalRelationship(this.rel, d.id, fx.rel, vk), vk, fx.rel), fear: addFearAmount(this.fear, vk, fx.fear), duels: recordOutcome(this.duels, 'fled', vk, d.id, this.clock) };
    }
    duelStatus() {
      const d = this.duel; if (!d || d.phase === 'done') return null;
      return { phase: d.phase, name: this.personName(d.id), rules: rulesText(d.rules), cause: d.cause, ...(d.phase === 'prompt' ? { line: challengeLine(d.cause, d.woman ? this.personName(d.woman) : undefined) } : {}), ...(d.woman ? { woman: this.personName(d.woman) } : {}) };
    }
    duelBoss() {
      const d = this.duel, f = this.duelFoe(); if (!d || !f || (d.phase !== 'fight' && d.phase !== 'gather')) return null;
      return { name: `${this.personName(d.id)} · ${rulesText(d.rules)}`, hp: Math.round(f.combat.hp), max: DUEL_HP, down: f.combat.phase === 'downed' };
    }
    shamedHere(p: { x: number; y: number }) { const v = FOLK_HOMES.find(v => isShamed(this.duels, villageKey(v.name), this.clock) && Math.hypot(p.x - v.x, p.y - v.y) < v.r + 120); return v ? v.name : null; }
    /** Jealous partner draws his weapon on the player. */
    confrontPartner(id: string, time: number) {
      const f = this.folk.find(o => o.c.id === id); if (!f || f.combat.phase !== 'ready' || f.c.state !== 'free') return;
      if (!this.duel && !this.caves.current && !this.dead && !isChampion(f.t) && isWarrior(f.t) && !onCooldown(this.duels, id, this.clock)) { this.startDuel(f, 'jealousy', time, womanOf(id)); return; }
      this.armFolk(f, time); this.bark(id, f.sprite, 'alarm', time, true, 'Du Hund! Sie gehört zu mir!');
      this.message = `${this.personName(id)} weiß Bescheid · er will Blut sehen!`; this.messageUntil = time + 3000;
    }
    nextCampChat = 0;
    campPeople() {
      return this.companionActors().filter(a => Math.hypot(a.sprite.x - CAMP.x, a.sprite.y - CAMP.y - FIRE_DY) < 220 && !allyDowned(this.allyHealth(a.id)));
    }
    campTopics(id: string) {
      const p = this.player;
      if (!p || Math.hypot(p.x - CAMP.x, p.y - CAMP.y - FIRE_DY) > 220) return [];
      return availableCampDialogues(this.campSocial, PROFILE_IDS[id] ?? id, this.campPeople().map(a => PROFILE_IDS[a.id] ?? a.id), clockOf(this.clock).day);
    }
    tickCampChat(time: number) {
      const request = input.dialogueChoice; input.dialogueChoice = null;
      if (request && !this.dead && !this.sleeping && this.health > 0) {
        if (request.dialogue === `trust-${PROFILE_IDS[request.target]}`) { this.personalChoice(request.target, request.choice, time); return; }
        const actor = this.campPeople().find(a => a.id === request.target), p = this.player;
        if (actor && p && Math.hypot(actor.sprite.x - p.x, actor.sprite.y - p.y) <= INTERACTION_RANGE && this.campTopics(actor.id).some(d => d.id === request.dialogue)) {
          const result = resolveCampDialogue(this.campSocial, request.dialogue, request.choice, PROFILE_IDS[actor.id] ?? actor.id, this.campPeople().map(a => PROFILE_IDS[a.id] ?? a.id), clockOf(this.clock).day);
          if (result) { this.campSocial = result.state; this.message = result.reply; this.messageUntil = time + 6500; if (request.dialogue === 'fire-stories' && request.choice === 'share' && isNight(clockOf(this.clock).minutesOfDay)) { const torvik = this.campPeople().find(a => PROFILE_IDS[a.id] === 'torvik'); if (torvik) this.trustEvent(torvik.id, 'stories'); } this.persist(); }
        }
      }
      if (input.paused || this.dead || this.sleeping || this.health <= 0 || time < this.nextCampChat || time < this.messageUntil) return;
      const p = this.player; if (!p || Math.hypot(p.x - CAMP.x, p.y - CAMP.y - FIRE_DY) > 220 || this.allyFoes().some(f => f.alive && f.hostile && Math.hypot(f.x - p.x, f.y - p.y) < 250)) return;
      const actors = this.campPeople();
      const topic = actors.flatMap(a => this.campTopics(a.id))[0]; if (!topic) return;
      const line = topic.lines[Math.floor(time / 12000) % topic.lines.length]; if (!line) return;
      const actor = actors.find(a => (PROFILE_IDS[a.id] ?? a.id) === line.speaker); if (!actor) return;
      this.bark(actor.id, actor.sprite, 'greet', time, false, line.text);
      this.nextCampChat = time + 12000;
    }
    profileView(id: string, portrait: string): ProfileView | undefined {
      let biography = getProfile(id); if (!biography) return undefined;
      let state = this.profiles[id];
      if (!state) { state = profileState(biography); this.profiles[id] = state; }
      const couple = relationLabel(this.couples, id, this.personName, this.folkAlive);
      if (couple) biography = { ...biography, relations: [...biography.relations, { with: 'couple', note: couple }] };
      const kin = reproLabels(this.repro, id, clockOf(this.clock).day, this.personName);
      if (kin.length) biography = { ...biography, relations: [...biography.relations, ...kin.map(note => ({ with: 'kin', note }))] };
      return { biography, state: profileState(biography, state), portrait, trustSteps: trustSteps(biography.id, this.trustProgress[id]), bonds: biography.relations.map(r => ({ with: r.with, value: pairBond(this.campSocial, biography.id, r.with), label: bondLabel(pairBond(this.campSocial, biography.id, r.with)) })) };
    }
    folkMood = new Map<string, { icon: Phaser.GameObjects.Text; next: number; dec?: BehaviorDecision | undefined; armedUntil?: number; weapon?: Phaser.GameObjects.Image }>();
    talk: TalkTarget | null = null;
    carried: Folk | undefined = undefined;
    carryImg?: Phaser.GameObjects.Image;
    villageSupplies = new Map<string, Phaser.GameObjects.Image>();
    hunger = 100;
    warmth = 100;
    clock = START_MINUTES; // Spielminuten seit Tag 1, 00:00
    nextHungerWarn = 0;
    nextColdWarn = 0;
    nightTex: Phaser.Textures.CanvasTexture | undefined = undefined;
    night: Phaser.GameObjects.Image | undefined = undefined;
    lastAutosave = 0;
    lastSaveReq = 0;
    plantTree?: (x: number, y: number, dir: number) => void;
    rocks: { x: number; y: number; hp: number; sprite: Phaser.Physics.Arcade.Sprite }[] = [];
    resPickups: { kind: Resource; x: number; y: number; sprite: Phaser.GameObjects.Image }[] = [];
    stock: Stock = emptyStock();
    crouchOn = false;
    hidden = false;
    covers: { x: number; y: number }[] = [];
    hitFlash = 0;
    bleedUntil = 0;
    nextTrail = 0;
    punch(dmg: number, finisher = false) { if (!this.physics.world.isPaused) { this.physics.pause(); this.anims.pauseAll(); this.time.delayedCall(hitstopMs(dmg, finisher), () => { this.physics.resume(); this.anims.resumeAll(); }); } this.cameras.main.shake(finisher ? 260 : 110, finisher ? 0.012 : Math.min(0.008, 0.002 + dmg * 0.0003)); if (finisher) { this.cameras.main.zoomTo(this.cameras.main.zoom * 1.08, 120, 'Sine.easeOut', true); this.time.delayedCall(500, () => this.cameras.main.zoomTo(this.cameras.main.zoom / 1.08, 300, 'Sine.easeIn', true)); } }
    hurtPlayer(dmg: number, time: number) { this.health = Math.max(0, this.health - dmg); this.bleedUntil = woundFrom(this.bleedUntil, dmg, Math.random(), time, this.owned.includes('bandage')); this.punch(dmg); }
    attackPending = false;
    lastDamage = 0;
    target: Creature | undefined = undefined;
    marker?: Phaser.GameObjects.Image;
    hasSpear = true;
    xp = 0;
    owned: ItemId[] = ['axe'];
    addXp(n: number) { const before = levelFromXp(this.xp); this.xp += n; const after = levelFromXp(this.xp); if (after > before) { this.message = `Stufe ${after} erreicht! Neue Rezepte im Handwerk`; this.messageUntil = this.time.now + 3000; return true; } return false; }
    lockReq = false;
    clickAttack = false;
    get held(): Weapon { return this.fistsDuel()?'none':this.weapon==='spear'&&!this.hasSpear?'none':this.weapon; }
    crouching = false;
    dead = false;
    lastRespawn = 0;
    spear: { img: Phaser.GameObjects.Image; target: Creature | undefined; tx: number; ty: number } | undefined = undefined;
    spearOnGround: { x: number; y: number; img: Phaser.GameObjects.Image } | undefined = undefined;
    pantry(){return{health:this.health,stamina:this.stamina,hunger:this.hunger,berries:this.count,meat:this.meat,cooked:this.cooked,jerky:this.jerky};}
    setPantry(r:Pantry){this.health=r.health;this.stamina=r.stamina;this.hunger=r.hunger;this.count=r.berries;this.meat=r.meat;this.cooked=r.cooked;this.jerky=r.jerky;}
    /** Aktueller Spielstand der Welt; null, solange Speichern keinen Sinn ergibt (tot, schlafend, noch nicht bereit). */
    snapshot(): GameSave | null {
      const p = this.player;
      if (!p || this.dead || this.sleeping || this.health <= 0) return null;
      const dv = this.savedDuelView();
      return {
        caves: this.caves,
        x: Math.round(p.x), y: Math.round(p.y),
        health: Math.min(100, Math.max(1, Math.round(this.health))),
        stamina: Math.min(100, Math.max(0, Math.round(this.stamina))),
        hunger: Math.round(this.hunger), warmth: Math.round(this.warmth), clock: Math.floor(this.clock),
        berries: this.count, meat: this.meat, cooked: this.cooked,
        stock: { ...this.stock }, xp: this.xp, owned: [...this.owned],
        stumps: this.stumps.map(({ x, y, dir }) => ({ x, y, dir })),
        minedRocks: this.minedRocks.map(([x, y]) => [x, y] as [number, number]),
        pickedBerries: this.berries.flatMap((b, i) => (b.picked ? [i] : [])),
        lootedHouses: [...this.lootedHouses],
        chest: { ...this.chest },
        tasks: Object.fromEntries(Object.entries(this.tasks).filter(([, t]) => t.kind !== 'none').map(([k, t]) => [k, { kind: t.kind, since: t.since }])),
        jerky: this.jerky,
        structures: this.structures.map(s => ({ ...s, meat: [...s.meat] })),
        traps: this.traps.map(t => ({ ...t })),
        signals: { manualAlarm: this.manualAlarm, hornReadyAt: this.hornReadyAt },
        tutorial: { ...this.tutorial },
        campSocial: { bonds: { ...this.campSocial.bonds }, resolved: { ...this.campSocial.resolved } },
        couples: { lure: { ...this.couples.lure }, affairs: { ...this.couples.affairs }, suspicion: { ...this.couples.suspicion }, broken: [...this.couples.broken] },
        repro: { pregnant: { ...this.repro.pregnant }, children: [...this.repro.children], day: this.repro.day },
        trustProgress: this.trustProgress,
        profiles: Object.fromEntries(Object.entries(this.profiles).map(([id, state]) => [id, { trust: state.trust, skills: { ...state.skills } }])),
        // A captive on the shoulders is saved lying bound at the player's feet.
        captives: this.folk.filter(f => f.c.state !== 'free').map(f => f.c.state === 'carried'
          ? { id: f.c.id, state: 'bound' as const, x: Math.round(p.x), y: Math.round(p.y + 6) }
          : { id: f.c.id, state: f.c.state as 'surrender' | 'bound' | 'camp', x: Math.round(f.sprite.x), y: Math.round(f.sprite.y) }),
        raid: { ...this.raid },
        fires: { ...this.fires },
        warband: this.warband,
        fear: dv.fear,
        duels: { shame: { ...dv.duels.shame }, cooldown: { ...dv.duels.cooldown } },
        lore: this.lore,
        rumors: this.savedRumors(),
        fighters: this.folk.filter(f => f.combat.hp !== (f.combat.max ?? 60) || f.combat.phase !== 'ready').map(f => ({ id: f.c.id, hp: f.combat.hp, phase: f.combat.phase, x: Math.round(f.sprite.x), y: Math.round(f.sprite.y), facing: f.facing, ...(f.deathClock !== undefined && f.combat.phase === 'dead' ? { deathClock: Math.floor(f.deathClock) } : {}), ...(f.beheaded ? { beheaded: true, headPosition: f.headPosition, ...(f.skullTaken ? { skullTaken: true } : {}) } : {}) })),
        companions: this.companionActors().flatMap(a => { const order = this.companionOrders.get(a.id); return order ? [{ id: a.id, mode: order.mode, x: Math.round(a.sprite.x), y: Math.round(a.sprite.y) }] : []; }),
        allies: [...this.allyHp].filter(([, h]) => h.hp < 50 || h.downUntil > 0).map(([id, h]) => ({ id, hp: Math.round(h.hp), downMs: h.downUntil > 0 ? Math.max(0, Math.min(60000, Math.round(h.downUntil - this.time.now))) : 0 })),
        relationships: { village: { ...dv.rel.village }, personal: { ...dv.rel.personal }, alarmUntil: { ...dv.rel.alarmUntil } },
      };
    }
    persist() { const g = this.snapshot(); if (g) saveGame({ game: g }); }
    ownBuildNear(p:{x:number;y:number}){let best:Placed|undefined;let bd=30;for(const s of this.structures){const d=Math.hypot(s.x-p.x,s.y-p.y);if(d<bd){bd=d;best=s;}}return best;}
    /** Build mode: ghost in front of the player, rotate, place or take down own structures. */
    tickBuild(input:GameInput,p:Phaser.Physics.Arcade.Sprite,time:number){
      this.nearRack=this.structures.find(s=>s.kind==='rack'&&Math.hypot(s.x-p.x,s.y-p.y)<38)??null;
      this.nearTrap=this.traps.find(t=>t.meat>0&&Math.hypot(t.x-p.x,t.y-p.y)<30)??null;
      const cmd=input.build;input.build=null;
      const say=(m:string)=>{this.message=m;this.messageUntil=time+2200;};
      if(cmd?.op==='select')this.building={kind:cmd.kind,dir:this.building?.dir??2,error:null};
      else if(cmd?.op==='cancel')this.building=null;
      else if(cmd?.op==='rotate'&&this.building)this.building={...this.building,dir:(this.building.dir+1)%8};
      else if(cmd?.op==='remove'){const s=this.ownBuildNear(p);const tr=this.traps.find(t=>Math.hypot(t.x-p.x,t.y-p.y)<30);if(s){this.structSprites.get(s.id)?.destroy();this.structSprites.delete(s.id);this.structures=this.structures.filter(o=>o.id!==s.id);this.stock=refund(STRUCTURES[s.kind].cost,this.stock);this.meat+=s.meat.length;say(`${STRUCTURES[s.kind].name} abgebaut · Material zurück`);this.persist();}else if(tr){this.trapSprites.get(tr.id)?.destroy();this.trapSprites.delete(tr.id);this.traps=this.traps.filter(o=>o.id!==tr.id);this.stock=refund(TRAPS[tr.kind].cost,this.stock);this.meat+=tr.meat;say(`${TRAPS[tr.kind].name} abgebaut · Material zurück`);this.persist();}else say('Kein eigener Bau in der Nähe');}
      if(!this.building){this.ghost?.setVisible(false);return;}
      const a=this.lastFacing*Math.PI/4;const gx=Math.round(p.x+Math.cos(a)*30),gy=Math.round(p.y+Math.sin(a)*24+6);
      const b=this.building;const isTrap=(TRAP_KINDS as readonly string[]).includes(b.kind);
      const def=isTrap?TRAPS[b.kind as TrapKind]:STRUCTURES[b.kind as StructureKind];
      const blockers=[{x:CAMP.x,y:CAMP.y+FIRE_DY,r:20},{x:CHEST_POS.x,y:CHEST_POS.y,r:12},{x:this.bed?.x??0,y:this.bed?.y??0,r:16},{x:p.x,y:p.y,r:4}];
      let error=isTrap?trapPlacementError(gx,gy,this.traps,blockers):placementError(b.kind as StructureKind,gx,gy,this.structures,blockers);
      if(!error&&!canAfford(def.cost,this.stock))error='Zu wenig Material';
      b.error=error;
      const sid=`s${gx}_${gy}`;const key=isTrap?`trap-${b.kind}`:structTex({kind:b.kind as StructureKind,dir:b.dir,id:sid});
      if(isTrap)this.makeTrapTextures();
      if(!this.ghost)this.ghost=this.add.image(gx,gy,key);
      this.ghost.setTexture(key).setPosition(gx,gy).setVisible(true).setAlpha(.6).setTint(error?0xff6060:0x80ff90).setDepth(gy+40);
      if(cmd?.op==='place'){
        if(error){say(error);return;}
        if(isTrap){const t:Trap={id:`t${gx}_${gy}`,kind:b.kind as TrapKind,x:gx,y:gy,uses:TRAPS[b.kind as TrapKind].uses,meat:0};this.stock=pay(def.cost,this.stock);this.traps=[...this.traps,t];this.spawnTrap(t);say(`${def.name} aufgestellt`);this.persist();return;}
        const s:Placed={id:sid,kind:b.kind as StructureKind,x:gx,y:gy,dir:!isTrap&&'rotates' in def&&def.rotates?b.dir:0,meat:[]};
        this.stock=pay(def.cost,this.stock);this.structures=[...this.structures,s];this.spawnStructure(s);say(`${def.name} gebaut`);if(s.kind==='totem'){const v=VILLAGES.find(v=>Math.hypot(v.x-gx,v.y-gy)<TOTEM_FEAR_RANGE);if(v){this.fear=addFear(decayFear(this.fear,clockOf(this.clock).day),villageKey(v.name),'totem');say(`Schandpfahl errichtet · ${v.name} erzittert`);}}this.persist();
      }
    }
    /** Wendet einen Spielstand auf die frisch (deterministisch) erzeugte Welt an. */
    restore(g: GameSave) {
      const p = this.player; if (!p) return;
      this.caves = g.caves ? { ...newCaves(), ...g.caves, builds: g.caves.builds ?? {} } : newCaves();
      this.health = g.health; this.stamina = g.stamina;
      this.count = g.berries; this.meat = g.meat; this.cooked = g.cooked;
      this.hunger = g.hunger; this.warmth = g.warmth; this.clock = g.clock;
      this.stock = { wood: g.stock.wood, stone: g.stock.stone, flint: g.stock.flint, fiber: g.stock.fiber, skull: g.stock.skull ?? 0, wolfPelt: g.stock.wolfPelt ?? 0, sabrePelt: g.stock.sabrePelt ?? 0 }; this.xp = g.xp; this.owned = [...g.owned];
      this.lootedHouses = [...g.lootedHouses];
      this.chest = { ...g.chest };
      this.tasks = Object.fromEntries(Object.entries(g.tasks ?? {}).map(([k, t]) => [k, { ...t }]));
      this.jerky = g.jerky; this.structures = g.structures.map(s => ({ ...s, meat: [...s.meat] })); this.structures.forEach(s => this.spawnStructure(s));
      this.traps = (g.traps ?? []).map(t => ({ ...t })); this.traps.forEach(t => this.spawnTrap(t));
      // Ältere Spielstände ohne Einführung: Spieler kennt das Spiel schon.
      this.tutorial = g.tutorial ? { ...g.tutorial } : { step: TUTORIAL_DONE, progress: 0 };
      this.rel = g.relationships;
      this.manualAlarm=g.signals?.manualAlarm??false;this.hornReadyAt=g.signals?.hornReadyAt??0;
      this.campSocial = g.campSocial ?? emptyCampSocial();
      this.couples = g.couples ? { lure: { ...g.couples.lure }, affairs: { ...g.couples.affairs }, suspicion: { ...g.couples.suspicion }, broken: [...g.couples.broken] } : EMPTY_COUPLES;
      this.repro = g.repro ? { pregnant: { ...g.repro.pregnant }, children: [...g.repro.children], day: g.repro.day } : EMPTY_REPRO;
      this.trustProgress = g.trustProgress ?? {};
      this.profiles = Object.fromEntries(Object.entries(g.profiles ?? {}).map(([id, state]) => [id, { trust: state.trust, skills: { ...state.skills } }]));
      for (const id of this.lootedHouses) { this.villageSupplies.get(id)?.destroy(); this.villageSupplies.delete(id); }
      // Bereits gefällte Bäume wieder entfernen; der Stumpf bleibt für das Nachwachsen nach dem Schlafen.
      for (const s of g.stumps) {
        const t = this.trees.find(t => Math.hypot(t.x - s.x, t.y - s.y) < 2); if (!t) continue;
        this.trees = this.trees.filter(o => o !== t); t.sprite.destroy();
        this.stumps.push({ x: t.x, y: t.y, dir: t.dir });
      }
      for (const [x, y] of g.minedRocks) {
        const r = this.rocks.find(r => Math.hypot(r.x - x, r.y - y) < 2); if (!r) continue;
        this.rocks = this.rocks.filter(o => o !== r);
        this.covers = this.covers.filter(c => Math.hypot(c.x - r.x, c.y - r.y) > 1);
        r.sprite.destroy(); this.minedRocks.push([r.x, r.y]);
      }
      for (const i of g.pickedBerries) { const b = this.berries[i]; if (b) { b.picked = true; b.sprite.setTint(0x849461); } }
      for (const c of g.captives) { const f = this.folk.find(o => o.c.id === c.id); if (f) { f.c = { ...c }; poseFolk(f); } }
      this.raid = { ...(g.raid ?? {}) };
      this.fires = { ...(g.fires ?? {}) };
      this.lore = g.lore ? { ...(g.lore.nordics ? { nordics: { ...g.lore.nordics } } : {}), ...(g.lore.dragon ? { dragon: { ...g.lore.dragon } } : {}) } : EMPTY_LORE;
      this.fear = g.fear ? { fear: { ...g.fear.fear }, tributeDay: { ...g.fear.tributeDay }, grudge: { ...g.fear.grudge }, day: g.fear.day } : EMPTY_FEAR;
      this.rumors = g.rumors ? { rumors: g.rumors.rumors.map(r => ({ ...r, reached: [...r.reached] })) } : EMPTY_RUMORS;
      this.carriers = EMPTY_CARRIERS;
      this.duels = g.duels ? { shame: { ...g.duels.shame }, cooldown: { ...g.duels.cooldown } } : EMPTY_DUELS; this.duel = null;
      this.warband = g.warband ? { pending: { ...g.warband.pending }, cooldown: { ...g.warband.cooldown }, fury: { ...(g.warband.fury ?? {}) }, squads: { ...(g.warband.squads ?? {}) }, active: g.warband.active ? { ...g.warband.active } : undefined } : EMPTY_WARBANDS; this.raidRoster.clear(); this.clearRaidFx();
      for (const saved of g.fighters ?? []) { const f = this.folk.find(o => o.c.id === saved.id); if (!f) continue; f.combat = { hp: saved.hp, phase: saved.phase, downUntil: saved.phase === 'downed' ? this.time.now + KNOCKDOWN_MS : 0, max: isChampion(f.t) ? CHAMPION_HP : 60 }; f.beheaded = saved.beheaded; f.headPosition = saved.headPosition; f.deathClock = saved.deathClock ?? (saved.phase === 'dead' ? this.clock : undefined); f.skullTaken = saved.skullTaken; f.facing = saved.facing; f.sprite.setPosition(saved.x, saved.y); poseFolk(f); }
      for (const order of g.companions ?? []) {
        const actor = this.companionActors().find(a => a.id === order.id); if (!actor) continue;
        if (order.mode === 'follow' && this.followingCount() >= MAX_COMPANIONS) continue;
        actor.sprite.setPosition(order.x, order.y);
        this.companionOrders.set(order.id, { ...order });
      }
      for (const a of g.allies ?? []) this.allyHp.set(a.id, a.downMs > 0 ? { hp: 0, downUntil: this.time.now + Math.max(1, a.downMs) } : { hp: a.hp, downUntil: 0 });
      p.setPosition(Phaser.Math.Clamp(g.x, MAP.x, MAP.x + MAP.w), Phaser.Math.Clamp(g.y, MAP.y, MAP.y + MAP.h));
      if (this.caves.current) this.enterCave(this.caves.current, true);
      this.cameras.main.centerOn(p.x, p.y);
      this.message = 'Spielstand geladen'; this.messageUntil = this.time.now + 2400;
    }
    /** Dunkelheit als Overlay mit "Lichtlöchern" am Lagerfeuer und um den Spieler (Canvas-Textur, deckt die Kamerasicht ab). */
    nextWeatherWarn = 0;
    weatherGfx: Phaser.GameObjects.Graphics | undefined = undefined;
    weatherNow(p: { x: number; y: number }): Weather { return this.caves.current ? 'clear' : weatherAt(regionOf(biomeAt(p.x, p.y)), this.clock); }
    /** Rain streaks, snowflakes, blizzard haze and lightning drawn over the camera view. */
    updateWeather() {
      const p = this.player; if (!p) return;
      const g = this.weatherGfx ??= this.add.graphics().setDepth(899999);
      g.clear();
      const w = this.weatherNow(p); if (w === 'clear') return;
      const v = this.cameras.main.worldView, t = this.time.now;
      if (w === 'blizzard') { g.fillStyle(0xe8f0ff, 0.32); g.fillRect(v.x, v.y, v.width, v.height); }
      if (w === 'thunder' && (t % 9000) < 120) { g.fillStyle(0xffffff, 0.45); g.fillRect(v.x, v.y, v.width, v.height); }
      const wet = isWet(w), n = w === 'blizzard' ? 160 : w === 'snow' ? 70 : w === 'thunder' ? 140 : 100;
      for (let i = 0; i < n; i++) {
        const sx = (i * 73.13) % 1, sy = (i * 41.77) % 1;
        if (wet) {
          const fy = ((sy * v.height + t * 0.35) % v.height), fx = ((sx * v.width - t * 0.06) % v.width + v.width) % v.width;
          g.lineStyle(1, 0xa8c4e8, 0.55); g.lineBetween(v.x + fx, v.y + fy, v.x + fx - 2, v.y + fy + 7);
        } else {
          const drift = w === 'blizzard' ? 0.18 : 0.02;
          const fy = ((sy * v.height + t * (w === 'blizzard' ? 0.08 : 0.03)) % v.height);
          const fx = ((sx * v.width + t * drift + Math.sin(t / 600 + i) * 4) % v.width + v.width) % v.width;
          g.fillStyle(0xffffff, 0.85); g.fillRect(v.x + fx, v.y + fy, 1.4, 1.4);
        }
      }
    }
    updateNight() {
      this.updateWeather();
      const tex = this.nightTex, img = this.night, p = this.player;
      if (!tex || !img || !p) return;
      const sky = this.caves.current ? { r: 2, g: 3, b: 3, a: 0.985 } : skyTint(clockOf(this.clock).minutesOfDay);
      if (sky.a < 0.01) { img.setVisible(false); return; }
      const wv = this.cameras.main.worldView, pad = 14;
      const wx = wv.x - pad, wy = wv.y - pad, ww = wv.width + pad * 2, wh = wv.height + pad * 2;
      const cw = Math.max(16, Math.ceil(ww / 3)), ch = Math.max(16, Math.ceil(wh / 3)); // 1 Canvas-Pixel = 3 Weltpixel
      if (tex.width !== cw || tex.height !== ch) tex.setSize(cw, ch);
      const ctx = tex.context, k = cw / ww;
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = `rgba(${sky.r},${sky.g},${sky.b},${sky.a})`;
      ctx.fillRect(0, 0, cw, ch);
      ctx.globalCompositeOperation = 'destination-out';
      const hole = (x: number, y: number, r: number, strength: number) => {
        const cx = (x - wx) * k, cy = (y - wy) * k, cr = r * k;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
        g.addColorStop(0, `rgba(0,0,0,${strength})`); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill();
      };
      if (this.caves.current) {
        for (const b of this.caves.builds[this.caves.current] ?? []) if(b.kind==='fire') hole(b.x,b.y,140,0.98);
        hole(p.x,p.y,(this.owned.includes('torch')&&!!input.torch)?120+Math.sin(this.time.now/120)*3:22,(this.owned.includes('torch')&&!!input.torch)?0.98:0.28);
      } else { for (const h of FLAMMABLE_HOUSES) { const f = this.fires[h.id]; if (!f) continue; const ph = firePhase(f, this.clock); if (ph === 'blaze') hole(h.x, h.y, 160 + Math.sin(this.time.now / 90 + h.x) * 6, 0.95); else if (ph === 'smolder') hole(h.x, h.y, 55, 0.6); }
        hole(CAMP.x, CAMP.y + FIRE_DY, 190, 0.92); hole(p.x, p.y, (this.owned.includes('torch')&&!!input.torch)?120:70, (this.owned.includes('torch')&&!!input.torch)?0.9:0.35); }                  // Restlicht um den Spieler
      ctx.globalCompositeOperation = 'source-over';
      tex.refresh();
      img.setVisible(true).setPosition(wx, wy).setDisplaySize(ww, wh);
    }
    skinNow(): SkinId | null { return this.inDuelFight() ? null : skinFor(input.armor, this.health); }
    playDeath(p: Phaser.Physics.Arcade.Sprite) { const s = this.skinNow(); p.play(s ? `anim-skin-${s}-death-${this.lastFacing}` : `anim-death-${this.lastFacing}`); }
    /** Main-hand torch or club with its own uploaded atlas set (torch wins; both live in the main hand). */
    heldLook(): { kind: 'torch' | 'club'; table: typeof TORCH_SKINS } | null { if (this.fistsDuel()) return null; return input.torch === 'main' ? { kind: 'torch', table: TORCH_SKINS } : input.club ? { kind: 'club', table: CLUB_SKINS } : null; }
    playAttack(p: Phaser.Physics.Arcade.Sprite, w: Weapon) { const s = this.skinNow(); const h = this.heldLook(); if (h) { p.play(`anim-${h.kind}-${s ?? 'base'}-attack-${this.lastFacing}`); return; } p.play(s && w === 'none' ? `anim-skin-${s}-punch-${this.lastFacing}` : s && isArmed(w) ? `anim-armed-${s}-${w}-attack-${this.lastFacing}` : `anim-${w}-attack-${this.lastFacing}`); }
    playWalk(p: Phaser.Physics.Arcade.Sprite, w: Weapon, running: boolean) { const s = this.skinNow(); const h = this.heldLook(); const key = h ? (running && h.table[s ?? 'base'].run > 1 ? `${h.kind}-${s ?? 'base'}-run-${this.lastFacing}` : `${h.kind}-${s ?? 'base'}-walk-${this.lastFacing}`) : s && isArmed(w) ? (running && ARMED_SKINS[s][w].frames.run > 1 ? `armed-${s}-${w}-run-${this.lastFacing}` : `armed-${s}-${w}-walk-${this.lastFacing}`) : s ? (running && SKINS[s].frames.run > 1 ? `skin-${s}-run-${this.lastFacing}` : `skin-${s}-walk-${this.lastFacing}`) : `${w}-walk-${this.lastFacing}`; if (p.anims.currentAnim?.key !== key || !p.anims.isPlaying) p.play(key); p.anims.timeScale = running && !key.includes('-run-') ? 1.5 : 1; }
    setIdle(p: Phaser.Physics.Arcade.Sprite, w: Weapon) { const s = this.skinNow(); p.anims.stop(); const h = this.heldLook(); if (h) p.setTexture(`${h.kind}-${s ?? 'base'}`, armedFrame('idle', this.lastFacing)); else if (s && isArmed(w)) p.setTexture(`armed-${s}-${w}`, armedFrame('idle', this.lastFacing)); else if (s) p.setTexture(`skin-${s}`, skinFrame('idle', this.lastFacing)); else p.setTexture(`${w}-idle-${this.lastFacing}`); }
    playCrouch(p: Phaser.Physics.Arcade.Sprite, moving: boolean) { const s = this.skinNow(); const ck = s ? `skin-${s}-crouch-${this.lastFacing}` : `anim-crouch-${this.lastFacing}`; if (moving) { if (p.anims.currentAnim?.key !== ck || !p.anims.isPlaying) p.play(ck); } else { p.anims.stop(); if (s) p.setTexture(`skin-${s}`, skinFrame('crouch', this.lastFacing, 3)); else p.setTexture(`crouch-${this.lastFacing}`, 4); } }
    preload() {
      preloadCampers(this);
      preloadFolk(this);
      preloadChildren(this);
      sprites.forEach((asset, i) => this.load.image(`human${i}`, asset.url));
      walkSheets.forEach((asset, i) => this.load.spritesheet(`walk${i}`, asset.url, { frameWidth: 28, frameHeight: 28 }));
      (['none','axe','spear','wedge'] as Weapon[]).forEach(w => {
        IDLE[w].forEach((u, i) => this.load.image(`${w}-idle-${i}`, u));
        WALK[w].forEach((u, i) => this.load.spritesheet(`${w}-walk-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
        ATTACK[w].forEach((u, i) => this.load.spritesheet(`${w}-attack-${i}`, u, { frameWidth: 32, frameHeight: 32 }));
      });
      FINISHER.forEach((u,i)=>this.load.spritesheet(`finisher-${i}`,u,{frameWidth:32,frameHeight:32}));
      BEHEAD.forEach((u,i)=>this.load.spritesheet(`behead-${i}`,u,{frameWidth:32,frameHeight:32}));
      FIST_FINISHER.forEach((u,i)=>this.load.spritesheet(`fistfin-${i}`,u,{frameWidth:32,frameHeight:32}));
      for(const [k,sk] of Object.entries(SKINS))this.load.spritesheet(`skin-${k}`,sk.url,{frameWidth:32,frameHeight:32});
      for(const [k,a] of Object.entries(TORCH_SKINS))this.load.spritesheet(`torch-${k}`,a.url,{frameWidth:32,frameHeight:32});
      for(const [k,a] of Object.entries(CLUB_SKINS))this.load.spritesheet(`club-${k}`,a.url,{frameWidth:32,frameHeight:32});
      for(const [k,ws] of Object.entries(ARMED_SKINS))for(const [w,a] of Object.entries(ws))this.load.spritesheet(`armed-${k}-${w}`,a.url,{frameWidth:32,frameHeight:32});
      DEATH.forEach((u,i)=>this.load.spritesheet(`death-${i}`,u,{frameWidth:32,frameHeight:32}));
      CROUCH.forEach((u,i)=>this.load.spritesheet(`crouch-${i}`,u,{frameWidth:32,frameHeight:32}));
      this.load.image('sleep', SLEEP);
      this.load.image('spear-proj', ICON_SPEAR);
      this.load.image('folk-axe', ICON_AXE);
      this.load.image('drum-0', DRUM_ICON);
      this.load.image('bed', BED);
      RACK_TEX.forEach((a,i)=>this.load.image(`rack-${i}`,a.url));SHELTER_TEX.forEach((a,i)=>this.load.image(`shelter-${i}`,a.url));BARRICADE_TEX.forEach((a,i)=>this.load.image(`barricade-${i}`,a.url));TOTEM_TEX.forEach((a,i)=>this.load.image(`totem-${i}`,a.url));this.load.image('severed-skull',skullAsset.url);
      treeTex.forEach((asset, i) => this.load.image(`tree${i}`, asset.url));
      SNOW_TREES.forEach((asset, i) => this.load.image(`snow-tree-${i}`, asset.url));
      SNOW_ROCKS.forEach((asset, i) => this.load.image(`snow-rock-${i}`, asset.url));
      this.load.image('res-wood', resWood.url);
      this.load.image('res-stone', resStone.url);
      this.load.image('res-flint', resFlint.url);
      this.load.image('res-fiber', resFiber.url);
      this.load.image('fire', campfire.url);
      for(const [k,u] of Object.entries({...CAMP_TEXTURES,...NORDIC_TEXTURES,...DRAGON_TEXTURES,...RUIN_TEXTURES})) this.load.image(k,u);
      this.load.spritesheet('house-flame',FLAME_SHEET.url,{frameWidth:FLAME_SHEET.w,frameHeight:FLAME_SHEET.h});this.load.spritesheet('smoke-column',SMOKE_SHEET.url,{frameWidth:SMOKE_SHEET.w,frameHeight:SMOKE_SHEET.h});
      for (let i = 0; i < 8; i++) {
        this.load.image(`tiger-idle-${i}`, TIGER.idle[i]!);
        this.load.spritesheet(`tiger-walk-${i}`, TIGER.walk[i]!, { frameWidth: 64, frameHeight: 64 });
        this.load.spritesheet(`tiger-attack-${i}`, TIGER.attack[i]!, { frameWidth: 64, frameHeight: 64 });
        this.load.image(`gazelle-idle-${i}`, GAZELLE.idle[i]!);
        this.load.spritesheet(`gazelle-walk-${i}`, GAZELLE.walk[i]!, { frameWidth: 40, frameHeight: 40 });
        this.load.spritesheet(`gazelle-run-${i}`, GAZELLE.run[i]!, { frameWidth: 40, frameHeight: 40 });
        for (const [k, sp] of Object.entries(SNOW)) {
          const f = { frameWidth: sp.cell, frameHeight: sp.cell };
          this.load.image(`${k}-idle-${i}`, sp.idle[i]!);
          this.load.spritesheet(`${k}-walk-${i}`, sp.walk[i]!, f);
          if (sp.attack) this.load.spritesheet(`${k}-attack-${i}`, sp.attack[i]!, f);
        }
        this.load.spritesheet(`wolf-eat-${i}`, WOLF_EAT[i]!, { frameWidth: 52, frameHeight: 52 });
      }
    }
    create() {
      // One looping walk cycle per direction; timeScale adapts to sprint speed.
      for (let i = 0; i < 8; i++) {
        this.anims.create({ key: `walk-${i}`, frames: this.anims.generateFrameNumbers(`walk${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
      }
      (['none','axe','spear','wedge'] as Weapon[]).forEach(w => {
        for (let i = 0; i < 8; i++) {
          const walkKey = `${w}-walk-${i}`;
          this.anims.create({ key: walkKey, frames: this.anims.generateFrameNumbers(walkKey, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
          const atkKey = `${w}-attack-${i}`;
          const tex = this.textures.get(atkKey);
          const frames = this.anims.generateFrameNumbers(atkKey, { start: 0, end: tex.frameTotal - 2 });
          this.anims.create({ key: `anim-${atkKey}`, frames, frameRate: 12, repeat: 0 });
        }
      });
      for (let i = 0; i < 8; i++) {
        for(const [k,sk] of Object.entries(SKINS))for(const a of SKIN_ANIMS){const n=sk.frames[a];if(n<2)continue;const st=skinFrame(a,i);const key=a==='walk'||a==='run'||a==='crouch'?`skin-${k}-${a}-${i}`:a==='finisher'?`anim-finisher-${k}-${i}`:`anim-skin-${k}-${a}-${i}`;this.anims.create({key,frames:this.anims.generateFrameNumbers(`skin-${k}`,{start:st,end:st+n-1}),frameRate:a==='walk'?10:a==='run'?10:a==='crouch'?7:a==='death'?9:a==='punch'?12:10,repeat:a==='walk'||a==='run'||a==='crouch'?-1:0});}
        for(const [kind,table] of [['torch',TORCH_SKINS],['club',CLUB_SKINS]] as const)for(const [k,a] of Object.entries(table))for(const an of ARMED_ANIMS){const n=a[an];if(n<2)continue;const st=armedFrame(an,i);const loop=an!=='attack';this.anims.create({key:loop?`${kind}-${k}-${an}-${i}`:`anim-${kind}-${k}-attack-${i}`,frames:this.anims.generateFrameNumbers(`${kind}-${k}`,{start:st,end:st+n-1}),frameRate:loop?10:12,repeat:loop?-1:0});}
        for(const [k,ws] of Object.entries(ARMED_SKINS))for(const [w,a] of Object.entries(ws))for(const an of ARMED_ANIMS){const n=a.frames[an];if(n<2)continue;const st=armedFrame(an,i);const loop=an!=='attack';this.anims.create({key:loop?`armed-${k}-${w}-${an}-${i}`:`anim-armed-${k}-${w}-attack-${i}`,frames:this.anims.generateFrameNumbers(`armed-${k}-${w}`,{start:st,end:st+n-1}),frameRate:loop?10:12,repeat:loop?-1:0});}
        this.anims.create({ key: `anim-finisher-${i}`, frames: this.anims.generateFrameNumbers(`finisher-${i}`), frameRate: 10, repeat: 0 });
        this.anims.create({ key: `anim-behead-${i}`, frames: this.anims.generateFrameNumbers(`behead-${i}`), frameRate: 11, repeat: 0 });
        this.anims.create({ key: `anim-fistfin-${i}`, frames: this.anims.generateFrameNumbers(`fistfin-${i}`), frameRate: 12, repeat: 0 });
        this.anims.create({ key: `anim-death-${i}`, frames: this.anims.generateFrameNumbers(`death-${i}`), frameRate: 9, repeat: 0 });
        this.anims.create({ key: `anim-crouch-${i}`, frames: this.anims.generateFrameNumbers(`crouch-${i}`), frameRate: 7, repeat: -1 });
        this.anims.create({ key: `tiger-walk-${i}`, frames: this.anims.generateFrameNumbers(`tiger-walk-${i}`, { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
        const tAtk = this.textures.get(`tiger-attack-${i}`);
        this.anims.create({ key: `anim-tiger-attack-${i}`, frames: this.anims.generateFrameNumbers(`tiger-attack-${i}`, { start: 0, end: tAtk.frameTotal - 2 }), frameRate: 14, repeat: 0 });
        this.anims.create({ key: `gazelle-walk-${i}`, frames: this.anims.generateFrameNumbers(`gazelle-walk-${i}`, { start: 0, end: 7 }), frameRate: 9, repeat: -1 });
        this.anims.create({ key: `gazelle-run-${i}`, frames: this.anims.generateFrameNumbers(`gazelle-run-${i}`, { start: 0, end: 5 }), frameRate: 14, repeat: -1 });
        for (const [k, sp] of Object.entries(SNOW)) {
          this.anims.create({ key: `${k}-walk-${i}`, frames: this.anims.generateFrameNumbers(`${k}-walk-${i}`), frameRate: k === 'mammoth' ? 7 : 10, repeat: -1 });
          if (sp.attack) this.anims.create({ key: `anim-${k}-attack-${i}`, frames: this.anims.generateFrameNumbers(`${k}-attack-${i}`), frameRate: 13, repeat: 0 });
        }
        this.anims.create({ key: `anim-wolf-eat-${i}`, frames: this.anims.generateFrameNumbers(`wolf-eat-${i}`), frameRate: 8, repeat: -1 });
      }
      // Hand-drawn integer-pixel textures, built once and rendered without filtering.
      const make = (key: string, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => {
        const texture = this.textures.createCanvas(key, w, h);
        if (!texture) return;
        draw(texture.context); texture.refresh();
      };
      const rect = (c: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => { c.fillStyle = color; c.fillRect(x,y,w,h); };
      make('rock', 34, 26, c => { rect(c,'#2c3529',2,20,30,5);rect(c,'#5a6058',4,8,26,13);rect(c,'#767b72',7,3,19,15);rect(c,'#8d9187',10,3,12,5);rect(c,'#61665d',21,10,8,10);rect(c,'#a3a69b',10,5,8,2);rect(c,'#4f6a45',5,8,6,3); });
      make('bush', 26, 24, c => { rect(c,'#26372a',2,9,23,13);rect(c,'#3d5636',4,4,17,14);rect(c,'#4f6a3e',8,3,12,8); for(const [x,y] of [[6,10],[15,7],[18,14],[10,16]] as const) {rect(c,'#a8524f',x,y,3,3);rect(c,'#d98b70',x,y,1,1);} });
      make('glow', 160, 110, c => { const g=c.createRadialGradient(80,55,4,80,55,80);g.addColorStop(0,'rgba(255,170,80,0.55)');g.addColorStop(0.5,'rgba(230,110,40,0.18)');g.addColorStop(1,'rgba(200,80,30,0)');c.fillStyle=g;c.beginPath();c.ellipse(80,55,80,55,0,0,Math.PI*2);c.fill(); });
      make('ground', WORLD, WORLD, c => {
        let seed=7351; const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
        rect(c,'#56654c',0,0,WORLD,WORLD);
        for(let i=0;i<60000;i++) { const x=Math.floor(rand()*WORLD/3)*3,y=Math.floor(rand()*WORLD/3)*3;rect(c,['#5d6d51','#4f5e46','#68775e','#4b5446','#606a58'][i%5] ?? '#5d6d51',x,y,3+(i%3)*2,2); }
        // Rolling hills: lit crests with shadowed southern flanks.
        let hs=911;const hr=()=>{hs=(hs*16807)%2147483647;return hs/2147483647;};
        for(let i=0;i<22;i++){const x=hr()*WORLD,y=700+hr()*(WORLD-700),rx=90+hr()*150,ry=50+hr()*80;if(Math.abs(x-riverX(y))<rx+60)continue;
          c.fillStyle='rgba(28,36,26,0.35)';c.beginPath();c.ellipse(x+14,y+18,rx,ry,0,0,Math.PI*2);c.fill();
          c.fillStyle='#5f6e53';c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
          c.fillStyle='#6a785c';c.beginPath();c.ellipse(x-rx*.15,y-ry*.2,rx*.7,ry*.6,0,0,Math.PI*2);c.fill();
          c.fillStyle='#74816a';c.beginPath();c.ellipse(x-rx*.25,y-ry*.35,rx*.35,ry*.28,0,0,Math.PI*2);c.fill();
          for(let k=0;k<70;k++)rect(c,k%2?'#7c8572':'#4f5b47',Math.floor(x+(hr()-.5)*rx*1.6),Math.floor(y+(hr()-.5)*ry*1.6),2,2);}
        // Untouched wilderness: irregular moss beds, dark soil, scree and lichen — no trails.
        for(let i=0;i<180;i++){const x=rand()*WORLD,y=rand()*WORLD,r=20+rand()*70;const col=['rgba(64,82,52,0.55)','rgba(70,72,62,0.45)','rgba(48,58,42,0.5)','rgba(98,106,86,0.35)'][i%4] ?? '';c.fillStyle=col;c.beginPath();for(let a=0;a<12;a++){const ang=a/12*Math.PI*2,rr=r*(0.6+rand()*0.5);const px=x+Math.cos(ang)*rr,py=y+Math.sin(ang)*rr*0.7;if(a===0)c.moveTo(px,py);else c.lineTo(px,py);}c.closePath();c.fill();}
        for(let i=0;i<1400;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);for(let k=0;k<5;k++)rect(c,k%2?'#7a7e72':'#555a50',x+Math.floor(rand()*14),y+Math.floor(rand()*8),2,2);}
        for(let i=0;i<900;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);rect(c,'#3a2f26',x,y,4+Math.floor(rand()*6),1);rect(c,'#4a3c30',x+1,y+1,3,1);}
        for(let i=0;i<1600;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);rect(c,['#8f9a6e','#a6a37e','#6f7d58'][i%3] ?? '#8f9a6e',x,y,1,1);}
        const river=(color:string,width:number)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(1570,-100);c.bezierCurveTo(1290,650,1750,1000,1580,2150);c.stroke();};
        river('#3b4438',163);river('#7a7c70',148);river('#3f5f63',132);river('#4b7378',110);river('#5c878a',78);
        for(let y=0;y<WORLD;y+=17) {const x=riverX(y);rect(c,'#a3c0bc',x-33+Math.floor(rand()*50),y,10+Math.floor(rand()*20),2);}
        for(let y=0;y<WORLD;y+=9){const x=riverX(y);for(const s of [-1,1])rect(c,rand()<.5?'#8e9087':'#6b6d64',Math.floor(x+s*(68+rand()*8)),y,3,2);}
        for(let i=0;i<2600;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*WORLD);if(Math.abs(x-riverX(y))<95)continue; rect(c,'#435238',x,y,2,5);rect(c,'#4e5f40',x+3,y-2,2,5);if(i%9===0){rect(c,'#b9b28e',x+1,y-2,2,2);}}
        // Camp forecourt of trampled earth and gravel.
        // Organic trampled patch that fades into the moss instead of a hard oval.
        for(let i=0;i<70;i++){const a=rand()*Math.PI*2,d=Math.sqrt(rand())*110;const x=CAMP.x+Math.cos(a)*d*1.3,y=CAMP.y+10+Math.sin(a)*d*0.75;c.fillStyle=`rgba(98,94,76,${0.5-d/300})`;c.beginPath();c.ellipse(x,y,14+rand()*22,9+rand()*14,rand()*3,0,Math.PI*2);c.fill();}
        for(let i=0;i<220;i++){const a=rand()*Math.PI*2,d=Math.sqrt(rand())*120;rect(c,i%2?'#7b7867':'#4b4a3f',Math.floor(CAMP.x+Math.cos(a)*d*1.3),Math.floor(CAMP.y+10+Math.sin(a)*d*0.75),2,2);}
        // Mountain massif: rock mass, strata, and a dark cliff face at its foot.
        for(let x=0;x<WORLD;x+=4){const e=Math.floor(mEdge(x));
          rect(c,'#2d3529',x,e-2,4,14);
          rect(c,'#5a5f57',x,0,4,e);
          rect(c,'#4a4f48',x,e-46,4,44);
          rect(c,'#3a3e38',x,e-18,4,16);}
        for(let i=0;i<9000;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*560);const e=mEdge(x);if(y>e-50)continue;rect(c,['#6a6f66','#50554d','#757a6e','#4f6345','#626a58'][i%5] ?? '#6a6f66',x,y,2+(i%4),2);}
        for(let i=0;i<260;i++){const x=Math.floor(rand()*WORLD),y=Math.floor(rand()*520);if(y>mEdge(x)-60)continue;rect(c,'#7f847a',x,y,14+Math.floor(rand()*26),2);rect(c,'#40443d',x+2,y+2,12+Math.floor(rand()*20),2);}
        for(let x=0;x<WORLD;x+=6+Math.floor(rand()*10)){const e=Math.floor(mEdge(x));rect(c,'#2f332d',x,e-44,2,30+Math.floor(rand()*10));rect(c,'#636860',x+2,e-44,2,18);}
        // Cave mouth carved into the cliff.
        const cy=Math.floor(mEdge(CAMP.x));
        c.fillStyle='#2e322c';c.beginPath();c.ellipse(CAMP.x,cy-6,46,44,0,Math.PI,0);c.fill();rect(c,'#2e322c',CAMP.x-46,cy-8,92,10);
        c.fillStyle='#141713';c.beginPath();c.ellipse(CAMP.x,cy-4,36,36,0,Math.PI,0);c.fill();rect(c,'#141713',CAMP.x-36,cy-6,72,10);
        c.fillStyle='#090a09';c.beginPath();c.ellipse(CAMP.x,cy,24,24,0,Math.PI,0);c.fill();
        for(const [dx,dy,w] of [[-48,-30,8],[40,-34,10],[-30,-50,14],[18,-52,12],[-52,-4,10],[44,-6,9]] as const)rect(c,'#7c8076',CAMP.x+dx,cy+dy,w,4);
        // Warm hearth light pooled on the forecourt.
        c.fillStyle='rgba(180,110,50,0.12)';c.beginPath();c.ellipse(CAMP.x,CAMP.y+30,70,40,0,0,Math.PI*2);c.fill();
        // Shallow fords: lighter water with stepping stones.
        for(const fy of FORDS){if(fy<0||fy>WORLD)continue;const fx=riverX(fy);c.fillStyle='#7d9a92';c.fillRect(fx-62,fy-30,124,60);
          for(let sx=-56;sx<=56;sx+=14){const oy=Math.floor((rand()-.5)*16);rect(c,'#3e4a42',fx+sx-1,fy+oy-4,12,9);rect(c,'#9a9c90',fx+sx,fy+oy-5,10,7);rect(c,'#b8b9ad',fx+sx+2,fy+oy-5,5,2);}}
        // Fade the start region's edges into the surrounding biome layer.
        c.globalCompositeOperation='destination-out';const F=260;
        for(const [x0,y0,x1,y1,rx,ry,rw,rh] of [[0,0,0,F,0,0,WORLD,F],[0,WORLD,0,WORLD-F,0,WORLD-F,WORLD,F],[0,0,F,0,0,0,F,WORLD],[WORLD,0,WORLD-F,0,WORLD-F,0,F,WORLD]] as const){const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(rx,ry,rw,rh);}
        c.globalCompositeOperation='source-over';
      });
      // Low-res biome layer for the whole map (4 px texels keep memory small on phones).
      const BS=4,bw=MAP.w/BS,bh=MAP.h/BS;const bt=this.textures.createCanvas('biome',bw,bh);
      if(bt){const ctx=bt.context;const img=ctx.createImageData(bw,bh);let ns=99;const nr=()=>{ns=ns*16807%2147483647;return ns/2147483647;};
        for(let j=0;j<bh;j++){const wy=MAP.y+j*BS;const rx=riverX(wy);const ford=isFord(wy);
          for(let i=0;i<bw;i++){const wx=MAP.x+i*BS;const d=Math.abs(wx-rx);let col:readonly [number,number,number];
            if(d<56)col=ford?[125,154,146]:d<32?[92,135,138]:[75,115,120];else if(d<72)col=[122,124,112];
            else{const sd=wy<400?streamDist(wx,wy):Infinity;if(sd<STREAM_HALF)col=sd<STREAM_HALF-5?[88,132,140]:[110,140,138];else if(sd<STREAM_HALF+5)col=[128,124,110];else{const b=biomeAt(wx+(nr()-.5)*48,wy+(nr()-.5)*48);col=b==='dragon'&&(sd<90||nr()<.18)?[70,98,62]:b==='dragon'&&nr()<.12?[74,74,82]:BIOME_COLOR[b];}}
            const n=(nr()-.5)*16,o=(j*bw+i)*4;img.data[o]=col[0]+n;img.data[o+1]=col[1]+n;img.data[o+2]=col[2]+n;img.data[o+3]=255;}}
        ctx.putImageData(img,0,0);bt.refresh();}
      this.add.image(MAP.x,MAP.y,'biome').setOrigin(0).setScale(BS).setDepth(MAP.y-200);
      this.add.image(0,0,'ground').setOrigin(0).setDepth(MAP.y-199);
      this.physics.world.setBounds(MAP.x,MAP.y,MAP.w,MAP.h);
      this.obstacles=this.physics.add.staticGroup();
      if(!this.anims.exists('house-flame'))this.anims.create({key:'house-flame',frames:this.anims.generateFrameNumbers('house-flame',{start:0,end:FLAME_SHEET.frames-1}),frameRate:FLAME_SHEET.fps,repeat:-1});
      if(!this.anims.exists('smoke-column'))this.anims.create({key:'smoke-column',frames:this.anims.generateFrameNumbers('smoke-column',{start:0,end:SMOKE_SHEET.frames-1}),frameRate:SMOKE_SHEET.fps,repeat:-1});
      // Dragon mountain terraces: height shading, cliff faces and blocking edges with open passes.
      {const T0=TERRACES[0]!,ox=Math.floor(T0.cx-T0.rx-40),oy=Math.floor(T0.cy-T0.ry-40),tw=Math.ceil(T0.rx*2+80),th=Math.ceil(T0.ry*2+80+CLIFF_H);
        const tt=this.textures.createCanvas('terraces',tw,th);
        if(tt){const c=tt.context;c.imageSmoothingEnabled=false;
          for(let j=0;j<th;j+=4)for(let i=0;i<tw;i+=4){const h=heightAt(ox+i,oy+j);if(h)c.fillStyle=h===1?'rgba(170,190,150,0.10)':'rgba(200,215,170,0.17)',c.fillRect(i,j,4,4);}
          let rs=313;const rr=()=>{rs=rs*16807%2147483647;return rs/2147483647;};
          for(const t of TERRACES)for(const pt of cliffPoints(t,3)){if(pt.open)continue;const x=Math.floor(pt.x-ox),y=Math.floor(pt.y-oy);
            if(pt.ny>0.25){const fh=Math.round(CLIFF_H*Math.min(1,pt.ny*1.3));
              for(let k=0;k<fh;k+=3){c.fillStyle=k%6===0?'#3d3f44':(rr()<.5?'#4a4c52':'#55575a');c.fillRect(x-1,y+k,4,3);}
              c.fillStyle='#24262a';c.fillRect(x-1,y+fh,4,3);c.fillStyle='rgba(0,0,0,0.22)';c.fillRect(x-1,y+fh+3,4,5);
              if(rr()<.08){c.fillStyle='#4f6b3e';c.fillRect(x,y+Math.floor(rr()*fh),3,2);}
            } else {c.fillStyle=pt.ny<-0.25?'#2c2e33':'#3a3c40';c.fillRect(x-1,y-1,4,4);c.fillStyle='#6d6f6c';c.fillRect(x-1,y-2,4,1);}
            c.fillStyle='#8a8c84';c.fillRect(x-1,y-1,3,1);}
          tt.refresh();this.add.image(ox,oy,'terraces').setOrigin(0).setDepth(MAP.y-198);}
      }
      const obstacle=(x:number,y:number,key:string,bw:number,bh:number)=> {
        const obj=this.obstacles?.create(x,y,key) as Phaser.Physics.Arcade.Sprite | undefined;
        if(!obj)return undefined;obj.setDepth(y+obj.height/2-6); const body=obj.body as Phaser.Physics.Arcade.StaticBody;body.setSize(bw,bh);body.setOffset((obj.width-bw)/2,obj.height-bh-4);
        return obj;
      };
      const choppable=(x:number,y:number,dir:number)=>{
        const snow=biomeAt(x,y)==='nordics';
        const obj=obstacle(x,y,snow?`snow-tree-${dir%3}`:`tree${dir}`,22,10);if(!obj)return;
        const tint=snow?0xffffff:BIOME_FLORA[biomeAt(x,y)].tint;obj.setTint(tint);
        this.trees.push({x,y,dir,hp:TREE_HP,tint,sprite:obj});
      };
      this.plantTree=choppable;
      this.makeObstacle=obstacle;
      const mineable=(x:number,y:number)=>{
        const snow=biomeAt(x,y)==='nordics';
        const key=snow?`snow-rock-${Math.abs(Math.floor(x*7+y*13))%6}`:'rock';
        const obj=obstacle(x,y,key,24,13);if(obj)this.rocks.push({x,y,hp:ROCK_HP,sprite:obj});
      };
      let seed=419;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
      for(let i=0;i<460;i++) {
        const x=40+random()*(WORLD-80),y=40+random()*(WORLD-80);
        if(y<mEdge(x)+40 || Math.abs(x-riverX(y))<130 || Math.hypot(x-CAMP.x,y-CAMP.y)<200)continue;
        // Forest thins toward the camp so the start stays readable.
        if(Math.hypot(x-CAMP.x,y-CAMP.y)<380&&i%3!==0)continue;
        if(i%7===0)mineable(x,y); else choppable(x,y,i%8);
      }
      // Boulders along the cliff foot and flanking the camp.
      for(let x=30;x<WORLD;x+=70+Math.floor(random()*90)){if(Math.abs(x-CAMP.x)<70)continue;mineable(x,mEdge(x)+14+random()*20);}
      for(const [x,y] of [[800,610],[1200,615]] as const) mineable(x,y);
      for(const [x,y] of [[790,770],[1215,775],[900,870],[1110,875]] as const) choppable(x,y,(x+y)%8);
      // Main camp: huts and palisade.
      for(const [i,pc] of CAMP_LAYOUT.entries()){const o=obstacle(pc.x,pc.y,pc.key,pc.bw,pc.bh);if(o&&pc.flip)o.setFlipX(true);if(o&&pc.key.startsWith('hut-'))this.houseSprites.set(`camp:${i}`,o);}
      // Outer biomes beyond the start region, density driven by each biome's flora.
      let os=7717;const orr=()=>{os=os*16807%2147483647;return os/2147483647;};
      for(let i=0;i<1800;i++){const x=MAP.x+40+orr()*(MAP.w-80),y=MAP.y+40+orr()*(MAP.h-80);
        if(x>-20&&x<WORLD+20&&y>-20&&y<WORLD+20)continue;if(Math.abs(x-riverX(y))<120)continue;
        if(villageAt(x,y,40)||dragonVillageAt(x,y,40)||nearCliff(x,y)||streamDist(x,y)<STREAM_HALF+16)continue;const f=BIOME_FLORA[biomeAt(x,y)],r=orr();if(r<f.rocks*0.4)mineable(x,y);else if(r<f.rocks*0.4+f.trees*0.6)choppable(x,y,i%8);}
      // Nordic villages.
      for(const pc of NORDIC_LAYOUT){
        if(pc.bw === 0){this.add.image(pc.x,pc.y,pc.key).setDepth(pc.y-32);continue;}
        const o=obstacle(pc.x,pc.y,pc.key,pc.bw,pc.bh);if(o&&pc.flip)o.setFlipX(true);if(o&&'id' in pc)this.houseSprites.set((pc as {id:string}).id,o);
      }
      for(const t of TERRACES)for(const pt of cliffPoints(t,14)){if(pt.open)continue;const yy=pt.y+(pt.ny>0.25?CLIFF_H*Math.min(1,pt.ny*1.3)/2:0);
        const o=this.obstacles?.create(pt.x,yy,'__DEFAULT') as Phaser.Physics.Arcade.Sprite|undefined;if(o){o.setVisible(false);(o.body as Phaser.Physics.Arcade.StaticBody).setSize(18,pt.ny>0.25?CLIFF_H:18);}}
      // Dragon-people terrace village.
      for(const pc of DRAGON_HOUSES){const o=obstacle(pc.x,pc.y,pc.key,pc.bw,pc.bh);if(o&&pc.flip)o.setFlipX(true);if(o)this.houseSprites.set(pc.id,o);}
      for(const pc of DRAGON_FENCES){
        if(pc.bw === 0){this.add.image(pc.x,pc.y,pc.key).setDepth(pc.y-32);continue;}
        const o=obstacle(pc.x,pc.y,pc.key,pc.bw,pc.bh);if(o&&pc.flip)o.setFlipX(true);
      }
      for (const h of NORDIC_HOUSES) {
        this.villageSupplies.set(h.id, this.add.image(h.x, h.y + 38, h.variant === 0 ? 'spear-proj' : 'res-wood').setScale(h.variant === 0 ? 0.55 : 1).setDepth(h.y + 38));
      }
      // Invisible segmented colliders: river banks and the mountain wall.
      for(let y=MAP.y;y<MAP.y+MAP.h;y+=24){ if(y>=0&&y<=WORLD&&y<mEdge(riverX(y)))continue;if(isFord(y))continue;const zone=this.add.zone(riverX(y),y,115,30);this.physics.add.existing(zone,true);this.obstacles.add(zone); }
      for(let x=0;x<WORLD;x+=16){const e=mEdge(x+8);const zone=this.add.zone(x+8,(e-4)/2,16,e-4);this.physics.add.existing(zone,true);this.obstacles.add(zone);}
      const glow=this.add.image(CAMP.x,CAMP.y+FIRE_DY+6,'glow').setDepth(CAMP.y).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({targets:glow,alpha:{from:.4,to:.6},scale:{from:.95,to:1.06},duration:420,yoyo:true,repeat:-1,ease:'Sine.easeInOut'});
      obstacle(CAMP.x,CAMP.y+FIRE_DY,'fire',20,8);
      // Sleeping place next to the campfire.
      this.bed=this.add.image(CAMP.x+46,CAMP.y+FIRE_DY+10,'bed').setDepth(CAMP.y+FIRE_DY+16);
      // Storage chest on the other side of the fire; small collider, reachable for E.
      this.add.image(CHEST_POS.x,CHEST_POS.y,'storage-chest').setDepth(CHEST_POS.y+12);
      // Collider-only sprite: the chest artwork is already drawn above.
      obstacle(CHEST_POS.x,CHEST_POS.y+6,'storage-chest',16,6)?.setVisible(false);
      for(const [x,y] of [[1128,700],[895,760],[1160,1170],[700,850],[1240,900],[760,1240],[480,1080],[1340,760],[980,1460]] as const) {
        const sprite=this.add.image(x,y,'bush').setDepth(y+8);this.berries.push({x,y,picked:false,sprite});this.covers.push({x,y});
      }
      // Cover zones: all rock obstacles plus bushes already pushed above.
      this.obstacles.getChildren().forEach(obj => {
        const s = obj as Phaser.Physics.Arcade.Sprite;
        if (s.texture?.key === 'rock' || s.texture?.key.startsWith('snow-rock')) this.covers.push({ x: s.x, y: s.y });
      });
      this.player=this.physics.add.sprite(CAMP.x,CAMP.y-30,'human2').setDepth(CAMP.y).setCollideWorldBounds(true);
      this.player.setTexture('none-idle-2');
      this.player.setSize(10,7).setOffset(11,23);
      this.player.on('animationupdate',(a:Phaser.Animations.Animation, frame:Phaser.Animations.AnimationFrame)=>{if((a.key.startsWith('anim-finisher-')&&frame.index===finisherImpactFrame('wedge'))||(a.key.startsWith('anim-behead-')&&frame.index===finisherImpactFrame('axe'))||(a.key.startsWith('anim-fistfin-')&&frame.index===FIST_FINISHER_IMPACT))this.landFinisher();});
      this.player.on('animationcomplete',(a:Phaser.Animations.Animation)=>{if(a.key.startsWith('anim-'))this.attacking=false;if(a.key.startsWith('anim-finisher-')||a.key.startsWith('anim-behead-')||a.key.startsWith('anim-fistfin-')){this.finisher=undefined;this.fistFinish=false;this.persist();}});
      this.physics.add.collider(this.player,this.obstacles);
      this.cameras.main.setBounds(MAP.x,MAP.y,MAP.w,MAP.h).setZoom(cameraZoom(this.scale.width,this.scale.height,input.zoomScale??1)).startFollow(this.player,true,0.07,0.07);
      const resizeCamera = (size: Phaser.Structs.Size) => { this.cameras.main.setZoom(cameraZoom(size.width,size.height,input.zoomScale??1)); };
      this.scale.on('resize',resizeCamera);
      let lastZoomScale=input.zoomScale??1;
      this.events.on('update',()=>{const z=input.zoomScale??1;if(z!==lastZoomScale){lastZoomScale=z;this.cameras.main.setZoom(cameraZoom(this.scale.width,this.scale.height,z));}});
      this.events.once('shutdown',()=>this.scale.off('resize',resizeCamera));
      this.keys=this.input.keyboard?.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT,E,SPACE,Q,F,R,H,CTRL,C,ONE,TWO,THREE,FOUR') as Record<string,Phaser.Input.Keyboard.Key>;
      this.input.mouse?.disableContextMenu();
      this.input.on('pointerdown',(ptr:Phaser.Input.Pointer)=>{if(ptr.wasTouch)return;if(ptr.rightButtonDown())this.lockReq=true;else if(ptr.leftButtonDown())this.clickAttack=true;});
      this.game.events.on('blur',()=>{input.x=0;input.y=0;input.sprint=false;});
      // Meat loot texture.
      make('meat', 14, 10, c => { rect(c,'#5a2a26',1,2,12,7);rect(c,'#8a3a30',2,3,10,5);rect(c,'#c25545',4,4,6,3);rect(c,'#efe6c8',6,5,2,1);rect(c,'#2b1510',3,8,8,1); });
      // Target lock marker: bone-white chevron.
      make('lock', 11, 7, c => { rect(c,'#2b1510',0,0,11,2);rect(c,'#2b1510',2,2,7,2);rect(c,'#2b1510',4,4,3,3);rect(c,'#efe2b8',1,0,9,1);rect(c,'#efe2b8',3,2,5,1);rect(c,'#e0a040',5,4,1,2); });
      this.marker=this.add.image(0,0,'lock').setVisible(false);
      make('signal-wave',32,32,c=>{c.strokeStyle='#eee1af';c.lineWidth=1;c.beginPath();c.arc(16,16,14,0,Math.PI*2);c.stroke();});
      // Spawn wildlife at safe, open locations away from camp, mountain and river.
      let wseed = 2131; const wr = () => { wseed = (wseed * 16807) % 2147483647; return wseed / 2147483647; };
      const spawn = (kind: Creature['kind'], x: number, y: number) => {
        const key = `${kind}-idle-2`;
        const s = this.physics.add.sprite(x, y, key).setDepth(y).setCollideWorldBounds(true);
        if (kind === 'tiger') s.setSize(14, 8).setOffset(25, 40);
        else if (kind === 'gazelle') s.setSize(14, 8).setOffset(13, 28);
        else { const b = SNOW[kind].body; s.setSize(b[0], b[1]).setOffset(b[2], b[3]); }
        if (this.obstacles) this.physics.add.collider(s, this.obstacles);
        // Solid bodies: player and animals can't overlap.
        if (this.player) this.physics.add.collider(this.player, s);
        (s.body as Phaser.Physics.Arcade.Body).pushable = false;
        this.creatures.push({ kind, sprite: s, state: 'wander', facing: 2, hp: kind === 'tiger' ? 60 : kind === 'gazelle' ? 30 : SNOW[kind].hp, stateUntil: 0, nextDecision: 0, nextAttack: 0, wanderX: x, wanderY: y });
      };
      const safeSpot = () => {
        for (let t = 0; t < 40; t++) {
          const x = 180 + wr() * (WORLD - 360), y = 180 + wr() * (WORLD - 360);
          if (y < mEdge(x) + 80) continue;
          if (Math.abs(x - riverX(y)) < 180) continue;
          if (Math.hypot(x - CAMP.x, y - CAMP.y) < 420) continue;
          return { x, y };
        }
        return null;
      };
      for (let i = 0; i < 5; i++) { const s = safeSpot(); if (s) spawn('gazelle', s.x, s.y); }
      for (let i = 0; i < 1; i++) { const s = safeSpot(); if (s) spawn('tiger', s.x, s.y); }
      // Snow animals roam only the Nordic mountains, never inside villages or near the river.
      const snowSpot = () => {
        for (let t = 0; t < 80; t++) {
          const x = MAP.x + 120 + wr() * (MAP.w - 240), y = MAP.y + 120 + wr() * (1700);
          if (biomeAt(x, y) !== 'nordics' || villageAt(x, y, 140) || Math.abs(x - riverX(y)) < 160) continue;
          return { x, y };
        }
        return null;
      };
      for (const k of Object.keys(SNOW) as SnowKind[]) {
        if (k === 'wolf') {
          // Two packs of three.
          for (let p = 0; p < SNOW.wolf.count / 3; p++) { const s = snowSpot(); if (s) for (let j = 0; j < 3; j++) spawn('wolf', s.x + (j - 1) * 26, s.y + (j % 2) * 20); }
        } else for (let i = 0; i < SNOW[k].count; i++) { const s = snowSpot(); if (s) spawn(k, s.x, s.y); }
      }
      this.campers = createCampers(this, this.player, this.obstacles);
      for (const camper of this.campers) {
        for (const creature of this.creatures) this.physics.add.collider(camper.sprite, creature.sprite);
      }
      this.folk = createFolk(this, this.obstacles);
      for (const f of this.folk) this.physics.add.collider(f.sprite, this.player, undefined, () => f.c.state === 'free' || f.c.state === 'camp');
      const allies = this.companionActors();
      allies.forEach((ally, i) => { for (const other of allies.slice(i + 1)) this.physics.add.collider(ally.sprite, other.sprite); });
      for (const f of this.folk) for (const camper of this.campers) this.physics.add.collider(f.sprite, camper.sprite, undefined, () => f.c.state === 'free' || f.c.state === 'camp');
      this.carryImg = this.add.image(0, 0, 'nordic-w0', 0).setOrigin(0.5).setVisible(false);
      if (this.textures.exists('night')) this.textures.remove('night');
      this.nightTex = this.textures.createCanvas('night', 64, 64) ?? undefined;
      if (this.nightTex) {
        this.nightTex.setFilter(Phaser.Textures.FilterMode.LINEAR);
        this.night = this.add.image(0, 0, 'night').setOrigin(0).setDepth(900000).setVisible(false);
        this.events.on('postupdate', () => this.updateNight());
      }
      for (const id of CAVE_IDS) if(id!=='home'){ const c=CAVES[id]; const mouth=this.add.graphics().setDepth(c.y); mouth.fillStyle(id==='ice'?0x889da2:0x5c5550).fillRect(c.x-42,c.y-30,84,40);mouth.fillStyle(0x101412).fillRect(c.x-26,c.y-24,52,36);mouth.fillStyle(0x070908).fillRect(c.x-18,c.y-12,36,24); }
      if (initial) this.restore(initial);
      // Beim Schließen oder Wegwischen der Seite sofort sichern (visibilitychange ist auf Mobilgeräten am zuverlässigsten).
      const flush = () => this.persist();
      const onHide = () => { if (document.visibilityState === 'hidden') flush(); };
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', onHide);
      const off = () => { window.removeEventListener('pagehide', flush); document.removeEventListener('visibilitychange', onHide); };
      this.events.once('shutdown', off); this.events.once('destroy', off);
    }
    override update(time:number, delta:number) {
      const p=this.player;if(!p)return;
      if (this.caves.current) { this.updateCave(time, delta); return; }
      this.cavePrompt = caveAt(p.x,p.y) ? `Betreten: ${CAVES[caveAt(p.x,p.y) ?? 'home'].name}` : null;
      this.tickSignals(time, input.paused || this.dead || this.health <= 0 || this.sleeping);
      const controlled = new Set([...this.companionOrders.keys(), ...this.responseOrders.keys()]); if (this.ilvarEscaping) controlled.add(this.ilvarEscaping);
      for (const c of this.carriers.carriers) if (c.status === 'fleeing') controlled.add(c.id);
      this.tickRepro(time);
      this.tickCarriers(time, input.paused || this.dead || this.health <= 0 || this.sleeping);
      if (this.closeness) controlled.add(this.closeness.id);
      for (const id of this.duelIds()) controlled.add(id);
      tickCampers(this.campers, this.obstacles, time, input.paused || this.dead || this.health <= 0 || this.sleeping, controlled);
      for (const id of this.tickPatrols(time, input.paused || this.dead || this.health <= 0 || this.sleeping)) controlled.add(id);
      tickFolk(this.folk, this.obstacles, time, input.paused || this.dead || this.health <= 0 || this.sleeping, controlled);
      if (this.kids.length !== this.repro.children.length) this.kids = syncChildren(this, this.kids, this.repro.children, this.folk);
      tickChildren(this.kids, this.folk, this.obstacles, time, delta, input.paused || this.dead || this.health <= 0 || this.sleeping, p);
      this.tickIlvar(time, input.paused || this.dead || this.health <= 0);
      const blocks: Block[] = (this.obstacles?.getChildren() ?? []).flatMap(o => {
        const body = (o as Phaser.Physics.Arcade.Sprite).body;
        return body ? [{ x: body.x, y: body.y, width: body.width, height: body.height }] : [];
      });
      this.tickAllies(time, delta, input.paused || this.dead || this.sleeping);
      this.companionMovement.tick(this.companionActors().filter(a => !allyDowned(this.allyHealth(a.id)) && a.id !== this.closeness?.id), this.movementOrders(), p, this.lastFacing, time,
        input.paused || this.dead || this.health <= 0 || this.sleeping, !!(input.sprint || this.keys?.['SHIFT']?.isDown) && canSprint(this.exhausted, this.stamina) && !this.carried,
        this.crouching, blocks, this.allyEngage(time, p));
      this.allyStrikes(time);
      this.tribal(time);
      this.tickCampChat(time);
      const k=this.keys; let dx=input.x,dy=input.y;
      if(k?.['A']?.isDown||k?.['LEFT']?.isDown)dx=-1;if(k?.['D']?.isDown||k?.['RIGHT']?.isDown)dx=1;
      if(k?.['W']?.isDown||k?.['UP']?.isDown)dy=-1;if(k?.['S']?.isDown||k?.['DOWN']?.isDown)dy=1;
      if(this.dead){
        p.setVelocity(0,0);
        if(input.respawn!==this.lastRespawn){
          this.lastRespawn=input.respawn;this.dead=false;this.health=100;this.stamina=100;this.hunger=Math.max(this.hunger,50);this.warmth=Math.max(this.warmth,80);p.setPosition(CAMP.x,CAMP.y-30);p.anims.stop();p.setTexture(`${this.held}-idle-2`);this.lastFacing=2;
          for(const c of this.creatures)if(c.state==='chase'||c.state==='attack'){c.state='wander';c.alert=0;}
          this.message='Du erwachst am Lagerfeuer';this.messageUntil=time+2400;
        }
        this.report(time,p);return;
      }
      this.lastRespawn=input.respawn;
      if(this.health<=0){
        this.finisher=undefined;this.attackPending=false;this.dead=true;this.attacking=false;this.target=undefined;p.setVelocity(0,0);p.clearTint();p.setAlpha(1);p.anims.timeScale=1;this.playDeath(p);
        this.report(time,p);return;
      }
      if(this.sleeping){this.clock+=SLEEP_CLOCK_PER_SEC*Math.min(delta,100)/1000; this.tickTrust(0); this.tickTasks();}
      else if(!input.paused){
        const dt=Math.min(delta,100)/1000;
        if(this.tutorial.step<TUTORIAL_DONE){const l=this.tutLast;if(l){const d=Math.hypot(p.x-l.x,p.y-l.y);if(d>0&&d<40)this.tut({kind:'move',dist:d},time);}this.tutLast={x:p.x,y:p.y};if(Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70)this.tut({kind:'fire'},time);}
        this.clock=advanceClock(this.clock,dt);
        this.tickRaid(time);
        this.tickFires(time, dt, p);
        this.tickRumors();
        this.tickTasks();
        this.tickTrust(dt * 2);
        const minutesOfDay=clockOf(this.clock).minutesOfDay;
        const bonus=this.party();const nearWarmth=Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<120*bonus.fireRange;
        this.hunger=tickHunger(this.hunger,dt*partyHungerFactor(this.followingPids())*((input.sprint||this.keys?.['SHIFT']?.isDown)?caveSprintFactor(this.caves):1));{const day=clockOf(this.clock).day;if(this.snackDay<0)this.snackDay=day;else if(day>this.snackDay){this.snackDay=day;const left=nukaSnack(this.count,this.tribePids().includes('nuka'));if(left<this.count){this.count=left;this.message='Nuka hat heimlich eine Beere genascht';this.messageUntil=time+2600;}}}
        {const wx=this.weatherNow(p);const sheltered=this.structures.some(s=>s.kind==='shelter'&&Math.hypot(s.x-p.x,s.y-p.y)<SHELTER_RANGE);const roofed=this.structures.some(s=>s.kind==='shelter'&&Math.hypot(s.x-CAMP.x,s.y-CAMP.y-FIRE_DY)<60);const before=this.warmth;let after=tickWarmth(before,{ambient:ambientTemp(biomeAt(p.x,p.y),minutesOfDay)+WEATHER[wx].temp,nearFire:nearWarmth,seconds:dt});if(nearWarmth&&after>before)after=before+(after-before)*fireStrength(wx,roofed);this.warmth=after<before?before-(before-after)*coldFactor(input.torch?this.owned:this.owned.filter(i=>i!=='torch'),isNight(minutesOfDay))*armorCold(this.armorNow())*caveColdFactor(this.caves)*(biomeAt(p.x,p.y)==='nordics'?bonus.snowCold:1)*(sheltered?0.5:1)*weatherColdFactor(wx,sheltered):after;if(WEATHER[wx].warn&&!sheltered&&time>=this.messageUntil&&time>this.nextWeatherWarn){this.nextWeatherWarn=time+30000;this.message=WEATHER[wx].warn;this.messageUntil=time+2600;}}
        if(this.owned.includes('bandage')&&this.hunger>30&&this.health<100)this.health=Math.min(100,this.health+BANDAGE_HP_PER_SEC*bonus.bandage*dt);
        this.health=Math.max(0,this.health-survivalDamage(this.hunger,this.warmth,dt)-bleedDamage(this.bleedUntil,time,dt));if(isBleeding(this.bleedUntil,time)&&time>this.nextTrail){this.nextTrail=time+450;this.bleed(p.x,p.y+6,0,1,2);}
        if(time>=this.messageUntil){
          if(this.warmth<COLD_WARN&&time>this.nextColdWarn){this.nextColdWarn=time+25000;this.message='Dir ist kalt – such ein Feuer';this.messageUntil=time+2400;}
          else if(this.hunger<HUNGER_WARN&&time>this.nextHungerWarn){this.nextHungerWarn=time+25000;this.message='Dein Magen knurrt – du brauchst Nahrung';this.messageUntil=time+2400;}
        }
      }
      if(input.save!==this.lastSaveReq){this.lastSaveReq=input.save;this.persist();this.message='Spielstand gespeichert';this.messageUntil=time+1800;}
      else if(time-this.lastAutosave>15000){this.lastAutosave=time;this.persist();}
      if (this.tickCloseness(time, delta, dx, dy)) { this.report(time, p); return; }
      if(this.finisher){p.setVelocity(0,0);this.lastAttack=input.attack;this.lastAction=input.action;if(input.paused)p.anims.pause();else p.anims.resume();this.report(time,p);return;}
      if(input.craft){const base=RECIPES.find(x=>x.id===input.craft);const rc=base&&discountedRecipe(base,this.party());const next=rc&&craft(rc,this.stock,levelFromXp(this.xp),this.owned);if(rc&&next){this.stock=next;this.owned=[...this.owned,rc.id];this.message=`${rc.name} hergestellt · +25 EP`;this.messageUntil=time+2400;this.addXp(XP.craft);this.tut({kind:'craft'},time);}input.craft=null;}
      if(input.weapon!==this.weapon){this.weapon=input.weapon==='none'||this.owned.includes(input.weapon)?input.weapon:'none';this.attacking=false;this.attackPending=false;}
      const bedX=this.bed?.x??0,bedY=this.bed?.y??0;
      this.nearBed=Math.hypot(p.x-bedX,p.y-bedY)<34;
      this.nearChest=Math.hypot(p.x-CHEST_POS.x,p.y-CHEST_POS.y)<CHEST_RANGE;
      // HUD toggles the chest panel; the world pauses while it is open.
      if((input.chestToggle??0)!==this.lastChestToggle){this.lastChestToggle=input.chestToggle??0;if(this.nearChest||this.chestOpen){this.chestOpen=!this.chestOpen;if(this.chestOpen){this.message='Vorratskiste geöffnet';this.messageUntil=time+1600;}}}
      if(this.chestOpen&&!this.nearChest)this.chestOpen=false;
      // Transfers between backpack and chest, applied through the engine-free storage rules.
      if(input.chestTransfer&&this.chestOpen){
        const {kind,n}=input.chestTransfer;input.chestTransfer=null;
        const playerGoods:ChestGoods={wood:this.stock.wood,stone:this.stock.stone,flint:this.stock.flint,fiber:this.stock.fiber,berries:this.count,meat:this.meat,cooked:this.cooked};
        const r=n>0?deposit(this.chest,playerGoods,kind,n):withdraw(this.chest,playerGoods,kind,-n);
        if(r){this.chest=r.chest;this.stock={wood:r.player.wood,stone:r.player.stone,flint:r.player.flint,fiber:r.player.fiber,skull:this.stock.skull??0,wolfPelt:this.stock.wolfPelt??0,sabrePelt:this.stock.sabrePelt??0};this.count=r.player.berries;this.meat=r.player.meat;this.cooked=r.player.cooked;this.persist();}
      }
      // Sleeping: lie on the bed, fade, restore vitals, wake up.
      if(input.sleep&&!this.sleeping&&this.nearBed){
        this.sleeping=true;p.anims.stop();p.setVelocity(0,0);p.setPosition(bedX,bedY-4);p.setTexture('sleep');
        const cam=this.cameras.main;cam.fadeOut(900,8,6,4);
        this.time.delayedCall(1700,()=>{this.health=100;this.stamina=100;cam.fadeIn(900,8,6,4);});
        this.time.delayedCall(3200,()=>{this.sleeping=false;input.sleep=false;this.hunger=Math.max(5,this.hunger-SLEEP_HUNGER_COST);this.warmth=Math.max(this.warmth,90);p.setPosition(bedX,bedY+18);const grown=this.regrowTrees();this.message=grown===1?'Ausgeschlafen · ein Baum ist nachgewachsen':grown>1?`Ausgeschlafen · ${grown} Bäume sind nachgewachsen`:'Ausgeschlafen · voll erholt';this.messageUntil=this.time.now+2400;this.persist();});
      }
      if(input.sleep&&!this.nearBed&&!this.sleeping)input.sleep=false;
      if(this.sleeping){p.setVelocity(0,0);p.setDepth(bedY+20);this.report(time,p);return;}
      if(input.paused||this.attacking){dx=0;dy=0;}
      const moving=Math.hypot(dx,dy)>0.12;const running=!this.carried&&moving&&(input.sprint||k?.['SHIFT']?.isDown)&&canSprint(this.exhausted,this.stamina);
      // Ducken als Umschalter: einmal drücken = ducken, erneut drücken = aufstehen.
      const cKey=k?.['C'],ctrlKey=k?.['CTRL'];
      if((cKey&&Phaser.Input.Keyboard.JustDown(cKey))||(ctrlKey&&Phaser.Input.Keyboard.JustDown(ctrlKey)))this.crouchOn=!this.crouchOn;
      if(running||this.attacking)this.crouchOn=false;
      this.crouching=!running&&!this.attacking&&(this.crouchOn||input.crouch);
      const body=p.body as Phaser.Physics.Arcade.Body;body.checkCollision.none=!!input.fly;body.setCollideWorldBounds(!input.fly);const speed=input.fly?420:(running?105:this.crouching?34:this.carried?CARRY_SPEED:65)*WEATHER[this.weatherNow(p)].speed*limpFactor(this.health)*(input.fly?1:armorSpeed(this.armorNow())); const len=Math.max(1,Math.hypot(dx,dy));p.setVelocity(dx/len*speed,dy/len*speed);
      this.tickAmbient(time,delta,p,{running:!!running,crouching:this.crouching,moving:moving&&!input.fly});
      if(this.igniting){const ig=this.igniting;if(moving||input.torch!=='main'||input.paused||this.attacking){this.igniting=undefined;if(!input.paused){this.message='Feuerlegen abgebrochen';this.messageUntil=time+1200;}}
        else{p.setVelocity(0,0);const left=ig.until-time;if(left<=0){this.igniting=undefined;this.igniteHouse(ig.house,time);}else{const n=Math.min(5,Math.ceil((1-left/IGNITE_MS)*5));this.message=`Fackel ans Dach halten … ${'▮'.repeat(n)}${'▯'.repeat(5-n)}`;this.messageUntil=time+300;}}}
      else if(time>=this.messageUntil&&!input.paused){const h=this.fireHouseNear(p);const f=h&&this.fires[h.id];
        if(h&&!f&&input.torch==='main'&&this.owned.includes('torch')){this.message=h.owner==='camp'?'[E] Deine eigene Hütte anzünden':'[E] Hütte anzünden';this.messageUntil=time+500;}
        else if(h&&f&&h.owner==='camp'&&firePhase(f,this.clock)==='ruin'){this.message=`[E] Hütte wieder aufbauen · ${repairCostText()}`;this.messageUntil=time+500;}}
      if(this.shove&&time<this.shove.until&&!input.fly)p.setVelocity(this.shove.vx,this.shove.vy);
      this.stamina=Phaser.Math.Clamp(this.stamina+(running?-22*caveSprintFactor(this.caves):13)*Math.min(delta,50)/1000,0,100);this.exhausted=nextExhausted(this.exhausted,this.stamina);
      const w=this.held;
      // Lock-on (F): cycle to the nearest living animal within range.
      const fKey=k?.['F'];
      const lockNow=input.focus||this.lockReq||(fKey&&Phaser.Input.Keyboard.JustDown(fKey));this.lockReq=false;input.focus=false;
      if(!input.paused&&lockNow){
        const cands=this.creatures.filter(c=>c.state!=='dead'&&c!==this.target&&Math.hypot(c.sprite.x-p.x,c.sprite.y-p.y)<260).sort((a,b)=>Math.hypot(a.sprite.x-p.x,a.sprite.y-p.y)-Math.hypot(b.sprite.x-p.x,b.sprite.y-p.y));
        this.target=cands[0];
        if(this.target&&this.owned.includes('bola')){this.target.slowUntil=time+BOLA_MS;}
        this.message=this.target?`${NAME[this.target.kind]} anvisiert${this.owned.includes('bola')?' · Bola trifft!':''}`:'Kein Tier in Sicht';this.messageUntil=time+1400;
      }
      // Throw (R): spear only, needs a locked target and the spear in hand.
      const rKey=k?.['R'];
      const throwNow=input.throwSpear||(rKey&&Phaser.Input.Keyboard.JustDown(rKey));input.throwSpear=false;
      if(!input.paused&&!this.attacking&&throwNow){
        if(w!=='spear'){this.message='Rüste den Steinspeer aus zum Werfen';}
        else if(!this.hasSpear){this.message='Dein Speer liegt noch im Gras';}
        else if(!this.target){this.message='Erst ein Tier anvisieren';}
        else{
          const t=this.target;this.lastFacing=(Math.round(Math.atan2(t.sprite.y-p.y,t.sprite.x-p.x)/(Math.PI/4))+8)%8;
          this.attacking=true;p.setVelocity(0,0);p.anims.timeScale=1;this.playAttack(p,'spear');
          this.hasSpear=this.owned.includes('bundle');
          const img=this.add.image(p.x,p.y-8,'spear-proj').setScale(0.5);
          this.spear={img,target:t,tx:t.sprite.x,ty:t.sprite.y};
          this.message='Speer geworfen!';
        }
        this.messageUntil=time+1400;
      }
      const qKey=k?.['Q'];
      const keyAttack=(qKey&&Phaser.Input.Keyboard.JustDown(qKey))||this.clickAttack;this.clickAttack=false;
      if(this.carried&&(input.attack!==this.lastAttack||keyAttack)){this.lastAttack=input.attack;this.message='Hände voll · erst absetzen [E]';this.messageUntil=time+1400;}
      else if(!input.paused&&!this.attacking&&(input.attack!==this.lastAttack||keyAttack)){
        this.lastAttack=input.attack;
        {const df=this.duelFoe();if(df&&this.duel?.phase==='fight'&&this.duel.rules.goal==='death'&&df.combat.phase==='downed'&&Math.hypot(df.sprite.x-p.x,df.sprite.y-p.y)<=FINISHER_REACH+6&&this.startFinisher(df,true)){this.report(time,p);return;}}
        const downed=this.folk.filter(f=>f.c.state==='free'&&f.c.id!==this.duel?.id&&canFinish(f.combat,Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y),canFinishWith(this.held),false)).sort((a,b)=>Phaser.Math.Distance.Between(p.x,p.y,a.sprite.x,a.sprite.y)-Phaser.Math.Distance.Between(p.x,p.y,b.sprite.x,b.sprite.y))[0];
        if(downed&&this.startFinisher(downed)){this.report(time,p);return;}
        const helpless=canFinishWith(this.held)?this.folk.filter(f=>canExecute(f.c,true)&&Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y)<=FINISHER_REACH).sort((a,b)=>Math.hypot(a.sprite.x-p.x,a.sprite.y-p.y)-Math.hypot(b.sprite.x-p.x,b.sprite.y-p.y))[0]:undefined;
        if(helpless&&this.executeCaptive(helpless)){this.report(time,p);return;}
        this.attacking=true;this.attackPending=true;this.duelSwingAt=time;p.setVelocity(0,0);
        if(this.target)this.lastFacing=(Math.round(Math.atan2(this.target.sprite.y-p.y,this.target.sprite.x-p.x)/(Math.PI/4))+8)%8;
        p.anims.timeScale=1;this.playAttack(p,w);
      } else if(input.attack!==this.lastAttack)this.lastAttack=input.attack;
      if(this.attacking){/* attack animation plays out; facing stays locked */}
      else if(this.crouching) {
        if(moving)this.lastFacing=(Math.round(Math.atan2(dy,dx)/(Math.PI/4))+8)%8;
        else if(this.target)this.lastFacing=(Math.round(Math.atan2(this.target.sprite.y-p.y,this.target.sprite.x-p.x)/(Math.PI/4))+8)%8;
        this.playCrouch(p,moving);
      }
      else if(moving) {
        const angle=Math.atan2(dy,dx);this.lastFacing=(Math.round(angle/(Math.PI/4))+8)%8;
        this.playWalk(p,w,!!running);
      } else {
        if(this.target)this.lastFacing=(Math.round(Math.atan2(this.target.sprite.y-p.y,this.target.sprite.x-p.x)/(Math.PI/4))+8)%8;
        this.setIdle(p,w);
      }
      p.setDepth(p.y);
      if(this.carried&&this.carryImg){
        // Bound captive lies across the shoulders and bobs with the walk cycle.
        const side=[0,1,7,6].includes(this.lastFacing)?0:4;
        const bob=p.anims.isPlaying?(p.anims.currentFrame?.index??0)%2:0;
        this.carryImg.setTexture(this.carried.t.tex,boundFrame(this.carried.t,side)).setPosition(p.x,p.y-13+bob).setDepth(this.lastFacing===6||this.lastFacing===5||this.lastFacing===7?p.y-1:p.y+1).setVisible(true);
      }
      const eatKey:Food|null=k?.['ONE']&&Phaser.Input.Keyboard.JustDown(k['ONE'])?'berries':k?.['TWO']&&Phaser.Input.Keyboard.JustDown(k['TWO'])?'meat':k?.['THREE']&&Phaser.Input.Keyboard.JustDown(k['THREE'])?'cooked':k?.['FOUR']&&Phaser.Input.Keyboard.JustDown(k['FOUR'])?'jerky':null;
      this.tickBuild(input,p,time);this.drawDryBars();this.tickTraps(time);
      const food=input.eat??eatKey;input.eat=null;
      if(food&&!this.dead&&!this.sleeping){const r=eat(this.pantry(),food);
        if(r){this.setPantry(r);this.healPulse++;this.message=`${FOOD[food].name} gegessen · +${FOOD[food].heal} Leben`;}
        else this.message=this.pantry()[food]<=0?`Keine ${FOOD[food].name} im Beutel`:'Du bist schon satt';
        this.messageUntil=time+2000;}
      const actionKey=k?.['E'],spaceKey=k?.['SPACE'];
      const keyboardAction=(actionKey&&Phaser.Input.Keyboard.JustDown(actionKey))||(spaceKey&&Phaser.Input.Keyboard.JustDown(spaceKey));
      if(!input.paused&&!this.attacking&&(input.action!==this.lastAction||keyboardAction)){
        this.lastAction=input.action;
        const entrance=caveAt(p.x,p.y);
        if(entrance){if(this.carried||this.spear){this.message='Erst die Hände freimachen';this.messageUntil=time+1800;}else{this.enterCave(entrance);this.report(time,p);return;}}
        const downed=this.folk.find(f=>f.c.state==='free'&&canFinish(f.combat,Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y),canFinishWith(w),false));
        if(downed&&this.startFinisher(downed)){this.report(time,p);return;}
        const knocked=this.folk.find(f=>f.c.state==='free'&&f.combat.phase==='downed'&&f.t.captive&&Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y)<30);
        if(knocked){knocked.combat=newFighter();knocked.c={...knocked.c,state:'surrender'};poseFolk(knocked);}
        const berry=this.berries.find(b=>!b.picked&&Math.hypot(p.x-b.x,p.y-b.y)<65);
        const meat=this.meatPickups.find(m=>Math.hypot(p.x-m.x,p.y-m.y)<32);
        const skullF=this.folk.find(f=>f.beheaded&&f.combat.phase==='dead'&&f.headPosition&&headStage(f.deathClock,this.clock,f.skullTaken)==='skull'&&Math.hypot(p.x-f.headPosition.x,p.y-f.headPosition.y)<30);
        if(skullF){skullF.skullTaken=true;skullF.headSprite?.destroy();skullF.headSprite=undefined;this.stock={...this.stock,skull:(this.stock.skull??0)+1};this.message=`Schädel aufgehoben · ${this.stock.skull} im Besitz`;this.messageUntil=time+2600;this.persist();this.report(time,p);return;}
        const res=this.resPickups.find(r=>Math.hypot(p.x-r.x,p.y-r.y)<30);
        const sg=this.spearOnGround&&Math.hypot(p.x-this.spearOnGround.x,p.y-this.spearOnGround.y)<34?this.spearOnGround:undefined;
        const house = NORDIC_HOUSES.find(h => Math.hypot(p.x-h.x,p.y-h.y-38)<28);
        const fireHouse = this.fireHouseNear(p);
        const captive = this.carried ? undefined : this.folk.find(f=>(f.c.state==='surrender'||f.c.state==='bound')&&Math.hypot(p.x-f.sprite.x,p.y-f.sprite.y)<30);
        if(this.carried){
          const f=this.carried;const inCamp=Math.hypot(p.x-CAMP.x,p.y-CAMP.y-50)<130;
          f.c=drop(f.c,p.x,p.y+6,inCamp);this.carried=undefined;this.carryImg?.setVisible(false);poseFolk(f);
          this.message=inCamp?'Im Lager abgesetzt · Optionsrad: Aufnehmen, Freilassen oder Hinrichten':'Gefangene abgesetzt · [E] wieder aufheben';
          this.persist();
        }
        else if(captive){
          const was=captive.c.state;captive.c=interact(captive.c,false);
          if(was==='surrender'){captive.c={...captive.c,x:Math.round(captive.sprite.x),y:Math.round(captive.sprite.y)};this.message='Gefesselt · [E] auf die Schultern nehmen';}
          else{this.carried=captive;this.message='Auf den Schultern · bring sie ins Höhlenlager';}
          poseFolk(captive);
          if(!this.inCampAt(captive.sprite.x,captive.sprite.y))this.kinAlarm(captive,time);
        }
        else if(this.nearTrap&&!this.building){const c=collectTrap(this.nearTrap);this.meat+=c.meat;this.traps=this.traps.map(t=>t.id===c.trap.id?c.trap:t);this.message=`Fleisch aus der Schlinge geholt · +${c.meat}`;this.persist();}
        else if(this.nearRack&&!this.building&&(this.meat>0||dryCount(this.nearRack,this.clock)>0)){const rk=this.nearRack;const c=collectJerky(rk,this.clock);let next=c.rack;let hung=0;while(this.meat>0){const h=hangMeat(next,this.clock);if(!h)break;next=h;this.meat--;hung++;}this.jerky+=c.jerky;this.structures=this.structures.map(s=>s.id===rk.id?next:s);this.message=c.jerky?`${c.jerky} Dörrfleisch abgenommen${hung?` · ${hung} Fleisch aufgehängt`:''} · [4] essen`:hung?`${hung} Fleisch zum Trocknen aufgehängt`:`Gestell voll (${RACK_SLOTS} Streifen)`;this.persist();}
        else if(this.nearDrum&&!this.building){this.toggleDrum(time,alarmThreats(this.allyFoes(),this.structures.filter(s=>s.kind==='drum')).length>0);}
        else if(this.nearChest){this.chestOpen=!this.chestOpen;this.message=this.chestOpen?'Vorratskiste geöffnet':'Kiste geschlossen';}
        else if(this.nearBed){input.sleep=true;this.message='Du legst dich schlafen …';}
        else if(sg){sg.img.destroy();this.spearOnGround=undefined;this.hasSpear=true;this.message='Speer aufgehoben';}
        else if(meat){meat.sprite.destroy();this.meatPickups=this.meatPickups.filter(m=>m!==meat);{const y=bonusYield(1,this.party().meat,this.meatCarry);this.meatCarry=y.carry;this.meat+=y.amount;this.message=`Fleisch aufgehoben · +${y.amount}`; if (meat.skorra && this.standingAllies().some(a => a.id === meat.skorra && Math.hypot(a.x - p.x, a.y - p.y) < 160)) { this.meat--; this.trustEvent(meat.skorra, 'hunt'); this.persist(); }}}
        else if(res){res.sprite.destroy();this.resPickups=this.resPickups.filter(r=>r!==res);{const n=pickupAmount(this.owned);for(let i=0;i<n;i++)this.stock=gain(this.stock,res.kind);this.message=`${RESOURCE_NAME[res.kind]} aufgehoben · +${n}`;}}
        else if(fireHouse&&((input.torch==='main'&&this.owned.includes('torch'))||this.fires[fireHouse.id])){this.fireAction(fireHouse,time);if(this.igniting){this.report(time,p);return;}}
        else if(house&&this.fires[house.id]){this.message='Nur noch Asche und verkohlte Balken';}
        else if(house){
          const next = lootHouse({ stock:this.stock, berries:this.count, meat:this.meat, cooked:this.cooked, owned:this.owned, lootedHouses:this.lootedHouses }, house.id);
          if(next){
            const weapon = next.owned.find(id => !this.owned.includes(id));
            this.stock=next.stock;this.count=next.berries;this.meat=next.meat;this.cooked=next.cooked;this.owned=next.owned;this.lootedHouses=next.lootedHouses;
            for (const f of this.folk.filter(f => f.c.state === 'camp')) this.trustEvent(f.c.id, 'violence');
            this.villageSupplies.get(house.id)?.destroy();this.villageSupplies.delete(house.id);
            const name = weapon === 'spear' ? 'Steinspeer' : weapon === 'club' ? 'Holzkeule' : 'Steinaxt';
            this.message=`${house.village} · +4 Holz, +3 Stein, +2 Fasern, +1 Feuerstein · +3 Beeren, +1 Fleisch, +2 Gebratenes${weapon ? ` · ${name}` : ''}`;
            this.persist();
          } else this.message='Dieses Haus ist bereits durchsucht';
        }
        else if(berry){berry.picked=true;berry.sprite.setTint(0x849461);{const y=bonusYield(1,this.party().berries,this.berryCarry);this.berryCarry=y.carry;this.count+=y.amount;this.message=`Beeren gesammelt · +${y.amount}`;}this.messageUntil=time+2400;this.tut({kind:'berry'},time);if(this.addXp(XP.berry))return this.report(time,p);}
        else if(Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70){const r=roast(this.pantry());if(r){this.setPantry(r);this.message='Fleisch gebraten · [3] essen';this.messageUntil=time+2400;if(this.addXp(XP.roast))return this.report(time,p);}else{this.stamina=100;this.message='Am Feuer ausgeruht';}}
        else if(p.y<CAMP.y-20&&Math.abs(p.x-CAMP.x)<60)this.message='Die Sippenhöhle – hier bist du sicher';
        else this.message='Hier gibt es nichts zu sammeln';
        this.messageUntil=time+2400;
      }
      this.tickWildlife(time, delta, p);
      this.report(time,p);
    }
    // Bäume fällen und Felsen abbauen mit der Steinaxt (normale Schlag-Animation).
    chop(time: number, fx: number, fy: number) {
      const p = this.player; if (!p) return;
      const inCone = (x: number, y: number, r: number) => { const dx = x - p.x, dy = y - p.y, d = Math.hypot(dx, dy); return d < r && (dx * fx + dy * fy) / Math.max(0.1, d) > 0.3; };
      const tree = this.trees.find(t => inCone(t.x, t.y, 48));
      if (tree) {
        if (this.held !== 'axe') { this.message = 'Dafür brauchst du die Steinaxt'; this.messageUntil = time + 1600; return; }
        tree.hp--;
        tree.sprite.setTint(0xffe0b0);
        this.time.delayedCall(120, () => { if (tree.sprite.active) tree.sprite.setTint(tree.tint); });
        if (tree.hp <= 0) {
          this.trees = this.trees.filter(t => t !== tree);
          const { x, y, dir } = tree;
          tree.sprite.destroy();
          // Baum verschwindet komplett; Position wird nur zum Nachwachsen gemerkt.
          this.stumps.push({ x, y, dir });
          this.dropResources(x, y, TREE_DROP);
          this.message = 'Baum gefällt! · +15 EP';
          this.messageUntil = time + 2200;
          this.addXp(XP.tree);
        } else { this.message = 'Der Baum wankt …'; this.messageUntil = time + 1200; }
        return;
      }
      const rock = this.rocks.find(r => inCone(r.x, r.y, 44));
      if (rock) {
        if (this.held !== 'axe') { this.message = 'Dafür brauchst du die Steinaxt'; this.messageUntil = time + 1600; return; }
        rock.hp--;
        rock.sprite.setTint(0xffe0b0);
        this.time.delayedCall(120, () => { if (rock.sprite.active) rock.sprite.clearTint(); });
        if (rock.hp <= 0) {
          this.rocks = this.rocks.filter(r => r !== rock);
          this.minedRocks.push([rock.x, rock.y]);
          this.covers = this.covers.filter(c => Math.hypot(c.x - rock.x, c.y - rock.y) > 1);
          rock.sprite.destroy();
          this.dropResources(rock.x, rock.y, ROCK_DROP);
          this.message = 'Fels zertrümmert · +15 EP';
          this.messageUntil = time + 2200;
          this.addXp(XP.rock);
        } else { this.message = 'Der Fels bröckelt …'; this.messageUntil = time + 1200; }
      }
    }
    dropResources(x: number, y: number, drop: Partial<Record<Resource, number>>) {
      let i = 0;
      for (const [res, n] of Object.entries(drop) as [Resource, number][]) {
        for (let k = 0; k < n; k++) {
          const a = i * 2.4 + 0.7, d = 14 + (i % 3) * 8;
          const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d;
          const sprite = this.add.image(px, py, `res-${res}`).setDepth(py);
          this.resPickups.push({ kind: res, x: px, y: py, sprite });
          i++;
        }
      }
    }
    /** Nach dem Schlafen wachsen alle Stümpfe zu neuen Bäumen nach; gibt die Anzahl zurück. */
    regrowTrees(): number {
      const grown = this.stumps.length;
      for (const s of this.stumps) {
        s.sprite?.destroy();
        this.plantTree?.(s.x, s.y, s.dir);
      }
      this.stumps = [];
      return grown;
    }
    /** Nearby villager for the interaction wheel, NPC reactions (icons, fleeing, guards) and wheel choices. */
    tribal(time: number) {
      const p = this.player; if (!p) return;
      const now = Date.now();
      const req = input.interaction; input.interaction = null;
      if (req) { if (!this.applyAllyInteraction(req.target, req.id, time)) { const f = this.folk.find(o => o.c.id === req.target); if (f) this.applyInteraction(f, req.id, time); } }
      const stop = input.paused || this.dead || this.sleeping || this.health <= 0;
      this.tickDuel(time, input.paused || this.sleeping); this.tickMockery(time, stop);
      const duelIds = this.duelIds();
      const inside = !!villageAt(p.x, p.y);
      let best: Folk | undefined, bd = INTERACTION_RANGE;
      for(const f of this.folk){if(f===this.finisher||f.combat.phase!=='downed'||f.c.state!=='free'||f.c.id===this.duel?.id)continue;if(stop){f.combat.downUntil+=Math.min(this.game.loop.delta,100);continue;}const recovered=recoverFighter(f.combat,time);if(recovered!==f.combat){f.combat=recovered;poseFolk(f);this.armFolk(f,time);}}
      const escorts = new Set<string>();
      if (inside && !stop) for (let vi = 0; vi < FOLK_HOMES.length; vi++) {
        const e = pickEscort(this.folk.filter(o => o.t.village === vi && o.c.state === 'free' && o.combat.phase === 'ready' && isWarrior(o.t) && !this.roaming.has(o.c.id) && Math.hypot(o.sprite.x - p.x, o.sprite.y - p.y) < 220).map(o => ({ id: o.c.id, x: o.sprite.x, y: o.sprite.y })), p);
        if (e) escorts.add(e.id);
      }
      const armedFolk = this.folk.filter(o => o.combat.phase === 'ready' && o.c.state === 'free' && (this.folkMood.get(o.c.id)?.armedUntil ?? 0) > time);
      for (const f of this.folk) {
        if (duelIds.has(f.c.id) && f.combat.phase !== 'dead') { if (f.combat.phase !== 'downed') this.folkMood.get(f.c.id)?.weapon?.setVisible(false); continue; }
        if (f.c.state === 'carried' || f.combat.phase === 'dead') {this.folkMood.get(f.c.id)?.icon.setVisible(false);this.folkMood.get(f.c.id)?.weapon?.setVisible(false);continue;}
        if(f.combat.phase==='downed'){this.folkMood.get(f.c.id)?.icon.setVisible(false);this.folkMood.get(f.c.id)?.weapon?.setVisible(false);continue;}
        if (isCarrier(this.carriers, f.c.id)) { f.sprite.setDepth(f.sprite.y); continue; }
        const s = f.sprite, d = Math.hypot(p.x - s.x, p.y - s.y);
        if (d < 150 && !this.lore[tribeOfVillage(f.t.village)]?.met) this.noteLore(f.t.village, 'met');
        if (d < bd) { bd = d; best = f; }
        if (f.c.id === this.closeness?.id) { this.folkMood.get(f.c.id)?.icon.setVisible(false); continue; }
        let m = this.folkMood.get(f.c.id);
        if (!m) { m = { icon: this.add.text(0, 0, '', { fontFamily: 'monospace', fontSize: '11px', color: '#ffe08a', stroke: '#1c1712', strokeThickness: 3 }).setOrigin(0.5, 1).setResolution(3), next: 0 }; this.folkMood.set(f.c.id, m); }
        const v = FOLK_HOMES[f.t.village], vk = villageKey(v.name);
        const protestUntil = this.closenessProtests.get(f.c.id) ?? 0;
        if (protestUntil > time && !stop && f.c.state === 'free' && (m.armedUntil ?? 0) <= time) {
          const dx = p.x - s.x, dy = p.y - s.y, len = Math.max(1, d);
          f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
          m.icon.setText('!').setPosition(s.x, s.y - 14).setDepth(s.y + 2000).setVisible(true);
          if (isWarrior(f.t) && d > SHOVE_RANGE) { s.setVelocity(dx / len * 65, dy / len * 65); s.play(`${f.t.tex}-walk-${f.facing}`, true); }
          else {
            s.setVelocity(0, 0); s.anims.stop(); s.setFrame(f.facing);
            if (isWarrior(f.t) && d <= SHOVE_RANGE) {
              this.shove = { vx: dx / len * SHOVE_SPEED, vy: dy / len * SHOVE_SPEED, until: time + SHOVE_MS };
              this.bark(f.c.id, s, 'warn', time, true, 'Zurück! Halt Abstand!');
              this.closenessProtests.delete(f.c.id);
            }
          }
          s.setDepth(s.y); continue;
        }
        // Carrying one of theirs makes the player an outlaw: warriors charge on sight.
        if (this.carried && f.c.state === 'free' && isWarrior(f.t) && d < CARRY_SIGHT && (m.armedUntil ?? 0) <= time) { m.armedUntil = time + 25000; this.bark(f.c.id, s, 'attack', time, true, 'Lass sie los!'); }
        // Villagers who saw an attack draw their weapons and hunt the player for a while.
        const armed = f.c.state === 'free' && (m.armedUntil ?? 0) > time;
        if (!armed) m.weapon?.setVisible(false);
        if (armed && !stop) {
          const s2 = f.sprite, dx = p.x - s2.x, dy = p.y - s2.y;
          if (!m.weapon && !isWarrior(f.t)) m.weapon = this.add.image(0, 0, isChampion(f.t) ? 'folk-axe' : f.seed % 2 ? 'folk-axe' : 'spear-proj').setScale(isChampion(f.t) ? 0.55 : 0.45);
          const inRange = this.roaming.has(f.c.id) || Math.hypot(s2.x - v.x, s2.y - v.y) < v.r * 1.4 + 160;
          const idx = armedFolk.indexOf(f), n = armedFolk.length;
          const lunging = isChampion(f.t) || this.raidRoster.has(f.c.id) || idx === lungeIndex(n, time);
          if (isChampion(f.t) && !(m as { roared?: boolean }).roared) { (m as { roared?: boolean }).roared = true; this.message = `${CHAMPION_NAMES[f.t.village]}, Champion von ${v.name}, stellt sich dir!`; this.messageUntil = time + 3000; this.cameras.main.shake(250, 0.006); }
          // Non-lunging fighters hold a ring slot and circle; the lunger closes in to strike.
          const near = this.standingAllies().filter(a => Math.hypot(a.x - s2.x, a.y - s2.y) < d - 10).sort((a, b) => Math.hypot(a.x - s2.x, a.y - s2.y) - Math.hypot(b.x - s2.x, b.y - s2.y))[0];
          const anchor = near ?? {x:p.x,y:p.y};
          const goal = lunging ? anchor : flankSlot(idx, n, anchor, 34, time, f.seed);
          const sep = separation(s2, armedFolk.filter(o => o !== f).map(o => o.sprite), 26);
          let gx = goal.x - s2.x + sep.x * 40, gy = goal.y - s2.y + sep.y * 40;
          const gl = Math.hypot(gx, gy);
          const attackingNow = time < ((m as { swingUntil?: number }).swingUntil ?? 0) && isWarrior(f.t);
          f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
          if (gl > 4 && inRange && !(lunging && (near ? Math.hypot(near.x - s2.x, near.y - s2.y) : d) <= 15)) {
            const spd = lunging ? 72 : 52; gx /= gl; gy /= gl;
            s2.setVelocity(gx * spd, gy * spd); if (!attackingNow) s2.play(`${f.t.tex}-walk-${f.facing}`, true);
          } else { s2.setVelocity(0, 0); if (!attackingNow) { s2.anims.stop(); s2.setFrame(f.facing); } }
          const left = dx < 0, swing = (m as { swingUntil?: number }).swingUntil ?? 0;
          const vic = lunging ? pickVictim(s2, p, this.standingAllies(), 19) : undefined;
          if (vic && vic !== 'player' && time > ((m as { allyHitAt?: number }).allyHitAt ?? 0)) {
            (m as { allyHitAt?: number }).allyHitAt = time + 1000; (m as { swingUntil?: number }).swingUntil = time + 500; if (isWarrior(f.t)) s2.play(`${f.t.tex}-attack-${f.facing}`);
            this.hitCompanion(vic, isChampion(f.t) ? CHAMPION_ALLY_DAMAGE : f.t.captive ? 8 : 11, -dx / Math.max(1, d), -dy / Math.max(1, d), time);
          } else if (vic === 'player' && time > this.lastDamage + 900) {
            this.hurtPlayer(isChampion(f.t) ? CHAMPION_DAMAGE : f.t.captive ? 5 : 7, time); this.hitFlash = time + 200; this.lastDamage = time;
            (m as { swingUntil?: number }).swingUntil = time + 500; if (isWarrior(f.t)) s2.play(`${f.t.tex}-attack-${f.facing}`);
            this.bleed(p.x, p.y, dx / Math.max(1, d), dy / Math.max(1, d), 6);
            this.message = isChampion(f.t) ? `${CHAMPION_NAMES[f.t.village]} trifft dich hart!` : f.t.captive ? 'Ein Dorfbewohner schlägt mit seiner Waffe zu!' : 'Eine Wache schlägt zu!'; this.messageUntil = time + 1400;
          }
          const sw = time < swing ? 1.2 : 0;
          m.weapon?.setVisible(true).setFlipX(left).setPosition(s2.x + (left ? -7 : 7), s2.y - 2).setRotation((left ? -1 : 1) * (0.5 + sw)).setDepth(s2.y + 1);
          m.icon.setText('⚔').setPosition(s2.x, s2.y - 14).setDepth(s2.y + 2000).setVisible(true);
          s2.setDepth(s2.y);
          if (!near && (d > 260 || !inRange && d > 120)) { m.armedUntil = 0; (m as { roared?: boolean }).roared = false; }
          continue;
        }
        const panicUntil = (m as { panicUntil?: number }).panicUntil ?? 0;
        if (f.c.state === 'free' && (!isWarrior(f.t) || ((m as { broken?: number }).broken ?? 0) > time) && panicUntil > time && !stop) {
          const ax = s.x - p.x, ay = s.y - p.y, al = Math.max(1, Math.hypot(ax, ay));
          const hx = v.x - s.x, hy = v.y - s.y, far = Math.hypot(hx, hy) > v.r * 1.2;
          const vx = far ? hx : ax / al * 100 + Math.sin(time / 300 + f.seed) * 30, vy = far ? hy : ay / al * 100 + Math.cos(time / 300 + f.seed) * 30, vl = Math.max(1, Math.hypot(vx, vy));
          if (d < 200) { s.setVelocity(vx / vl * 78, vy / vl * 78); f.facing = (Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8; s.play(`${f.t.tex}-walk-${f.facing}`, true); }
          else { s.setVelocity(0, 0); s.anims.stop(); s.setFrame(surrenderFrameOf(f)); }
          m.icon.setText('!!').setPosition(s.x, s.y - 14).setDepth(s.y + 2000).setVisible(true); s.setDepth(s.y);
          if (time > m.next) { m.next = time + 1500 + (f.seed % 900); if (d < 200) this.bark(f.c.id, s, 'flee', time); }
          continue;
        }
        if (f.c.state !== 'free' || d > 160) { m.dec = undefined; m.icon.setVisible(false); continue; }
        if (time > m.next) {
          m.next = time + 400;
          const before = m.dec?.state;
          m.dec = decideReaction({ relationship: getPersonalRelationship(this.rel, f.c.id, vk), armed: this.held !== 'none', crouching: this.crouching, carryingCaptive: !!this.carried, night: isNight(clockOf(this.clock).minutesOfDay), witnessedCrime: false, insideVillage: inside, alarmActive: isAlarmActive(this.rel, vk, now), role: f.t.captive ? 'villager' : 'guard' });
          if (m.dec.state !== before && d < 110) {
            const k: BarkKind | undefined = m.dec.state === 'friendly' ? 'greet' : m.dec.state === 'suspicious' ? 'warn' : m.dec.state === 'noticed' ? 'spotted' : m.dec.state === 'fleeing' ? 'flee' : m.dec.state === 'hostile' ? 'alarm' : undefined;
            if (k) this.bark(f.c.id, s, k, time);
          }
          if (m.dec.shouldRaiseAlarm) { this.rel = raiseAlarm(this.rel, vk, now); this.message = `${v.name} schlägt Alarm!`; this.messageUntil = time + 1800; }
        }
        const dec = m.dec; if (!dec) continue;
        m.icon.setText(dec.icon === 'none' ? '' : dec.icon).setPosition(s.x, s.y - 14).setDepth(s.y + 2000).setVisible(dec.icon !== 'none');
        if (stop) continue;
        const dx = p.x - s.x, dy = p.y - s.y, len = Math.max(1, d);
        const home = Math.hypot(s.x - v.x, s.y - v.y) < v.r;
        const face = (vx: number, vy: number) => { f.facing = (Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8; s.play(`${f.t.tex}-walk-${f.facing}`, true); };
        // Tense first contact: distrustful people stare, block, warn, shove and finally strike.
        if (!dec.shouldAttack && !dec.shouldFlee && dec.state !== 'friendly' && guardsSpace(getPersonalRelationship(this.rel, f.c.id, vk))) {
          const mm = m as { shoveAt?: number };
          const stare = () => { s.setVelocity(0, 0); s.anims.stop(); f.facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8; s.setFrame(f.facing); };
          if (d < SHOVE_RANGE && time > (mm.shoveAt ?? 0)) {
            mm.shoveAt = time + SHOVE_COOLDOWN_MS; stare();
            const strikes = nextStrikes(this.pressStrikes.get(f.c.id), time); this.pressStrikes.set(f.c.id, { strikes, at: time });
            const step = shoveStep(strikes, this.held !== 'none');
            if (step === 'warn') { this.bark(f.c.id, s, 'warn', time, true, isWarrior(f.t) ? 'Zurück, Fremder!' : 'Komm mir nicht zu nah!'); this.shove = { vx: dx / len * SHOVE_SPEED * 0.4, vy: dy / len * SHOVE_SPEED * 0.4, until: time + SHOVE_MS }; }
            else if (step === 'shove') { this.shove = { vx: dx / len * SHOVE_SPEED, vy: dy / len * SHOVE_SPEED, until: time + SHOVE_MS }; this.hurtPlayer(SHOVE_DAMAGE, time); this.hitFlash = time + 150; this.cameras.main.shake(140, 0.004); this.bark(f.c.id, s, 'warn', time, true, isWarrior(f.t) ? 'Verschwinde! Letzte Warnung!' : 'Weg von mir!'); this.message = 'Du wirst weggestoßen'; this.messageUntil = time + 1400; }
            else if (isWarrior(f.t)) { this.rel = raiseAlarm(this.rel, vk, now); this.armFolk(f, time); this.message = `${v.name} hat genug · sie greifen an!`; this.messageUntil = time + 2200; }
            else this.kinAlarm(f, time);
          } else if (d < PERSONAL_SPACE) stare();
          else if (escorts.has(f.c.id)) { const g = escortGoal(s, p), gx = g.x - s.x, gy = g.y - s.y, gl = Math.hypot(gx, gy); if (gl > 8) { s.setVelocity(gx / gl * 50, gy / gl * 50); face(gx, gy); } else stare(); }
          else if (!isWarrior(f.t) && this.held !== 'none' && d < 90 && home) { s.setVelocity(-dx / len * 40, -dy / len * 40); face(-dx, -dy); }
          else if (d < 110 && inside) stare();
          s.setDepth(s.y); continue;
        }
        if (dec.shouldAttack && !f.t.captive) {
          // Guards close in and strike; they never leave their village.
          if (d > 16 && home) { s.setVelocity(dx / len * 55, dy / len * 55); face(dx, dy); }
          else { s.setVelocity(0, 0); if (d <= 18 && time > this.lastDamage + 1100) { this.hurtPlayer(6, time); this.hitFlash = time + 200; this.lastDamage = time; this.message = 'Eine Wache schlägt zu!'; this.messageUntil = time + 1400; } }
        } else if ((dec.shouldFlee || dec.state === 'hostile') && home) { s.setVelocity(-dx / len * 45, -dy / len * 45); face(-dx, -dy); }
        s.setDepth(s.y);
      }
      if (best && !this.carried) {
        const f = best, st = f.c.state, vk = villageKey(FOLK_HOMES[f.t.village].name);
        this.talk = {
          id: f.c.id, name: getProfile(f.c.id)?.name ?? (st === 'camp' ? 'Stammesmitglied' : `Bewohner von ${FOLK_HOMES[f.t.village].name}`), profile: this.profileView(f.c.id, f.t.url),
          target: st === 'camp' ? 'ally' : st === 'surrender' || st === 'bound' ? 'captive' : f.t.captive ? 'villager' : 'guard',
          targetRole: f.t.captive ? 'villager' : 'guard', relationship: getPersonalRelationship(this.rel, f.c.id, vk),
          closeness: this.closenessContext(f.c.id),
          hasGift: this.count > 0 || this.stock.flint > 0, hasTradeGoods: this.stock.flint > 0 || this.stock.fiber >= 2,
          targetDefeated: st === 'surrender' || st === 'bound', targetBound: st === 'bound', targetCarried: false, isOwnTribe: st === 'camp', inRange: true,
          inCamp: this.inCampAt(f.sprite.x, f.sprite.y), hasWedge: canFinishWith(this.held), challenge: this.challengeRefusal(f),
          fear: this.villageFear(f.t.village), tributePaid: !canDemandTribute(this.fear, vk, clockOf(this.clock).day) && fearOf(this.fear, vk) >= 50,
        };
      } else this.talk = null;
      const ally = this.companionActors().filter(a => Math.hypot(a.sprite.x - p.x, a.sprite.y - p.y) <= INTERACTION_RANGE)
        .sort((a, b) => Math.hypot(a.sprite.x - p.x, a.sprite.y - p.y) - Math.hypot(b.sprite.x - p.x, b.sprite.y - p.y))[0];
      if (!this.carried && ally && (!best || Math.hypot(ally.sprite.x - p.x, ally.sprite.y - p.y) <= bd)) this.talk = this.allyContext(ally);
    }
    /** Live foes as engine-free records; creature ids are their index, folk ids their captive id. */
    allyFoes(): (Foe & { ref: Creature | Folk })[] {
      return [
        ...this.creatures.map((c, i) => ({ id: 'c' + i, x: c.sprite.x, y: c.sprite.y, alive: c.state !== 'dead' && c.sprite.active, hostile: c.state === 'chase' || c.state === 'attack', ref: c as Creature | Folk })),
        ...this.folk.map(f => ({ id: 'f' + f.c.id, x: f.sprite.x, y: f.sprite.y, alive: f.c.state === 'free' && f.combat.phase === 'ready',
          hostile: (this.folkMood.get(f.c.id)?.armedUntil ?? 0) > this.time.now || (this.roaming.has(f.c.id) && this.warband.active?.phase !== 'return' && this.raiders().includes(f)), ref: f as Creature | Folk })),
      ];
    }
    allyTargets = new Map<string, Foe & { ref: Creature | Folk }>();
    allyEngage(time: number, p: Phaser.Physics.Arcade.Sprite) {
      const goals = new Map<string, { x: number; y: number }>();
      const recalling = this.clock < this.recallUntil;
      const recalled = recalling ? recallOrders(this.companionActors().map(a=>({id:a.id,x:a.sprite.x,y:a.sprite.y,down:allyDowned(this.allyHealth(a.id))})),this.companionOrders,p) : new Map();
      const following = this.companionActors().filter(a => !this.responseOrders.has(a.id) && !recalled.has(a.id) && this.companionOrders.get(a.id)?.mode === 'follow' && !allyDowned(this.allyHealth(a.id))).sort((a, b) => a.id.localeCompare(b.id));
      const foes = this.dead || this.sleeping || this.carried ? [] : this.allyFoes().map(f => ({ ...f, champion: !('kind' in f.ref) && isChampion(f.ref.t) }));
      const willing = following.filter(a => foes.some(f => !this.shirks(a.id, f)));
      const assigned = assignAllyTargets(willing.map(a => ({ id: a.id, x: a.sprite.x, y: a.sprite.y })), foes, p, this.allyFocus);
      for (const [id, t] of assigned) if (this.shirks(id, t)) assigned.delete(id);
      if (!assigned.size && !foes.some(f => f.id === this.allyFocus && f.alive)) this.allyFocus = undefined;
      for (const [id, t] of assigned) if (this.allyTargets.get(id)?.id !== t.id && Math.random() < 0.5) { const a = following.find(o => o.id === id); if (a) this.allyBark(a, t, time); }
      for(const [id,t] of this.defenseTargets)assigned.set(id,{...t,champion:!('kind' in t.ref)&&isChampion(t.ref.t)});
      this.allyTargets = assigned;
      const per = new Map<string, number>();
      for (const a of following) {
        const t = assigned.get(a.id); if (!t) continue;
        const i = per.get(t.id) ?? 0; per.set(t.id, i + 1);
        goals.set(a.id, flankSlot(i + 1, 3, t, ALLY_REACH - 4, time, 1.7 + i));
      }
      for(const [id,t] of this.defenseTargets)goals.set(id,t);
      for(const [id] of recalled)if(!this.responseOrders.has(id))goals.set(id,{x:p.x,y:p.y});
      for (const a of this.companionActors().filter(a=>following.some(f=>f.id===a.id)||assigned.has(a.id))) {
        let g = this.allyGear.get(a.id);
        if (!g) { g = { img: this.add.image(0, 0, companionWeapon(a.id) === 'spear' ? 'spear-proj' : 'folk-axe').setScale(0.5), next: 0, swingUntil: 0 }; this.allyGear.set(a.id, g); }
        const t = assigned.get(a.id);
        const left = t ? t.x < a.sprite.x : a.facing >= 3 && a.facing <= 5, sw = time < g.swingUntil ? 1.2 : 0;
        g.img.setVisible(!!t).setFlipX(left).setPosition(a.sprite.x + (left ? -7 : 7), a.sprite.y - 2).setRotation((left ? -1 : 1) * (0.5 + sw)).setDepth(a.sprite.y + 1);
      }
      for (const [id, g] of this.allyGear) if (!assigned.has(id) || allyDowned(this.allyHealth(id))) g.img.setVisible(false);
      return goals;
    }
    allyBarkAt = 0;
    allyBark(a: CompanionActor, t: Foe & { ref: Creature | Folk }, time: number) {
      if (time < this.allyBarkAt) return; this.allyBarkAt = time + 2500;
      const champ = !('kind' in t.ref) && isChampion(t.ref.t);
      const lines = champ ? ['Den Großen nehme ich!', 'Zusammen bringen wir ihn zu Fall!', 'Für unseren Stamm!'] : ['Ich übernehme den da!', 'Hinter dir!', 'Los, drauf!', 'Ich decke dich!'];
      const txt = this.add.text(a.sprite.x, a.sprite.y - 20, lines[Math.floor(Math.random() * lines.length)] ?? "", { fontFamily: 'monospace', fontSize: '9px', color: '#fff3c4', stroke: '#1c1712', strokeThickness: 3 }).setOrigin(0.5, 1).setResolution(3).setDepth(a.sprite.y + 3000);
      this.tweens.add({ targets: txt, y: txt.y - 10, alpha: 0, delay: 1200, duration: 600, onComplete: () => txt.destroy() });
    }
    allyStrikes(time: number) {
      if (input.paused) return;
      for (const a of this.companionActors()) {
        const t = this.allyTargets.get(a.id);
        const g = this.allyGear.get(a.id); if (!t || !g || (this.companionOrders.get(a.id)?.mode !== 'follow' && !this.defenseTargets.has(a.id)) || allyDowned(this.allyHealth(a.id))) continue;
        const dx = t.ref.sprite.x - a.sprite.x, dy = t.ref.sprite.y - a.sprite.y, d = Math.hypot(dx, dy);
        if (d > ALLY_REACH + 6 || time < g.next) continue;
        g.next = time + ALLY_STRIKE_MS + Math.random() * 300; g.swingUntil = time + 220;
        const fx = dx / Math.max(1, d), fy = dy / Math.max(1, d);
        const dir = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8; a.face(dir);
        if ('kind' in t.ref) { if (t.ref.state !== 'dead') this.hurt(t.ref, ALLY_DAMAGE*caveDamageFactor(this.caves,companionWeapon(a.id)), fx, fy, time); }
        else {
          const f = t.ref; if (f.combat.phase !== 'ready' || f.c.state !== 'free') continue;
          const dmg=ALLY_DAMAGE*caveDamageFactor(this.caves,companionWeapon(a.id)); f.combat = isWarrior(f.t) && !isChampion(f.t) ? hitWarrior(f.combat, dmg, time, true) : hitFighter(f.combat, dmg, time); this.armFolk(f, time); this.bleed(f.sprite.x, f.sprite.y, fx, fy, f.combat.phase === 'dead' ? 28 : 14);
          if (f.combat.phase === 'dead') { dieFolk(f); this.message = 'Dein Trupp hat einen Krieger erschlagen'; this.messageUntil = time + 2200; this.persist(); }
          if (f.combat.phase === 'downed') { poseFolk(f); this.message = isChampion(f.t) ? `Dein Trupp hat ${CHAMPION_NAMES[f.t.village]} niedergerungen · jetzt der Finisher!` : 'Dein Jagdtrupp hat einen Gegner niedergeschlagen'; this.messageUntil = time + 2200; }
        }
      }
    }
    raid: RaidState = {};
    /** Burning and burnt huts (arson.ts); visuals are rebuilt from the clock each tick. */
    fires: FireState = EMPTY_FIRES;
    houseSprites = new Map<string, Phaser.Physics.Arcade.Sprite>();
    fireFx = new Map<string, { phase: string; objs: Phaser.GameObjects.GameObject[] }>();
    igniting?: { house: FlammableHouse; until: number } | undefined;
    nextHeatWarn = 0;
    fireHouseNear(p: { x: number; y: number }) { return FLAMMABLE_HOUSES.find(h => { const d = doorPoint(h); return Math.hypot(p.x - d.x, p.y - d.y) < IGNITE_RANGE; }); }
    /** Swaps hut/ruin textures and spawns flames, smoke and glow whenever a hut changes phase. */
    syncFireFx(time: number) {
      for (const h of FLAMMABLE_HOUSES) {
        const f = this.fires[h.id], spr = this.houseSprites.get(h.id); if (!spr) continue;
        const ph = f ? firePhase(f, this.clock) : null;
        const phase = !f ? 'intact' : ph === 'ruin' ? (ruinSmoking(f, this.clock) ? 'smoking' : 'ruin') : ph!;
        const fx = this.fireFx.get(h.id), prev = fx?.phase ?? 'intact';
        if (prev === phase) continue;
        fx?.objs.forEach(o => o.destroy());
        spr.setTexture(phase === 'ruin' || phase === 'smoking' ? ruinKey(h.key) : h.key);
        const objs: Phaser.GameObjects.GameObject[] = [], d = spr.depth + 1;
        const flame = (dx: number, dy: number, sc: number, start: number) => { const o = this.add.sprite(h.x + dx, h.y + dy, 'house-flame').setOrigin(FLAME_SHEET.ox, FLAME_SHEET.oy).setScale(sc).setDepth(d + dy * 0.01); o.play({ key: 'house-flame', startFrame: start % FLAME_SHEET.frames }); objs.push(o); };
        const smoke = (dx: number, dy: number, sc: number, alpha: number) => { const o = this.add.sprite(h.x + dx, h.y + dy, 'smoke-column').setOrigin(SMOKE_SHEET.ox, SMOKE_SHEET.oy).setScale(sc).setAlpha(alpha).setDepth(d + 2); o.play({ key: 'smoke-column', startFrame: ((Math.floor(h.x + h.y) % SMOKE_SHEET.frames) + SMOKE_SHEET.frames) % SMOKE_SHEET.frames }); objs.push(o); };
        if (phase === 'smolder') { flame(-6, 0, 0.45, 0); smoke(4, -10, 0.8, 0.55); }
        else if (phase === 'blaze') {
          const glow = this.add.image(h.x, h.y + 12, 'glow').setDepth(d - 2).setBlendMode(Phaser.BlendModes.ADD).setScale(0.9);
          this.tweens.add({ targets: glow, alpha: { from: 0.55, to: 0.9 }, scale: { from: 0.85, to: 1 }, duration: 260, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
          objs.push(glow);
          flame(-13, 10, 0.72, 2); flame(12, 8, 0.8, 5); flame(0, -2, 1, 0); flame(-4, 18, 0.5, 3); flame(9, 19, 0.45, 6);
          smoke(2, -30, 1.25, 0.85);
          if (prev === 'smolder' && f && f.owner !== 'camp') {
            this.rel = raiseAlarm(this.rel, villageKey(h.name), Date.now());
            this.message = `Feuer in ${h.name}! Die Wachen suchen den Brandstifter`; this.messageUntil = time + 3200;
          }
        }
        else if (phase === 'smoking') smoke(0, -6, 0.9, 0.45);
        this.fireFx.set(h.id, { phase, objs });
      }
    }
    tickFires(time: number, dt: number, p: { x: number; y: number }) {
      // Foreign villagers rebuild burnt huts by themselves; a defeated village waits for its respawn.
      const due = rebuildDue(this.fires, this.clock, v => championFallen(this.raid, v));
      if (due.length) {
        this.fires = removeFires(this.fires, due);
        const names = [...new Set(due.map(id => FLAMMABLE_HOUSES.find(h => h.id === id)?.name).filter(Boolean))];
        this.message = `${names.join(', ')} · die verbrannten Hütten sind wieder aufgebaut`; this.messageUntil = time + 3200; this.persist();
      }
      this.syncFireFx(time);
      for (const h of FLAMMABLE_HOUSES) {
        const f = this.fires[h.id]; if (!f) continue;
        if (!inHeat(f, this.clock, Math.hypot(p.x - h.x, p.y - h.y - 14))) continue;
        this.health = Math.max(0, this.health - HEAT_DAMAGE_PER_SEC * dt);
        if (time > this.nextHeatWarn) { this.nextHeatWarn = time + 2200; this.message = 'Die Hitze versengt dich!'; this.messageUntil = time + 1500; }
      }
    }
    igniteHouse(h: FlammableHouse, time: number) {
      if (this.fires[h.id]) return;
      this.fires = ignite(this.fires, h.id, h.owner, this.clock, h.village);
      this.cameras.main.shake(140, 0.003);
      if (h.owner === 'camp') {
        for (const f of this.folk.filter(f => f.c.state === 'camp')) this.trustEvent(f.c.id, 'violence');
        this.message = 'Du hast deine eigene Hütte angezündet!';
      } else {
        this.message = `${h.name} · das Dach fängt Feuer!`;
        if (h.village !== undefined) this.witnessDeed({ t: { village: h.village }, c: { id: `house:${h.id}` }, sprite: { x: h.x, y: h.y + 20 } }, 'arson', 'arson');
      }
      this.messageUntil = time + 2600; this.syncFireFx(time); this.persist();
    }
    /** [E] at a hut door: start the torch, or rebuild an own ruin. */
    fireAction(h: FlammableHouse, time: number) {
      const f = this.fires[h.id];
      if (!f) { this.igniting = { house: h, until: time + IGNITE_MS }; this.message = h.owner === 'camp' ? 'Deine eigene Hütte … Fackel ans Dach halten' : 'Fackel ans Dach halten …'; return; }
      if (isBurning(f, this.clock)) { this.message = 'Die Hütte steht in Flammen'; return; }
      if (h.owner !== 'camp') { this.message = `Nur noch Asche · ${h.name} baut sie irgendwann wieder auf`; return; }
      const r = repairHut(this.fires, h.id, this.clock, this.stock, this.owned.includes('axe'));
      if (r) { this.fires = r.state; this.stock = r.stock; this.syncFireFx(time); this.message = 'Hütte wieder aufgebaut'; this.persist(); return; }
      const b = repairBlock(this.fires, h.id, this.clock, this.stock, this.owned.includes('axe'));
      this.message = b === 'hot' ? 'Die Glut ist noch zu heiß · warte etwas' : b === 'no-axe' ? 'Ohne Steinaxt bekommst du die verkohlten Balken nicht weg' : `Wiederaufbau braucht ${repairCostText()}`;
    }
    fear: FearState = EMPTY_FEAR;
    /** Notizbuch-Fortschritt pro fremdem Volk. */
    lore: LoreState = EMPTY_LORE;
    /** Vermerkt eine Begegnung im Notizbuch und meldet neue Seiten. */
    noteLore(village: number, event: LoreEvent) {
      const tribe = tribeOfVillage(village), r = recordLore(this.lore, tribe, event);
      this.lore = r.state;
      if (r.after > r.before) { this.message = `Notizbuch: neue Seite über ${LORE[tribe].name}`; this.messageUntil = this.time.now + 3200; this.persist(); }
    }
    /** Raises a village's fear (after daily decay) and tells the player when it changes tier. */
    frighten(village: number, ev: FearEvent) {
      const vk = villageKey(FOLK_HOMES[village]!.name), before = fearTier(fearOf(this.fear, vk));
      this.fear = addFear(decayFear(this.fear, clockOf(this.clock).day), vk, ev);
      const after = fearTier(fearOf(this.fear, vk));
      if (after !== before) this.time.delayedCall(2300, () => { this.message = `${FOLK_HOMES[village]!.name} ist ${after}`; this.messageUntil = this.time.now + 3000; });
    }
    rumors: RumorState = EMPTY_RUMORS;
    /** Only those who see or hear a deed react; seen deeds become rumors that travel to neighbouring villages. */
    witnessDeed(victim: { t: { village: number }; c: { id: string }; sprite: { x: number; y: number } }, kind: DeedKind, fearEv?: FearEvent) {
      const victimVk = villageKey(FOLK_HOMES[victim.t.village]!.name);
      this.noteLore(victim.t.village, kind === 'champion' ? 'champion' : 'contact');
      const observers: Observer[] = this.folk.filter(o => o !== (victim as unknown) && o.combat.phase !== 'dead').map(o => ({ id: o.c.id, x: o.sprite.x, y: o.sprite.y, village: villageKey(FOLK_HOMES[o.t.village]!.name), role: isWarrior(o.t) ? 'guard' as const : 'villager' as const, bound: o.c.state !== 'free' }));
      const deed = { kind, actorId: 'player', victimVillage: victimVk, x: victim.sprite.x, y: victim.sprite.y, clock: this.clock, night: isNight(clockOf(this.clock).minutesOfDay), crouching: this.crouching };
      const out = resolveDeed(deed, witnessesOf(deed, observers));
      const now = Date.now();
      for (const r of out.villages) {
        if (r.alarm) this.rel = raiseAlarm(this.rel, r.village, now);
        if (r.relationship) this.rel = changeVillageRelationship(this.rel, r.village, r.relationship);
        if (r.fear) { const vi = FOLK_HOMES.findIndex(v => villageKey(v.name) === r.village); if (vi >= 0) this.frighten(vi, r.village === victimVk && fearEv ? fearEv : r.fear); }
      }
      // The victim's own village saw who did it: revenge builds up until a squad swears to burn the camp.
      if (out.villages.some(r => r.identified && r.village === victimVk)) {
        const vi = victim.t.village, rv = addRevenge(this.warband, vi, kind, this.clock, championFallen(this.raid, vi), Math.random);
        this.warband = rv.state;
        if (rv.sworn) this.time.delayedCall(4200, () => { this.message = `${FOLK_HOMES[vi]!.name} schwört Rache · ein Rachetrupp sammelt sich`; this.messageUntil = this.time.now + 3500; });
      }
      if (!out.unwitnessed) {
        // Freie Dorfbewohner, die es gesehen haben, rennen heim, um es zu melden. Krieger bleiben und kämpfen.
        const busy = new Set([...this.companionOrders.keys(), ...this.responseOrders.keys()]); if (this.ilvarEscaping) busy.add(this.ilvarEscaping);
        const runners = this.folk.filter(f => out.carriers.includes(f.c.id) && f.c.state === 'free' && f.combat.phase === 'ready' && !isWarrior(f.t) && !isChampion(f.t) && !busy.has(f.c.id));
        if (!runners.length) { this.rumors = startRumor(this.rumors, deed, victimVk); return; }
        const seeds = runners.map(f => { const h = FOLK_HOMES[f.t.village]!; return { id: f.c.id, village: villageKey(h.name), homeX: h.x, homeY: h.y, homeR: h.r }; });
        this.carriers = startCarriers(this.carriers, seeds, kind, this.clock);
        if (runners.some(f => { const h = FOLK_HOMES[f.t.village]!; return Math.hypot(f.sprite.x - h.x, f.sprite.y - h.y) > h.r * 0.8; })) this.time.delayedCall(kind === 'attack' ? 0 : 2300, () => { this.message = 'Ein Zeuge rennt los! Halt ihn auf!'; this.messageUntil = this.time.now + 2600; });
      }
      else if (kind !== 'attack') { this.time.delayedCall(2300, () => { this.message = 'Niemand hat es gesehen …'; this.messageUntil = this.time.now + 2200; }); }
    }
    tickRumors() {
      if (!this.rumors.rumors.length) return;
      const keys = FOLK_HOMES.map(v => villageKey(v.name));
      const neighbours: Record<string, string[]> = {};
      FOLK_HOMES.forEach((v, i) => { neighbours[keys[i]!] = FOLK_HOMES.map((w, j) => ({ j, d: Math.hypot(w.x - v.x, w.y - v.y) })).filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 2).map(o => keys[o.j]!); });
      const r = spreadRumors(this.rumors, this.clock, neighbours);
      if (r.state === this.rumors && !r.arrivals.length) return;
      this.rumors = r.state;
      for (const a of r.arrivals) {
        if (a.relationship) this.rel = changeVillageRelationship(this.rel, a.village, a.relationship);
        if (a.fear) this.fear = addFearAmount(decayFear(this.fear, clockOf(this.clock).day), a.village, a.fear);
        const name = FOLK_HOMES.find(v => villageKey(v.name) === a.village)?.name;
        if (name) { this.message = `Gerüchte über deine Taten erreichen ${name}`; this.messageUntil = this.time.now + 2600; }
      }
      if (r.arrivals.length) this.persist();
    }
    /** Fliehende Zeugen sind flüchtig; wer beim Speichern noch rennt, gilt als entkommen, damit Neuladen keine Tat verschweigt. */
    carriers: CarrierState = EMPTY_CARRIERS;
    savedRumors(): RumorState {
      let r = this.rumors;
      for (const c of this.carriers.carriers) if (c.status === 'fleeing') r = startRumor(r, { kind: c.kind, actorId: 'player', x: 0, y: 0, clock: c.deedClock, night: false, crouching: false }, c.village);
      return r;
    }
    /** Zeugen rennen heim, um die Tat zu melden. Wer sie einholt und ausschaltet, hält sie geheim. */
    tickCarriers(time: number, stop: boolean) {
      const p = this.player; if (!p || !this.carriers.carriers.length) return;
      const views = new Map<string, CarrierView>();
      for (const c of this.carriers.carriers) { const f = this.folk.find(o => o.c.id === c.id); if (f) views.set(c.id, { id: c.id, x: f.sprite.x, y: f.sprite.y, alive: f.combat.phase === 'ready', free: f.c.state === 'free', child: false }); }
      const r = stepCarriers(this.carriers, views, { x: p.x, y: p.y }, stop ? 0 : Math.min(this.game.loop.delta, 100) / 1000);
      for (const st of r.steps) {
        const f = this.folk.find(o => o.c.id === st.id); if (!f) continue;
        const s = f.sprite;
        if (stop) { s.setVelocity(0, 0); continue; }
        s.setVelocity(st.vx, st.vy); f.facing = (Math.round(Math.atan2(st.vy, st.vx) / (Math.PI / 4)) + 8) % 8; s.play(`${f.t.tex}-walk-${f.facing}`, true); s.setDepth(s.y);
        const m = this.folkMood.get(f.c.id); if (m) { m.icon.setText('!!').setPosition(s.x, s.y - 14).setDepth(s.y + 2000).setVisible(true); m.weapon?.setVisible(false); }
      }
      for (const c of [...r.escaped, ...r.silenced]) { const f = this.folk.find(o => o.c.id === c.id); this.folkMood.get(c.id)?.icon.setVisible(false); if (f && f.combat.phase === 'ready' && f.c.state === 'free') { f.sprite.setVelocity(0, 0); f.sprite.anims.stop(); poseFolk(f); } }
      for (const c of r.escaped) {
        this.rumors = startRumor(this.rumors, { kind: c.kind, actorId: 'player', x: 0, y: 0, clock: c.deedClock, night: false, crouching: false }, c.village);
        this.message = 'Ein Zeuge ist entkommen · bald weiß es die Gegend'; this.messageUntil = time + 3000;
      }
      if (r.silenced.length && !r.escaped.length) { this.message = 'Der Zeuge schweigt · niemand erfährt davon'; this.messageUntil = time + 2600; }
      this.carriers = pruneCarriers(r.state);
      if (r.escaped.length) this.persist();
    }
    villageFear(village: number) { this.fear = decayFear(this.fear, clockOf(this.clock).day); return fearOf(this.fear, villageKey(FOLK_HOMES[village]!.name)); }
    tickRaid(time: number) {
      for (const v of villagesToRespawn(this.raid, this.clock, (vi, at) => respawnExtra(this.fires, vi, at))) {
        const burnt = Object.values(this.fires).some(f => f.owner !== 'camp' && f.village === v); this.fires = clearVillageFires(this.fires, v); this.syncFireFx(time);
        for (const f of this.folk) {
          if (f.t.village !== v || f.t.captive || f.combat.phase !== 'dead') continue;
          f.combat = newFighter(isChampion(f.t) ? CHAMPION_HP : undefined); f.c = { id: f.c.id, state: 'free', x: f.t.x, y: f.t.y };
          f.sprite.setPosition(f.t.x, f.t.y); poseFolk(f); if (isChampion(f.t)) f.sprite.setTint(0xffe6c0);
        }
        this.raid = clearRespawn(this.raid, v);
        this.message = `${VILLAGES[v]?.name}${burnt ? ' ist wieder aufgebaut und' : ' hat sich'} neu bewaffnet · ${CHAMPION_NAMES[v]} führt die Wachen an`; this.messageUntil = time + 4000; this.persist();
      }
    }
    bossStatus(p: { x: number; y: number }) {
      const c = this.folk.find(f => isChampion(f.t) && f.combat.phase !== 'dead' && f.c.state === 'free' && Math.hypot(f.sprite.x - p.x, f.sprite.y - p.y) < 220 && ((this.folkMood.get(f.c.id)?.armedUntil ?? 0) > this.time.now || f.combat.phase === 'downed'));
      return c ? { name: `${CHAMPION_NAMES[c.t.village as 0]} · ${FOLK_HOMES[c.t.village].name}`, hp: Math.round(c.combat.hp), max: CHAMPION_HP, down: c.combat.phase === 'downed' } : null;
    }
    followingCount() { return [...this.companionOrders.values()].filter(o => o.mode === 'follow').length; }
    companionActors(): CompanionActor[] {
      return [
        ...this.campers.map(c => ({ id: c.template.id, sprite: c.sprite, texture: c.template.id,
          home: { x: c.template.x, y: c.template.y }, facing: c.facing, face: (d: number) => { c.facing = d; }, pace: companionPace(PROFILE_IDS[c.template.id] ?? '') })),
        ...this.folk.filter(f => f.c.state === 'camp' && f.combat.phase === 'ready').map(f => ({ id: f.c.id, sprite: f.sprite, texture: f.t.tex,
          home: { x: 940 + this.folk.indexOf(f) % 4 * 38, y: 735 }, facing: f.facing, face: (d: number) => { f.facing = d; }, pace: companionPace(PROFILE_IDS[f.c.id] ?? '') })),
      ];
    }
    allyContext(a: CompanionActor): TalkTarget {
      const portrait = this.campers.find(c => c.template.id === a.id)?.template.url ?? this.folk.find(f => f.c.id === a.id)?.t.url;
      return { id: a.id, name: getProfile(a.id)?.name ?? 'Stammesmitglied', profile: portrait ? this.profileView(a.id, portrait) : undefined, dialogues: [...this.campTopics(a.id), ...this.personalTopics(a.id)], target: 'ally', targetRole: 'villager', relationship: 100,
        closeness: this.closenessContext(a.id), hasGift: this.count > 0, hasTradeGoods: false, targetDefeated: false, targetBound: false,
        targetCarried: false, isOwnTribe: true, inRange: true, following: this.companionOrders.get(a.id)?.mode === 'follow', companionCount: this.followingCount(), task: taskLabel(this.tasks[a.id]?.kind ?? 'none') };
    }
    applyAllyInteraction(target: string, id: InteractionId, time: number): boolean {
      const actor = this.companionActors().find(a => a.id === target); if (!actor) return false;
      const p = this.player;
      if (!p || this.dead || this.health <= 0 || this.sleeping || Math.hypot(actor.sprite.x - p.x, actor.sprite.y - p.y) > INTERACTION_RANGE) return true;
      const option = getAvailableInteractions(this.allyContext(actor)).find(o => o.id === id);
      if (!option || option.disabled) return true;
      if (id === 'bond') { this.startCloseness(target, time); return true; }
      if (id === 'follow' || id === 'wait' || id === 'return') {
        if (id === 'follow' && !canRecruit(true, this.followingCount(), this.companionOrders.get(target)?.mode === 'follow')) return true;
        { const no = id === 'follow' ? followRefusal(PROFILE_IDS[target] ?? target, this.profiles[target]?.trust ?? 0) : null; if (no) { this.message = no; this.messageUntil = time + 2600; return true; } }
        this.companionOrders.set(target, { id: target, mode: id, x: actor.sprite.x, y: actor.sprite.y });
        actor.sprite.setVelocity(0, 0); this.companionMovement.reset(target);
        if (id === 'follow') this.tut({ kind: 'recruit' }, time);
        this.message = id === 'follow' ? `Begleitet dich · Jagdtrupp ${this.followingCount()}/${MAX_COMPANIONS}` : id === 'wait' ? 'Wartet hier auf dich' : 'Kehrt zum Höhlenlager zurück';
      } else if (id === 'assign') {
        const kind = nextTask(this.tasks[target]?.kind ?? 'none');
        this.tasks[target] = { kind, since: this.clock };
        this.message = kind === 'none' ? 'Hat keine Aufgabe mehr' : `Neue Aufgabe: ${taskLabel(kind)} · Erträge landen in der Vorratskiste`;
      } else if (id === 'feed') {
        const shareCooked = PROFILE_IDS[target] === 'skorra' && this.cooked > 0;
      const o = resolveInteraction(id, { state: 'camp', capturable: false, relationship: 100, goods: { berries: shareCooked ? 0 : this.count, cooked: this.cooked, flint: this.stock.flint, fiber: this.stock.fiber } });
        if (shareCooked) o.goods.berries = this.count;
        if (o.goods.berries === this.count && o.goods.cooked === this.cooked) { this.message = o.message; this.messageUntil = time + 2200; return true; }
        this.count = o.goods.berries; this.cooked = o.goods.cooked;
        // Feeding actually heals the ally: downed companions get back up, hurt ones recover.
        const h = this.allyHealth(target);
        this.allyHp.set(target, allyDowned(h) ? { hp: 25, downUntil: 0 } : { hp: Math.min(50, h.hp + 25), downUntil: 0 });
        this.message = o.message;
        if (shareCooked) this.trustEvent(target, 'meal');
      } else return true;
      this.messageUntil = time + 2200; this.persist(); return true;
    }
    /** Every free villager of f's village who can see f draws a weapon (f itself only if it is still free). */
    /** The victim cries for help: the village raises the alarm and every warrior within reach charges. */
    kinAlarm(f: Folk, time: number) {
      const vk = villageKey(FOLK_HOMES[f.t.village].name);
      this.rel = raiseAlarm(this.rel, vk, Date.now());
      this.bark(f.c.id, f.sprite, 'flee', time, true, 'Hilfe! Sie holen mich!');
      this.armFolk(f, time, KIN_ALARM_RADIUS);
      this.message = `${FOLK_HOMES[f.t.village].name} hört den Hilferuf · die Krieger kommen!`; this.messageUntil = time + 2600;
      this.cameras.main.shake(200, 0.004);
    }
    /** Player shoves past villagers: brief knockback velocity overriding movement. */
    shove?: { vx: number; vy: number; until: number };
    pressStrikes = new Map<string, { strikes: number; at: number }>();
    armFolk(f: Folk, time: number, radius = 200) {
      for (const ally of this.folk.filter(a => a.c.state === 'camp')) this.trustEvent(ally.c.id, 'violence');
      for (const o of this.folk) {
        if (o.combat.phase !== 'ready' || o.c.state !== 'free' || o.t.village !== f.t.village) continue;
        if (o !== f && Math.hypot(o.sprite.x - f.sprite.x, o.sprite.y - f.sprite.y) > radius) continue;
        const m = this.folkMood.get(o.c.id);
        // Morale: frightened warriors (worse at night) break and run instead of fighting; champions never break.
        if (isWarrior(o.t) && !isChampion(o.t) && moraleBreaks(this.villageFear(o.t.village), isNight(clockOf(this.clock).minutesOfDay))) { if (m) { (m as { panicUntil?: number }).panicUntil = time + 15000; (m as { broken?: number }).broken = time + 15000; } this.bark(o.c.id, o.sprite, 'flee', time); continue; }
        if (!isWarrior(o.t)) { if (m) (m as { panicUntil?: number }).panicUntil = time + 20000; if (o !== f) this.bark(o.c.id, o.sprite, 'flee', time); continue; }
        if (m) m.armedUntil = time + 25000;
        if (o !== f) this.bark(o.c.id, o.sprite, 'attack', time);
      }
      this.bark(f.c.id, f.sprite, isWarrior(f.t) ? 'alarm' : 'flee', time, true);
    }
    /** Per-person cooldowns for social actions so gifts/trades/ransoms cannot be spammed. */
    lastSocial = new Map<string, number>();
    inCampAt(x: number, y: number) { return Math.hypot(x - CAMP.x, y - CAMP.y - 50) < 130; }
    closeness: { id: string; elapsed: number; health: number; bubble: Phaser.GameObjects.Text } | undefined;
    closenessProtests = new Map<string, number>();
    closenessContext(id: string): ClosenessContext {
      const f = this.folk.find(o => o.c.id === id), camper = this.campers.find(o => o.template.id === id), p = this.player;
      const sprite = f?.sprite ?? camper?.sprite;
      const home = f ? FOLK_HOMES[f.t.village] : undefined;
      const vk = home ? villageKey(home.name) : '';
      const own = !!camper || f?.c.state === 'camp';
      const mood = this.folkMood.get(id);
      const peaceful = !this.attacking && !this.finisher && !this.dead && this.health > 0 && !this.sleeping
        && !this.closeness && (mood?.armedUntil ?? 0) <= this.time.now
        && ((mood as { panicUntil?: number } | undefined)?.panicUntil ?? 0) <= this.time.now
        && (this.closenessProtests.get(id) ?? 0) <= this.time.now;
      return { adultWoman: ADULT_WOMEN.has(id), playerAdult: true,
        free: !!camper || f?.c.state === 'free' || f?.c.state === 'camp',
        ready: !!camper ? !allyDowned(this.allyHealth(id)) : f?.combat.phase === 'ready' && (!own || !allyDowned(this.allyHealth(id))),
        willing: peaceful && (!!camper || (own ? (this.profiles[id]?.trust ?? 0) >= 75 : getPersonalRelationship(this.rel, id, vk) >= 55 && !isAlarmActive(this.rel, vk, Date.now()))),
        playerArmed: this.held !== 'none' || input.weapon !== 'none', carrying: !!this.carried,
        inRange: !!p && !!sprite && Math.hypot(p.x - sprite.x, p.y - sprite.y) <= INTERACTION_RANGE };
    }
    startCloseness(id: string, time: number) {
      const refusal = closenessRefusal(this.closenessContext(id));
      const seduction = refusal ? null : seductionRefusal(this.couples, id, COUPLES[id] ? this.personName(COUPLES[id]) : undefined, this.folkAlive);
      if (refusal || seduction) { this.message = refusal ?? seduction!; this.messageUntil = time + 2600; return; }
      const sprite = this.folk.find(f => f.c.id === id)?.sprite ?? this.campers.find(c => c.template.id === id)?.sprite;
      if (!sprite || !this.player) return;
      const bubble = this.add.text(sprite.x, sprite.y - 24, '♥', { fontFamily: 'monospace', fontSize: '12px', color: '#ffe08a', stroke: '#1c1712', strokeThickness: 3 }).setOrigin(0.5).setResolution(3).setDepth(sprite.y + 2000);
      this.closeness = { id, elapsed: 0, health: this.health, bubble };
      this.companionMovement.reset(id); sprite.setVelocity(0, 0);
      this.bark(id, sprite, 'greet', time, true, 'Ja, bleib einen Moment bei mir.');
      this.message = 'Sie nimmt deine Einladung an'; this.messageUntil = time + CLOSENESS_MS;
    }
    endCloseness(message: string, time: number) {
      const bond = this.closeness; if (!bond) return;
      bond.bubble.destroy(); this.closeness = undefined;
      const f = this.folk.find(o => o.c.id === bond.id), c = this.campers.find(o => o.template.id === bond.id);
      if (f) { f.next = time + 600; f.until = 0; }
      if (c) { c.nextDecision = time + 600; c.walkUntil = 0; }
      this.message = message; this.messageUntil = time + 2000;
    }
    tickCloseness(time: number, delta: number, dx: number, dy: number): boolean {
      const bond = this.closeness, p = this.player; if (!bond || !p) return false;
      const f = this.folk.find(o => o.c.id === bond.id), c = this.campers.find(o => o.template.id === bond.id), s = f?.sprite ?? c?.sprite;
      if (!s || this.dead || this.health <= 0 || this.sleeping || this.health < bond.health || (f && (f.combat.phase !== 'ready' || !['free', 'camp'].includes(f.c.state)))) { this.endCloseness('Der Moment endet', time); return false; }
      if (input.paused) { p.setVelocity(0, 0); s.setVelocity(0, 0); return true; }
      const interrupted = Math.hypot(dx, dy) > 0.12 || input.attack !== this.lastAttack || input.action !== this.lastAction || input.weapon !== 'none' || input.throwSpear
        || this.clickAttack || this.keys?.['Q']?.isDown || this.keys?.['E']?.isDown || this.keys?.['SPACE']?.isDown || this.keys?.['R']?.isDown;
      if (interrupted || Math.hypot(s.x - p.x, s.y - p.y) > INTERACTION_RANGE) { this.endCloseness('Du beendest den gemeinsamen Moment', time); return false; }
      if (f && f.c.state === 'free') {
        const village = villageKey(FOLK_HOMES[f.t.village].name);
        const observers: Observer[] = this.folk.filter(o => o.combat.phase === 'ready').map(o => ({ id: o.c.id, x: o.sprite.x, y: o.sprite.y, village: villageKey(FOLK_HOMES[o.t.village].name), role: isWarrior(o.t) ? 'guard' : 'villager', bound: o.c.state !== 'free' }));
        const witnesses = closenessWitnesses({ id: bond.id, village, x: s.x, y: s.y, ownTribe: false }, observers, isNight(clockOf(this.clock).minutesOfDay), (ax, ay, bx, by) => (this.obstacles?.getChildren() ?? []).some(o => {
          const body = (o as Phaser.Physics.Arcade.Sprite).body;
          return !!body && blocksSight(ax, ay + 10, bx, by + 10, body);
        }));
        if (witnesses.length) {
          const reactions: WitnessReaction[] = witnesses.map(w => witnessReaction(this.couples, bond.id, w.id, this.folkAlive));
          const found = discover(this.couples, bond.id, reactions, this.folkAlive); this.couples = found.state;
          if (found.confront) { this.endCloseness('Ertappt!', time); this.confrontPartner(found.confront, time); this.persist(); return false; }
          if (reactions.includes('gossip')) { this.endCloseness(`Man hat euch gesehen · ${this.personName(COUPLES[bond.id] ?? "")} wird davon hören`, time); this.persist(); return false; }
          for (const witness of witnesses) {
            const npc = this.folk.find(o => o.c.id === witness.id); if (!npc) continue;
            this.closenessProtests.set(witness.id, time + 4000);
            this.bark(witness.id, npc.sprite, 'warn', time, true, isWarrior(npc.t) ? 'Halt Abstand, Fremder!' : 'Lasst das!');
          }
          this.endCloseness('Stammesangehörige protestieren · der Moment wird unterbrochen', time); return false;
        }
      }
      p.setVelocity(0, 0); s.setVelocity(0, 0); p.anims.stop(); s.anims.stop();
      this.lastFacing = (Math.round(Math.atan2(s.y - p.y, s.x - p.x) / (Math.PI / 4)) + 8) % 8;
      const facing = (this.lastFacing + 4) % 8; if (f) f.facing = facing; if (c) c.facing = facing;
      p.setTexture(`none-idle-${this.lastFacing}`).setDepth(p.y); s.setFrame(facing).setDepth(s.y);
      bond.bubble.setPosition((p.x + s.x) / 2, Math.min(p.y, s.y) - 23 - Math.sin(time / 200) * 2);
      bond.elapsed += Math.min(delta, 100);
      if (bond.elapsed >= CLOSENESS_MS) {
        if (COUPLES[bond.id] && f) {
          const r = secretAffair(this.couples, bond.id, this.folkAlive); const had = r.state !== this.couples; this.couples = r.state;
          this.repro = conceive(this.repro, bond.id, PLAYER, COUPLES[bond.id] && !this.couples.broken.includes(bond.id) && this.folkAlive(COUPLES[bond.id]!) ? COUPLES[bond.id] : undefined, clockOf(this.clock).day, Math.random());
          this.endCloseness(had ? 'Niemand hat es gesehen · eine heimliche Affäre' : 'Ein ruhiger Moment zu zweit', time);
          if (r.confront) this.confrontPartner(r.confront, time);
          this.persist(); return false;
        }
        if (f) { this.repro = conceive(this.repro, bond.id, PLAYER, undefined, clockOf(this.clock).day, Math.random()); this.persist(); }
        this.endCloseness('Ein ruhiger Moment zu zweit', time); return false;
      }
      return true;
    }
    applyInteraction(f: Folk, id: InteractionId, time: number) {
      const p=this.player;if(!p||Math.hypot(p.x-f.sprite.x,p.y-f.sprite.y)>INTERACTION_RANGE||f.combat.phase!=='ready')return;
      this.noteLore(f.t.village, 'contact');
      if (id === 'bond') { this.startCloseness(f.c.id, time); return; }
      if (id === 'challenge') {
        const no = this.challengeRefusal(f); if (no !== null) { if (no) { this.message = no; this.messageUntil = time + 2000; } return; }
        const vk0 = villageKey(FOLK_HOMES[f.t.village].name), w = womanOf(f.c.id), wronged = !!w && (this.couples.affairs[w] ?? 0) > 0;
        if (Math.random() < acceptChance({ fear: this.villageFear(f.t.village), relationship: getPersonalRelationship(this.rel, f.c.id, vk0), wronged })) { this.bark(f.c.id, f.sprite, 'attack', time, true, 'So sei es. Vor allen Augen!'); this.startDuel(f, 'player', time); this.message = `${this.personName(f.c.id)} nimmt an! · ${this.message}`; }
        else { this.duels = setCooldown(this.duels, f.c.id, this.clock); this.fear = addFearAmount(decayFear(this.fear, clockOf(this.clock).day), vk0, 5); this.bark(f.c.id, f.sprite, 'flee', time, true, 'Nicht heute, Fremder…'); this.message = `${this.personName(f.c.id)} weicht deinem Blick aus und lehnt ab`; this.messageUntil = time + 2600; this.persist(); }
        return;
      }
      if(id==='attack'){if(f.c.state==='free'&&!input.paused&&!this.attacking){this.lastFacing=(Math.round(Math.atan2(f.sprite.y-p.y,f.sprite.x-p.x)/(Math.PI/4))+8)%8;this.attacking=true;this.attackPending=true;p.setVelocity(0,0);p.play(`anim-${this.held}-attack-${this.lastFacing}`);}return;}
      const vk = villageKey(FOLK_HOMES[f.t.village].name);
      if (isSocialAction(id)) {
        const last = this.lastSocial.get(`${f.c.id}:${id}`) ?? 0;
        if (!socialReady(last, Date.now())) {
          this.message = 'Dafür ist es noch zu früh · warte eine Weile'; this.messageUntil = time + 2000; return;
        }
      }
      if (id === 'execute') { this.executeCaptive(f); return; }
      if (id === 'tribute') {
        const day = clockOf(this.clock).day; this.fear = decayFear(this.fear, day);
        const r = demandTribute(this.fear, vk, day);
        if (!r) { this.message = 'Sie zahlen nicht · zu wenig Furcht oder heute schon gezahlt'; this.messageUntil = time + 2000; return; }
        this.fear = r.state; this.cooked += r.cooked; this.stock.flint += r.flint;
        this.rel = changeVillageRelationship(this.rel, vk, TRIBUTE_REL_COST);
        this.message = `Tribut aus Angst: ${r.cooked} Gebratenes, ${r.flint} Feuerstein · Hass wächst`;
        if (r.revenge) { this.warband = scheduleRaid(this.warband, f.t.village, true, this.clock, championFallen(this.raid, f.t.village)); this.message += ` · ${FOLK_HOMES[f.t.village].name} schwört Rache!`; }
        this.bark(f.c.id, f.sprite, 'flee', time, true); this.messageUntil = time + 3200; this.persist(); return;
      }
      if (id === 'adopt' && !this.inCampAt(f.sprite.x, f.sprite.y)) { this.message = 'Nur im Höhlenlager möglich'; this.messageUntil = time + 1600; return; }
      const o = resolveInteraction(id, { state: f.c.state, capturable: f.t.captive, relationship: getPersonalRelationship(this.rel, f.c.id, vk), goods: { berries: this.count, cooked: this.cooked, flint: this.stock.flint, fiber: this.stock.fiber } });
      if (isSocialAction(id)) this.lastSocial.set(`${f.c.id}:${id}`, Date.now());
      if ((id === 'gift' || id === 'greet') && COUPLES[f.c.id] && f.c.state === 'free' && o.rel && o.rel > 0) { this.couples = addLure(this.couples, f.c.id, id === 'gift' ? GIFT_LURE : GREET_LURE); o.message += ` · sie lächelt dich an (${this.couples.lure[f.c.id]}/40)`; }
      if (o.carry && this.carried) { this.message = 'Du trägst schon jemanden'; this.messageUntil = time + 1600; return; }
      if (id === 'trade' && o.goods.cooked > this.cooked && this.tribePids().includes('ymra')) { const ymra = this.folk.find(f => PROFILE_IDS[f.c.id] === 'ymra' && f.c.state === 'camp'); if (ymra) this.trustEvent(ymra.c.id, 'trade'); if (ymra && (this.profiles[ymra.c.id]?.trust ?? 0) >= 60) { const y = bonusYield(o.goods.cooked - this.cooked, YMRA_TRADE_BONUS, this.tradeCarry); this.tradeCarry = y.carry; if (y.amount > o.goods.cooked - this.cooked) o.message += ' · Ymra handelt 1 extra heraus'; o.goods.cooked = this.cooked + y.amount; } }
      this.count = o.goods.berries; this.cooked = o.goods.cooked; this.stock.flint = o.goods.flint; this.stock.fiber = o.goods.fiber;
      if (o.rel && f.c.state !== 'camp') this.rel = changeVillageRelationship(changePersonalRelationship(this.rel, f.c.id, o.rel, vk), vk, o.rel);
      if (o.alarm) this.rel = raiseAlarm(this.rel, vk, Date.now());
      if (o.state !== f.c.state) {
        f.c = { ...f.c, state: o.state, x: Math.round(f.sprite.x), y: Math.round(f.sprite.y) };
        if (o.carry) this.carried = f;
        poseFolk(f);
        if (o.state === 'camp') this.trustEvent(f.c.id, 'joined');
      }
      this.message = o.message; this.messageUntil = time + 2200;
      if (isKinCrime(id) && f.c.state !== 'camp' && !this.inCampAt(f.sprite.x, f.sprite.y)) this.kinAlarm(f, time);
      this.persist();
    }
    startFinisher(f:Folk,duel=false):boolean {
      const p=this.player;
      if(!p||this.attacking||this.carried||input.paused||!(duel?f.combat.phase==='downed':canFinish(f.combat,Math.hypot(f.sprite.x-p.x,f.sprite.y-p.y),canFinishWith(this.held),f.c.state==='camp')))return false;
      const angle=Math.atan2(f.sprite.y-p.y,f.sprite.x-p.x);
      this.lastFacing=(Math.round(angle/(Math.PI/4))+8)%8;
      this.target=undefined;this.finisher=f;this.fistFinish=duel&&!canFinishWith(this.held);this.beheading=!this.fistFinish&&finisherStyle(this.held)==='behead';this.attacking=true;this.attackPending=false;this.crouchOn=false;
      p.setPosition(f.sprite.x-Math.cos(angle)*14,f.sprite.y-Math.sin(angle)*14).setVelocity(0,0).setDepth(f.sprite.y+1);
      p.anims.timeScale=1;if(this.fistFinish)p.play(`anim-fistfin-${this.lastFacing}`);else{const s=this.skinNow();p.play(!this.beheading&&s&&SKINS[s].frames.finisher>1?`anim-finisher-${s}-${this.lastFacing}`:`anim-${this.beheading?'behead':'finisher'}-${this.lastFacing}`);}
      this.message=this.beheading?'Enthauptung!':this.fistFinish?'Faust-Finisher!':'Finisher!';this.messageUntil=this.time.now+1800;return true;
    }
    executing = false;
    beheading = false;
    /** Bound or surrendered people are helpless: the Steinkeil finisher kills them outright. */
    executeCaptive(f:Folk):boolean {
      if(!canExecute(f.c,canFinishWith(this.held))){if(!canFinishWith(this.held)){this.message='Nimm Steinkeil oder Axt in die Hand';this.messageUntil=this.time.now+1600;}return false;}
      const before={c:f.c,combat:f.combat};
      f.c={...f.c,state:'free',x:Math.round(f.sprite.x),y:Math.round(f.sprite.y)};f.combat={...f.combat,phase:'downed',downUntil:this.time.now+600000};
      if(this.startFinisher(f)){this.executing=true;this.message='Hinrichtung!';return true;}
      f.c=before.c;f.combat=before.combat;return false;
    }
    landFinisher(){
      const f=this.finisher,p=this.player;if(!f||!p||this.dead||f.combat.phase!=='downed')return;
      if(this.duel?.phase==='fight'&&f.c.id===this.duel.id){f.combat=finishFighter(f.combat);f.beheaded=this.beheading;dieFolk(f);const fx=Math.cos(this.lastFacing*Math.PI/4),fy=Math.sin(this.lastFacing*Math.PI/4);this.bleed(f.sprite.x,f.sprite.y,fx,fy,this.fistFinish?24:40);if(this.beheading)this.severHead(f,fx,fy);this.beheading=false;this.punch(40,true);this.endDuel('win',this.time.now);return;}
      f.combat=finishFighter(f.combat);f.beheaded=this.beheading;dieFolk(f);this.armFolk(f,this.time.now);
      if(isChampion(f.t)){this.raid=recordChampionDeath(this.raid,f.t.village,this.clock);this.xp+=120;this.cameras.main.shake(400,0.012);this.time.delayedCall(1900,()=>{this.message=`${CHAMPION_NAMES[f.t.village as 0]} ist gefallen · ${FOLK_HOMES[f.t.village].name} ist befreit!`;this.messageUntil=this.time.now+5000;});this.persist();}
      for (const a of this.companionActors().filter(a => Math.hypot(a.sprite.x - f.sprite.x, a.sprite.y - f.sprite.y) < 200)) this.trustEvent(a.id, 'finisher');
      {const fx=Math.cos(this.lastFacing*Math.PI/4),fy=Math.sin(this.lastFacing*Math.PI/4);this.bleed(f.sprite.x,f.sprite.y,fx,fy,40);if(this.beheading)this.severHead(f,fx,fy);}this.beheading=false;this.punch(40,true);
      this.witnessDeed(f,isChampion(f.t)?'champion':this.executing?'execution':'finisher',isChampion(f.t)?'champion':this.executing?'execution':'finisher');this.executing=false;
      this.message='Gegner besiegt';this.messageUntil=this.time.now+2200;this.persist();
    }
    /** Split the victim's own lying artwork at the neck, then throw that exact head. */
    severHead(f:Folk,fx:number,fy:number){
      const art=corpseParts(this,f.t.tex);if(!art)return;
      const s=f.sprite,x=s.x+art.headX*s.scaleX,y=s.y+art.headY*s.scaleY,side=Math.random()<0.5?-1:1;
      const nx=s.x+art.neckX*s.scaleX,ny=s.y+art.neckY*s.scaleY;
      this.bleed(nx,ny+6,-fy*side,fx*side,30);
      const pool=this.add.ellipse(nx,ny+3,18,7,0x5a0606,0.85).setDepth(s.depth-1).setScale(0.2);
      this.tweens.add({targets:pool,scale:1,duration:2400,ease:'Sine.easeOut'});
      for(let k=0;k<4;k++)this.time.delayedCall(k*260,()=>{if(s.active)this.bleed(nx,ny+6,-fy*side,fx*side,8);});
      const head=this.add.image(x,y,art.headKey).setDepth(s.y+20).setScale(s.scaleX,s.scaleY);f.headSprite=head;
      const a=Math.atan2(fy,fx)+side*1.1,dist=22+Math.random()*8,tx=x+Math.cos(a)*dist,ty=y+Math.sin(a)*dist*0.6+3;
      f.headPosition={x:tx,y:ty};f.deathClock=this.clock;f.skullTaken=false;
      // high arc: rise then fall, bounce and roll out
      this.tweens.add({targets:head,x:tx,duration:820,ease:'Quad.easeOut',angle:side*720});
      this.tweens.chain({targets:head,tweens:[{y:y-30,duration:300,ease:'Quad.easeOut'},{y:ty,duration:520,ease:'Bounce.easeOut'}],onComplete:()=>{head.setDepth(ty);
        this.bleed(tx,ty+6,side,0,10);
        const trail=this.add.ellipse(tx,ty+3,7,3,0x6e0b0b,0.85).setDepth(MAP.y-198);this.tweens.add({targets:trail,alpha:0,delay:360000,duration:60000,onComplete:()=>trail.destroy()});}});
      const drip=this.time.addEvent({delay:60,repeat:12,callback:()=>{const d=this.add.rectangle(head.x,head.y+2,1,1,0x8a0f0f).setDepth(MAP.y-197);this.tweens.add({targets:d,alpha:0,delay:240000,duration:30000,onComplete:()=>d.destroy()});}});void drip;
      this.beheading=false;
    }
    /** Pixel blood: droplets fly in hit direction, then leave fading stains on the ground. */
    bleed(x: number, y: number, dx: number, dy: number, n: number) {
      const reds = [0x8a0f0f, 0xb01818, 0x5e0808];
      for (let i = 0; i < n; i++) {
        const sz = Math.random() < 0.3 ? 2 : 1;
        const drop = this.add.rectangle(x, y - 6, sz, sz, reds[i % 3]).setDepth(y + 5);
        const spread = (Math.random() - 0.5) * 1.4, sp = 10 + Math.random() * 18;
        const a = Math.atan2(dy, dx) + spread;
        const tx = x + Math.cos(a) * sp, ty = y + Math.sin(a) * sp * 0.6 + 2;
        this.tweens.add({ targets: drop, x: tx, y: { from: y - 6, to: ty }, duration: 220 + Math.random() * 160, ease: 'Quad.easeOut', onComplete: () => {
          drop.setDepth(MAP.y - 197).setAlpha(0.85);
          this.tweens.add({ targets: drop, alpha: 0, delay: 240000, duration: 30000, onComplete: () => drop.destroy() });
        } });
      }
      const pool = this.add.ellipse(x + dx * 4, y + 3 + dy * 2, 6 + n * 0.7, 3 + n * 0.35, 0x6e0b0b, 0.75).setDepth(MAP.y - 198);
      this.tweens.add({ targets: pool, alpha: 0, delay: 360000, duration: 60000, onComplete: () => pool.destroy() });
    }
    hurt(c: Creature, dmg: number, fx: number, fy: number, time: number) {
      if (c.kind !== 'mammoth' || dmg > 0) this.bleed(c.sprite.x, c.sprite.y, fx, fy, c.kind === 'gazelle' ? 6 : 9);
      c.hp -= dmg;
      c.sprite.setTint(0xff6b4a);
      this.time.delayedCall(140, () => { if (c.state !== 'dead') c.sprite.clearTint(); });
      (c.sprite.body as Phaser.Physics.Arcade.Body).setVelocity(fx * 90, fy * 90);
      if (c.hp <= 0) {
        if (c.kind === 'wolf') for (const f of this.folk.filter(f => f.c.state === 'camp')) this.trustEvent(f.c.id, 'wolf');
        const skorra = c.kind !== 'wolf' ? this.standingAllies().find(a => PROFILE_IDS[a.id] === 'skorra' && Math.hypot(a.x - c.sprite.x, a.y - c.sprite.y) < 160 && this.trustProgress[a.id]?.done.includes('meal') && !this.trustProgress[a.id]?.done.includes('hunt')) : undefined;
        c.state = 'dead';
        const mx = c.sprite.x, my = c.sprite.y;
        c.sprite.destroy();
        if (this.target === c) this.target = undefined;
        const meat = this.add.image(mx, my, 'meat').setDepth(my);
        this.meatPickups.push({ x: mx, y: my, sprite: meat, ...(skorra ? { skorra: skorra.id } : {}) });
        const pelt = peltFor(c.kind);
        if (pelt) this.stock = { ...this.stock, [pelt]: (this.stock[pelt] ?? 0) + 1 };
        this.message = `${NAME[c.kind]} erlegt · Fleisch zurückgelassen${pelt ? ` · +1 ${PELT_NAME[pelt]}` : ''}`;
        this.messageUntil = time + 2600;
        this.addXp(XP[c.kind]);
      } else if (c.kind === 'gazelle') { c.state = 'flee'; c.stateUntil = time + 4000; }
      else { c.state = 'chase'; c.stateUntil = time + 8000; c.nextAttack = Math.max(c.nextAttack, time + 500); }
    }
    tickWildlife(time:number, delta:number, p:Phaser.Physics.Arcade.Sprite){
      // Stealth: hidden when crouched behind any cover within 36 px.
      this.hidden = this.covers.some(c => Math.hypot(c.x - p.x, c.y - p.y) < 36);
      p.setAlpha(this.hidden ? 0.6 : this.crouching ? 0.85 : 1);
      // Player attack hit: resolve on the first tick after attack starts.
      const hw = this.held;
      const reach = hw === 'wedge' ? 24 : hw === 'spear' ? 46 : hw === 'axe' ? 38 : 30;
      const fa = this.lastFacing * (Math.PI / 4);
      const fx = Math.cos(fa), fy = Math.sin(fa);
      if (this.attackPending && (hw !== 'wedge' || (p.anims.currentFrame?.index ?? 0) >= 7)) {
        this.attackPending = false;
        for (const c of this.creatures) {
          if (c.state === 'dead') continue;
          const ddx = c.sprite.x - p.x, ddy = c.sprite.y - p.y, d = Math.hypot(ddx, ddy);
          if (d > reach) continue;
          if ((ddx * fx + ddy * fy) / Math.max(0.1, d) < 0.3) continue;
          this.allyFocus = 'c' + this.creatures.indexOf(c);
          this.hurt(c, (hw === 'wedge' ? 24 : hw === 'spear' ? 22 : hw === 'axe' ? 18 : this.clubNow() ? 16 : 10)*caveDamageFactor(this.caves,this.clubNow()?'club':hw)*armorDamage(this.armorNow()), fx, fy, time);
        }
        for (const f of this.folk) {
          if (f.c.state !== 'free') continue;
          const ddx = f.sprite.x - p.x, ddy = f.sprite.y - p.y, d = Math.hypot(ddx, ddy);
          if (d > reach || (ddx * fx + ddy * fy) / Math.max(0.1, d) < 0.3) continue;
          if(f.combat.phase!=='ready')continue;
          if(this.duel&&this.duel.phase!=='done'){if(f.c.id===this.duel.id){if(this.duel.phase==='fight')this.duelStruck(f,hw==='wedge'?24:hw==='spear'?22:hw==='axe'?18:this.clubNow()?16:10,fx,fy,time);else this.duel=null;if(this.duel)continue;}else if(this.inDuelFight())continue;}
          this.allyFocus='f'+f.c.id;
          {const dmg=(hw==='wedge'?24:hw==='spear'?22:hw==='axe'?18:this.clubNow()?16:10)*caveDamageFactor(this.caves,this.clubNow()?'club':hw)*armorDamage(this.armorNow());f.combat=isWarrior(f.t)&&!isChampion(f.t)?hitWarrior(f.combat,dmg,time,isLethalWeapon(hw)):hitFighter(f.combat,dmg,time);this.punch(dmg);}
          this.armFolk(f,time);
          this.bleed(f.sprite.x,f.sprite.y,fx,fy,f.combat.phase==='dead'?30:16);
          if(f.combat.phase==='dead'){dieFolk(f);this.witnessDeed(f,'kill','kill');this.message='Krieger erschlagen';this.persist();}
          else if(f.combat.phase==='downed'){poseFolk(f);this.message=isChampion(f.t)?`${CHAMPION_NAMES[f.t.village]} geht zu Boden · nur ein Finisher mit dem Steinkeil beendet es!`:f.t.captive?'Niedergeschlagen · Steinkeil: Finisher · ohne: [E] fesseln':'Krieger niedergeschlagen · Steinkeil: Finisher';}
          else{f.sprite.setTint(0xff6b4a);this.time.delayedCall(140,()=>{f.sprite.clearTint();if(isChampion(f.t))f.sprite.setTint(0xffe6c0);});this.message=isChampion(f.t)?`Treffer! ${CHAMPION_NAMES[f.t.village]} brüllt vor Wut`:'Treffer! Das Dorf greift an!';}
          this.messageUntil=time+2000;
          if(f.combat.phase!=='dead')this.witnessDeed(f,'attack');
        }
        this.chop(time, fx, fy);
      }
      // Creature AI.
      for (const c of this.creatures) {
        if (c.state === 'dead') continue;
        c.feeding = false;
        const s = c.sprite; const body = s.body as Phaser.Physics.Arcade.Body;
        const dx = p.x - s.x, dy = p.y - s.y, dist = Math.hypot(dx, dy);
        // Sight range: hidden behind cover = invisible, crouching = much shorter range.
        const base = c.kind === 'tiger' ? 150 : c.kind === 'gazelle' ? 200 : SNOW[c.kind].sight;
        // Wolves busy on a corpse have tunnel vision: they only react when you come really close.
        const busy = c.kind === 'wolf' && c.state === 'wander' && !!c.feedOn && (() => { const k = this.carcasses().find(q => q.id === c.feedOn); return !!k && Math.hypot(k.x - s.x, k.y - s.y) <= FEED_REACH + 4; })();
        const range = busy ? feedingSight(this.crouching) : this.crouching ? base * 0.47 : base;
        const sees = !this.hidden && dist < range;
        if (c.kind === 'gazelle') {
          if (sees && c.state !== 'flee') { c.state = 'flee'; c.stateUntil = time + 2500; }
          if (c.state === 'flee' && time > c.stateUntil && dist > 260) { c.state = 'wander'; c.nextDecision = time + 800; }
        } else {
          // Predators need a moment of clear sight before they notice you; mammoths never do (sight 0).
          const nm = NAME[c.kind];
          c.alert = Phaser.Math.Clamp((c.alert ?? 0) + (sees ? delta * (busy ? FEED_ALERT_RATE : 1) : -delta * 0.6), 0, 1600);
          if (c.state === 'wander' && c.alert >= (c.kind === 'wolf' ? 900 : 1400)) { c.state = 'chase'; c.stateUntil = time + 5000; this.message = `${nm} hat dich entdeckt!`; this.messageUntil = time + 1800; }
          if (c.state === 'chase' && (this.hidden ? time > c.stateUntil - 3500 : (!sees && dist > 260 && time > c.stateUntil))) { c.state = 'wander'; c.alert = 0; c.nextDecision = time + 800; if (this.hidden) { this.message = `${nm} verliert deine Spur`; this.messageUntil = time + 1800; } }
          if (c.state === 'chase' && !this.dead && dist < reachOf(c.kind) && time > c.nextAttack) {
            c.state = 'attack'; c.nextAttack = time + (c.kind === 'wolf' ? 1100 : 1600); c.stateUntil = time + 650;
            body.setVelocity(0, 0);
            const facing = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
            c.facing = facing;
            const ak = `anim-${c.kind}-attack-${facing}`;
            if (this.anims.exists(ak)) s.play(ak, true); else s.play(`${c.kind}-walk-${facing}`, true);
            const vic = pickVictim(s, p, this.standingAllies(), reachOf(c.kind));
            if (vic && vic !== 'player') this.hitCompanion(vic, c.kind === 'tiger' ? 14 : SNOW[c.kind].damage * 1.4, dx / Math.max(1, dist), dy / Math.max(1, dist), time);
            else if (time > this.lastDamage + 900) {
              this.hurtPlayer(c.kind === 'tiger' ? 10 : SNOW[c.kind].damage, time);
              this.hitFlash = time + 200;
              this.bleed(p.x, p.y, dx / Math.max(1, dist), dy / Math.max(1, dist), 7);
              this.lastDamage = time;
              this.message = `${nm} greift dich an!`;
              this.messageUntil = time + 1600;
            }
          }
        }
        if (c.state === 'attack') {
          if (time > c.stateUntil) c.state = 'chase';
        } else if (c.state === 'flee') {
          const nx = -dx, ny = -dy, nl = Math.max(1, Math.hypot(nx, ny));
          const sl = c.slowUntil && c.slowUntil > time ? BOLA_SLOW : 1;
          body.setVelocity(nx / nl * 95 * sl, ny / nl * 95 * sl);
        } else if (c.state === 'chase') {
          const sp = (c.kind === 'tiger' ? 70 : SNOW[c.kind as SnowKind].speed) * (c.slowUntil && c.slowUntil > time ? BOLA_SLOW : 1);
          // Pack hunters approach from different angles and keep apart instead of stacking.
          const pack = this.creatures.filter(o => o !== c && o.state !== 'dead' && (o.state === 'chase' || o.state === 'attack'));
          const sep = separation(s, pack.map(o => o.sprite), reachOf(c.kind) * 0.9);
          let gx = dx, gy = dy;
          if (pack.length && dist > reachOf(c.kind)) {
            const all = [c, ...pack].sort((a, b) => a.sprite.x - b.sprite.x);
            const slot = flankSlot(all.indexOf(c), all.length, p, reachOf(c.kind) * 0.8, time, c.sprite.x % 7);
            gx = slot.x - s.x; gy = slot.y - s.y;
          }
          gx += sep.x * 50; gy += sep.y * 50;
          const gl = Math.max(1, Math.hypot(gx, gy));
          if (dist < reachOf(c.kind) - 6 && Math.hypot(sep.x, sep.y) < 0.05) body.setVelocity(0, 0); else body.setVelocity(gx / gl * sp, gy / gl * sp);
        } else if (c.kind === 'wolf' && this.scavenge(c)) {
          // feeding on a corpse
        } else {
          // Wander: pick a nearby target now and then.
          if (time > c.nextDecision) {
            c.nextDecision = time + 1800 + Math.random() * 2200;
            c.wanderX = s.x + (Math.random() - 0.5) * 160;
            c.wanderY = s.y + (Math.random() - 0.5) * 160;
          }
          const wx = c.wanderX - s.x, wy = c.wanderY - s.y, wl = Math.hypot(wx, wy);
          if (wl > 8) body.setVelocity(wx / wl * 22, wy / wl * 22);
          else body.setVelocity(0, 0);
        }
        // Villages are off-limits: steer wildlife back out of the protected zone.
        const vil = villageAt(s.x, s.y, 50);
        if (vil) {
          const ox = s.x - vil.x, oy = s.y - vil.y, ol = Math.max(1, Math.hypot(ox, oy));
          body.setVelocity(ox / ol * 60, oy / ol * 60);
          c.wanderX = vil.x + ox / ol * (vil.r + 120); c.wanderY = vil.y + oy / ol * (vil.r + 120);
          if (c.state === 'chase' || c.state === 'attack') { c.state = 'wander'; c.alert = 0; c.nextDecision = time + 2500; }
        }
        // Animate based on velocity.
        if (c.feeding) {
          const ek = `anim-wolf-eat-${c.facing}`;
          if (s.anims.currentAnim?.key !== ek || !s.anims.isPlaying) s.play(ek);
        } else if (c.state !== 'attack') {
          const vx = body.velocity.x, vy = body.velocity.y, vlen = Math.hypot(vx, vy);
          if (vlen > 12) {
            // Only turn after a short hold so close-range contact doesn't flicker directions.
            const facing = (Math.round(Math.atan2(vy, vx) / (Math.PI / 4)) + 8) % 8;
            if (facing !== c.facing && time > (c.turnAt ?? 0)) { c.facing = facing; c.turnAt = time + 220; }
            const key = c.kind === 'gazelle' && c.state === 'flee' ? `gazelle-run-${c.facing}` : `${c.kind}-walk-${c.facing}`;
            if (s.anims.currentAnim?.key !== key || !s.anims.isPlaying) s.play(key);
          } else if (vlen < 4) {
            s.anims.stop();
            s.setTexture(`${c.kind}-idle-${c.facing}`);
          }
        }
        s.setDepth(s.y);
      }
      // Target lock marker.
      if (this.target && this.target.state === 'dead') this.target = undefined;
      if (this.target && Math.hypot(this.target.sprite.x - p.x, this.target.sprite.y - p.y) > 320) { this.target = undefined; this.message = 'Ziel verloren'; this.messageUntil = time + 1200; }
      if (this.marker) {
        if (this.target) { this.marker.setVisible(true).setPosition(this.target.sprite.x, this.target.sprite.y - 26).setDepth(99999); this.marker.setScale(1 + 0.12 * Math.sin(time / 120)); }
        else this.marker.setVisible(false);
      }
      // Thrown spear: homes toward its locked target, then drops to the ground.
      const sp = this.spear;
      if (sp) {
        const tgt = sp.target && sp.target.state !== 'dead' ? sp.target : undefined;
        const tx = tgt ? tgt.sprite.x : sp.tx, ty = tgt ? tgt.sprite.y : sp.ty;
        const ddx = tx - sp.img.x, ddy = ty - sp.img.y, d = Math.hypot(ddx, ddy);
        const step = 420 * Math.min(delta, 50) / 1000;
        sp.img.setRotation(Math.atan2(ddy, ddx) + Math.PI / 4).setDepth(sp.img.y + 20);
        if (d <= step + 6) {
          if (tgt) this.hurt(tgt, tgt.kind === 'gazelle' ? 999 : tgt.kind === 'wolf' ? 40 : 45, ddx / Math.max(1, d), ddy / Math.max(1, d), time);
          sp.img.setPosition(tx, ty + 6).setRotation(Math.PI / 4 + 0.6).setDepth(ty);
          this.spearOnGround = { x: tx, y: ty + 6, img: sp.img };
          this.spear = undefined;
        } else sp.img.setPosition(sp.img.x + ddx / d * step, sp.img.y + ddy / d * step);
      }
      {const tint=playerTint(input.armor,this.health);if (time < this.hitFlash) p.setTint(0xff5050); else if (tint!==null) p.setTint(tint); else p.clearTint();}
    }
    report(time:number,p:Phaser.Physics.Arcade.Sprite){
      if(time-this.lastReport>100){this.lastReport=time;onStatus({lore:this.lore,bleeding:isBleeding(this.bleedUntil,time),campAlarm:!this.caves.current&&this.campAlarm,nearDrum:!this.caves.current&&this.nearDrum,hornCooldown:Math.max(0,Math.ceil(this.hornReadyAt-this.clock)),caves:this.caves,cavePrompt:this.cavePrompt,nearPaint:!!this.caves.current&&Math.hypot(p.x-PAINT_WALL.x,p.y-PAINT_WALL.y)<44,x:Math.round(p.x),y:Math.round(p.y),stamina:Math.round(this.stamina),health:Math.round(this.health),berries:this.count,meat:this.meat,cooked:this.cooked,healPulse:this.healPulse,skull:this.stock.skull??0,wood:this.stock.wood,stone:this.stock.stone,flint:this.stock.flint,wolfPelt:this.stock.wolfPelt??0,sabrePelt:this.stock.sabrePelt??0,fiber:this.stock.fiber,xp:this.xp,level:levelFromXp(this.xp),owned:this.owned,hunger:Math.round(this.hunger),warmth:Math.round(this.warmth),day:clockOf(this.clock).day,minutes:clockOf(this.clock).minutesOfDay,nearFire:this.caves.current?this.caveWarm(p):Math.hypot(p.x-CAMP.x,p.y-CAMP.y-FIRE_DY)<70,hidden:this.hidden,weapon:this.held,sleeping:this.sleeping,nearBed:this.nearBed,crouching:this.crouching,dead:this.dead,area:this.caves.current?CAVES[this.caves.current].name:Math.hypot(p.x-CAMP.x,p.y-CAMP.y)<200?'Höhlenlager':p.x>=0&&p.x<=WORLD&&p.y>=0&&p.y<mEdge(p.x)+140?'Am Bergmassiv':isFord(p.y)&&Math.abs(p.x-riverX(p.y))<90?'Furt':Math.abs(p.x-riverX(p.y))<130?'Flussufer':BIOME_NAME[biomeAt(p.x,p.y)],message:time<this.messageUntil?this.message:'',talk:this.talk,companionCount:this.followingCount(),craftDiscount:this.party().craftDiscount,nearChest:this.nearChest,chest:{...this.chest},chestOpen:this.chestOpen,tutorial:{...this.tutorial},squad:this.squad(),jerky:this.jerky,build:this.building?{...this.building}:null,nearRack:this.nearRack?{hung:this.nearRack.meat.length,ready:dryCount(this.nearRack,this.clock)}:null,nearTrap:this.nearTrap?{meat:this.nearTrap.meat}:null,nearOwnBuild:!!this.ownBuildNear(p)||this.traps.some(t=>Math.hypot(t.x-p.x,t.y-p.y)<30),weather:this.weatherNow(p),boss:this.caves.current?null:(this.duelBoss()??this.bossStatus(p)),duel:this.duelStatus(),shamed:this.caves.current?null:this.shamedHere(p)});}
    }
  }
  const game=new Phaser.Game({type:Phaser.AUTO,parent,width:Math.max(1,parent.clientWidth),height:Math.max(1,parent.clientHeight),pixelArt:true,roundPixels:true,backgroundColor:'#56654c',scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:'arcade',arcade:{debug:false}},scene:Wilderness,audio:{noAudio:true},input:{activePointers:4}});const resizeObserver=new ResizeObserver(()=>{if(parent.clientWidth&&parent.clientHeight)game.scale.resize(parent.clientWidth,parent.clientHeight);});resizeObserver.observe(parent);game.events.once('destroy',()=>resizeObserver.disconnect());(window as unknown as {__game?:Phaser.Game}).__game=game;return game;
}

// Southern edge of the mountain massif; flattened at the camp with rock spurs either side.
function mEdge(x:number){const base=440+55*Math.sin(x/150)+30*Math.sin(x/57+2)+18*Math.sin(x/23);const w=Math.exp(-(((x-CAMP.x)/200)**2));const spur=110*Math.exp(-(((Math.abs(x-CAMP.x)-210)/55)**2));return base*(1-w)+560*w+spur;}
