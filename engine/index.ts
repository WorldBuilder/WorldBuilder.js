import * as Battle from './battle'
import * as GameAssets from './game-assets'


GameAssets.sync()

export var initialGameState: App.GameState = {
  frame: 0,
  mode: 'battle',
  map: {
    width: 800,
    height: 400,
  },
  units: {
    '10': {
      id: '10',
      type: 'player',
      name: 'Alice',
      size: 25,
      currentHp: 30,
      maxHp: 30,
      pos: { x: 100, y: 100 },
      skills: ['singe'],
      stats: {
        resilience: 50,
        speed: 10,
        range: 5,
        str: 10,
        mag: 5,
        wis: 1,
      }
    },
    '20': {
      aiType: 'passive',
      type: 'enemy',
      id: '20',
      name: 'Goblin',
      size: 20,
      currentHp: 14,
      maxHp: 20,
      pos: { x: 300, y: 200 },
      skills: [],
      stats: {
        resilience: 50,
        speed: 20,
        range: 5,
        str: 10,
        mag: 2,
        wis: 1,
      }
    }
  },
  timeline: {
    '10': { type: 'wait', value: 750 },
    '20': { type: 'wait', value: 750 },
  },
  retreatPoints: {
    '10': { x: 100, y: 200 },
    '20': { x: 300, y: 150 },
  },

  pendingDecisions: {},

  intents: {
    '10': { type: 'passive' },
    '20': { type: 'passive' },
  },

  inputs: {},

  meta: {
    timelineWaitSize: 1000,
    fps: 30,
    skills: GameAssets.skills,
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
    // Inputs only last a single frame
    //
    delete game.inputs[id]

    // TODO: Move to another file if this gets too big

    //
    // When resolving pending decisions,
    // a target decision to resolve is provided (pd.id).
    // This ensures a spam click or slow connection doesn't
    // accidently make the player decide multiple, different things.
    //
    if (
      game.mode === 'battle'
      && input.type === 'decision'
      && pd && pd.id === input.pendingDecisionId
    ) {
      var battleEffects = Battle.handleAction(game, id, input.action)
      effects = effects.concat(battleEffects)
    }

    else if ( input.type === 'set-retreat-point' ) {
      game.retreatPoints[id] = input.pos
      effects.push({ type: 'retreat-point', actorId: id, pos: input.pos })
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

    if ( pos.type === 'wait' ) {
      let wasWaiting = pos.value > 0
        , newValue = Math.max(pos.value - unit.stats.resilience/10, 0)
        , noLongerWaiting = newValue === 0

      game.timeline[id] = { type: 'wait', value: newValue }

      if ( wasWaiting && noLongerWaiting ) {
        //
        // The unit has cross the timeline act mark.
        // Store a "decision slot" in the game state,
        // causing the game to pause until the unit makes a decision.
        //
        game.pendingDecisions[id] = { id: String(idCounter++), action: null }
      }
    }
    else if ( pos.type === 'act' ) {

      pos.step += 1

      if ( pos.step >= pos.limit ) {
        // TODO: Set back differently based on action
        game.timeline[id] = { type: 'wait', value: game.meta.timelineWaitSize }
        game.intents[id] = { type: 'passive' }
      }
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


    if ( intent.type === 'target' ) {

      let target = game.units[intent.target]
      if ( ! target ) {
        console.warn('No such target:', intent.target)
        continue
      }


      if ( intent.action === 'attack' ) {
        let dir = { x: target.pos.x - unit.pos.x, y: target.pos.y - unit.pos.y }
        let distance = Math.sqrt(dir.x*dir.x + dir.y*dir.y)

        if ( distance <= (target.size + unit.size + unit.stats.range) ) {
          // Target is within range of attack
          var damage = unit.stats.str + Math.round( Math.random() * unit.stats.str * 0.25 )
          target.currentHp = Math.max(target.currentHp - damage, 0)

          effects.push({ type: 'battle:hp', actorId: unit.id, targetId: target.id, mod: 0-damage })

          game.intents[unit.id] = { type: 'retreat', pos: game.retreatPoints[unit.id] }
        }
        else {
          // Move towards target
          dir.x /= distance
          dir.y /= distance

          unit.pos.x += dir.x * unit.stats.speed / 10
          unit.pos.y += dir.y * unit.stats.speed / 10
        }
      }

    }
    else if ( intent.type === 'retreat' ) {

      // Move towards point
      let dir = { x: intent.pos.x - unit.pos.x, y: intent.pos.y - unit.pos.y }
      let distance = Math.sqrt(dir.x*dir.x + dir.y*dir.y)

      if ( distance > 1 ) {
        dir.x /= distance
        dir.y /= distance

        unit.pos.x += dir.x * unit.stats.speed / 10
        unit.pos.y += dir.y * unit.stats.speed / 10
      }

    }
  }

  //
  // Return shallow copy where copy is one frame higher than the old.
  //
  return { game: { ...game, frame: game.frame+1 }, effects: effects }
}


export function registerUserInput (game: App.GameState, actorId: string, input: App.UserInput) {
  game.inputs[actorId] = input
  console.log("Registering user input by", actorId, input)
}

function hasPendingBattleDecision (game: App.GameState) {
  return Object.keys(game.pendingDecisions)
    .filter( id => game.pendingDecisions[id].action === null )
    .length > 0
}
