//
// This file is shared between server & client
//

export function getValidTargets(game: App.GameState, actorId: string, action: string, args: any[]) {
  var actor = game.units[actorId]
  return ['20']
}
