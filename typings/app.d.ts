
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
    speed: number,
    range: number,
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
        step: number, // This increments once per frame
        limit: number, // The max number of steps before the action gets cancelled
      }
  type Timeline = Record<UnitId, TimelinePos>

  export type UserInput
    = { type: 'decision', pendingDecisionId: string, action: BattleAction }
    | { type: 'set-retreat-point', pos: Coordinate }

  export type BattleAction
    = { type: 'attack', target: UnitId }
    | { type: 'skill', skill: SkillId, target: UnitId | { x: number, y: number } }

  export type BattleActionType = 'attack' | 'skill'


  type ActionState
    = {
        type: 'passive'
      }
    | {
        type: 'target',
        target: UnitId,
        action: 'move' | 'attack' | 'skill' | 'defend'
      }
    | {
        type: 'retreat',
        pos: Coordinate
      }

  export type PendingDecision = {
    id: string, // Useful for mitigating potential slow network issues
    action: null | string, // When a player makes a decision, this gets filled.
  }

  export interface GameState {
    frame: number,
    mode: 'battle' | 'explore'
    map: {
      width: number,
      height: number,
    },
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

  export type Effect
    = {
        type: 'invalid-action',
        message: string,
      }
    | {
        type: 'battle:decision',
        actorId: UnitId,
        targetId?: UnitId,
        action: 'attack'
      }
    | {
        type: 'battle:hp',
        actorId: UnitId,
        targetId: UnitId,
        mod: number, // negative for damage, positive for heal, zero for miss.
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
      pre: number,
      post: number,
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
