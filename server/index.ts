import * as express from 'express'
import { createServer } from 'http'

var app = express()
var server = createServer(app)

//
// Pipework
//
require('./config/config-game-assets').default(app)
require('./config/config-web-assets').default(app)
require('./config/config-websockets').default(server)

console.log("Listening on port 4242")
server.listen(4242)
