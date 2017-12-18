//
// For an overview of JS animations, see the following referenc:
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
//


type Elem = Element & { animate: any }


export function none() {}

export function hitShake(extra=0, opts: AnimationEffectTiming = {}) {
  var mapDiv = document.querySelector('#map')
  if ( ! mapDiv ) return

  var keyframes = [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: 'translate3d(-8px, 0, 0)' },
    { transform: 'translate3d(8px, 0, 0)' },
  ]
  for (var i=0; i < extra; i++) {
    var px = (i%2===0 ? -1 : 1) * 8 + 'px'
    keyframes.push({ transform: `translate3d(${px}, 0, 0)` })
  }
  keyframes.push({ transform: 'translate3d(0, 0, 0)' })

  return mapDiv.animate(keyframes, {
    duration: 200 + extra * 80,
    ...opts,
  })
}


export function punch(id: App.UnitId, to: App.DirectionCoordinate, opts: AnimationEffectTiming = {}) {
  var unitDiv = document.querySelector(`#map [data-unit-id=${id}] > div`)
  if ( ! unitDiv ) return Promise.resolve({}) // ts

  var px = 10
  var keyframes = [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: `translate3d(${px * to.x * -1}px, ${px * to.y * -1}px, 0)`, offset: 0.5 },
    { transform: `translate3d(${px * to.x}px, ${px * to.y}px, 0)` },
    { transform: 'translate3d(0, 0, 0)' }
  ]

  var anim = unitDiv.animate(keyframes, {
    duration: 500,
    easing: 'ease-in',
    ...opts,
  })

  // Skill animations need to indicate when they're done
  return new Promise(resolve => anim.onfinish = resolve)
}


export function smacked(id: App.UnitId, from: App.DirectionCoordinate, opts: AnimationEffectTiming = {}) {
  const unitDiv = document.querySelector(`#map [data-unit-id=${id}]`)
  if ( ! unitDiv ) return

  // Create damange burst div
  var size = 20
  const dmgDiv = document.createElement('div')
  dmgDiv.className = 'shape-blast'

  Object.assign(dmgDiv.style, {
    position: 'absolute',
    top:  `${from.y * 50 + 50}%`,
    left: `${from.x * 50 + 50}%`,
    width: size + 'px',
    height: size + 'px',
    margin: `-${size/2}px 0 0 -${size/2}px`,
  })

  unitDiv.appendChild(dmgDiv)

  let anim = dmgDiv.animate([
    { transform: 'translateZ(0px)', opacity: 1 },
    { transform: 'translateZ(100px)', opacity: 0 },
  ], { duration: 800, easing: 'ease-out' })

  anim.onfinish = () => unitDiv.removeChild(dmgDiv)


  const px = 7
  const keyframes = [
    { transform: 'translate3d(0, 0, 0)' },
    { transform: `translate3d(${px * from.x * -1}px, ${px * from.y * -1}px, 0)`, offset: 0.2 },
    { transform: 'translate3d(0, 0, 0)' }
  ]

  return unitDiv.children[0].animate(keyframes, {
    duration: 500,
    easing: 'ease-out',
    ...opts,
  })
}


export function number(id: App.UnitId, number: number, color: string, opts: AnimationEffectTiming = {}) {
  const unitDiv = document.querySelector(`#map [data-unit-id=${id}]`)
  if ( ! unitDiv ) return

  // Create damange burst div
  var size = 20
  const numberDiv = document.createElement('div')
  numberDiv.innerText = ''+number

  Object.assign(numberDiv.style, {
    background: 'rgba(255,255,255,0.8)',
    color: color,
    position: 'absolute',
    padding: '3px',
    top:  '0',
    left: '75%',
  })

  unitDiv.appendChild(numberDiv)

  let anim = numberDiv.animate([
    { transform: 'translateY(-15px)', opacity: 1 },
    { transform: 'translateY(-23px)', opacity: 1, offset: 0.8 },
    { transform: 'translateY(-25px)', opacity: 0 },
  ], { duration: 1700 })

  anim.onfinish = () => unitDiv.removeChild(numberDiv)
}
