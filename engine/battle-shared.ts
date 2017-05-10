//
// This file is shared between server & client
//
export type TargetQuery
  = { type: 'attack' }
  | { type: 'skill', skill: App.SkillId }
  // | { type: 'defend' }
  // | { type: 'evade' }

export type ValidTargets = App.UnitId[] | App.RadiusTarget


export function getValidTargets (game: App.GameState, actorId: string, query: TargetQuery): ValidTargets {

  var actor = game.units[actorId]
  var allUnits = Object.keys(game.units).map( id => game.units[id] )

  if ( query.type === 'skill' ) {
    return getSkillValidTargets(game, actor, game.meta.skills.find( s => s.name === query.skill )!)
  }
  else if ( actor.type === 'player' ) {
    return allUnits.filter( u => u.type === 'enemy' ).map(getId)
  }
  else if ( actor.type === 'enemy' ) {
    return allUnits.filter( u => u.type === 'player' ).map(getId)
  }
  else {
    return []
  }
}


function getSkillValidTargets (game: App.GameState, actor: App.Unit, skill: App.Skill): ValidTargets {
  if ( skill.target.type === 'single' ) {
    let validTargets: ValidTargets = []

    if ( skill.target.valid === 'ally' || skill.target.valid === 'any' ) {
      let allyTargets = unitsOfType( allyTypeFor(actor), game )
      validTargets = validTargets.concat( allyTargets.map(getId) )
    }

    if ( skill.target.valid === 'enemy' || skill.target.valid === 'any' ) {
      let enemyTargets = unitsOfType( enemyTypeFor(actor), game )
      validTargets = validTargets.concat( enemyTargets.map(getId) )
    }

    return validTargets
  }
  else if ( skill.target.type === 'radius' ) {
    return skill.target
  }
  else {
    return [] // ts
  }
}


function unitsOfType (type: 'player' | 'enemy', game: App.GameState) {
  return Object.keys(game.units)
    .filter( id => game.units[id].type === type )
    .map( id => game.units[id] )
}
function getId (unit: App.Unit) { return unit.id }


function allyTypeFor (unit: App.Unit) {
  return unit.type === 'player' ? 'player' : 'enemy'
}
function enemyTypeFor (unit: App.Unit) {
  return unit.type === 'player' ? 'enemy' : 'player'
}
