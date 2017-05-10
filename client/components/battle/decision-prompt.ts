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
  actionType: null | App.BattleActionType,
  skill: null | App.SkillId,
  validTargets: null | Battle.ValidTargets,
}


export default {
  oninit(vnode) {
    vnode.state.actionType = null
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
  var unit = Game.get( attrs.unitId )

  var actionType = state.actionType

  return m('.decision.prompt',

    Game.userPlayer && unit.id === Game.userPlayer.id
      ? m('h3', "Decide your decision:")
      : m('h3', `${unit.name}'s Move:`)
    ,

    m('button', { onclick: ()=> selectAction(state, attrs, 'attack') }, "Attack"),

    unit.skills.length > 0 &&
    m('button', { onclick: ()=> selectAction(state, attrs, 'skill') }, "Skill"),

    // m('button', { onclick: ()=> selectAction(state, attrs, 'defend') }, "Defend"),
    // m('button', { onclick: ()=> selectAction(state, attrs, 'evade') }, "Evade"),


    actionType === 'skill' &&
    m('ul.options',
      unit.skills.map( skillId =>
        m('li', {
          class: actionType && actionType === 'skill' && state.skill === skillId ? 'active' : '',
          onclick: ()=> {
            state.skill = skillId
            selectAction(state, attrs, 'skill')
          },
        }, `Use skill: ${skillId}`)
      )
    ),

    promptTarget(state, attrs)
  )
}

function selectAction(state: State, attrs: Attrs, action: App.BattleActionType) {
  state.actionType = action

  if ( action === 'skill' && ! state.skill ) {
    state.validTargets = null
    return;
  }

  if ( action === 'attack' ) {
    state.validTargets = Battle.getValidTargets(attrs.game, attrs.unitId, { type: action })
  }
  else if ( action === 'skill' && state.skill ) {
    state.validTargets = Battle.getValidTargets(attrs.game, attrs.unitId, { type: action, skill: state.skill })
  }
  else {
    state.validTargets = []
  }
}

function promptTarget (state: State, attrs: Attrs) {
  const actionType = state.actionType
  var targets = state.validTargets

  if ( ! actionType || ! targets ) return null


  if ( Array.isArray(targets) ) {

    var unit = Game.get( attrs.unitId )

    if ( actionType === 'skill' ) {
      if ( ! state.skill ) return null

      return renderTargets(attrs.pd.id, unit, targets, { type: 'skill', skill: state.skill, target: '' })
    }
    else if ( actionType === 'attack' ) {
      return renderTargets(attrs.pd.id, unit, targets, { type: 'attack', target: '' })
    }

  }

  // TODO: SET VIEW STATE TO ACCEPT POINT FOR AOE RADIUS
  return m('h4', 'Select point on map')
}


function renderTargets (pdid: string, actor: App.Unit, targets: App.UnitId[], action: App.BattleAction) {
  return m('ul.options',
    targets.length === 0
      ? m('h4', "No valid targets.")
      : targets.map( targetId => {
          var a = action
          return m('li', {
            onclick: ()=> Game.act(actor.id, {
              type: 'decision',
              pendingDecisionId: pdid,
              action: { ...action, target: targetId }
            })
          }, `${ a.type === 'skill' ? a.skill : a.type }: ${Game.get(targetId).name}`)
        })
    )
}
