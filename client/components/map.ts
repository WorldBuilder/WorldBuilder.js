import * as m from 'mithril'
import Game from '../models/game'

var getClickPoint = require('mouse-event-offset')


interface Attrs {
  game: App.GameState,
}

interface State {
  selected: null | App.UnitId
}


export default {
  oninit(vnode) {
    vnode.state.selected = null
  },
  view(vnode) {
    var game = vnode.attrs.game

    var style = {
      'background-image': `url(${ game.map.imageUrl })`,
      height: game.map.height * game.map.tileSize,
      width: game.map.width * game.map.tileSize,
    }

    return m('.map#map',
      { style, onclick: handleClick, oncontextmenu: handleRightClick },

      m('.scroll-padding-hack'),

      // Sort by y position to avoid DOM bug where health bars get
      // overlaid by other units
      Game.units.sort((a,b) => a.pos.y - b.pos.y).map( unit => [
        renderUnit(game, unit),
      ]),

      Game.mapMode.type === 'move-point' && renderMovePaths(game, Game.mapMode.actorId),
    )
  }
} as m.Component<Attrs, State>


function renderUnit (game: App.GameState, unit: App.Unit) {
  var pos = unit.pos
  var unitSize = unit.size * 1 // unit.size is radius

  var unitStyle = {
    width: unitSize + 'px',
    height: unitSize + 'px',
    lineHeight: unitSize + 'px',
  }
  var posStyle = {
    transform: `translate(${ pos.x * game.map.tileSize }px, ${ pos.y * game.map.tileSize }px)`,
  }

  var hp = {
    max: { width: `${unitSize - 6}px`, left: '3px' },
    current: { width: `${unit.currentHp / unit.maxHp * 100}%` },
  }

  return m(`.unit[data-unit-id=${unit.id}]`, { style: posStyle },
    // This body div is necessary for easier animation manipulation
    m('.body',
      Game.unitFocus(['stats', 'target'], ['stats'], unit.id, { style: unitStyle, class: unit.type }),

      m('.bar-max', { style: hp.max }, m('.bar', { style: hp.current })),

      unit.name[0].toUpperCase()
    )
  )
}

function renderMovePaths (game: App.GameState, actorId: App.UnitId) {
  var selected = Game.mapClickEvent()
  var considering = Game.mapHoverEvent()
  // TODO: USE l1-path-finder TO RENDER STUFF ON SCREEN
  return null
}


function handleClick (e: Event) {
  var [ex, ey] = getClickPoint(e)
  Game.mapClickEvent({
    x: Math.floor(ex / Game.state.map.tileSize),
    y: Math.floor(ey / Game.state.map.tileSize),
  })
}

function handleRightClick (e: Event) {
  e.preventDefault()
  // TODO
}
