import * as BattleShared from './battle-shared'

//
// Re-export shared methods for server convenience
//
export * from './battle-shared'


export function handleDecision(game: App.GameState, actorId: string, args: any[]): App.Effect[] {

  if ( args[0] === 'attack' ) {
    let target = game.units[ args[1] ]
    if ( ! target ) return [];

    let validTargets = BattleShared.getValidTargets(game, actorId, args[0], args.slice(1))
    if ( ! validTargets.includes(target.id) ) {
      return [{ type: 'invalid-action', message: `Invalid target ${target.name}` }]
    }

    game.intents[actorId] = { type: 'target', target: target.id, action: 'attack' }
    delete game.pendingDecisions[actorId]

    return [{ type: 'battle:decision', actorId: actorId, targetId: target.id, action: 'attack' }]
  }

  return []
}
