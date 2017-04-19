import { Application } from 'express'
import { Server } from 'http'
import * as SocketIO from 'socket.io'
import * as most from 'most'
import multicast from '@most/multicast'
import DeepDiff = require('deep-diff')

import Game from '../models/game'
import * as GameEngine from '../../engine'


export default function configWebsockets (server: Server) {

  var io = SocketIO(server, {})

  io.on('connection', socket => {
    console.log("a user connected")
    socket.emit('gs', Game.state)

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
    .tap( _ => console.log("STEP", x++, Game.state.timeline, Game.state.pendingDecisions) )
)


function * gameLoop (frame: number) {

  while (true) {
    Game.state = GameEngine.gameStep(Game.state)
    yield delayPromise(frame, Game.state)
  }
}


function delayPromise<T>(ms: number, value: T) {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(value), ms)
  })
}
