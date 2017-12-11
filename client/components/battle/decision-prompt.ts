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
  choice: null | ActionChoice,
  validTargets: null | Battle.ValidTargets,
}

type ActionChoice = SkillChoice | MoveChoice

type SkillChoice = {
  type: 'skill',
  skill: null | App.SkillId,
}
type MoveChoice = {
  type: 'move',
}


export default {
  oninit(vnode) {
    vnode.state.choice = null
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

  const choice = state.choice

  return m('.decision.prompt',

    Game.userPlayer && unit.id === Game.userPlayer.id
      ? m('h3', "Decide your decision:")
      : m('h3', `${unit.name}'s Move:`)
    ,

    unit.skills.length > 0 &&
    m('button', { onclick: ()=> selectAction(state, attrs, 'skill') }, "Skill"),

    m('button', "Item (todo)"),

    m('button', { onclick: ()=> selectAction(state, attrs, 'move') }, "Move"),


    choice && choice.type === 'skill' && skillView(state, attrs, choice),
    choice && choice.type === 'move'  && moveView(state, attrs, choice),
  )
}

function skillView (state: State, attrs: Attrs, choice: SkillChoice) {
  const unit = Game.get( attrs.unitId )
  const skill = choice.skill
  const targets = skill &&
    Battle.getValidTargets(attrs.game, attrs.unitId, { type: 'skill', skill: skill })

  return [
    //
    // Which skill?
    //
    m('ul.options',
      unit.skills.map( skillId =>
        m('li', {
          class: skill === skillId ? 'active' : '',
          onclick: ()=> {
            choice.skill = skillId
          },
        }, `Use skill: ${skillId}`)
      )
    ),

    //
    // Target whom with selected skill? (unit target)
    //
    skill && targets && Array.isArray(targets) && [
      targets.length === 0 &&
        m('.options', m('h4', 'No valid targets.'))
      ,

      m('ul.options', targets.map( targetId => {
        return m('li', {
          onclick: () =>
            Game.act(unit.id, {
              type: 'decision',
              pendingDecisionId: attrs.pd.id,
              action: { type: 'skill', skill: skill, target: targetId }
            })
        }, `${ choice.skill }: ${Game.get(targetId).name}`)
      }))
    ]
    //
    // Target where with selected skill? (point target)
    //
    // TODO
  ]
}

function moveView (state: State, attrs: Attrs, choice: MoveChoice) {
  const unit = Game.get( attrs.unitId )
  const dest = Game.mapClickEvent()
  return [
    m('p', "Please select a point on the map."),
    dest &&
      m('button', { onclick: () => submitMovement(state, attrs, dest) }, `Move to (${dest.x}, ${dest.y})`)
    ,
  ]
}



function selectAction(state: State, attrs: Attrs, action: App.BattleActionType) {
  var unit = Game.get( attrs.unitId )

  if ( action === 'skill' ) {
    state.validTargets = null
    state.choice = { type: 'skill', skill: null }
  }
  else if ( action === 'move' ) {
    state.validTargets = null
    state.choice = { type: 'move' }
    Game.mapMode = { type: 'move-point', actorId: unit.id, label: `${unit.name}'s move` }
  }
}


function submitMovement(state: State, attrs: Attrs, dest: App.Coordinate) {
  // TODO: MODIFY AND INVOKE Game.act()
}
