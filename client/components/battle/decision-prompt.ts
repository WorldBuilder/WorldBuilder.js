import * as m from 'mithril'
import Game from '../../models/game'
import * as Battle from '../../../engine/battle-shared'


interface Attrs {
  game: App.GameState,
  pd: App.PendingDecision,
  unitId: string,
  prompt: boolean,
}

interface State {
  action: null | Battle.ActionWithType,
  validTargets: Array<string>,
}


export default {
  oninit(vnode) {
    vnode.state.action = null
    vnode.state.validTargets = []
  },
  view(vnode) {
    return m('.decision-prompt',
      vnode.attrs.prompt ? renderPrompt(vnode) : renderStatus(vnode)
    )
  }
} as m.Component<Attrs, State>


type HelperParams = { state: State, attrs: Attrs }

function renderStatus ({ state, attrs }: HelperParams) {
  var unit = Game.get( attrs.unitId )
  return m('.decision.status',
    attrs.pd.action
      ? `${unit.name} has made their decision!`
      : `Waiting for ${unit.name}'s decision...`
  )
}

function renderPrompt ({ state, attrs }: HelperParams) {
  var unit = Game.get( attrs.unitId )

  return m('.decision.prompt',

    Game.userPlayer && unit.id === Game.userPlayer.id
      ? m('h3', "Decide your decision:")
      : m('h3', `${unit.name}'s Move:`)
    ,

    m('button', { onclick: ()=> selectAction(state, attrs, { type: 'attack' }) }, "Attack"),
    m('button', { onclick: ()=> selectAction(state, attrs, { type: 'defend' }) }, "Defend"),
    m('button', { onclick: ()=> selectAction(state, attrs, { type: 'evade'  }) }, "Evade"),


    state.action &&
    m('ul.targets',
      state.validTargets.length === 0
        ? m('h4', "No valid targets.")
        : state.validTargets.map( targetId =>
            m('li', {
              onclick: ()=> Game.act(unit.id, {
                type: 'decision',
                pendingDecisionId: attrs.pd.id,
                action: { type: 'attack', targetId: targetId }
              })
            }, `${ state.action!.type }: ${Game.get(targetId).name}`)
          )
    )
  )
}

function selectAction(state: State, attrs: Attrs, action: Battle.ActionWithType) {
  state.action = action
  state.validTargets =
      action.type === 'attack'
    ? Battle.getValidTargets(attrs.game, attrs.unitId, action)
    : []
}
