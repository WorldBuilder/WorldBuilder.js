import * as io from 'socket.io-client'
import * as m from 'mithril'

import Timeline from './components/timeline'

console.log('hi')

var socket = io()

socket.on('gs', (state: App.GameState) => {

  m.render(document.body, m('#ui',
    m('.sidebar'),
    m('.main'),
    m(Timeline, { game: state })
  ))
})
