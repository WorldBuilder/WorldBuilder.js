import * as io from 'socket.io-client'
import * as m from 'mithril'

console.log('hi')

var socket = io()

socket.on('gs', (state:any) => {
  m.render(document.body, m('div',
    m('p', `x: ${state.x}`),
    m('p', `y: ${state.y}`)
  ))
})
