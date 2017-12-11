import * as m from 'mithril'

var padding = 50
var actWidth = 150

interface Attrs {
  game: App.GameState
}

interface State {
  width: number
}


export default {
  oncreate(vnode) {
    vnode.state.width = vnode.dom.clientWidth - padding*2
  },
  view(vnode) {
    var game = vnode.attrs.game

    return m('.timeline',

      m('.line.wait', { style: {
        left: padding+'px',
        right: padding+actWidth+'px',
      } }),

      m('.line.action', { style: {
        width: actWidth+'px',
        right: padding+'px',
      } }),

      Object.keys(game.timeline).map( (unitId, i) => {
        var pos = game.timeline[unitId]
        var unit = game.units[unitId]
        if ( ! unit ) return;

        var max = game.meta.timelineWaitSize
        var timelineWaitWidth = vnode.state.width - actWidth

        var offset = pos.type === 'wait'
          ? (1 - pos.value / max) * timelineWaitWidth || 0
          : timelineWaitWidth + (pos.current / pos.target * actWidth)

        var style = {
          transform: `translateX(${ offset + padding }px)`,
          marginTop: (unit.type=='player' ? 5 : -25) + 'px',
        }

        return m('.unit', { style: style, class: unit.type }, m('span.marker'), unit.name)
      })
    )
  }
} as m.Component<Attrs, State>


