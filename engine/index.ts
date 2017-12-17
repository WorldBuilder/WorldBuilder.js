import * as Battle from './battle'
import * as GameAssets from './game-assets'

type Unit = App.Unit
type Effect = App.Effect
type GameState = App.GameState
type UserInput = App.UserInput
type UnitStats = App.UnitStats
type SkillEffect = App.SkillEffect

GameAssets.sync()

export var initialGameState: GameState = {
  frame: 0,
  mode: 'battle',
  map: GameAssets.loadMap('example'),
  units: {
    'gob_1': {
      aiType: 'passive',
      type: 'enemy',
      id: 'gob_1',
      name: 'Goblin',
      size: 20,
      currentHp: 14,
      maxHp: 20,
      pos: { x: 3, y: 4 },
      skills: ['melee-attack', 'wind-up-punch'],
      stats: {
        con: 10,
        dex: 14,
        int: 10,
        mov: 35,
        str: 11,
        wis: 10,
      }
    }
  },
  timeline: {
    'gob_1': { type: 'wait', value: 120 },
  },

  pendingDecisions: {},

  intents: {
    'gob_1': { type: 'passive' },
  },

  inputs: {},

  meta: {
    name: GameAssets.settings.gameName,
    timelineWaitSize: 30 * 10, // 10 seconds
    fps: 30,
    skills: GameAssets.skills,
    movementStartup: 6,
    baseCooldown: 60,
  },
}

//
// Inject players into game state
//
GameAssets.players.forEach( player => {
  initialGameState.units[player.id] = player
  initialGameState.timeline[player.id] = { type: 'wait', value: 25 + Math.round(Math.random()*100) }
  initialGameState.intents[player.id] = { type: 'passive' }
})



var idCounter = 1

export function gameStep (game: GameState): App.Step {
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
  var actTime: Record<App.UnitId, App.TimelinePosAct> = {}

  for ( let id in game.timeline ) {
    let pos = game.timeline[id]

    let unit = game.units[id]
    if ( ! unit ) {
      console.warn('[timeline] No such unit:', id)
      continue
    }

    if ( pos.type === 'wait' ) {
      let wasWaiting = pos.value > 0
        , newValue = pos.value - 1
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
      pos.current += 1
      actTime[id] = pos
    }
  }

  //
  // Handle active intents
  //
  for ( let id in game.intents ) {
    const time = actTime[id]
    const intent = game.intents[id]

    if ( ! time ) {
      // Unit is not acting; they are waiting.
      // Whatever their intent is, it's gotta wait.
      continue
    }

    var timeLeft = time.target - time.current
    let unit = game.units[id]

    if ( ! unit ) {
      console.warn('No such unit:', id)
      continue
    }

    if ( intent.type === 'passive' ) {
      continue
    }
    else if ( intent.type === 'move' ) {

      if ( intent.target.x === unit.pos.x && intent.target.y === unit.pos.y && timeLeft === 0 ) {
        // Unit has reached its destination!
        promptPlayerDecision(game, unit.id)
        continue
      }

      //
      // The purpose of this logic is to make movement have both a startup and cooldown time.
      // It makes the unit move in the MIDDLE of the act bar, as opposed to the beginning or end.
      //
      var isMovementFrame = time.current === game.meta.movementStartup

      if ( timeLeft === 0 ) {
        game.timeline[unit.id] = { type: 'act', current: 0, target: game.meta.fps*2 - unit.stats.mov }
        continue
      }
      else if ( ! isMovementFrame ) {
        // Movement executes on a specific frame, mid act bar
        continue
      }

      var path: number[] = []
      var dist = game.map.planner.search(unit.pos.x, unit.pos.y, intent.target.x, intent.target.y, path)

      if ( ! Number.isFinite(dist) ) {
        effects.push({ type: 'movement-impossible', actorId: unit.id })
        promptPlayerDecision(game, unit.id, 20)
        continue
      }

      // path[0] and path[1] are the current pos of unit
      // path[2] and path[3] are the end of the next straight line
      var nextPoint = { x: path[2], y: path[3] }
      var nextPos = {
        x: calcDirection(nextPoint.x - unit.pos.x) + unit.pos.x,
        y: calcDirection(nextPoint.y - unit.pos.y) + unit.pos.y,
      }


      var blocker = unitAt(game, nextPos.x, nextPos.y)
      if ( blocker ) {
        effects.push({ type: 'movement-blocked', actorId: unit.id, blockPos: nextPos })
        promptPlayerDecision(game, unit.id, 30)
        continue
      }

      // Move unit one space towards destination
      unit.pos = nextPos
    }
    else if ( intent.type === 'target-unit' ) {

      if ( timeLeft > 0 ) {
        // Unit is still charging up
        continue
      }

      let target = game.units[intent.target]
      if ( ! target ) {
        console.warn('No such target:', intent.target)
        continue
      }

      let skill = game.meta.skills.find( s => s.name === intent.skillName )! // ts


      let dir = { x: target.pos.x - unit.pos.x, y: target.pos.y - unit.pos.y }
      let distance = Math.sqrt(dir.x*dir.x + dir.y*dir.y)

      if ( distance <= (target.size + unit.size + skill.range) ) {
        //
        // Target is within range of skill
        //
        var gameEffects = skill.effects
          .map( eff => applySkillEffect(game, unit, target, eff) )

        effects = effects.concat(...gameEffects)

        //
        // The skill has been performed; we're done (for now).
        //
        game.timeline[id] = { type: 'wait', value: game.meta.baseCooldown + skill.time.cooldown*game.meta.fps }
        game.intents[id] = { type: 'passive' }
      }
      else {
        //
        // TODO: NOTIFY PLAYER THAT UNIT IS OUT OF RANGE
        //
      }
    }
  }

  //
  // Return shallow copy where copy is one frame higher than the old.
  //
  return { game: { ...game, frame: game.frame+1 }, effects: effects }
}


