import * as io from 'socket.io-client'
import * as m from 'mithril'

import Map from './components/map'
import Timeline from './components/timeline'

var socket = io()

var gameState: App.GameState | null = null

socket.on('gs', (state: App.GameState) => {
  gameState = state
  m.redraw()
})

function drawGame () {
  if ( ! gameState ) return m('#ui', m('.loading', "Loading..."))
  return m('#ui',
    m('.sidebar'),
    m('.main', m(Map, { game: gameState })),
    m(Timeline, { game: gameState })
  )
}

m.mount(document.body, { view: drawGame })
