import { Application } from 'express'
import { Server } from 'http'
import * as SocketIO from 'socket.io'
import * as most from 'most'
import multicast from '@most/multicast'
import DeepDiff = require('deep-diff')


export default function configWebsockets (server: Server) {

  var io = SocketIO(server, {})

  io.on('connection', socket => {
    console.log("a user connected")

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


interface GameState {
  x: number,
  y: number,
}



var stateStream = multicast( most.generate(gameLoop, 1000) )


function * gameLoop (frame: number) {
  var state = {
    x: 10,
    y: 20,
  }

  while (true) {
    state = step(state)
    yield delayPromise(frame, state)
  }
}

var x=0;
function step (state: GameState) {
  console.log("STEP", x++)

  for (var i=0; i < 5; i++) {
    if ( Math.random() > 0.5 ) {
      state.x += Math.random() > 0.5 ? 1 : -1
    }
    else {
      state.y += Math.random() > 0.5 ? 1 : -1
    }
  }

  return state
}

function delayPromise<T>(ms: number, value: T) {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(value), ms)
  });
}
