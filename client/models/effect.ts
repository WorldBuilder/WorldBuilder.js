import * as Animate from './animate'
import { directionCoord, flipDirectionCoord } from '../../engine/util'


export function handle (game: App.GameState, effect: App.Effect) {
  console.log("Effect:", effect)

  if ( effect.type === 'skill:hit' ) {
    var skill = game.meta.skills.find( s => s.name === effect.skill )!


    if ( skill.animation === 'punch' ) {
      var dir = directionCoord(game.units[effect.actorId].pos, game.units[effect.targetId].pos)
      console.log("Animating", effect.actorId, effect.targetId, dir)
      Animate.punch(effect.actorId, dir).then( () => {
        Animate.smacked(effect.targetId, flipDirectionCoord(dir))
        effect.effects.forEach( eff => handle(game, eff) )
      })
    }
  }
  else if ( effect.type === 'skill:damage' ) {
    Animate.number(effect.targetId, effect.mod, effect.mod < 0 ? 'red' : 'green')
  }
}
