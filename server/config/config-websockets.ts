import { Application } from 'express'
import { Server } from 'http'
import * as SocketIO from 'socket.io'
import * as most from 'most'
import multicast from '@most/multicast'
import DeepDiff = require('deep-diff')

import * as GameEngine from '../../engine'


export default function configWebsockets (server: Server) {

  var io = SocketIO(server, {})

  io.on('connection', socket => {
    console.log("a user connected")
    socket.emit('gs', state)

    var sub = stateStream.subscribe({
      next: (state) => socket.emit('gs', state),
      complete: () => socket.disconnect(),
      error: (err) => {
        console.log("Error:", err)
        socket.disconnect()
      }
    })

    socket.on('disconnect', () => {
      console.log('nooo')
      sub.unsubscribe()
    })
  })

}


var x=0;
var stateStream = multicast(
  most.generate(gameLoop, 33)
    .skipRepeats()
    .tap( _ => console.log("STEP", x++, state.timeline) )
)


var state = GameEngine.initialGameState

function * gameLoop (frame: number) {

  while (true) {
    state = GameEngine.gameStep(state)
    yield delayPromise(frame, state)
  }
}


function delayPromise<T>(ms: number, value: T) {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(value), ms)
  });
}
