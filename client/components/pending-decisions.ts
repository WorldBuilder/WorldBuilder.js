import * as m from 'mithril'
import DecisionPrompt from './battle/decision-prompt'


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
        var shouldPrompt = uPlayer && uPlayer.id === unitId

        return m(DecisionPrompt, { game, unitId, pd, prompt: !!shouldPrompt })
      })
    )
  }
} as m.Component<Attrs, State>
