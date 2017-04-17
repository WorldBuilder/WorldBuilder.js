import * as m from 'mithril'

var padding = 50
var actionWidth = 150

interface Attrs {
  game: App.GameState
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

    return m('.map',

      Object.keys(game.units).map( unitId => {
        var unit = game.units[unitId]
        if ( ! unit ) return;

        var pos = unit.pos

        var style = {
          transform: `translate(${ pos.x }px, ${ pos.y }px)`,
          width: unit.size*5 + 'px',
          height: unit.size*5 + 'px',
          lineHeight: unit.size*5 + 'px',
        }

        return m('.unit', { style: style, class: unit.type }, unit.name[0].toUpperCase())
      })
    )
  }
} as m.Component<Attrs, State>


