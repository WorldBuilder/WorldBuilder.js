//
// This file is shared between server & client
//
export type ActionWithType = Object & { type: string }


export function getValidTargets(game: App.GameState, actorId: string, action: ActionWithType): App.UnitId[] {

  var actor = game.units[actorId]
  var allUnits = Object.keys(game.units).map( id => game.units[id] )


  if ( actor.type === 'player' ) {
    return allUnits.filter( u => u.type === 'enemy' ).map(getId)
  }
  else if ( actor.type === 'enemy' ) {
    return allUnits.filter( u => u.type === 'player' ).map(getId)
  }
  else {
    return []
  }
}


function getId (unit: App.Unit) { return unit.id }
