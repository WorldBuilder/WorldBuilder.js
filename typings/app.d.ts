
declare namespace App {
  interface Unit {
    id: string,
    type: 'player' | 'enemy',
    name: string,
    pos: { x: number, y: number },
    currentHp: number,
    maxHp: number,
    stats: {
      speed: number,
      str: number,
    }
  }

  type Player = Unit & { type: 'player' }
  type Enemy  = Unit & { aiType: string, type: 'enemy' }
  type UnitId = string

  type TimelinePos = number // neg is wait time, 0 is decision time, pos is act time
  type Timeline = Record<UnitId, TimelinePos>


  export interface GameState {
    map: {
      width: number,
      height: number,
    },
    units: Record<UnitId, Player | Enemy>,

    // number is where they are on timeline
    timeline: Timeline,

    //
    // During battle, only one unit can make a decision at a time.
    // The battle pauses as long as there is a pending decision with a null action.
    //
    pendingDecision: null | {
      unitId: UnitId, // Which unit needs to make the decision
      action: null | string, // When a player makes a decision, this gets filled.
    },

    meta: {
      timelineWaitSize: number,
    }
  }
}
