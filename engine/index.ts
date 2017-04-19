import * as Battle from './battle'


export var initialGameState: App.GameState = {
  frame: 0,
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

  inputs: {},

  meta: {
    timelineWaitSize: 1000,
  },
}


var idCounter = 1

export function gameStep (game: App.GameState): App.Step {
  var effects: App.Effect[] = []
  //
  // Handle user input, which may resolve pending decisions
  //
  for ( let id in game.inputs ) {
    let input = game.inputs[id]
    let pd = game.pendingDecisions[id]

    //
    // When resolving pending decisions,
    // the first arg is the target decision to resolve.
    // This ensures a spam click or slow connection doesn't
    // accidently make the player decide multiple things.
    //
    if ( game.mode === 'battle' && pd && pd.id === input.args[0] ) {
      var battleEffects = Battle.handleDecision(game, id, input.args.slice(1))
      effects = effects.concat(battleEffects)
    }
  }

  //
  // Pause when a player needs to make a decision
  //
  if ( hasPendingBattleDecision(game) ) {
    return { game, effects }
  }

  //
  // Handle timeline ticks
  //
  for ( let id in game.timeline ) {
    let pos = game.timeline[id]

    let unit = game.units[id]
    if ( ! unit ) {
      console.warn('[timeline] No such unit:', id)
      continue
    }

    let wasWaiting = pos < 0
      , newPos = pos + unit.stats.resilience/10
      , noLongerWaiting = newPos >= 0

    game.timeline[id] = newPos

    if ( wasWaiting && noLongerWaiting ) {
      game.pendingDecisions[id] = { id: String(idCounter++), action: null }
    }
  }

  //
  // Handle active intents
  //
  for ( let id in game.intents ) {
    let intent = game.intents[id]

    let unit = game.units[id]
    if ( ! unit ) {
      console.warn('No such unit:', id)
      continue
    }
    if ( intent.type === 'passive' ) continue;

    let target = game.units[intent.target]
    if ( ! target ) {
      console.warn('No such target:', intent.target)
      continue
    }


    if ( intent.action === 'move' ) {
      let dir = { x: target.pos.x - unit.pos.x, y: target.pos.y - unit.pos.y }
      let hyp = Math.sqrt(dir.x*dir.x + dir.y*dir.y)
      dir.x /= hyp
      dir.y /= hyp

      unit.pos.x += dir.x * unit.stats.speed / 10
      unit.pos.y += dir.y * unit.stats.speed / 10
    }
  }

  //
  // Return shallow copy where copy is one frame higher than the old.
  //
  return { game: { ...game, frame: game.frame+1 }, effects: effects }
}


export function registerUserInput (game: App.GameState, actorId: string, action: string, args: any[]) {
  game.inputs[actorId] = { action, args }
  console.log("Registering user input by", actorId, { action, args })
}

function hasPendingBattleDecision (game: App.GameState) {
  return Object.keys(game.pendingDecisions)
    .filter( id => game.pendingDecisions[id].action === null )
    .length > 0
}
