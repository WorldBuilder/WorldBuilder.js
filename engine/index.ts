import * as Battle from './battle'


export var initialGameState: App.GameState = {
  mode: 'battle',
  map: {
    width: 600,
    height: 400,
  },
  units: {
    '10': {
      id: '10',
      type: 'player',
      name: 'Alice',
      size: 10,
      currentHp: 20,
      maxHp: 20,
      pos: { x: 100, y: 100 },
      stats: {
        resilience: 50,
        speed: 10,
        str: 10,
      }
    },
    '20': {
      aiType: 'passive',
      type: 'enemy',
      id: '20',
      name: 'Goblin',
      size: 8,
      currentHp: 14,
      maxHp: 20,
      pos: { x: 300, y: 200 },
      stats: {
        resilience: 50,
        speed: 12,
        str: 10,
      }
    }
  },
  timeline: {
    '10': -750,
    '20': -750,
  },
  pendingDecisions: {},

  intents: {
    '10': { type: 'passive' },
    '20': { type: 'target', target: '10', action: 'move' },
  },

  meta: {
    timelineWaitSize: 1000,
  },
}


var idCounter = 1

export function gameStep (game: App.GameState) {

  //
  // Pause when a player needs to make a decision
  //
  if ( hasPendingBattleDecision(game) ) {
    return game
  }

  for ( let id in game.timeline ) {
    var pos = game.timeline[id]

    var unit = game.units[id]
    if ( ! unit ) {
      console.warn('[timeline] No such unit:', id)
      continue
    }

    var wasWaiting = pos < 0
      , newPos = pos + unit.stats.resilience/10
      , noLongerWaiting = newPos >= 0

    game.timeline[id] = newPos

    if ( wasWaiting && noLongerWaiting ) {
      game.pendingDecisions[id] = { id: String(idCounter++), action: null }
    }
  }

  for ( let id in game.intents ) {
    var intent = game.intents[id]

    var unit = game.units[id]
    if ( ! unit ) {
      console.warn('No such unit:', id)
      continue
    }
    if ( intent.type === 'passive' ) continue;

    var target = game.units[intent.target]
    if ( ! target ) {
      console.warn('No such target:', intent.target)
      continue
    }


    if ( intent.action === 'move' ) {
      var dir = { x: target.pos.x - unit.pos.x, y: target.pos.y - unit.pos.y }
      var hyp = Math.sqrt(dir.x*dir.x + dir.y*dir.y)
      dir.x /= hyp
      dir.y /= hyp

      unit.pos.x += dir.x * unit.stats.speed / 10
      unit.pos.y += dir.y * unit.stats.speed / 10
    }
  }

  //
  // Return shallow copy to bypass duplicate checks
  //
  return { ...game }
}


export function applyAction (game: App.GameState, actorId: string, action: string, args: any[]) {

  if ( game.mode === 'battle' && game.pendingDecisions[actorId] ) {
    return Battle.handleDecision(game, actorId, action, args)
  }
  else {
    return game
  }
}

function hasPendingBattleDecision (game: App.GameState) {
  return Object.keys(game.pendingDecisions)
    .filter( id => game.pendingDecisions[id].action === null )
    .length > 0
}
