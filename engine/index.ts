
export var initialGameState: App.GameState = {
  map: {
    width: 600,
    height: 400,
  },
  units: {
    '10': {
      id: '10',
      type: 'player',
      name: 'Alice',
      currentHp: 20,
      maxHp: 20,
      pos: { x: 0, y: 0 },
      stats: {
        speed: 10,
        str: 10,
      }
    },
    '20': {
      aiType: 'passive',
      type: 'enemy',
      id: '20',
      name: 'Goblin',
      currentHp: 20,
      maxHp: 20,
      pos: { x: 0, y: 0 },
      stats: {
        speed: 12,
        str: 10,
      }
    }
  },
  timeline: {
    '10': -251,
    '20': -200,
  },
  pendingDecision: null,

  meta: {
    timelineWaitSize: 300,
  },
}


export function gameStep (game: App.GameState) {

  //
  // Pause when a player needs to make a decision
  //
  if ( game.pendingDecision && game.pendingDecision.action === null ) {
    return game
  }

  for ( let id in game.timeline ) {
    var pos = game.timeline[id]

    var unit = game.units[id]

    if ( ! unit ) { continue }

    var wasWaiting = pos < 0
      , newPos = pos + unit.stats.speed
      , noLongerWaiting = newPos >= 0

    game.timeline[id] = newPos

    if ( unit.type === 'player' && wasWaiting && noLongerWaiting ) {
      game.timeline[id] = 0
      game.pendingDecision = { unitId: id, action: null }
    }
  }

  return { ...game }
}
