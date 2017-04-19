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
  action: null | string,
  validTargets: null | Array<string>,
}


export default {
  oninit(vnode) {
    vnode.state.action = null
    vnode.state.validTargets = null
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
  return m('.decision.prompt',
    m('h3', "Decide your decision:"),
    m('button', { onclick: ()=> selectAction(state, attrs, 'attack', []) }, "Attack"),
    m('button', { onclick: ()=> selectAction(state, attrs, 'defend', []) }, "Defend"),
    m('button', { onclick: ()=> selectAction(state, attrs, 'evade',  []) }, "Evade"),


    state.action &&
    m('ul.targets',
      state.validTargets && state.validTargets.length === 0
        ? m('h4', "No valid targets.")
        : state.validTargets
        ? state.validTargets.map( id =>
            m('li', { onclick: ()=> executeAction(state, attrs, [id]) }, `${ state.action }: ${Game.get(id).name}`)
          )
        : null
    )
  )
}


function selectAction(state: State, attrs: Attrs, action: string, args: any[]) {
  state.action = action
  state.validTargets =
      action === 'attack'
    ? Battle.getValidTargets(attrs.game, attrs.unitId, action, args)
    : null
}

function executeAction(state: State, attrs: Attrs, args: any[]) {
  console.log("Executing", state.action, args)
}
