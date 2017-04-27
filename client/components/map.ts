import * as m from 'mithril'
import Game from '../models/game'


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
      height: game.map.height,
      width: game.map.width,
    }

    return m('.map',
      { style, oncontextmenu: setRetreatPoint },

      m('.scroll-padding-hack'),

      Game.units.map( unit => [
        renderUnit(game, unit),
        renderRetreatPath(game, unit),
      ])
    )
  }
} as m.Component<Attrs, State>


function renderUnit (game: App.GameState, unit: App.Unit) {
  var pos = unit.pos
  var unitSize = unit.size * 2 // unit.size is radius

  var style = {
    transform: `translate(${ pos.x }px, ${ pos.y }px)`,
    width: unitSize + 'px',
    height: unitSize + 'px',
    lineHeight: unitSize + 'px',
  }

  var hp = {
    max: { width: `${unitSize - 6}px`, left: '3px' },
    current: { width: `${unit.currentHp / unit.maxHp * 100}%` },
  }

  return m('.unit', Game.focus(unit.id, { style: style, class: unit.type }),

    m('.bar-max', { style: hp.max }, m('.bar', { style: hp.current })),

    unit.name[0].toUpperCase()
  )
}


function setRetreatPoint (e: any) {
  e.preventDefault()
  var rect    = e.currentTarget.getBoundingClientRect()
    , offsetX = e.clientX - rect.left
    , offsetY = e.clientY - rect.top

  if ( Game.userPlayer ) {
    Game.act(Game.userPlayer.id, {
      type: 'set-retreat-point',
      pos: { x: offsetX, y: offsetY },
    })
  }
}


function renderRetreatPath (game: App.GameState, unit: App.Unit) {
  // TODO
  return null
}
