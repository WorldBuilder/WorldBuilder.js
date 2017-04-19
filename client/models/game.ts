import * as io from 'socket.io-client'
import * as m from 'mithril'


var state: App.GameState;

var gameState: App.GameState | null = null
var userPlayer: App.Player | null = null


//
// Connet to server and handle data syncing
//
var socket = io()

socket.on('gs', (newGameState: App.GameState) => {
  state = newGameState
  console.log("Pend?", state.pendingDecisions)

  // TODO: Calculate based on logged-in user
  var alice = state.units['10']
  if ( alice.type === 'player' ) {
    userPlayer = alice
  }

  m.redraw()
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
  update (game: App.GameState) {
    state = game
  },
  get (id: string) {
    return state.units[id]
  }
}

export default api