export function registerUserInput (game: GameState, actorId: string, input: UserInput) {
  game.inputs[actorId] = input
  console.log("Registering user input by", actorId, input)
}

function hasPendingBattleDecision (game: GameState) {
  return Object.keys(game.pendingDecisions)
    .filter( id => game.pendingDecisions[id].action === null )
    .length > 0
}


function applySkillEffect (game: GameState, actor: Unit, target: Unit, effect: SkillEffect): Effect[] {

  if ( effect.type === 'damage' ) {
    let damage = effect.amount
    for (let stat in effect.scale) {
      damage += actor.stats[stat as keyof UnitStats] * effect.scale[stat as keyof UnitStats]
    }

    target.currentHp = Math.max(target.currentHp - damage, 0)

    return [{ type: 'battle:hp', actorId: actor.id, targetId: target.id, mod: 0-damage }]
  }
  else if ( effect.type === 'setback' ) {
    var time = game.timeline[target.id]

    if ( time.type === 'act' && time.current < time.target ) {
      // Target got hit by skill while charging up! Ouch!
      var setback = effect.amount * game.meta.fps
      time.current = Math.max(0, time.current - setback)
      return [{ type: 'battle:setback', actorId: actor.id, targetId: target.id, amount: setback }]
    }
    else {
      return []
    }
  }
  else {
    return []
  }
}

function promptPlayerDecision (game: GameState, unitId: App.UnitId, afterFrames=1) {
  game.timeline[unitId] = { type: 'wait', value: afterFrames }
  game.intents[unitId] = { type: 'passive' }
}

function unitAt (game: GameState, x: number, y: number) {
  return Object.keys(game.units).find( id =>
    game.units[id].pos.x === x && game.units[id].pos.y === y
  )
}

function calcDirection (x: number) {
  if ( x === 0 ) return 0
  return x < 0 ? -1 : 1
}
