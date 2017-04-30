import { Application, static as staticFolder } from 'express'
import { resolve as resolvePath } from 'path'

var browserify = require('browserify-middleware')
var assetFolder = resolvePath(__dirname, '../../client/public')


export default function configAssets (server: Application) {
  var external = ['socket.io-client', 'mithril', 'most']

  //
  // Avoid transform during development
  //
  var transform = process.env.NODE_ENV === 'production'
    ? [
        ["babelify", { extensions: [".ts"], presets: ["es2015"] }]
      ]
    : null

  //
  // Provide browserified files at specified urls
  //
  server.get('/assets/vendor-bundle.js', browserify(external))

  server.get('/assets/app-bundle.js', browserify('./client/index.ts', {
    external: external,
    transform: transform,
    plugins: [
      { plugin: "tsify", options: { target: "es6" } }
    ],
  }))

  //
  // Static assets (html, etc.)
  //
  server.use(staticFolder(assetFolder))
}
