
interface Unit {
  id: number,
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
type UnitId = number

type TimelinePos = number // neg is wait time, 0 is decision time, pos is act time
type Timeline = Map<UnitId,TimelinePos>


export interface GameState {
  map: {
    width: number,
    height: number,
  },
  units: Map<UnitId, Player | Enemy>,

  // number is where they are on timeline
  timeline: Timeline,

  //
  // During battle, only one unit can make a decision at a time.
  // The battle pauses as long as there is a pending decision with a null action.
  //
  pendingDecision: null | {
    unitId: UnitId, // Which unit needs to make the decision
    action: null | string, // When a player makes a decision, this gets filled.
  }
}

// ----

export var initialGameState: GameState = {
  map: {
    width: 600,
    height: 400,
  },
  units: new Map<UnitId, Player | Enemy>([
    [10, {
      id: 10,
      type: 'player',
      name: 'Alice',
      currentHp: 20,
      maxHp: 20,
      pos: { x: 0, y: 0 },
      stats: {
        speed: 10,
        str: 10,
      }
    }],
    [20, {
      aiType: 'passive',
      type: 'enemy',
      id: 20,
      name: 'Goblin',
      currentHp: 20,
      maxHp: 20,
      pos: { x: 0, y: 0 },
      stats: {
        speed: 12,
        str: 10,
      }
    }]
  ]),
  timeline: new Map<UnitId,TimelinePos>([
    [10, -251],
    [20, -200],
  ]),
  pendingDecision: null,
}


export function gameStep (game: GameState) {

  //
  // Pause when a player needs to make a decision
  //
  if ( game.pendingDecision && game.pendingDecision.action === null ) {
    return game
  }

  for ( let [id, pos] of game.timeline.entries() ) {
    console.log("Id,pos:", id, pos)
    var unit = game.units.get(id)

    if ( ! unit ) { continue }

    var wasWaiting = pos < 0
      , newPos = pos + unit.stats.speed
      , noLongerWaiting = newPos >= 0

    game.timeline.set(id, newPos)

    if ( unit.type === 'player' && wasWaiting && noLongerWaiting ) {
      // Goal: Pause
      // Goal: Prompt player to decide their decision
      game.timeline.set(id, 0)
      game.pendingDecision = { unitId: id, action: null }
    }
  }

  return game
}
