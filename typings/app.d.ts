
declare namespace App {
  export type UnitId = string

  interface UnitBase {
    id: UnitId,
    name: string,
    size: number,
    pos: { x: number, y: number },
    currentHp: number,
    maxHp: number,
    stats: {
      resilience: number,
      speed: number,
      str: number,
    }
  }


  export type Unit = Player | Enemy
  export type Player = { type: 'player' } & UnitBase
  export type Enemy  = { type: 'enemy', aiType: string } & UnitBase

  type TimelinePos = number // neg is wait time, 0 is decision time, pos is act time
  type Timeline = Record<UnitId, TimelinePos>


  type ActionState
    = {
        type: 'passive'
      }
    | {
        type: 'target',
        target: UnitId,
        action: 'move' | 'attack' | 'cast' | 'defend'
      }

  export type PendingDecision = {
    id: string, // Useful for mitigating potential slow network issues
    action: null | string, // When a player makes a decision, this gets filled.
  }

  export interface GameState {
    mode: 'battle' | 'explore'
    map: {
      width: number,
      height: number,
    },
    units: Record<UnitId, Unit>,

    // number is where they are on timeline
    timeline: Timeline,

    //
    // During battle, the game pauses as long as there is a decision to be made.
    //
    pendingDecisions: Record<UnitId, PendingDecision>,

    intents: Record<UnitId, ActionState>

    meta: {
      timelineWaitSize: number,
    }
  }
}
