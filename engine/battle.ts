import * as BattleShared from './battle-shared'

//
// Re-export shared methods for server convenience
//
export * from './battle-shared'


export function handleAction(game: App.GameState, actorId: string, action: App.BattleAction): App.Effect[] {

  if ( action.type === 'attack' ) {
    let target = game.units[ action.targetId ]
    if ( ! target ) return [];

    let validTargets = BattleShared.getValidTargets(game, actorId, action)
    if ( ! validTargets.includes(target.id) ) {
      return [{ type: 'invalid-action', message: `Invalid target ${target.name}` }]
    }

    game.intents[actorId] = { type: 'target', target: target.id, action: 'attack' }
    delete game.pendingDecisions[actorId]

    return [{ type: 'battle:decision', actorId: actorId, targetId: target.id, action: 'attack' }]
  }

  return []
}
