import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import { TileType } from './enums'
import * as TOML from 'toml'
import * as Map from './map'
import * as ndarray from 'ndarray'
import * as t from 'runtypes'
var createPlanner = require('l1-path-finder')


var maps: App.Map[] = []
export var skills: App.Skill[] = []
export var players: App.Player[] = []


export function sync () {

  console.log('[Startup] Loading skill definitions...')
  var source = readFileSync(__dirname + '/../game-assets/skills.toml', 'utf8')
  var importedSkills = TOML.parse(source)

  skills = importedSkills.skill.map( (sk: any) => {

    sk.time = sk.time || {}

    var imported: App.Skill = {
      name: sk.name,
      range: sk.range || 100,
      cost: sk.cost || 0,
      time: {
        startup: sk.time.startup || 0.5,
        cooldown: sk.time.cooldown || 0,
        recharge: sk.time.recharge || 0,
      },
      target: sk.target, // TODO: Validate
      effects: sk.effect || [] // TODO: Validate
    }

    return imported
  })


  console.log('[Startup] Loading player accounts...')
  var source = readFileSync(__dirname + '/../game-assets/players.toml', 'utf8')
  var importedPlayers = TOML.parse(source)

  players = importedPlayers.player.map( (p: any) => {
    try {
      console.log('  > Loading', p.id)
      var clean = PlayerChecker.check(p)
    }
    catch (error) {
      console.error('ERROR: Invalid player definition in game-assets/players.toml')
      console.error('  ', error.message)
      return process.exit(1) // ts doesn't know process.exit quits, so we return to appease.
    }

    var final: App.Player = {
      ...clean,
      type: 'player',
    }

    return final
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

    var tileMap = convertTo2d(
      mapData.width,
      mapData.height,
      mapData.layers[0].data.map( tileId => {
        var spec = mapData.tilesets[0].tiles[tileId]
        return spec && spec.type === 'wall'
          ? TileType.Wall
          : TileType.Empty
      })
    )

    var map: App.Map = {
      id: file,
      imageUrl: `/assets/maps/${file}.png`,
      height: mapData.height,
      width: mapData.width,

      tileSize: mapData.tilewidth,
      tileMapCols: mapData.tilesets[0].columns,
      tiles: tileMap,
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

export function loadMap (id: string) {
  var map = maps.find( m => m.id === id )
  if ( ! map ) {
    throw new Error(`No such map: ${id}`)
  }

  // Need to flip map diagonally for ndarray library
  var tilesFlipped = transpose(map.tiles)

  var mapPlus: App.MapWithPlanner = {
    ...map,
    planner: createPlanner(
      ndarray(tilesFlipped.reduce((a,b) => a.concat(b)), [tilesFlipped.length, tilesFlipped[0].length])
    )
  }
  return mapPlus
}

//
// Helpers
//
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

function transpose<T> (arr: T[][]) {
  var result: T[][] = []
  for (var i=0; i < arr[0].length; i++) {
    result[i] = []
    for (var k=0; k < arr.length; k++) {
      result[i][k] = arr[k][i]
    }
  }
  return result
}

// THIS SHOULD MIRROR THAT IN typings/app.d.ts!!
const PlayerChecker = t.Record({
  id: t.String,
  password: t.String,

  name: t.String,
  size: t.Number,
  pos: t.Record({ x: t.Number, y: t.Number }),
  currentHp: t.Number,
  maxHp: t.Number,
  stats: t.Record({
    con: t.Number,
    dex: t.Number,
    int: t.Number,
    mov: t.Number,
    str: t.Number,
    wis: t.Number,
  }),
  skills: t.Array(t.String),
})
