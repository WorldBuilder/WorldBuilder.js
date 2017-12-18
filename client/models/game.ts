import * as io from 'socket.io-client'
import * as m from 'mithril'
import * as Stream from 'mithril/stream'
import * as Effect from './effect'


var state: App.GameState;

var gameState: App.GameState | null = null
var userPlayer: App.Player | null = null
var isDM = false

type MapMode
  = { type: 'none' }
  | { type: 'move-point', actorId: App.UnitId, label: string }
  | { type: 'skill-point', actorId: App.UnitId, label: string }

var mapMode = { type: 'none' } as MapMode

var mapHoverEvent = Stream(null as null | App.Coordinate)
var mapClickEvent = Stream(null as null | App.Coordinate)

mapHoverEvent.map( _ => m.redraw() )
mapClickEvent.map( _ => m.redraw() )

//
// Connet to server and handle data syncing
//
var socket = io({
  query: {
    id: localStorage.getItem('session:id') || '',
    password: localStorage.getItem('session:password') || '',
  }
})
socket.on('reconnect_attempt', () => { // Support Sign-out
  socket.io.opts.query = {
    id: localStorage.getItem('session:id') || '',
    password: localStorage.getItem('session:password') || '',
  }
})


socket.on('gs', (step: App.Step) => {
  state = step.game
  step.effects.forEach( eff => Effect.handle(state, eff) )
  m.redraw()
})

socket.on('userPlayer', (player: App.Player) => {
  console.log("Signed in as player:", player)
  userPlayer = player
  m.redraw()
})

socket.on('dm', () => {
  console.log("Signed in as Game Master")
  isDM = true
  m.redraw()
})

socket.on('session:unauthorized', () => {
  alert('Invalid id + password.')
  userPlayer = null
  isDM = false
  m.redraw()
})

//
// Return one single object for convenience
//
const Game = {

  mapHoverEvent: mapHoverEvent,
  mapClickEvent: mapClickEvent,

  get mapMode () { return mapMode },
  set mapMode (mode: MapMode) {
    mapMode = mode
    mapHoverEvent(null)
    mapClickEvent(null)
  },


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

    // These highlights should be irrelevant after a decision.
    Game.clearUnitFocus(['stats', 'target'])
  },

  get units () {
    return Object.keys(state.units).map( id => state.units[id] )
  },

  signIn(id: string, password: string) {
    //
    // Store local id+password for easy refreshes
    //
    localStorage.setItem('session:id', id)
    localStorage.setItem('session:password', password)
    socket.emit('sign-in', id, password)
  },
  signOut() {
    userPlayer = null
    isDM = false
    localStorage.removeItem('session:password')
    socket.close()
    socket.open()
  },

  //
  // UI Helpers
  //
  unitFocus (readTypes: string[], writeTypes: string[], unitId: App.UnitId, obj?: any) {
    obj = obj || {}
    obj['data-id'] = unitId
    obj['data-write-types'] = writeTypes.join(';;')
    obj.onmouseenter = onmouseenter
    obj.onmouseleave = onmouseleave

    var className = obj.class || ''

    var readTypes = Object.keys(selectedUnitIds)
    for (var i=0; i < readTypes.length; i++) {
      var type = readTypes[i]
      if ( selectedUnitIds[type] === unitId ) {
        className += ' focus--' + type
      }
    }

   obj.class = className
    return obj
  },
  clearUnitFocus (types: string[]) {
    types.forEach( t => delete selectedUnitIds[t] )
  }
}

export default Game

//
// UI helpers
//
var selectedUnitIds: Record<string, App.UnitId> = {}

function onmouseenter (e: any) {
  var types = e.target.dataset.writeTypes.split(';;')
  for (var i=0; i < types.length; i++) {
    selectedUnitIds[ types[i] ] = e.target.dataset.id
  }
}
function onmouseleave (e: any) {
  var types = e.target.dataset.writeTypes.split(';;')
  for (var i=0; i < types.length; i++) {
    if ( selectedUnitIds[ types[i] ] === e.target.dataset.id ) {
      delete selectedUnitIds[ types[i] ]
    }
  }
}
