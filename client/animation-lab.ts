import * as Animate from './models/animate'


var mappings: Record<string, any> = {
  'shake': (e: any) => Animate.hitShake(0),
  'punch': (e: any) => Animate.punch('pnch', { x: 1, y: 0 }),
  'smacked': (e: any) => Animate.smacked('smkd', { x: -1, y: 0 }),
  'number': (e: any) => Animate.number('num', -999, 'red'),
}


for (var id in mappings) {
  document.getElementById(id)!.addEventListener('click', mappings[id])
}
