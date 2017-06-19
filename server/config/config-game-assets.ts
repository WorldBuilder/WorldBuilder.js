import { Application, static as staticFolder } from 'express'
import { resolve as resolvePath } from 'path'

var assetFolder = resolvePath(__dirname, '../../game-assets')


export default function configGameAssets (server: Application) {

  server.get('/assets/maps/:map_name.png', function (req, res) {
    var sanitized = req.params.map_name.replace(/[^a-z]/ig, '')
    res.sendFile(`${assetFolder}/maps/${sanitized}/map.png`)
  })
}
