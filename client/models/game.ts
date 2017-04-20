import * as io from 'socket.io-client'
import * as m from 'mithril'


var state: App.GameState;

var gameState: App.GameState | null = null
var userPlayer: App.Player | null = null
var isDM = false


//
// Connet to server and handle data syncing
//
var socket = io()

socket.on('gs', (step: App.Step) => {
  state = step.game
  step.effects.forEach( eff => console.log("Effect:", eff) )
  m.redraw()
})

socket.on('userPlayer', (player: App.Player) => {
  console.log("Signed in as player:", player)
  userPlayer = player
  m.redraw()
})

socket.on('dm', () => {
  isDM = true
})

//
// Return one single object for convenience
//
var api = {
  get state () {
    return state
  },
  get userPlayer () {
    return userPlayer
  },
  get isDM () {
    return isDM
  },
  get (id: string) {
    return state.units[id]
  },
  update (game: App.GameState) {
    state = game
  },
  act (actorId: string, input: App.UserInput) {
    socket.emit('user-input', actorId, input)
  }
}

export default api
