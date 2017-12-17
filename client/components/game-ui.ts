import * as m from 'mithril'
import Game from '../models/game'

import Map from './map'
import Timeline from './timeline'
import UnitStats from './unit-stats'


interface Attrs {
  game: App.GameState
}

interface State {}


export default {
  view({ attrs }) {
    var game = attrs.game
    if ( ! game ) return m('#ui', m('.loading', "Loading..."))

    return m('#ui',
      m('.sidebar',
        m(UnitStats, { game }),
        m('.text-center',
          m('button', { onclick: Game.signOut }, "Sign out"),
        )
      ),
      m('.main',
        renderMapLabel(),
        m('.scroller',
          m(Map, { game })
        ),
        m(Timeline, { game })
      ),
    )
  }
} as m.Component<Attrs, State>


function renderMapLabel () {
  var mode = Game.mapMode
  if ( mode.type === 'none' ) return m('.label')

  return m('.label', mode.label)
}
