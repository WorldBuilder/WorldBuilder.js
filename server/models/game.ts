//
// This is set up this way to share server game state across files.
//
import * as TOML from 'toml'
import { initialGameState } from '../../engine'

export default {
  state: initialGameState,
}
