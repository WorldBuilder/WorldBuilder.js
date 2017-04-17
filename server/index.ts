import { createServer } from 'http'
import * as most from 'most'
import multicast from '@most/multicast'
import DeepDiff = require('deep-diff')


var server = createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' })

  var sub = stateStream.subscribe({
    next: (state) => res.write( JSON.stringify(state) ),
    complete: () => res.end(),
    error: (err) => {
      console.log("Error:", err)
      res.end()
    }
  })

  res.on('close', () => {
    console.log("End")
    sub.unsubscribe()
  })
})

console.log("Listening on port 4242")
server.listen(4242)



interface GameState {
  x: number,
  y: number,
}


var stateStream = multicast( most.generate(gameLoop, 1000) )


function * gameLoop (frame: number) {
  var state = {
    x: 10,
    y: 20,
  }

  while (true) {
    state = step(state)
    yield delayPromise(frame, state)
  }
}

var x=0;
function step (state: GameState) {
  console.log("STEP", x++)

  for (var i=0; i < 5; i++) {
    if ( Math.random() > 0.5 ) {
      state.x += Math.random() > 0.5 ? 1 : -1
    }
    else {
      state.y += Math.random() > 0.5 ? 1 : -1
    }
  }

  return state
}

function delayPromise<T>(ms: number, value: T) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}
