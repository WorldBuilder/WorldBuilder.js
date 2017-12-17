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
    socket.emit('gs', { game: cleanGameStateForNetwork(Game.state), effects: [] })

    //
    // Attach player to connected user
    //
    // TODO: Calculate based on auth

    var isDM = false
    var userPlayer = Game.state.units['alice']
    socket.emit('userPlayer', userPlayer)

    // TODO: flag only on correct password event
    isDM = true
    socket.emit('dm')

    //
    // Register input by connected user.
    // The input will be properly handled on the next game loop iteration.
    //
    socket.on('user-input', (actorId: string, input: App.UserInput) => {
      if ( ! userPlayer && ! isDM ) return;

      if ( userPlayer && actorId !== userPlayer.id && ! isDM ) {
        //
        // Non-DMs can only control their own player unit.
        //
        actorId = userPlayer.id
      }
      GameEngine.registerUserInput(Game.state, actorId, input)
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
      console.log('disconnect')
      sub.unsubscribe()
    })
  })

}



interface GameStep {
  state: App.GameState,
  effects: App.Effect[],
}

var stateStream = multicast(
  most.generate<App.Step>(gameLoop, 1000 / Game.state.meta.fps)
    .skipRepeatsWith( (a,b) => a.game.frame === b.game.frame && b.effects.length === 0 )
    .map( (data) => {
      data.game = cleanGameStateForNetwork(data.game)
      return data
    })
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

function cleanGameStateForNetwork (game: App.GameState) {
  //
  // Don't send over binary data
  //
  var clean = { ...game }
  clean.map = { ...clean.map }
  delete clean.map.planner
  return clean
}
