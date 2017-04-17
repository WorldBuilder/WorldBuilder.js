
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
  timeline: Timeline
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
    [10, -250],
    [20, -200],
  ]),
}


export function gameStep (game: GameState) {

  for ( let [id, pos] of game.timeline.entries() ) {
    console.log("Id,pos:", id, pos)
    var unit = game.units.get(id)

    if ( ! unit ) { continue }

    game.timeline.set(id, pos + unit.stats.speed)
  }

  return game
}
