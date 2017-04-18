
declare namespace App {
  export type UnitId = string

  interface Unit {
    id: UnitId,
    type: 'player' | 'enemy',
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

  type Player = Unit & { type: 'player' }
  type Enemy  = Unit & { aiType: string, type: 'enemy' }

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

  export interface GameState {
    map: {
      width: number,
      height: number,
    },
    units: Record<UnitId, Player | Enemy>,

    // number is where they are on timeline
    timeline: Timeline,

    //
    // During battle, the game pauses as long as there is a decision to be made.
    //
    pendingDecisions: Record<UnitId, {
      action: null | string, // When a player makes a decision, this gets filled.
    }>,

    intents: Record<UnitId, ActionState>

    meta: {
      timelineWaitSize: number,
    }
  }
}
