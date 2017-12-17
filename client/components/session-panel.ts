import * as m from 'mithril'
import Game from '../models/game'


interface Attrs {}

interface State {
  id: string,
  password: string,
}


export default {
  oninit(vnode) {
    vnode.state.id = localStorage.getItem('session:id') || ''
    vnode.state.password = localStorage.getItem('session:password') || ''
  },
  view({ state }) {

    return m('.session-panel',
      m('label[for=s-id]', "Player ID: "),
      m('input[type=text][id=s-id]', { value: state.id, onchange: (e:any) => state.id = e.target.value }),
      m('br'),

      m('label[for=s-pw]', "Password: "),
      m('input[type=password][id=s-pw]', { value: state.password, onchange: (e:any) => state.password = e.target.value }),
      m('br'),

      m('button', { onclick: () => Game.signIn(state.id, state.password) }, 'Sign in'),
    )
  }
} as m.Component<Attrs, State>
