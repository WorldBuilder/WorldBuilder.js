import * as m from 'mithril'
(window as any).m = m // For debugging

import Game from './models/game'

import SessionPanel from './components/session-panel'
import GameUI from './components/game-ui'


function drawApp () {
  if ( Game.userPlayer || Game.isDM ) {
    return m(GameUI, { game: Game.state })
  }
  else {
    return m('#session.d-flex.flex-center',
      m('div',
        m('h1', "WorldBuilder.js"),
        m('p', "Please sign in:"),
        m(SessionPanel),
      )
    )
  }
}

m.mount(document.body, { view: drawApp })
