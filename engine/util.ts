

export function directionCoord (from: App.Coordinate, to: App.Coordinate): App.DirectionCoordinate {
  return { x: calcDirection(to.x - from.x), y: calcDirection(to.y - from.y) }
}

export function flipDirectionCoord (coord: App.DirectionCoordinate) {
  return { x: coord.x * -1, y: coord.y * -1 } as App.DirectionCoordinate
}

export function calcDirection (x: number) {
  if ( x === 0 ) return 0
  return x < 0 ? -1 : 1
}
