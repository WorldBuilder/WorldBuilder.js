
interface Unit {
  id: number,
  name: string,
  pos: { x: number, y: number },
  currentHp: number,
  maxHp: number,
  stats: {
    speed: number,
    str: number,
  }
}

type Player = Unit
type Enemy  = Unit & { aiType: string }
type UnitId = number

type TimelinePos = number // neg is wait time, 0 is decision time, pos is act time
type Timeline = Map<UnitId,TimelinePos>

interface Game {
  map: {
    width: number,
    height: number,
  },
  players: Map<UnitId,Player>,
  enemies: Map<UnitId,Enemy>,

  // number is where they are on timeline
  timeline: Timeline
}

// ----

var game: Game = {
  map: {
    width: 600,
    height: 400,
  },
  players: new Map<UnitId,Player>([
    [10, {
      id: 10,
      name: 'Alice',
      currentHp: 20,
      maxHp: 20,
      pos: { x: 0, y: 0 },
      stats: {
        speed: 10,
        str: 10,
      }
    }]
  ]),
  enemies: new Map<UnitId,Enemy>([
    [20, {
      aiType: 'passive',
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


function gameStep (game: Game) {
  for ( let [id, pos] of game.timeline.entries() ) {
    console.log("Id,pos:", id, pos)
    var unit = game.players.get(id) || game.enemies.get(id)
  }
}

gameStep(game)
