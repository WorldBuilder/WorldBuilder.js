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
    socket.emit('gs', { game: Game.state, effects: [] })

    //
    // Attach player to connected user
    //
    // TODO: Calculate based on auth
    var userPlayer = Game.state.units['10']
    socket.emit('userPlayer', userPlayer)


    //
    // Register input by connected user.
    // The input will be properly handled on the next game loop iteration.
    //
    socket.on('user-input', (action: string, args: any[]) => {
      GameEngine.registerUserInput(Game.state, userPlayer.id, action, args)
    })

    //
    // Subscribe socket to streaming game state updates
    //
    var sub = stateStream.subscribe({
      next: (step) => socket.emit('gs', step),
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



interface GameStep {
  state: App.GameState,
  effects: App.Effect[],
}

var stateStream = multicast(
  most.generate<App.Step>(gameLoop, 33)
    .skipRepeatsWith( (a,b) => a.game.frame === b.game.frame && b.effects.length === 0 )
    .tap( ({ game }) => console.log("Frame", game.frame, game.timeline, game.pendingDecisions) )
)


function * gameLoop (frame: number) {

  while (true) {
    let step = GameEngine.gameStep(Game.state)
    Game.state = step.game
    yield delayPromise(frame, step)
  }
}


function delayPromise<T>(ms: number, value: T) {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(value), ms)
  })
}
