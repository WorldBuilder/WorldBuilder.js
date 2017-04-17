import { GameState } from '../engine'
import * as io from 'socket.io-client'
import * as m from 'mithril'

console.log('hi')

var socket = io()

socket.on('gs', (state: GameState) => {

  m.render(document.body, m('div',
    renderTimeline(state)
  ))
})


function renderTimeline (state: GameState) {
  return m('.timeline',
    Object.keys(state.timeline).map( (unitId, i) => {
      var pos = state.timeline[unitId]
      var unit = state.units[unitId]
      if ( ! unit ) return;

      var max = state.meta.timelineWaitSize
      var timelineWaitWidth = 750

      var percentPos = 1 - Math.abs(pos / max)

      console.log(i, percentPos, '->', timelineWaitWidth * percentPos)

      var style = {
        transform: `translateX(${ timelineWaitWidth * percentPos }px)`,
        top: (i * 25 * (unit.type=='player' ? -1 : 1)) + 'px',
      }

      return m('.unit', { style: style }, unit.name)
    })
  )
}
