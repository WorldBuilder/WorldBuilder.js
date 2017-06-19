import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { TileType } from './enums'
import * as TOML from 'toml'
import * as Map from './map'


export var skills: App.Skill[] = []
export var maps: App.Map[] = []


export function sync () {

  console.log('[Startup] Loading skill definitions...')
  var source = readFileSync(__dirname + '/../game-assets/skills.toml', 'utf8')
  var importedSkills = TOML.parse(source)

  skills = importedSkills.skill.map( (sk: any) => {

    sk.time = sk.time || {}

    var imported: App.Skill = {
      name: sk.name,
      range: sk.range || 100,
      cost: sk.cost || {},
      time: {
        chargeup: sk.time.chargeup || 0,
        cooldown: sk.time.cooldown || 0,
        limit: sk.time.limit || 4,
      },
      target: sk.target, // TODO: Validate
      effects: sk.effect || [] // TODO: Validate
    }

    return imported
  })


  console.log('[Startup] Loading map definitions...')
  var allMapsDir = __dirname + '/../game-assets/maps'

  var foundMaps = readdirSync(allMapsDir).map( file => {
    var mapDir = join(allMapsDir, file)
    var stat   = statSync( mapDir )

    if (! stat || ! stat.isDirectory()) return;

    console.log(`  > Loading map "${file}"...`)
    if ( ! statSync( join(mapDir,'map.png') ) ) {
      throw new Error(`map.png not found.`)
    }

    var mapData = JSON.parse(readFileSync( join(mapDir, 'map.json'), 'utf8' )) as TiledMap.Map

    if ( mapData.layers.length == 0 ) {
      throw new Error(`No layers in map definition file.`)
    }
    if ( mapData.layers.length >= 2 ) {
      throw new Error(`Multiple layers not yet supported.`)
    }

    if ( mapData.tilesets.length == 0 ) {
      throw new Error(`No tileset in map definition file.`)
    }
    if ( mapData.tilesets.length >= 2 ) {
      throw new Error(`Multiple tilesets not yet supported.`)
    }

    var map: App.Map = {
      id: file,
      imageUrl: `/assets/maps/${file}.png`,
      height: mapData.height,
      width: mapData.width,

      tileSize: mapData.tilewidth,
      tileMapCols: mapData.tilesets[0].columns,

      tiles: convertTo2d(mapData.width, mapData.height,

        mapData.layers[0].data.map( tileId => {
          var spec = mapData.tilesets[0].tiles[tileId]
          return spec && spec.type === 'wall'
            ? TileType.Wall
            : TileType.Empty
        })
      )
    }

    return map
  })

  //
  // Roundabout reduce to appease ts
  //
  maps = foundMaps.reduce( (acc, x) => {
    if (x) acc.push(x)
    return acc
  }, [] as App.Map[] )

  if ( maps.length === 0 ) {
    throw new Error('At least one map is required to start the game server.')
  }
}


function convertTo2d<T>(width: number, height: number, array: T[]) {
  var result: T[][] = []

  for (var row=0; row < height; row++) {
    result.push([])
    for (var col=0; col < width; col++) {
      result[row][col] = array[row * width + col]
    }
  }
  return result
}
