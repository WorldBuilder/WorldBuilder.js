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
export default {
  get state () { return state },
  get userPlayer () { return userPlayer },
  get isDM () { return isDM },


  get (id: string) {
    return state.units[id]
  },
  update (game: App.GameState) {
    state = game
  },
  act (actorId: string, input: App.UserInput) {
    socket.emit('user-input', actorId, input)
  },

  get units () {
    return Object.keys(state.units).map( id => state.units[id] )
  },

  //
  // UI Helpers
  //
  focus (unitId: App.UnitId, obj?: any) {
    obj = obj || {}
    obj['data-id'] = unitId
    obj.onmouseenter = onmouseenter
    obj.onmouseleave = onmouseleave

    var className = obj.class || ''
    obj.class = (selectedUnitId === unitId) ? `${className} focused` : className
    return obj
  }
}

//
// UI helpers
//
var selectedUnitId: null | App.UnitId = null

function onmouseenter (e: any) {
  selectedUnitId = e.target.dataset.id
}
function onmouseleave (e: any) {
  if ( selectedUnitId === e.target.dataset.id ) {
    selectedUnitId = null
  }
}
