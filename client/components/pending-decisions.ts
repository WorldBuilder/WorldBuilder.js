import * as m from 'mithril'
import DecisionPrompt from './battle/decision-prompt'
import Game from '../models/game'


interface Attrs {
  game: App.GameState,
  userPlayer: null | App.Player,
}

interface State {}


export default {
  view(vnode) {
    var game = vnode.attrs.game
    var uPlayer = vnode.attrs.userPlayer

    return m('.pending-decisions',

      Object.keys(game.pendingDecisions).map( unitId => {
        var pd = game.pendingDecisions[unitId]
        var unit = game.units[unitId]

        var shouldPrompt = uPlayer && uPlayer.id === unitId
                        || Game.isDM && unit.type !== 'player'

        return m(DecisionPrompt, { game, unitId, pd, prompt: !!shouldPrompt })
      })
    )
  }
} as m.Component<Attrs, State>
