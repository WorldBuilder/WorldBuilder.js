
declare namespace App {
  export type UnitId = string
  export type SkillId = string

  interface UnitBase {
    id: UnitId,
    name: string,
    size: number,
    pos: Coordinate,
    currentHp: number,
    maxHp: number,
    stats: UnitStats,
    skills: SkillId[]
  }

  interface UnitStats {
    resilience: number,
    movement: number,
    str: number,
    mag: number,
    wis: number,
  }


  export type Unit = Player | Enemy
  export type Player = { type: 'player' } & UnitBase
  export type Enemy  = { type: 'enemy', aiType: null | string } & UnitBase

  type TimelinePos
    = {
        type: 'wait',
        value: number, // 0 is decision time
      }
    | {
        type: 'act',
        current: number, // This increments once per frame
        target: number, // The limit to reach before performing the action
      }
  type Timeline = Record<UnitId, TimelinePos>

  export type UserInput
    = { type: 'decision', pendingDecisionId: string, action: BattleAction }
    | { type: 'set-retreat-point', pos: Coordinate }

  export type BattleAction
    = { type: 'skill', skill: SkillId, target: UnitId | { x: number, y: number } }
    | { type: 'item', target: UnitId | { x: number, y: number } }

  export type BattleActionType = 'skill' | 'item' | 'move'


  type ActionState
    = {
        type: 'passive'
      }
    | {
        type: 'move',
        target: Coordinate,
        // cooldown: number,
      }
    | {
        type: 'target-unit',
        target: UnitId,
        skillName: SkillId,
      }
    | {
        type: 'target-point',
        target: Coordinate,
        skillName: SkillId,
      }

  export type PendingDecision = {
    id: string, // Useful for mitigating potential slow network issues
    action: null | string, // When a player makes a decision, this gets filled.
  }

  export interface GameState {
    frame: number,
    mode: 'battle' | 'explore',
    map: MapWithPlanner,
    units: Record<UnitId, Unit>,

    // number is where they are on timeline
    timeline: Timeline,

    //
    // This is the point that units will retreat towards
    // when they have leftover action points during battle.
    //
    retreatPoints: Record<UnitId, Coordinate>

    //
    // During battle, the game pauses as long as there is a decision to be made.
    //
    pendingDecisions: Record<UnitId, PendingDecision>,

    intents: Record<UnitId, ActionState>

    inputs: Record<UnitId, UserInput>,

    meta: {
      timelineWaitSize: number,
      fps: number,
      skills: Skill[],
    }
  }

  export interface Map {
    height: number,
    id: string,
    imageUrl: string,
    tileMapCols: number,
    tiles: TileType[][],
    tileSize: number,
    width: number,
  }

  export interface MapWithPlanner {
    height: number,
    id: string,
    imageUrl: string,
    tileMapCols: number,
    tiles: TileType[][],
    planner: {
      search: (x1: number, y1: number, x2: number, y2: number, out: number[]) => number
    },
    tileSize: number,
    width: number,
  }

  //
  // Unfortunately, due to the way `declare namespace` works,
  // we have to duplicate this information here.
  // Fortunately, TypeScript is structural.
  enum TileType {
    Empty = 0,
    Wall = 1,
  }


  export type Effect
    = {
        type: 'invalid-action',
        message: string,
      }
    | {
        type: 'battle:decision:skill:target',
        actorId: UnitId,
        targetId: UnitId,
        skillName: string,
      }
    | {
        type: 'battle:hp',
        actorId: UnitId,
        targetId: UnitId,
        mod: number, // negative for damage, positive for heal, zero for miss.
      }
    | {
        type: 'movement-blocked',
        actorId: UnitId,
        blockPos: Coordinate,
      }
    | {
        type: 'movement-impossible',
        actorId: UnitId,
      }
    | {
        type: 'retreat-point',
        actorId: UnitId,
        pos: Coordinate,
      }

  export type Step = { game: GameState, effects: Effect[] }


  export interface Skill {
    name: SkillId,
    range: number,
    cost: {
      mp?: number,
      sp?: number,
    },
    time: {
      chargeup: number,
      cooldown: number,
      limit: number,
    },
    target: SkillTarget,
    effects: SkillEffect[],
  }

  export type SingleTarget = { type: 'single', valid: 'ally' | 'enemy' | 'any' }
  export type RadiusTarget = { type: 'radius', size: number , affects: 'ally' | 'enemy' | 'all' }

  export type SkillTarget = SingleTarget | RadiusTarget


  export type SkillEffect
    = { type: 'damage', amount: number, scale: Record<keyof UnitStats, number> }
    | { type: 'blind', amount: number, duration: number }

  type DamageType = 'physical' | 'spell'

  //
  // Util
  //
  type Coordinate = { x: number, y: number }
}
