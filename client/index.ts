import * as m from 'mithril'

import Game from './models/game'

import Map from './components/map'
import Timeline from './components/timeline'
import UnitStats from './components/unit-stats'


function drawGame () {
  var game = Game.state
  if ( ! game ) return m('#ui', m('.loading', "Loading..."))
  return m('#ui',
    m('.sidebar',
      m(UnitStats, { game })
    ),
    m('.main',
      renderMapLabel(),
      m('.scroller',
        m(Map, { game })
      )
    ),
    m(Timeline, { game })
  )
}

m.mount(document.body, { view: drawGame })

function renderMapLabel () {
  var mode = Game.mapMode
  if ( mode.type === 'none' ) return m('.label')

  return m('.label', mode.label)
}
