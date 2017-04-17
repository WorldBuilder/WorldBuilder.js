import * as m from 'mithril'

var padding = 50
var actionWidth = 150

interface Attrs {
  game: App.GameState
}

interface State {
  width: number
}


export default {
  oncreate(vnode) {
    console.log("Width", vnode.dom.clientWidth)
    vnode.state.width = vnode.dom.clientWidth - padding*2
  },
  view(vnode) {
    var game = vnode.attrs.game

    return m('.timeline',

      m('.line.wait', { style: {
        left: padding+'px',
        right: padding+actionWidth+'px',
      } }),

      m('.line.action', { style: {
        width: actionWidth+'px',
        right: padding+'px',
      } }),

      Object.keys(game.timeline).map( (unitId, i) => {
        var pos = game.timeline[unitId]
        var unit = game.units[unitId]
        if ( ! unit ) return;

        var max = game.meta.timelineWaitSize
        var timelineWaitWidth = vnode.state.width - actionWidth

        var percentPos = 1 - Math.abs(pos / max)

        var style = {
          transform: `translateX(${ timelineWaitWidth * percentPos + padding }px)`,
          marginTop: (unit.type=='player' ? 5 : -25) + 'px',
        }

        return m('.unit', { style: style, class: unit.type }, m('span.marker'), unit.name)
      })
    )
  }
} as m.Component<Attrs, State>


