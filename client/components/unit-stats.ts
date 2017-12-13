import * as m from 'mithril'
import DecisionPrompt from './battle/decision-prompt'
import Game from '../models/game'


interface Attrs {
  game: App.GameState,
}

interface State {}


export default {
  view(vnode) {
    var game = vnode.attrs.game
    var uPlayer = Game.userPlayer

    return m('.unit-stats-component',

      Object.keys(game.units).map( unitId => {
        var pd = game.pendingDecisions[unitId]
        var unit = game.units[unitId]

        var shouldPrompt = uPlayer && uPlayer.id === unitId
                        || Game.isDM && unit.type !== 'player'

        return m('.unit-stats', Game.unitFocus(['stats', 'target'], ['stats'], unit.id), [
          renderStats(unit),
          pd && m(DecisionPrompt, { game, unitId, pd, prompt: !!shouldPrompt }),
        ])
      })
    )
  }
} as m.Component<Attrs, State>


function renderStats (unit: App.Unit) {
  return m('.stats',
    m('h3', unit.name, m('small.debug', ` (${Math.round(unit.pos.x)},${Math.round(unit.pos.y)})`)),
    m('.stat', m('label', 'hp'), m('.value', `${unit.currentHp}/${unit.maxHp}`))
  )
}
